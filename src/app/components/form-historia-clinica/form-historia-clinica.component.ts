import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IDatosDinamicos, IHistoriaClinica } from '../../interfaces/historia_clinica.interface';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { SliderModule } from 'primeng/slider';
import { InputSwitchModule } from 'primeng/inputswitch';

@Component({
  selector: 'app-form-historia-clinica',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputNumberModule,
    ButtonModule,
    FloatLabelModule,
    InputTextModule,
    FormsModule,
    SliderModule,
    InputSwitchModule,
  ],
  templateUrl: './form-historia-clinica.component.html',
  styleUrl: './form-historia-clinica.component.css'
})
export class FormHistoriaClinicaComponent implements OnInit {
  @Output() onSubmit = new EventEmitter<IHistoriaClinica>();

  form!: FormGroup;
  selectedProfilePicture : File | null = null;
  dynamicData : IDatosDinamicos[] = [];

  datoDinamicoRango : IDatosDinamicos = {
    clave: '',
    valor: 50,
  }

  datoDinamicoNum : IDatosDinamicos = {
    clave: '',
    valor: 0,
  }

  datoDinamicoSwitch : IDatosDinamicos = {
    clave: '',
    valor: true,
  }

  ngOnInit(): void {
    this.form = new FormGroup(
      {
        altura: new FormControl("1", [Validators.required, Validators.min(1), Validators.max(300)]),
        peso: new FormControl("1", [Validators.required, Validators.min(1), Validators.max(500)]),
        temperatura: new FormControl("30", [Validators.required, Validators.min(30), Validators.max(45)]),
        presion: new FormControl("100", [Validators.required, Validators.min(100), Validators.max(300)]),
      },
    );
  }



  get altura(){
    return this.form.get('altura');
  }
  get peso(){
    return this.form.get('peso');
  }
  get temperatura(){
    return this.form.get('temperatura');
  }
  get presion(){
    return this.form.get('presion');
  }

  addDatoDinamico() {
    this.dynamicData.push({
      clave: '',
      valor: '',
    });
  }

  esValidoDatosDinamicos() {
    if (!this.datoDinamicoNum.clave || !this.datoDinamicoRango.clave || !this.datoDinamicoSwitch.clave)
      return false;
    for (let dato of this.dynamicData)
    {
      if (!dato.clave || !dato.valor )
        return false;
    }

    return true;
  }

  sendForm() {
    if(this.form.valid && this.esValidoDatosDinamicos()) {
      const finalDatosDinamicos : IDatosDinamicos[] = [...this.dynamicData, this.datoDinamicoNum, this.datoDinamicoRango, this.datoDinamicoSwitch ]
      const data : IHistoriaClinica = {
        ...this.form.value,
        datosDinamicos: finalDatosDinamicos,
      }
      this.onSubmit.emit(data as IHistoriaClinica);
    }
  }
}
