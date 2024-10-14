import { Component, OnInit, inject } from '@angular/core';
import { IEspecialista, IPaciente, IUser } from '../../interfaces/user.interface';
import { UserService } from '../../services/user.service';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { InputGroupModule } from 'primeng/inputgroup';
import { DropdownModule } from 'primeng/dropdown';
import { HorariosService } from '../../services/horarios.service';
import { ITurno } from '../../interfaces/turno.interface';
import { TurnoService } from '../../services/turno.service';
import { AuthService } from '../../services/auth.service';
import { TableModule } from 'primeng/table';
import { bounceInAnimation, fadeInAnimation, slideInRightAnimation, SlideUpAnimation } from '../../animations/animations';
import { DateTurnPipe } from '../../pipes/date-turn.pipe';
import { CaptchaDirective } from '../../directives/captcha.directive';
import { Router } from '@angular/router';


@Component({
  selector: 'app-solicitar-turno',
  standalone: true,
  imports: [
    FormsModule,
    ToolbarModule,
    ButtonModule,
    InputTextModule,
    InputGroupModule,
    DropdownModule,
    TableModule,
    CaptchaDirective,
  ],
  templateUrl: './solicitar-turno.component.html',
  styleUrl: './solicitar-turno.component.css',
  animations: [
    slideInRightAnimation,
    fadeInAnimation,
    SlideUpAnimation,
    bounceInAnimation,
  ]
})
export class SolicitarTurnoComponent implements OnInit {
  userService = inject(UserService);
  horariosService = inject(HorariosService);
  turnoService = inject(TurnoService);
  authService = inject(AuthService);
  dateTurnPipe = inject(DateTurnPipe);
  router = inject(Router);
  especialistas: IEspecialista[] = [];
  turnos: ITurno[] = [];
  selectedEspecialista: IEspecialista | null = null;
  selectedEspecialidad?: string;
  fechasEspecialista: any;
  filterBy: string = 'nombre';
  query: string = '';
  workingDays = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
  turnsPerDay: Map<string, number> = new Map<string, number>();
  cantConsultorios = 6;
  selectedPaciente: IPaciente | null = null;
  users : IPaciente[] = [];
  isCaptchaValid = false;
  isCaptchaEnabled = true;

  dateOptions: any = {
    day: '2-digit',
    year: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false // Use 24-hour time format
  };


  ngOnInit(): void {
    console.log(this.getNext15Days());
    if (this.authService.currentUserSignal()?.role == 'paciente')
      this.selectedPaciente = this.authService.currentUserSignal()! as IPaciente;
    else {
      this.userService.getUsersByRole('paciente')
      .then( (users) => {
          this.users = users as IPaciente[];
        }
      );
    }

    this.loadEspecialistas();
    this.turnoService.getAll().subscribe(
      (turnos) => {
        this.turnos = turnos;
        this.turnsPerDay.clear();
        for (let turno of turnos) {
          const formattedDate = turno.fecha.toLocaleString('en-US', this.dateOptions);
          if (this.turnsPerDay.has(formattedDate)) {
            this.turnsPerDay.set(formattedDate, this.turnsPerDay.get(formattedDate)! + 1)
          }
          else {
            this.turnsPerDay.set(formattedDate, 1)
          }
        }
      }
    );
  }

  async loadEspecialistas() {
    this.especialistas = await this.userService.ObtenerUsuarios('role', 'especialista') as IEspecialista[];
  }

  select(especialista: IEspecialista) {
    this.selectedEspecialista = especialista;
    this.getHorarios();
  }

  selectPaciente(paciente : IPaciente) {
    this.selectedPaciente = paciente;
  }

  changeFilter(newFilter: string) {
    this.filterBy = newFilter;
  }

  getFilteredEspecialistas(): IEspecialista[] {
    if (this.query.length > 0) {
      if (this.filterBy == 'nombre') {
        return this.especialistas.filter(v => v.nombre.toLowerCase().includes(this.query.toLowerCase()));
      }
      else {
        return this.especialistas.filter(esp => {
          for (let especialidad of esp.especialidades) {
            if (especialidad.toLowerCase().includes(this.query.toLowerCase()))
              return true
          }
          return false;
        });
      }

    }
    return this.especialistas;
  }

