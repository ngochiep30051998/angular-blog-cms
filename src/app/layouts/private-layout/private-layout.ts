import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../../components/header/header';
import { Sidebar } from '../../components/sidebar/sidebar';

@Component({
  selector: 'app-private-layout',
  imports: [RouterOutlet, Header, Sidebar],
  templateUrl: './private-layout.html',
  styleUrl: './private-layout.scss',
  standalone: true,
})
export class PrivateLayout {

}
