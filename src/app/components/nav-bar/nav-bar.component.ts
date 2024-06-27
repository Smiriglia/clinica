import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { TabMenuModule } from 'primeng/tabmenu';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TabMenuModule],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.css'
})
export class NavBarComponent {
  authService = inject(AuthService);
  router = inject(Router);
  itemsUnLogged: MenuItem[] | undefined;
  itemsLogged: MenuItem[] | undefined;
  itemsAdmin: MenuItem[] | undefined;

  ngOnInit() {
      const user = this.authService.currentUserSignal();


      this.itemsUnLogged = [
        { label: 'Welcome', icon: 'pi pi-users', routerLink: "/welcome"  },
        { label: 'Login', icon: 'pi pi-sign-in', routerLink: "/login"  },
      ];
      this.itemsLogged = [
        { label: 'Welcome', icon: 'pi pi-users', routerLink: "/welcome"  },
        { label: 'Home', icon: 'pi pi-home', routerLink: "/home" },
        { label: 'Products', icon: 'pi pi-list', routerLink: "/example2"  },
        { label: 'Salir', icon: 'pi pi-sign-out', command: () => {
          this.authService.logOut();
          this.router.navigateByUrl('/welcome')}  },
      ];

      this.itemsAdmin = [
        { label: 'Home', icon: 'pi pi-home', routerLink: "/home" },
        { label: 'Usuarios', icon: 'pi pi-users', routerLink: "/users" },
        { label: 'Salir', icon: 'pi pi-sign-out', command: () => {
          this.authService.logOut();
          this.router.navigateByUrl('/welcome')}  },
      ]
  }

  getItems() {
    if(this.authService.currentUserSignal() != null) {
      if(this.authService.currentUserSignal()?.role == 'admin')
        return this.itemsAdmin
      return this.itemsLogged
    }
    return this.itemsUnLogged;
  }
}
