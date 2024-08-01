import { Component, inject } from '@angular/core';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from "primeng/floatlabel"
import { FormsModule } from '@angular/forms';
import { PasswordModule } from 'primeng/password';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoaderComponent } from '../loader/loader.component';
import { scaleUpAnimation } from '../../animations/animations';
import { BorderColorByRoleDirective } from '../../directives/border-color-by-role.directive';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    DividerModule,
    ButtonModule,
    InputTextModule,
    FloatLabelModule,
    PasswordModule,
    LoaderComponent,
    BorderColorByRoleDirective,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  animations: [
    scaleUpAnimation
  ]
})
export class LoginComponent {
  errorMessage = ""
  authService = inject(AuthService);
  router = inject(Router);
  userCredentials : IUserCredentials[] = [
    {
      email: 'faustosmiriglia@gmail.com',
      password: 'test123',
      picture: 'https://firebasestorage.googleapis.com/v0/b/clinica-90464.appspot.com/o/files%2F19%3A25%3A57%20GMT-0300%20(hora%20est%C3%A1ndar%20de%20Argentina)_foto_fausto.jpg?alt=media&token=9eaf702a-a881-4b31-a69a-b6d999c02da8',
      role: 'paciente',
    },
    {
      email: 'jorzarurdo@gufum.com',
      password: 'test123',
      picture: 'https://firebasestorage.googleapis.com/v0/b/clinica-90464.appspot.com/o/files%2F19%3A31%3A04%20GMT-0300%20(hora%20est%C3%A1ndar%20de%20Argentina)_Willy%20(2).png?alt=media&token=0218f47c-4560-414e-83e9-88a61a8181ac',
      role: 'paciente',
    },
    {
      email: 'vaspefukni@gufum.com',
      password: 'test123',
      picture: 'https://firebasestorage.googleapis.com/v0/b/clinica-90464.appspot.com/o/files%2F19%3A34%3A10%20GMT-0300%20(hora%20est%C3%A1ndar%20de%20Argentina)_hangman.jpg?alt=media&token=a13930ac-6c09-4229-a4fd-229a054b9385',
      role: 'paciente',
    },
    {
      email: 'dapawood@gmail.com',
      password: 'test123',
      picture: 'https://firebasestorage.googleapis.com/v0/b/clinica-90464.appspot.com/o/files%2F20%3A50%3A25%20GMT-0300%20(hora%20est%C3%A1ndar%20de%20Argentina)_5a0c40a65a997e1c2cea116c.png?alt=media&token=e2d2c197-d627-4a51-981a-e18f7c2e0224',
      role: 'especialista',
    },
    {
      email: 'caloxa4428@digdy.com',
      password: 'test123',
      picture: 'https://firebasestorage.googleapis.com/v0/b/clinica-90464.appspot.com/o/files%2F19%3A25%3A46%20GMT-0300%20(hora%20est%C3%A1ndar%20de%20Argentina)_latest.png?alt=media&token=ecf08fcf-e691-486e-9151-9865efa1965b',
      role: 'especialista',
    },
    {
      email: 'dapawood2@gmail.com',
      password: 'test123',
      picture: 'https://firebasestorage.googleapis.com/v0/b/clinica-90464.appspot.com/o/files%2F19%3A12%3A37%20GMT-0300%20(hora%20est%C3%A1ndar%20de%20Argentina)_descarga.jpg?alt=media&token=0f14ae21-f987-4b14-8410-c98cf941f7c3',
      role: 'admin',
    },
    
  ];
  userData = {
    email: "",
    password: "",
  }
  loaderState = {
    loading: false,
    state: "loading"
  }

  onLogin() {
    this.loaderState.loading = true;
    this.authService.currentUserSignal.set(undefined);
    this.authService.singIn(this.userData.email, this.userData.password).subscribe(
      {
        next: () => {
          this.loaderState.state = "check"
          this.router.navigateByUrl('/home');
        },
        error: (err) => {
          switch(err.code)
          {
            case "auth/invalid-email":
              this.errorMessage = 'El formato de correo es invalido';
              break;
            case "auth/operation-not-allowed":
              this.errorMessage = "Operación no permitida"
              break;
            case "auth/emailNotVerified":
              this.errorMessage = "Email no verificado";
              break;
            case "auth/noHabilitado":
              this.errorMessage = "Especialista no habilitado";
              break;
            default:
              this.errorMessage = 'El email o contraseña no son correctos'
          }
          this.loaderState.state = "error";
          setTimeout(() => {
            this.loaderState.state = "loading";
            this.loaderState.loading = false;
          },
            1500);
        }

      }
    );    
  }
  
  onLoadCredentials(userCredential : IUserCredentials) {
    this.userData.email = userCredential.email;
    this.userData.password = userCredential.password;
  }

  onRegisterClick() {
    this.router.navigateByUrl('register');
  }
}

interface IUserCredentials {
  email: string,
  password: string,
  role: string,
  picture: string,
}