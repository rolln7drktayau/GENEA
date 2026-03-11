import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import FamilyTree from '@balkangraph/familytree.js';
import { AuthService } from '../../services/auth/auth.service';
import { Person } from '../../models/person.model';
import { I18nService } from '../../services/i18n/i18n.service';

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
  hasTreeData = false;
  useFallbackTree = false;
  fallbackTrees: Array<{ root: any; generations: any[][]; partners: string[] }> = [];
  private familyTreeRef: any;
  private renderWatchdog: any;

  constructor(private authService: AuthService, public i18n: I18nService) {}

  get isAdmin(): boolean {
    return this.authService.isAdmin;
  }

  ngOnInit() {
    const viewerId = sessionStorage.getItem('UserId');
    if (viewerId == null) {
      this.hasTreeData = false;
      return;
    }

    this.authService.getTreeData(viewerId).subscribe({
      next: (persons) => {
        const transformedPersons = this.transformPersonsData(persons);
        if (transformedPersons.length > 0) {
          this.renderTree(transformedPersons);
          return;
        }

        // Fallback if /tree/{id} returns empty.
        if (this.isAdmin) {
          this.authService.getAllPersons().subscribe(allPersons => {
            const fallbackNodes = this.transformPersonsData(allPersons);
            this.renderTree(fallbackNodes);
          });
        } else {
          this.authService.getFamily(viewerId).subscribe(familyPersons => {
            const fallbackNodes = this.transformPersonsData(familyPersons);
            this.renderTree(fallbackNodes);
          });
        }
      },
      error: () => {
        this.hasTreeData = false;
      }
    });
  }

  private renderTree(nodes: any[]): void {
    this.persons = nodes;
    this.familyData = nodes;
    this.hasTreeData = nodes.length > 0;
    this.useFallbackTree = false;
    this.fallbackTrees = [];

    const tree = document.getElementById('tree');
    if (!tree || nodes.length === 0) {
      return;
    }

    if (this.familyTreeRef && typeof this.familyTreeRef.destroy === 'function') {
      this.familyTreeRef.destroy();
    }

    try {
      FamilyTree.SEARCH_PLACEHOLDER = "Get focused on a person...";
      this.familyTreeRef = new FamilyTree(tree, {
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
                  this.familyTreeRef.removeNode(nodeId);
                  this.authService.getPersonById(nodeId).subscribe(result => {
                    if (result) {
                      if (result.email !== null && result.email !== undefined) {
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

      this.familyTreeRef.editUI.on('save', (sender: any, args: any) => {
            this.authService.getPersonByEmail(args.data).subscribe(isPresent => {
              if (isPresent) {
                let toUpdate = this.updatePerson(isPresent, args.data);
                this.updateData(toUpdate);
              } else {
                this.mailHandler(args.data);
              }
            });
          });

      this.familyTreeRef.editUI.on('element-btn-click', (sender: any, args: any) => {
            FamilyTree.fileUploadDialog((file) => {
              // console.log(args);
              // if (args.element.binding === 'i') {
              let data = new FormData();
              data.append('file', file);


              this.authService.getPersonById(args.nodeId).subscribe(result => {
                let reader = new FileReader();
                reader.onload = () => {
                  let personToUpdate: Person = result;
                  personToUpdate.photo = reader.result;
                  this.updateData(personToUpdate);
                };
                reader.readAsDataURL(file);
              });
            })
          });

      this.familyTreeRef.load(this.persons);
      this.scheduleRenderWatchdog(nodes);
    } catch (error) {
      console.error('FamilyTreeJS render failed, switching to fallback mode.', error);
      this.activateFallbackTree(nodes);
    }
  }

  transformPersonsData(persons: any): any[] {
    try {
      const source = Array.isArray(persons) ? persons : [];

      return source.map((person) => {
        const firstName = person.firstname || person.firstName || '';
        const lastName = person.lastname || person.lastName || '';
        const fullName = person.name || `${firstName} ${lastName}`.trim();

        let transformedPerson: {
          id: string;
          pids?: string[];
          firstname: string;
          lastname: string;
          name: string;
          gender: string;
          email: string;
          photo: any;
          mid?: string;
          fid?: string,
          password?: string,
          mem?: any[],
          status?: string,
          desc?: string
        } =
        {
          id: person.id,
          firstname: firstName,
          lastname: lastName,
          name: fullName,
          mid: person.mid ?? person.mother,
          fid: person.fid ?? person.father,
          pids: person.pids ?? person.partner ?? [],
          gender: person.gender,
          email: person.email,
          photo: person.photo,
          password: person.password,
          mem: person.mem,
          status: person.status,
          desc: person.desc ?? person.description
        };
        return transformedPerson;
      }).filter(node => !!node.id);
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
      console.log('Updated Person:', person);
    });
    this.authService.setStats();
  }

  updatePerson(existingPerson: any, newPerson: any): any {
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

  private scheduleRenderWatchdog(nodes: any[]): void {
    if (this.renderWatchdog) {
      clearTimeout(this.renderWatchdog);
    }

    this.renderWatchdog = setTimeout(() => {
      const treeElement = document.getElementById('tree');
      const hasSvg = !!treeElement?.querySelector('svg');
      if (!hasSvg) {
        this.activateFallbackTree(nodes);
      }
    }, 5000);
  }

  private activateFallbackTree(nodes: any[]): void {
    if (this.familyTreeRef && typeof this.familyTreeRef.destroy === 'function') {
      this.familyTreeRef.destroy();
      this.familyTreeRef = null;
    }

    this.useFallbackTree = true;
    this.fallbackTrees = this.buildFallbackForest(nodes);
  }

  private buildFallbackForest(nodes: any[]): Array<{ root: any; generations: any[][]; partners: string[] }> {
    const source = Array.isArray(nodes) ? nodes : [];
    if (source.length === 0) {
      return [];
    }

    const byId = new Map<string, any>();
    source.forEach((person) => {
      if (person?.id) {
        byId.set(String(person.id), person);
      }
    });

    const childrenByParent = new Map<string, Set<string>>();
    source.forEach((person) => {
      const childId = person?.id ? String(person.id) : null;
      if (!childId) {
        return;
      }

      const addChild = (parentId: any) => {
        if (!parentId) {
          return;
        }
        const parentKey = String(parentId);
        if (!byId.has(parentKey)) {
          return;
        }
        if (!childrenByParent.has(parentKey)) {
          childrenByParent.set(parentKey, new Set<string>());
        }
        childrenByParent.get(parentKey)?.add(childId);
      };

      addChild(person.mid);
      addChild(person.fid);
    });

    const roots = source.filter((person) => {
      const mid = person?.mid ? String(person.mid) : '';
      const fid = person?.fid ? String(person.fid) : '';
      const hasKnownMother = !!mid && byId.has(mid);
      const hasKnownFather = !!fid && byId.has(fid);
      return !hasKnownMother && !hasKnownFather;
    });

    const normalizedRoots = roots.length > 0 ? roots : source.slice(0, Math.min(source.length, 12));
    const visited = new Set<string>();
    const forest: Array<{ root: any; generations: any[][]; partners: string[] }> = [];

    for (const root of normalizedRoots) {
      if (!root?.id) {
        continue;
      }

      const rootId = String(root.id);
      if (visited.has(rootId)) {
        continue;
      }

      const generations: any[][] = [];
      let currentLevelIds = [rootId];
      const localVisited = new Set<string>();
      let depth = 0;

      while (currentLevelIds.length > 0 && depth < 7) {
        const levelPeople: any[] = [];
        const nextLevelSet = new Set<string>();

        for (const personId of currentLevelIds) {
          if (localVisited.has(personId)) {
            continue;
          }
          localVisited.add(personId);
          visited.add(personId);

          const person = byId.get(personId);
          if (!person) {
            continue;
          }
          levelPeople.push(person);

          const childIds = childrenByParent.get(personId);
          if (childIds) {
            childIds.forEach((childId) => {
              if (!localVisited.has(childId)) {
                nextLevelSet.add(childId);
              }
            });
          }
        }

        if (levelPeople.length > 0) {
          generations.push(levelPeople);
        }
        currentLevelIds = Array.from(nextLevelSet);
        depth++;
      }

      const partnerNames = (root.pids || [])
        .map((partnerId: string) => byId.get(String(partnerId)))
        .filter((partner: any) => !!partner)
        .map((partner: any) => partner.name || partner.email || partner.id);

      forest.push({
        root,
        generations,
        partners: partnerNames
      });
    }

    source.forEach((person) => {
      if (!person?.id) {
        return;
      }
      const personId = String(person.id);
      if (!visited.has(personId)) {
        forest.push({
          root: person,
          generations: [[person]],
          partners: []
        });
      }
    });

    return forest;
  }
}
