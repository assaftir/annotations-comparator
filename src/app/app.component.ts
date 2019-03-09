import { Component } from '@angular/core';
import { ManuscriptService } from './services/services.imageService';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [ManuscriptService]
})
export class AppComponent {

}
