import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Person } from '../../models/person.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PersonService {
  private readonly apiUrl = `${environment.apiBaseUrl}/api/persons`;

  constructor(private http: HttpClient) { }

  removeIdFromPersons(persons: any[], personToRemove: Person): any[] {
    const idToRemove = personToRemove.id;
    persons.forEach(person => {

      // Remove id from partner array
      if (person.pid)
        person.pid = person.pid.filter((id: string) => id !== idToRemove);

      // Remove id from mother and father attributes
      if (person.mid === idToRemove) {
        person.mid = null;
      }
      if (person.fid === idToRemove) {
        person.fid = null;
      }
    });

    // Remove the person with the given ID from the array
    persons = persons.filter(person => person.id !== idToRemove);
    return persons;
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

  updatePerson(id: string, personDetails: Person): Observable<Person> {
    return this.http.put<Person>(`${this.apiUrl}/${id}`, personDetails);
  }

  deletePerson(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  init(): Observable<Person[] | string> {
    return this.http.get<Person[] | string>(`${this.apiUrl}/init`);
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
