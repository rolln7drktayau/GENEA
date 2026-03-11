import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { FamilyComponent } from './pages/family/family.component';
import { TreeComponent } from './pages/tree/tree.component';
import { MemoriesComponent } from './pages/memories/memories.component';
import { NavbarComponent } from './pages/navbar/navbar.component';
import { authGuard } from './shield/auth.guard';
import { adminGuard } from './shield/admin.guard';
import { TeamComponent } from './pages/team/team.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'family', component: FamilyComponent, canActivate: [authGuard] },
  { path: 'tree', component: TreeComponent, canActivate: [authGuard] },
  { path: 'memories', component: MemoriesComponent, canActivate: [authGuard] },
  { path: 'team', component: TeamComponent, canActivate: [authGuard, adminGuard] },
  { path: 'navbar', component: NavbarComponent, canActivate: [authGuard] },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login', pathMatch: 'full' }
];