  getOptions() {
    return this.selectedEspecialista!.especialidades;
  }

  changeEspecialidad(especialidad: any) {
    this.selectedEspecialidad = especialidad;
  }

  getNext15Days() {
    const today = new Date();
    const daysOfWeek = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
    const result: any = {
      lunes: { fechas: [] },
      martes: { fechas: [] },
      miercoles: { fechas: [] },
      jueves: { fechas: [] },
      viernes: { fechas: [] },
      sabado: { fechas: [] },
    };

    for (let i = 0; i <= 15; i++) {
      const currentDay = new Date(today);
      currentDay.setDate(today.getDate() + i);
      const dayIndex = currentDay.getDay();
      const dayNameNoAccent = daysOfWeek[dayIndex];
      // const formattedDate = `${currentDay.getDate()}/${currentDay.getMonth() + 1}`;

      if (dayNameNoAccent !== "domingo") {
        result[dayNameNoAccent].fechas.push(currentDay);
      }
    }

    return result;
  }

  async getHorarios() {
    const horarios = await this.horariosService.ObtenerHorarios('uid', this.selectedEspecialista!.uid);
    const fechas = this.getNext15Days();

    for (let day of this.workingDays) {
      fechas[day].horarios = horarios[day];
    }

    this.fechasEspecialista = fechas;
  }

  getFormattedDate(date: Date) {
    return `${date.getDate()}/${date.getMonth() + 1}`;
  }


  getRemainingTurn(horario: string, fecha: Date): number {
    const splittedHorario = horario.split(':');
    const hour = parseInt(splittedHorario[0]);
    const minutes = parseInt(splittedHorario[1]);

    fecha.setHours(hour, minutes);

    const formattedDate = fecha.toLocaleString('en-US', this.dateOptions);

    const amount = this.turnsPerDay.get(formattedDate);
    if (amount)
      return this.cantConsultorios - amount

    return this.cantConsultorios;
  }


  getHorario(horario: string, fecha: Date): string {
    const auxDate = new Date(fecha.getTime());
    const splittedHorario = horario.split(':');
    const hour = parseInt(splittedHorario[0]);
    const minutes = parseInt(splittedHorario[1]);

    auxDate.setHours(hour, minutes);

    return `${this.dateTurnPipe.transform(auxDate)} (${this.getRemainingTurn(horario, fecha)})`;
  }

  solicitarTurno(fecha: Date, horario: string) {
    console.log('entro');
    const splittedHorario = horario.split(':');
    const hour = parseInt(splittedHorario[0]);
    const minutes = parseInt(splittedHorario[1]);

    fecha.setHours(hour, minutes);

    this.turnoService.addTurno({
      pacienteUid: this.selectedPaciente!.uid,
      especialistaUid: this.selectedEspecialista!.uid,
      especialidad: this.selectedEspecialidad!,
      fecha: fecha,
      estado: 'pendiente',
      comentario: null,
      especialista: this.selectedEspecialista!,
      paciente: this.selectedPaciente! as IPaciente,
    })
    .then((val) => {
      console.log(val);
    })
    .catch((err) => {
      console.log(err);
    });
    this.router.navigateByUrl('/home');
  }

  getImgEspecialidad(especialidad : string) {
    const especialidades = ['fisioterapia', 'psicologia', 'urologia'];
    let aux = 'default';
    const espLower = especialidad.toLowerCase();
    if(especialidades.includes(espLower))
      aux = espLower;

    return `assets/especialidades/${aux}.png`;

  }

  onCaptchaValidated(isValid : boolean) {
    this.isCaptchaValid = isValid;
  }

  goBack() {
    if (this.selectedEspecialidad) {
      this.selectedEspecialidad = undefined;
    }
    else if (this.selectedEspecialista)
    {
      this.selectedEspecialista = null;
    }
  }
}
