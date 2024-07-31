import { Component, inject, OnInit } from '@angular/core';
import { ITurno } from '../../interfaces/turno.interface';
import { TurnoService } from '../../services/turno.service';
import { AuthService } from '../../services/auth.service';
import { IPaciente } from '../../interfaces/user.interface';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { VerHistoriaClinicaComponent } from '../ver-historia-clinica/ver-historia-clinica.component';
import { TableModule } from 'primeng/table';
import { VerTurnosComponent } from '../ver-turnos/ver-turnos.component';

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [
    DialogModule,
    ButtonModule,
    VerHistoriaClinicaComponent,
    VerTurnosComponent,
    TableModule,

  ],
  templateUrl: './pacientes.component.html',
  styleUrl: './pacientes.component.css'
})
export class PacientesComponent implements OnInit {
  turnoService = inject(TurnoService);
  authService = inject(AuthService);
  selectedOption = '';
  visibleDialog = false;
  pacienteSeleccionado! : IPaciente;
  pacientes : IPaciente[] = [];
  user = this.authService.currentUserSignal()!;
  isHidden = false;

  ngOnInit(): void {
    this.turnoService.getTurnosRoleUid('especialista', this.user.uid)
    .subscribe(
      (turnos) => {
        this.pacientes.slice(0, this.pacientes.length);
        for (let turno of turnos) {
          if (!this.containsPatient(turno))
          {
            this.pacientes.push(turno.paciente);
          }
        }
      }
    )
  }

  verDialog(paciente : IPaciente) {
    this.selectedOption = `${paciente.nombre} ${paciente.apellido}`;
    this.visibleDialog = true;
    this.pacienteSeleccionado = paciente;
  }

  containsPatient(turno : ITurno)
  {
    for (let paciente of this.pacientes) {
      if (turno.pacienteUid == paciente.uid)
        return true;
    }
    return false;
  }

  toggleView() {
    this.isHidden = !this.isHidden
  }

  changeOption(opcion : string) {
    this.selectedOption = opcion;
  }
}
