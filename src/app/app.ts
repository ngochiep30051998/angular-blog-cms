import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { environment } from '../environments/environment';
import { Loading } from './components/loading/loading';
import { ModalComponent } from './components/modal/modal';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Loading, ModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal(environment.title);
}
