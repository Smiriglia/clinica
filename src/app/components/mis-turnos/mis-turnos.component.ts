import { Component, inject } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../services/auth.service';
import { TurnoService } from '../../services/turno.service';
import { ITurno } from '../../interfaces/turno.interface';
import { DateDisplayPipe } from '../../pipes/date-display.pipe';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { IPregunta } from '../../interfaces/encuesta.interface';
import { ToolbarModule } from 'primeng/toolbar';
import { InputGroupModule } from 'primeng/inputgroup';
import { FormHistoriaClinicaComponent } from '../form-historia-clinica/form-historia-clinica.component';
import { IHistoriaClinica } from '../../interfaces/historia_clinica.interface';
import { slideInAnimation } from '../../animations/animations';
import { SliderModule } from 'primeng/slider';
import { CheckboxModule } from 'primeng/checkbox';
import { RatingModule } from 'primeng/rating';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { RadioButtonModule } from 'primeng/radiobutton';

@Component({
  selector: 'app-mis-turnos',
  standalone: true,
  imports: [
    CardModule,
    ButtonModule,
    DateDisplayPipe,
    DialogModule,
    FormsModule,
    InputTextModule,
    ToolbarModule,
    InputGroupModule,
    SliderModule,
    CheckboxModule,
    FormHistoriaClinicaComponent,
    InputTextModule,
    InputTextareaModule,
    RatingModule,
    RadioButtonModule
  ],
  templateUrl: './mis-turnos.component.html',
  styleUrl: './mis-turnos.component.css',
  animations: [
    slideInAnimation,
  ]
})
export class MisTurnosComponent {
  authService = inject(AuthService);
  turnoService = inject(TurnoService);
  _dateDisplay = inject(DateDisplayPipe);
  role!: string;
  turnos: ITurno[] = []
  visibleComentario = false;
  visibleReview = false;
  visibleEncuesta = false;
  visibleHistoria = false;
  motivoComentario = '';
  nuevoEstado = '';
  nuevoComentario = '';
  turnoAModificar: ITurno | null = null;
  query = '';
  filterBy = 'especialidad';
  campoAdicional = '';

  historiaFijaFilters = ['altura', 'temperatura', 'peso', 'presion'];



  encuesta: IPregunta[] = [
    {
      pregunta: '¿Como fue la atencion del especialista?',
      respuesta: ''
    },
    {
      pregunta: '¿La atencion de la administracion fue buena?',
      respuesta: ''
    },
    {
      pregunta: '¿Hay algo que mejorarias de la clinica?',
      respuesta: ''
    },

  ];

  encuestaAtencion: IPregunta[] = [
    {
      pregunta: 'Por favor, deja un comentario adicional:',
      respuesta: ''
    },
    {
      pregunta: '¿Cómo calificarías el servicio con estrellas?',
      respuesta: 0
    },
    {
      pregunta: '¿Recomendarías este servicio?',
      respuesta: ''
    },
    {
      pregunta: '¿Qué aspectos te gustaron del servicio? (Marque todos los que aplican)',
      respuesta: []
    },
    {
      pregunta: 'Nivel de satisfacción general (1-10):',
      respuesta: 5
    }
  ];

  visibleEncuestaAtencion = false;


  constructor() {
    const user = this.authService.currentUserSignal()!
    this.role = user.role;
    this.turnoService.getTurnosRoleUid(this.role, user.uid)
      .subscribe(
        {
          next: (turnos) => {
            this.turnos = turnos;
          },
          error: (err) => {
            console.log(err);
          }
        }
      );
  }

  changeFilter(newFilter: string) {
    this.filterBy = newFilter;
  }

  changeFilterCampoInterno(newFilter: string, campoAdicional: string) {
    this.filterBy = newFilter;
    this.campoAdicional = campoAdicional;
  }

