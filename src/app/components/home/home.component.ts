import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { CarouselModule } from 'primeng/carousel';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CardModule,
    CarouselModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  doctors = [
    {name: 'Dr. Juan Pérez', specialty: 'Cardiología', image: 'assets/images/doctor1.jpg'},
    {name: 'Dra. María García', specialty: 'Pediatría', image: 'assets/images/doctor2.jpg'},
    {name: 'Dr. Carlos López', specialty: 'Traumatología', image: 'assets/images/doctor3.jpg'}
  ];
}
