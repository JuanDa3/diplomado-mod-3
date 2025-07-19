import { Routes } from '@angular/router';
import { KeyPairGeneratorComponent } from './key-pair-generator/key-pair-generator.component';
import { LoginComponent } from './login/login.component';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', component: KeyPairGeneratorComponent, canActivate: [authGuard] },
  { path: 'key-generator', component: KeyPairGeneratorComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
