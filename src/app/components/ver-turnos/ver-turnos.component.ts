import { Component, inject, Input, OnInit } from '@angular/core';
import { IPaciente } from '../../interfaces/user.interface';
import { ITurno } from '../../interfaces/turno.interface';
import { TurnoService } from '../../services/turno.service';
import { DateDisplayPipe } from '../../pipes/date-display.pipe';
import { AccordionModule } from 'primeng/accordion';
import { TurnoHeaderPipe } from '../../pipes/turno-header.pipe';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-ver-turnos',
  standalone: true,
  imports: [
    AccordionModule,
    TurnoHeaderPipe,
    ButtonModule,
  ],
  templateUrl: './ver-turnos.component.html',
  styleUrl: './ver-turnos.component.css'
})
export class VerTurnosComponent implements OnInit {
  @Input() paciente! : IPaciente;

  turnosService = inject(TurnoService);
  _dateDisplayPipe = inject(DateDisplayPipe);
  
  turnos : ITurno[] = [];

  ngOnInit(): void {
    this.turnosService.getTurnosRoleUid('paciente', this.paciente.uid)
    .subscribe(
      (turnos) => {
        this.turnos = turnos;
      }
    );
  }
}
