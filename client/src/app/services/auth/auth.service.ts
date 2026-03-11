import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Person } from '../../models/person.model';
import { Stats } from '../../models/stats.model'; 
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiBaseUrl}/api/persons`;
  private readonly statsUrl = `${environment.apiBaseUrl}/api/stats`;
  private readonly authSessionKey = 'IsAuthenticated';
  private readonly roleSessionKey = 'UserRole';
  private readonly adminRole = 'ADMIN';

  stats: Stats = new Stats(0, 0, 0, 0);

  constructor(private http: HttpClient) {}

  get isAValidUser(): boolean {
    return sessionStorage.getItem(this.authSessionKey) === 'true';
  }

  set isAValidUser(value: boolean) {
    sessionStorage.setItem(this.authSessionKey, String(value));
  }

  get currentRole(): string {
    return sessionStorage.getItem(this.roleSessionKey) ?? 'USER';
  }

  get isAdmin(): boolean {
    return this.currentRole === this.adminRole;
  }

  // Login 
  checkPerson(person: Person): Observable<Person> {
    return this.http.post<Person>(`${this.apiUrl}/check`, person);
  }

  getPersonByEmail(person: Person): Observable<Person> {
    return this.http.post<Person>(`${this.apiUrl}/emailcheck`, person);
  }

  // Updates
  updateDb(person: Person): Observable<Person> {
    return this.http.put<Person>(`${this.apiUrl}/updatedb`, person);
  }

  updatePerson(id: string, personDetails: Person): Observable<Person> {
    return this.http.put<Person>(`${this.apiUrl}/update/${id}`, personDetails);
  }

  setSession(person: Person): void {
    this.isAValidUser = true;
    sessionStorage.setItem(this.roleSessionKey, person.role || 'USER');
    sessionStorage.setItem('UserId', person.id);
    sessionStorage.setItem('UserFirstName', person.firstname);
    sessionStorage.setItem('UserLastName', person.lastname);
    sessionStorage.setItem('UserGender', person.gender);
    sessionStorage.setItem('UserPhoto', person.photo);
    sessionStorage.setItem('User', JSON.stringify(person));
    this.setStats();
  }

  setStats(): void {
    this.getAllPersons().subscribe(persons => {
      const nextStats = new Stats(0, 0, 0, 0);
      persons.forEach((person) => {
        if (person.mem?.length) {
          nextStats.memories += person.mem.length;
        }
        if (person.gender === 'male') {
          nextStats.males++;
        }
        if (person.gender === 'female') {
          nextStats.females++;
        }
      });
      nextStats.connections = persons.length;
      this.stats = nextStats;
      sessionStorage.setItem('Stats', JSON.stringify(nextStats));
      this.saveStats();
    });
  }

  getTeam(): Observable<Person[]> {
    return this.getAllPersons().pipe(
      map((persons) => persons.filter((person) => person.status === 'Team'))
    );
  }

  getStats(): Observable<Stats[]> {
    return this.http.get<Stats[]>(`${this.statsUrl}/`);
  }

  updateStats(stats: Stats): Observable<Stats> {
    return this.http.post<Stats>(`${this.statsUrl}/update`, stats);
  }

  saveStats(): void {
    const stats = sessionStorage.getItem('Stats');
    if (stats) {
      const toSave = JSON.parse(stats);
      this.updateStats(toSave).subscribe();
    }
  }

  deleteSession(): void {
    sessionStorage.clear();
  }

  getAllPersons(): Observable<Person[]> {
    return this.http.get<Person[]>(`${this.apiUrl}/`);
  }

  createPerson(person: Person): Observable<Person> {
    return this.http.post<Person>(`${this.apiUrl}/create`, person);
  }

  getFamily(id: string): Observable<Person[]> {
    return this.http.get<Person[]>(`${this.apiUrl}/family/${id}`);
  }

  getPersonById(id: string): Observable<Person> {
    return this.http.get<Person>(`${this.apiUrl}/${id}`);
  }

  sendEmail(initiator: Person, person: Person): Observable<Map<string, string>> {
    return this.http.post<Map<string, string>>(`${this.apiUrl}/sendEmail`, { initiator, person });
  }

  deletePerson(id: string): Observable<Person> {
    return this.http.delete<Person>(`${this.apiUrl}/delete/${id}`);
  }

  getChildrenByPersonId(id: string): Observable<Person[]> {
    return this.http.get<Person[]>(`${this.apiUrl}/${id}/children`);
  }

  getMotherByPersonId(id: string): Observable<Person> {
    return this.http.get<Person>(`${this.apiUrl}/${id}/mother`);
  }

  getFatherByPersonId(id: string): Observable<Person> {
    return this.http.get<Person>(`${this.apiUrl}/${id}/father`);
  }

  getSiblingsByPersonId(id: string): Observable<Person[]> {
    return this.http.get<Person[]>(`${this.apiUrl}/${id}/siblings`);
  }

}
