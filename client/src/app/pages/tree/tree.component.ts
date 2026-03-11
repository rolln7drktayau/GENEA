import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import FamilyTree from '@balkangraph/familytree.js';
import { AuthService } from '../../services/auth/auth.service';
import { Person } from '../../models/person.model';

@Component({
  selector: 'app-tree',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, ReactiveFormsModule, NavbarComponent],
  templateUrl: './tree.component.html',
  styleUrl: './tree.component.css'
})
export class TreeComponent implements OnInit {

  person: Person = new Person();
  persons: any[] = [];
  familyData: any[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit() {
    let id = sessionStorage.getItem('UserId');
    if (id != null) {
      this.authService.getTreeData(id).subscribe(persons => {
        console.log('Your Family', persons);
        this.familyData = persons;
        const transformedPersons = this.transformPersonsData(persons);
        console.log('Transformed Data', transformedPersons);
        this.persons = transformedPersons;

        const tree = document.getElementById('tree');
        if (tree) {
          FamilyTree.SEARCH_PLACEHOLDER = "Get focused on a person..."; // the default value is "Search"
          var family = new FamilyTree(tree, {
            // template : 'hugo',
            enableSearch: true,
            nodeMenu: {
              edit: { text: 'Edit' },
              details: { text: 'Details' },
              remove: {
                text: 'Delete',
                // onClick: function (nodeId: any) {
                //   console.log('clicked on remove node', nodeId);
                // }
                onClick: (nodeId: string) => {
                  console.log('clicked on node to remove : ', nodeId);
                  // let toRemove: string = `"${args.removeNodeId}"`;
                  // console.log(toRemove);
                  // let idToRemove = nodeId;
                  family.removeNode(nodeId);
                  this.authService.getPersonById(nodeId).subscribe(result => {
                    if (result) {
                      console.log(result);
                      if (result.email !== null && result.email !== undefined) {
                        console.log('Person To Remove : ', result);
                        let toUpdate = this.removePersonFromTree(result, nodeId);
                        this.updateData(toUpdate);
                      }
                      else {
                        this.authService.deletePerson(nodeId).subscribe(isDeleted => {
                          console.log('Person Deleted : ', isDeleted);
                        });
                      }
                    }
                  });
                }
              }
            },
            editForm: {
              addMore: '',
              generateElementsFromFields: false,
              // titleBinding: "name",
              // photoBinding: "img",
              buttons: {
                // remove: {
                //   icon: FamilyTree.icon.remove(24, 24, '#fff'),
                //   text: 'Delete',
                //   hideIfEditMode: true,
                //   hideIfDetailsMode: false
                // }
                remove: null
              },
              elements: [
                [
                  { type: 'textbox', label: 'First Name', binding: 'firstname' },
                  { type: 'textbox', label: 'Last Name', binding: 'lastname' }
                ],
                [
                  { type: 'textbox', label: 'Email', binding: 'email', vlidators: { required: 'Is required', email: 'Invalid email' } },
                  { type: 'date', label: 'Birthday Date', binding: 'bdate' }
                ],
                [
                  { type: 'textbox', label: 'Gender (Male / Female)', binding: 'gender' },
                  { type: 'textbox', label: 'Photo Url', binding: 'photo', btn: 'Upload' }
                ],
                [
                  { type: 'textbox', label: 'Description:', binding: 'desc' }
                ]
              ]
            },
            nodeTreeMenu: true,
            //   nodeBinding: {
            //     cc: 'cc',
            //     address: 'address',
            //     desc: 'desc',
            //     birthDate: 'birthDate',
            //     photo: 'photo',
            //     name: 'name',
            //     img_0: 'photo'
            // },
            // searchFields: ["name", "city", "country"],
            nodeBinding: {
              field_0: "name",
              field_1: "email",
              field_2: "desc",
              // field_3: "mid",
              img_0: "photo",
            },
            menu: {
              pdf: { text: "Export PDF" },
              png: { text: "Export PNG" },
              svg: { text: "Export SVG" },
              csv: { text: "Export CSV" }
            },
          });

          family.editUI.on('save', (sender, args) => {
            this.authService.getPersonByEmail(args.data).subscribe(isPresent => {
              // let toUpdate;
              if (isPresent) {
                console.warn('Founded person :', isPresent);
                let toUpdate = this.updatePerson(isPresent, args.data);
                this.updateData(toUpdate);
              } else {
                this.mailHandler(args.data);
              }
            });
          });

          family.editUI.on('element-btn-click', (sender, args) => {
            FamilyTree.fileUploadDialog((file) => {
              // console.log(args);
              // if (args.element.binding === 'i') {
              console.log('Upload a photo');
              let data = new FormData();
              data.append('file', file);


              this.authService.getPersonById(args.nodeId).subscribe(result => {
                let reader = new FileReader();
                reader.onload = () => {
                  let personToUpdate: Person = result;
                  personToUpdate.photo = reader.result;
                  this.updateData(personToUpdate);
                  console.log(reader);
                  console.warn('WARN : ', personToUpdate);
                };
                reader.readAsDataURL(file);
              });
            })
          });

          family.load(this.persons);
          // family.load(this.familyData);
        }
      });
    }
  }

  transformPersonsData(persons: any[]): any[] {
    try {
      return persons.map((person) => {
        let transformedPerson: {
          id: number;
          pids?: string[];
          firstname: string;
          lastname: string;
          name: string;
          gender: string;
          email: string;
          photo: any;
          mid?: number;
          fid?: number,
          password?: string,
          mem?: any[],
          status?: string,
          desc?: string
        } =
        {
          id: person.id,
          firstname: person.firstname,
          lastname: person.lastname,
          name: `${person.firstname} ${person.lastname}`,
          mid: person.mid,
          fid: person.fid,
          pids: person.pids,
          gender: person.gender,
          email: person.email,
          photo: person.photo,
          password: person.password,
          mem: person.mem,
          status: person.status,
          desc: person.desc
        };
        return transformedPerson;
      });
    } catch (error) {
      console.error('An error occurred:', error);
      return [];
    }
  }

  mailHandler(recipient: Person) {
    let initiator = new Person();
    let user = sessionStorage.getItem('User');
    if (user != null) {
      initiator = JSON.parse(user);
      // console.log(initiator);
      // console.log(args.data);
      this.authService.sendEmail(initiator, recipient).subscribe(response => {
        console.log('Mail : ', response);
      });
    } else {
      console.log("No user in session storage");
    }
    this.authService.createPerson(recipient).subscribe(response => { });
  }

  updateData(personToUpdate: any) {
    this.authService.updateDb(personToUpdate).subscribe(person => {
      console.log('To Update : ', personToUpdate);
      console.log('Updated Person:', person);
      console.log('The person was updated');
    });
    this.authService.setStats();
  }

  updatePerson(existingPerson: any, newPerson: any): any {
    let idtodelete = existingPerson.id;

    existingPerson.id = newPerson.id;
    existingPerson.name = newPerson.name;
    existingPerson.firstname = newPerson.firstname;
    existingPerson.lastname = newPerson.lastname;
    existingPerson.gender = newPerson.gender;
    existingPerson.email = newPerson.email;
    newPerson.password = existingPerson.password;

    newPerson.pids?.forEach((element: any) => {
      if (!existingPerson.pids?.includes(element)) {
        existingPerson.pids = existingPerson.pids || [];
        existingPerson.pids.push(element);
      }
    });

    existingPerson.mid = newPerson.mid;
    existingPerson.fid = newPerson.fid;
    existingPerson.bdate = newPerson.bdate;
    // existingPerson.photo = newPerson.photo;

    existingPerson.desc = newPerson.desc;

    newPerson.mem?.forEach((element: any) => {
      existingPerson.mem = existingPerson.mem || [];
      existingPerson.mem.push(element);
    });

    // this.authService.deletePerson(idtodelete).subscribe(isDeleted => {
    //   if (isDeleted) {
    //     console.log('User deleted !');
    //   }
    // });

    return existingPerson;
  }

  removePersonFromTree(person: any, nodeId: string): any {
    let personToRemove: Person = person;
    personToRemove.mid = 'Undefined';
    personToRemove.fid = 'Undefined';
    this.persons.forEach(person => {
      if (person.pids) {
        person.pids = person.pids.filter((id: string) => id !== nodeId);
      }
    });
    return personToRemove;
  }

  getPersons(): void {
    this.authService.getAllPersons().subscribe(persons => {
      this.persons = persons;
      console.log('Persons:', this.persons);
    });
  }
}
