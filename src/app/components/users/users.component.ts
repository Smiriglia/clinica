import { Component, inject } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { TabMenuModule } from 'primeng/tabmenu';
import { FormRegisterPacienteComponent } from '../form-register-paciente/form-register-paciente.component';
import { FormRegisterEspecialistaComponent } from '../form-register-especialista/form-register-especialista.component';
import { AuthService } from '../../services/auth.service';
import { StorageService } from '../../services/storage.service';
import { FormRegisterAdminComponent } from '../form-register-admin/form-register-admin.component';
import { TableModule } from 'primeng/table';
import { IAdmin, IEspecialista, IPaciente, IUser } from '../../interfaces/user.interface';
import { ButtonModule } from 'primeng/button';
import { UserService } from '../../services/user.service';
import { DialogModule } from 'primeng/dialog';
import { VerHistoriaClinicaComponent } from '../ver-historia-clinica/ver-historia-clinica.component';
import { TurnoService } from '../../services/turno.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    TabMenuModule,
    FormRegisterPacienteComponent,
    FormRegisterEspecialistaComponent,
    FormRegisterAdminComponent,
    TableModule,
    ButtonModule,
    DialogModule,
    VerHistoriaClinicaComponent,
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent {
  authService = inject(AuthService);
  storageService = inject(StorageService);
  userService = inject(UserService);
  turnoService = inject(TurnoService);

  errorMessage = "";

  itemsAction: MenuItem[] | undefined;
  itemsRole: MenuItem[] | undefined;

  action!: MenuItem;
  role!: MenuItem;

  users: IUser[] = [];

  userKeys : string[] = [];

  visibleHistoria = false;
  pacienteSeleccionado! : IPaciente; 

  visibleExportarTurnos = false;

  loaderState = {
    loading: false,
    state: "check"
  }
  
  ngOnInit() {
      this.itemsAction = [
          { label: 'Crear', icon: 'pi pi-user-plus' },
          { label: 'Listar', icon: 'pi pi-home' },
      ];

      this.itemsRole = [
        { label: 'paciente', icon: 'pi pi-user',  },
        { label: 'especialista', icon: 'pi pi-heart' },
        { label: 'admin', icon: 'pi pi-key' },
    ];


    this.action = this.itemsAction[0];
    this.role = this.itemsRole[0];
    this.getUsers();
  }

  onActionChange(event: MenuItem) {
      this.action = event;
  }

  onRoleChange(event: MenuItem) {
    this.role = event;
    this.getUsers();
  }

  onRegister(data: any) {
    this.loaderState.loading = true;
    data.data.role = this.role?.label;
    if (this.role?.label != "especialista")
      data.data.estaHabilitado = false;
    console.log(data);
    this.storageService.uploadMultiple(data.files)
      .subscribe({
        next: (urlsObject) => {
          const keys = Object.keys(urlsObject);
          for (let key of keys) {
            data.data[key] = urlsObject[key];
          }
          this.authService.singUp(data.data)
            .subscribe({
              next: (_) => {
                this.loaderState.state = "check";
                setTimeout(() => {
                  this.loaderState.state = "loading";
                  this.loaderState.loading = false;
                },
                1500);
              },
              error: (err) => {
                switch (err.code) {
                  case "auth/email-already-in-use":
                    this.errorMessage = 'El correo ya está en uso';
                    break;
                  case "auth/invalid-email":
                    this.errorMessage = 'Correo electronico invalido';
                    break;
                  case "auth/operation-not-allowed":
                    this.errorMessage = "Operación no permitida"
                    break;
                  case "auth/weak-password":
                    this.errorMessage = "Constraseña debil"
                }

                this.loaderState.state = "error";
                setTimeout(() => {
                  this.loaderState.state = "loading";
                  this.loaderState.loading = false;
                },
                  1500);
              },
            });

        },
        error: (err) => {
          this.errorMessage = "Error al subir la imagen";
          this.loaderState.state = "error";
          setTimeout(() => {
            this.loaderState.state = "loading";
            this.loaderState.loading = false;
          },
          1500);
        }
      });
    }

    async getUsers() {
      this.userService.getUsersByRole(this.role.label!)
      .then( (users) => {
          this.users = users;
          if(users.length > 0) {
            this.userKeys = Object.keys(users[0]);
          }
        }
      );
  }
  
  async deshabilitar(user: IEspecialista) {
    const response = await this.userService.updateEstaHabilitado(user, false)
    if(response) 
      user.estaHabilitado = false;
  }

  async habilitar(user: IEspecialista) {
    const response = await this.userService.updateEstaHabilitado(user, true)
    if(response) 
      user.estaHabilitado = true;
  }

  verHistoriaClinica(paciente : IPaciente) {
    this.visibleHistoria = true;
    this.pacienteSeleccionado = paciente;
  }

  exportarTurnos() {
    this.visibleExportarTurnos = true;
  }

  exportarTurno(paciente : IUser) {
    this.turnoService.getTurnosRoleUid('paciente', paciente.uid)
    .subscribe(
      (turnos) => {
        const exportData = turnos.map(turno => ({
          id: turno.id,
          fecha: turno.fecha.toISOString(),
          pacienteUid: turno.pacienteUid,
          especialistaUid: turno.especialistaUid,
          estado: turno.estado,
          comentario: turno.comentario,
          review: turno.review
        }));
    
        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Turnos');
    
        XLSX.writeFile(wb, 'turnos.xlsx');
      }
    );
    this.visibleExportarTurnos = false;
  }

  exportPacientesToCsv(filename: string = 'pacientes.csv'): void {
    
    const pacientes = this.users as IPaciente[];
    
    // Extract the headers from the first object
    const headers = Object.keys(pacientes[0]);

    // Create CSV content
    const csvContent = pacientes.map(paciente => {
      return headers.map(header => this.formatCsvValue(paciente[header])).join(',');
    });

    // Add headers as the first row
    csvContent.unshift(headers.join(','));

    // Join all lines into a single string with line breaks
    const csvString = csvContent.join('\r\n');

    // Create a Blob from the CSV string and download it
    this.downloadCsv(csvString, filename);
  }

  private formatCsvValue(value: any): string {
    if (typeof value === 'string') {
      // Escape quotes by doubling them
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  private downloadCsv(csvString: string, filename: string): void {
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}
