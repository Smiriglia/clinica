import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormRegisterPacienteComponent } from './form-register-paciente.component';

describe('FormRegisterPacienteComponent', () => {
  let component: FormRegisterPacienteComponent;
  let fixture: ComponentFixture<FormRegisterPacienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormRegisterPacienteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FormRegisterPacienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
