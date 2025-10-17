import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TeamMatchesComponent } from "./components/team-matches/team-matches.component";

@Component({
  selector: 'app-root',
  imports: [TeamMatchesComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'cornelios-app';
}
