import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, inject, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [],
  templateUrl: './language-switcher.component.html',
  styleUrl: './language-switcher.component.css',
  animations: [
    trigger('menuAnimation', [
      state('closed', style({
        height: '0px',
        opacity: 0
      })),
      state('open', style({
        height: '*',
        opacity: 1
      })),
      transition('closed <=> open', animate('300ms ease-in-out'))
    ])
  ]
})
export class LanguageSwitcherComponent implements OnInit{
  private translate = inject(TranslateService);

  isOpen = false;
  currentFlag = 'es';
  languages = [
    { code: 'es', name: 'Español', flag: 'es' },
    { code: 'en', name: 'English', flag: 'us' },
    { code: 'pt', name: 'Português', flag: 'pt' }
  ];

  ngOnInit() {
    const defaultLang = localStorage.getItem('language') || 'es';
    this.translate.setDefaultLang(defaultLang);
    this.translate.use(defaultLang);
    if (defaultLang == 'en') this.currentFlag = 'us'
    else this.currentFlag = defaultLang;
  }

  toggleMenu() {
    this.isOpen = !this.isOpen;
    console.log(this.isOpen);
  }

  changeLanguage(language: any) {
    this.currentFlag = language.flag;
    this.translate.use(language.code);
    localStorage.setItem('language', language.code);
    this.isOpen = false;
  }
}
