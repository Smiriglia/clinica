import { Directive, ElementRef, Input, OnChanges, OnInit } from '@angular/core';

@Directive({
  selector: '[appBorderColorByRole]',
  standalone: true
})
export class BorderColorByRoleDirective implements OnChanges {
  @Input() role : string = '';
  constructor(
    private el : ElementRef
  ) { }

  ngOnChanges(): void {
    let color : string;
    if(this.role == 'admin')
    {
      color = 'red';
    }
    else if(this.role == 'especialista') {
      color = 'magenta';
    }
    else {
      color = 'blue';
    }

    this.el.nativeElement.style.borderColor = color;
    
  }

}
