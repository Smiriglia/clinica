import { Component, inject, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { Chart, ChartConfiguration, registerables } from 'chart.js'
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { TurnoService } from '../../services/turno.service';
import { ITurno } from '../../interfaces/turno.interface';
import { CalendarModule } from 'primeng/calendar';
import { Iingreso } from '../../interfaces/ingreso.interface';
import { AuthService } from '../../services/auth.service';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { StatNumberDirective } from '../../directives/stat-number.directive';
import { UserService } from '../../services/user.service';
import { IEspecialista, IPaciente, IUser } from '../../interfaces/user.interface';

Chart.register(...registerables);

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [
    TableModule,
    ButtonModule,
    DropdownModule,
    FormsModule,
    CalendarModule,
    StatNumberDirective,
  ],
  templateUrl: './estadisticas.component.html',
  styleUrl: './estadisticas.component.css'
})
export class EstadisticasComponent implements OnInit {
  turnoService = inject(TurnoService);
  authService = inject(AuthService);
  userService = inject(UserService);
  turnos: ITurno[] = [];
  ingresos: Iingreso[] = [];
  rangeDates: Date[] = [new Date(), new Date()];
  especialistas: IEspecialista[] = [];
  pacientes: IPaciente[] = [];
  selectedPaciente: IPaciente | null = null;
  options = [
    { name: 'Log de ingresos al sistema', value: 1 },
    { name: 'Cantidad de turnos por especialidad', value: 2 },
    { name: 'Cantidad de turnos por día', value: 3 },
    { name: 'Cantidad de turnos solicitado por médico en un lapso de tiempo', value: 4 },
    { name: 'Cantidad de turnos finalizados por médico en un lapso de tiempo', value: 5 },
    { name: 'Cantidad de visitas a la clínica', value: 6 },
    { name: 'Cantidad de pacientes por especialidad', value: 7 },
    { name: 'Cantidad de médicos por especialidad', value: 8 },
    { name: 'Informe basado en la encuesta al cliente', value: 9 },
    { name: 'Ver turnos por paciente', value: 10 },
  ];
  selectedView = 'estadisticas';
  chart!: Chart;
  data: {
    [key: string]: any;
  } = {};
  selectedOption: any;
  config: ChartConfiguration = {
    type: 'bar',
    data: {
      labels: [],
      datasets: [
        {
          label: 'Turnos',
          backgroundColor: 'blue',
          borderColor: 'red',
          data: [200, 100, 300, 150, 400, 50],
        }
      ]
    }
  };

  getKeys(): string[] {
    return Object.keys(this.data);
  }


  ngOnInit(): void {
    this.turnoService.getAll()
      .subscribe(
        (turnos) => {
          this.turnos = turnos;
        }
      );

    this.authService.getIngresos()
      .subscribe(
        (ingresos) => {
          this.ingresos = ingresos;
        }
      );
    this.userService.getUsersByRole('especialista')
      .then((users) => {
        this.especialistas = users as IEspecialista[];
      }
      );
    this.userService.getUsersByRole('paciente')
      .then((users) => {
        this.pacientes = users as IPaciente[];
      }
      );
  }



  verEstadisticas() {
    this.selectedView = 'estadisticas';
  }

  verGrafico() {
    this.selectedView = 'grafico';
    this.loadGrafico();
  }

  loadGrafico() {
    setTimeout(
      () => {
        this.chart = new Chart('chart', this.config)
      },
      150
    );
  }

  changeOption() {
    console.log(this.selectedOption);
    switch (this.selectedOption.value) {
      case 1:
        this.calcularCantIngresosDia();
        break;
      case 2:
        this.calcularCantTurnosEsp();
        break;
      case 3:
        this.calcularCantTurnosDia();
        break;
      case 4:
        this.calcularSolicitadosMedico();
        break;
      case 5:
        this.calcularRealizadosMedico();
        break;
      case 6:
        this.calcularCantVisitas();
        break;
      case 7:
        this.calcularCantPacientesEsp();
        break;
      case 8:
        this.calcularCantMedicosEsp();
        break;
      case 9:
        this.calcularPromedioEstrellasPorEspecialidad();
        break;
      case 10:
        this.calcularCantTurnosPaciente();
        break;
    }
  }

  // {name: 'Cantidad de turnos por especialidad', value: 2}
  calcularCantTurnosEsp() {
    this.data = {};

    for (let turno of this.turnos) {
      if (this.data[turno.especialidad])
        this.data[turno.especialidad] += 1;
      else
        this.data[turno.especialidad] = 1;
    }
    this.updateChart('line', 'Turnos');
  }

  calcularSolicitadosMedico() {
    this.data = {};

    for (let turno of this.turnos) {
      if (turno.fecha >= this.rangeDates[0] && turno.fecha <= this.rangeDates[1]) {
        const nombreCompleto = `${turno.especialista.nombre} ${turno.especialista.apellido}`;
        if (this.data[nombreCompleto])
          this.data[nombreCompleto] += 1;
        else
          this.data[nombreCompleto] = 1;
      }
    }
    this.updateChart('bar', 'Turnos');
  }

  calcularRealizadosMedico() {
    this.data = {};

    for (let turno of this.turnos) {
      if (turno.fecha >= this.rangeDates[0] && turno.fecha <= this.rangeDates[1] && turno.estado == 'realizado') {
        const nombreCompleto = `${turno.especialista.nombre} ${turno.especialista.apellido}`;
        if (this.data[nombreCompleto])
          this.data[nombreCompleto] += 1;
        else
          this.data[nombreCompleto] = 1;
      }
    }
    this.updateChart('', 'Turnos');
  }

