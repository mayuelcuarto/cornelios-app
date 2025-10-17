import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';

// --- Interfaces para tipar los datos ---
// (Puedes moverlas a su propio archivo, ej: src/app/models/match.model.ts)
export interface Match {
  fixture: {
    id: number;
    date: string;
  };
  league: {
    name: string;
  };
  teams: {
    home: { name: string; logo: string; };
    away: { name: string; logo: string; };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  statistics: {
    team: { id: number; name: string; };
    stats: Array<{ type: string; value: number | null; }>;
  }[];
}

interface ApiTeamResponse {
  response: { team: { id: number } }[];
  results: number;
}

interface ApiFixturesResponse {
  response: Match[];
}


// --- Interfaces para TheSportsDB ---
interface SportsDbTeamResponse {
  teams: { idTeam: string; strTeam: string; }[];
}

interface SportsDbEvent {
  idEvent: string;
  dateEvent: string;
  strLeague: string;
  strHomeTeam: string;
  strAwayTeam: string;
  intHomeScore: string | null;
  intAwayScore: string | null;
  intHomeYellowCards: string | null;
  intAwayYellowCards: string | null;
  intHomeRedCards: string | null;
  intAwayRedCards: string | null;
  intHomeCorners: string | null;
  intAwayCorners: string | null;
}

interface SportsDbLastEventsResponse {
  results: SportsDbEvent[];
}

interface ApiStatisticsResponse {
    response: Match['statistics'];
}


@Injectable({
  providedIn: 'root'
})
export class FootballService {
  private http = inject(HttpClient);

  // Método para TheSportsDB
  async searchTeamMatchesTheSportsDB(teamName: string): Promise<any[]> { // Puedes crear una interfaz más específica
    const API_KEY = environment.theSportsDB.apiKey;
    const API_URL = `https://www.thesportsdb.com/api/v1/json/${API_KEY}`;

    // 1. Buscar el ID del equipo
    const teamResponse = await firstValueFrom(
      this.http.get<SportsDbTeamResponse>(`${API_URL}/searchteams.php?t=${teamName}`)
    );

    if (!teamResponse.teams) {
      throw new Error(`No se encontró el equipo "${teamName}".`);
    }
    const teamId = teamResponse.teams[0].idTeam;

    // 2. Obtener los últimos 5 partidos
    const eventsResponse = await firstValueFrom(
      this.http.get<SportsDbLastEventsResponse>(`${API_URL}/eventslast.php?id=${teamId}`)
    );

    if (!eventsResponse.results) {
      return [];
    }

    // 3. Mapear los datos al formato que tu tabla espera (o adaptar la tabla)
    return eventsResponse.results.map(event => {
      const isHome = event.strHomeTeam.toLowerCase() === teamName.toLowerCase();

      // Lógica mejorada para obtener las tarjetas:
      // Se asegura de que si el valor es `null`, se use '0' antes de convertir a número.
      // Esto evita errores de precedencia y es más fácil de leer.
      const yellowCardsStr = isHome ? event.intHomeYellowCards : event.intAwayYellowCards;
      const redCardsStr = isHome ? event.intHomeRedCards : event.intAwayRedCards;
      const yellowCards = yellowCardsStr ? parseInt(yellowCardsStr, 10) : null;
      const redCards = redCardsStr ? parseInt(redCardsStr, 10) : null;
      // Añadimos la lógica para los córners
      const homeCorners = event.intHomeCorners ? parseInt(event.intHomeCorners, 10) : null;
      const awayCorners = event.intAwayCorners ? parseInt(event.intAwayCorners, 10) : null;

      return {
        fixture: {
          id: event.idEvent,
          date: event.dateEvent,
        },
        league: {
          name: event.strLeague,
        },
        teams: {
          home: { name: event.strHomeTeam },
          away: { name: event.strAwayTeam },
        },
        goals: {
          home: event.intHomeScore ? parseInt(event.intHomeScore, 10) : null,
          away: event.intAwayScore ? parseInt(event.intAwayScore, 10) : null,
        },
        // Adaptamos la estructura para que coincida con lo que la tabla espera
        yellowCards: yellowCards,
        redCards: redCards,
        homeCorners: homeCorners,
        awayCorners: awayCorners
      };
    });
  }
}