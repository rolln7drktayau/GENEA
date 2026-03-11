import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Stats } from '../../models/stats.model';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  private readonly apiUrl = `${environment.apiBaseUrl}/api/stats`;
  stats: any = {};

  constructor(private http: HttpClient) { }

  getStats(): Observable<Stats[]> {
    return this.http.get<Stats[]>(`${this.apiUrl}/`);
  }

  updateStats(stats: Stats): Observable<Stats> {
    return this.http.post<Stats>(`${this.apiUrl}/update`, stats);
  }

  saveStats(): void {
    let stats = sessionStorage.getItem('Stats');
    if (stats != null) {
      let toSave = JSON.parse(stats);
      this.updateStats(toSave).subscribe();
    }
  }
}