  getFilteredTurnos(): ITurno[] {
    if (this.query.length == 0) return this.turnos;

    if (this.filterBy == 'paciente' || this.filterBy == 'especialista') {
      return this.turnos.filter((turno) => {
        let nombreCompleto: string = `${turno[this.filterBy].nombre} ${turno[this.filterBy].apellido}`;
        nombreCompleto = nombreCompleto.toLowerCase();
        return nombreCompleto.includes(this.query.toLowerCase())
      });
    }
    if (this.filterBy == 'historiaClinica') {
      return this.turnos.filter((turno) => {
        if (!turno.historiaClinica) return false;

        for (let datoDinamico of turno.historiaClinica.datosDinamicos) {
          if (datoDinamico.clave == this.campoAdicional) {
            let valor: string = `${datoDinamico.valor}`;
            valor = valor.toLowerCase();
            return valor.includes(this.query.toLowerCase());
          }
        }

        if (turno.historiaClinica[this.campoAdicional]) {
          let valor: string = `${turno.historiaClinica[this.campoAdicional]}`;
          valor = valor.toLowerCase();
          return valor.includes(this.query.toLowerCase());
        }
        return false;
      });
    }
    else if (this.filterBy == 'fecha') {
      return this.turnos.filter((turno) => {
        let fechaStr = this._dateDisplay.transform(turno.fecha);
        return fechaStr.toLowerCase().includes(this.query.toLowerCase())
      });
    }
    return this.turnos.filter((turno) => turno[this.filterBy].toLowerCase().includes(this.query.toLowerCase()));
  }

  getHistoriaDinamicoFilters(): string[] {
    const filters: string[] = [];

    for (let turno of this.turnos) {
      if (turno.historiaClinica) {
        for (let datoDinamico of turno.historiaClinica.datosDinamicos) {
          if (!filters.includes(datoDinamico.clave)) {
            filters.push(datoDinamico.clave);
          }
        }
      }
    }

    return filters;
  }

  getNombre(turno: ITurno): string {
    if (this.role == 'paciente') {
      return `${turno.especialista.nombre} ${turno.especialista.apellido}`
    }

    return `${turno.paciente.nombre} ${turno.paciente.apellido}`
  }

  getImg(turno: ITurno): string {
    if (this.role == 'paciente') {
      return turno.especialista.imagenPerfil
    }

    return turno.paciente.imagenPerfil
  }

  puedeCancelar(turno: ITurno): boolean {
    if (this.role == 'paciente') {
      return turno.estado != 'realizado' && turno.estado != 'cancelado' && turno.estado != 'rechazado';
    }
    else {
      return turno.estado != 'aceptado' && turno.estado != 'realizado' && turno.estado != 'rechazado' && turno.estado != 'cancelado';
    }
  }

  puedeVerComentario(turno: ITurno): boolean {
    if (turno.comentario || turno.review)
      return true;

    return false;
  }

  puedeCompletarEncuesta(turno: ITurno): boolean {
    if (this.role == 'paciente' && turno.estado == 'realizado' && turno.comentario && !turno.encuesta) {
      return true;
    }

    return false;
  }

  puedeCalificarAtencion(turno: ITurno): boolean {
    if (this.role == 'paciente' && turno.estado == 'realizado' && !turno.review)
      return true;

    return false;
  }

  puedeRechazar(turno: ITurno): boolean {
    if (this.role == 'especialista' && turno.estado == 'pendiente')
      return true;

    return false;
  }

  puedeAceptar(turno: ITurno): boolean {
    if (this.role == 'especialista' && turno.estado == 'pendiente')
      return true;

    return false;
  }

  puedeFinalizar(turno: ITurno): boolean {
    if (this.role == 'especialista' && turno.estado == 'aceptado')
      return true;

    return false;
  }

  puedeDejarHistoriaClinica(turno: ITurno) {
    if (this.role == 'especialista' && turno.estado == 'realizado' && !turno.historiaClinica)
      return true;
    return false;
  }

  cancelar(turno: ITurno) {
    this.nuevoEstado = 'cancelado';
    this.motivoComentario = 'cancelar';
    this.turnoAModificar = turno;
    this.visibleComentario = true;
  }

  rechazar(turno: ITurno) {
    this.nuevoEstado = 'rechazado';
    this.motivoComentario = 'rechazar';
    this.turnoAModificar = turno;
    this.visibleComentario = true;
  }

  aceptar(turno: ITurno) {
    this.turnoAModificar = turno;
    this.turnoService.update(
      this.turnoAModificar!,
      {
        estado: 'aceptado',
      }
    )
      .then(
        () => {

        }
      )
      .catch(
        (err) => {
          console.log(err);
        }
      );
  }

