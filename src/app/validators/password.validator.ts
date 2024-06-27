import { ValidatorFn, ValidationErrors, AbstractControl } from "@angular/forms";

export function confirmPasswordValidator(): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
        
      const clave = formGroup.get('password');
      const repiteClave = formGroup.get('rePassword');
      const respuestaError = { noMatch: 'La contraseña no coincide' };

      if (clave?.value !== repiteClave?.value) {
        formGroup.get('rePassword')?.setErrors(respuestaError);
        // Si los campos de contraseña no coinciden, devolvemos un error de validación
        return respuestaError;

      } else {
        formGroup.get('rePassword')?.setErrors(null);
        // Si los campos de contraseña coinciden, la validación es correcta
        return null;
      }
    };
}