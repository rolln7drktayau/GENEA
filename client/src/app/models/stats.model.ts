import { Person } from "./person.model";

export class Stats {
  connections: number;
  males: number;
  females: number;
  memories: number;

  constructor(connections: number, males: number, females: number, memories: number) {
    this.connections = connections;
    this.males = males;
    this.females = females;
    this.memories = memories;
  }
}
