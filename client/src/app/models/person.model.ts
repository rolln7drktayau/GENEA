// src/app/person.model.ts

// export the Person class
export class Person {
  // declare the properties
  id: string;
  name: string;
  firstname: string;
  lastname: string;
  gender: string;
  email: string;
  password: string;
  pids: Array<string>;
  mid: string;
  fid: string;
  bdate: string;
  photo: any;
  mem: Array<any>;
  status: string;
  desc : string;

  // define the constructor
  constructor(id?: string, name?: string, firstname?: string, lastname?: string, gender?: string, email?: string, password?: string, partner?: Array<string>, mother?: string, father?: string, date?: string, photo?: any, mem?: Array<any>, status?: string, desc?: string) {
    this.id = id || '';
    this.name = firstname + ' ' + lastname || '';
    this.firstname = firstname || '';
    this.lastname = lastname || '';
    this.gender = gender || '';
    this.email = email || '';
    this.password = password || '';
    this.pids = partner || [];
    this.mid = mother || '';
    this.fid = father || '';
    this.bdate = date || '';
    this.photo = photo || '';
    this.mem = mem || [];
    this.status = status || '';
    this.desc = desc || '';
  }

  // optionally, define some methods
  // for example, a method to get the full name of the person
  getFullName(): string {
    return this.firstname + ' ' + this.lastname;
  }
}
