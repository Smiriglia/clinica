import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import {CarouselModule} from 'primeng/carousel'

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [
    CarouselModule,
    ButtonModule,
    CardModule,
    RouterLink,
    TranslateModule,
  ],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.css'
})
export class WelcomeComponent {
  images: string[] = ['hospital_1', 'hospital_2', 'hospital_3'];
}