  calcularCantTurnosDia() {
    this.data = {};

    for (let turno of this.turnos) {
      let dateStr: string = `${turno.fecha.getDate()}/${turno.fecha.getMonth()}/${turno.fecha.getFullYear()}`
      if (this.data[dateStr])
        this.data[dateStr] += 1
      else
        this.data[dateStr] = 1
    }
    this.updateChart('bar', 'Turnos');
  }


  calcularCantIngresosDia() {
    this.data = {};

    for (let ingreso of this.ingresos) {
      let dateStr: string = `${ingreso.fecha.getDate()}/${ingreso.fecha.getMonth()}/${ingreso.fecha.getFullYear()}`
      if (this.data[dateStr])
        this.data[dateStr] += 1
      else
        this.data[dateStr] = 1
    }
    this.updateChart('bar', 'Ingresos');
  }

  calcularCantVisitas() {
    this.data = {};

    for (let turno of this.turnos) {
      if (turno.estado === 'realizado') {
        let dateStr: string = `${turno.fecha.getDate()}/${turno.fecha.getMonth() + 1}/${turno.fecha.getFullYear()}`;
        if (this.data[dateStr]) {
          this.data[dateStr] += 1;
        } else {
          this.data[dateStr] = 1;
        }
      }
    }

    this.updateChart('bar', 'Visitas a la Clínica');
  }

  calcularCantPacientesEsp() {
    this.data = {};

    for (let turno of this.turnos) {
      if (this.data[turno.especialidad]) {
        this.data[turno.especialidad].add(turno.paciente.uid);
      } else {
        this.data[turno.especialidad] = new Set([turno.paciente.uid]);
      }
    }

    for (let especialidad in this.data) {
      this.data[especialidad] = this.data[especialidad].size;
    }

    this.updateChart('bar', 'Pacientes por Especialidad');
  }

  calcularCantMedicosEsp() {
    this.data = {};

    for (let especialista of this.especialistas) {
      if (especialista.estaHabilitado) {
        for (let especialidad of especialista.especialidades) {
          if (this.data[especialidad]) {
            this.data[especialidad] += 1;
          } else {
            this.data[especialidad] = 1;
          }
        }
      }
    }

    this.updateChart('bar', 'Médicos por Especialidad');
  }

  calcularCantTurnosPaciente() {
    this.data = {};

    for (let turno of this.turnos) {
      if (turno.pacienteUid == this.selectedPaciente?.uid) {
        if (this.data[turno.estado]) {
          this.data[turno.estado] += 1;
        }
        else {
          this.data[turno.estado] = 1;
        }
      }
    }

    this.updateChart('bar', 'Estado Turnos Paciente');
  }

  calcularPromedioEstrellasPorEspecialidad() {
    this.data = {};

    for (let turno of this.turnos) {
      if (turno.review) {
        for (let pregunta of turno.review) {
          if (pregunta.pregunta.toLowerCase().includes('estrellas') && typeof pregunta.respuesta === 'number') {
            if (this.data[turno.especialidad]) {
              this.data[turno.especialidad] += pregunta.respuesta;
            }
            else {
              this.data[turno.especialidad] = pregunta.respuesta;
            }
          }
        }
      }
    }

    for (let especialidad in Object.keys(this.data)) {
      if (this.data[especialidad] > 0) {
        this.data[especialidad] = this.data[especialidad] / this.data[especialidad];
      }
    }

    this.updateChart('bar', 'Promedio de Estrellas por Especialidad');
  }





  updateChart(type: string, dataLabel: string) {
    const keys = this.getKeys();
    let newLabels: string[] = [];
    let newData: number[] = [];
    for (let key of keys) {
      newLabels.push(key);
      newData.push(this.data[key]);
    }
    this.config.data.labels = newLabels;
    this.config.data.datasets[0].data = newData;
    this.config.data.datasets[0].label = dataLabel;
    if (type == 'line')
      this.config.type = 'line';
    else
      this.config.type = 'bar';

    if (this.selectedView == 'grafico') {
      this.selectedView = 'estadisticas';
      setTimeout(
        () => {
          this.selectedView = 'grafico';
          this.loadGrafico();
        },
        1
      )
    }


  }
  generateExcel() {
    const headers = ['Campo', 'Cantidad'];
    const rows = Object.entries(this.data);
    const worksheetData = [headers, ...rows];

    const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(worksheetData);

    const workbook: XLSX.WorkBook = {
      Sheets: { 'Data': worksheet },
      SheetNames: ['Data']
    };

    XLSX.writeFile(workbook, 'estadisticas.xlsx');
  }
  generateImage() {
    if (this.chart) {
      const base64Img = this.chart.toBase64Image('image/png', 1.0);
      
      const link = document.createElement('a');
      link.href = base64Img;
      link.download = `${this.selectedOption.name}.png`;
      link.click();
    }
  }

  generatePdf() {
    const doc = new jsPDF();
    const base64Img = this.chart.toBase64Image('PNG', 1000);

    doc.addImage(base64Img, 'PNG', 10, 10, 200, 100);

    doc.text(this.selectedOption.name, 10, 120);

    doc.save('grafico.pdf');
  }
}