  finalizar(turno: ITurno) {
    this.nuevoEstado = 'realizado';
    this.motivoComentario = 'finalizar';
    this.turnoAModificar = turno;
    this.visibleComentario = true;
  }

  dejarHistoriaClinica(turno: ITurno) {
    this.nuevoEstado = 'realizado';
    this.motivoComentario = 'finalizar';
    this.turnoAModificar = turno;
    this.visibleHistoria = true;
  }

  verReview(turno: ITurno) {
    this.turnoAModificar = turno;
    this.visibleReview = true;
  }

  dejarReview(turno: ITurno) {
    this.turnoAModificar = turno;
    this.visibleEncuestaAtencion = true;
  }

  mostrarEncuesta(turno: ITurno) {
    this.turnoAModificar = turno;
    this.visibleEncuesta = true;
  }

  confirmarComentario() {
    this.turnoAModificar
    this.turnoService.update(
      this.turnoAModificar!,
      {
        estado: this.nuevoEstado,
        comentario: this.nuevoComentario,
      }
    )
      .then(
        () => {

        }
      )
      .catch(
        (err) => {
          console.log(err);
        }
      );
    this.visibleComentario = false;
    this.nuevoComentario = '';
  }

  confirmarReview() {
    this.turnoAModificar
    this.turnoService.update(
      this.turnoAModificar!,
      {
        review: this.nuevoComentario,
      }
    )
      .then(
        () => {

        }
      )
      .catch(
        (err) => {
          console.log(err);
        }
      );
    this.visibleEncuestaAtencion = false;
    this.nuevoComentario = '';
  }

  puedeConfirmar() {
    return this.nuevoComentario.length < 1;
  }

  clearEncuesta() {
    for (let pregunta of this.encuesta) {
      pregunta.respuesta = '';
    }
  }

  puedeEnviarEncuesta() {
    for (let pregunta of this.encuesta) {
      if (pregunta.respuesta.length < 1)
        return true;
    }
    return false;
  }

  enviarEncuesta() {
    this.turnoAModificar
    this.turnoService.update(
      this.turnoAModificar!,
      {
        encuesta: this.encuesta,
      }
    )
      .then(
        () => {

        }
      )
      .catch(
        (err) => {
          console.log(err);
        }
      );
    this.visibleEncuesta = false;
    this.clearEncuesta();
  }

  enviarHistoriaClinica(historiaClinica: IHistoriaClinica) {
    this.turnoAModificar
    this.turnoService.update(
      this.turnoAModificar!,
      {
        historiaClinica: historiaClinica,
      }
    )
      .then(
        () => {

        }
      )
      .catch(
        (err) => {
          console.log(err);
        }
      );
    this.visibleHistoria = false;
  }

  getSearchingString(): string {
    let str = 'Buscando por ' + this.filterBy;
    if (this.filterBy == 'historiaClinica') {
      str += ': ' + this.campoAdicional;
    }
    return str;
  }

  puedeEnviarEncuestaAtencion() {
    return this.encuestaAtencion.some((pregunta, index) => {
      if (index === 0 || index === 2) { // Pregunta de comentario adicional y recomendación
        return !pregunta.respuesta || pregunta.respuesta.trim().length === 0;
      } else if (index === 1) { // Pregunta de calificación con estrellas
        return pregunta.respuesta === 0;
      } else if (index === 4) { // Pregunta de nivel de satisfacción (rango)
        return pregunta.respuesta < 1 || pregunta.respuesta > 10;
      }
      return false;
    });
  }

  enviarEncuestaAtencion() {
    this.turnoService.update(
      this.turnoAModificar!,
      {
        review: this.encuestaAtencion
      }
    )
      .then(() => {
        // Manejar éxito
      })
      .catch((err) => {
        console.log(err);
      });

    this.visibleEncuestaAtencion = false;

    // Limpiar los campos después de enviar
    this.encuestaAtencion.forEach((pregunta, index) => {
      if (index === 0 || index === 2) { // Pregunta de comentario adicional y recomendación
        pregunta.respuesta = '';
      } else if (index === 1 || index === 4) { // Pregunta de estrellas y nivel de satisfacción
        pregunta.respuesta = 0;
      } else if (index === 3) { // Pregunta de checkbox
        pregunta.respuesta = [];
      }
    });
  }
}
