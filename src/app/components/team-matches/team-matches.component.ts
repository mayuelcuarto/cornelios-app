import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FootballService } from '../../services/football.service.ts';

@Component({
  selector: 'app-team-matches',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './team-matches.component.html',
  styleUrls: ['./team-matches.component.css']
})
export class TeamMatchesComponent {
  // Inyección de dependencias moderna
  private footballService = inject(FootballService);

  // Propiedades para el estado del componente
  teamName: string = '';
  matches: any[] = []; // Se usará la estructura de TheSportsDB
  loading: boolean = false;
  error: string | null = null;
  searchedTeam: string = ''; // Para buscar tarjetas del equipo correcto

  async handleSearch(): Promise<void> {
    if (!this.teamName.trim()) {
      this.error = "Por favor, ingresa el nombre de un equipo.";
      return;
    }
    this.loading = true;
    this.error = null;
    this.matches = [];
    this.searchedTeam = this.teamName;

    try {
      this.matches = await this.footballService.searchTeamMatchesTheSportsDB(this.teamName);
    } catch (err: any) {
      this.error = err.message || 'Ocurrió un error al buscar los datos.';
    } finally {
      this.loading = false;
    }
  }
}
