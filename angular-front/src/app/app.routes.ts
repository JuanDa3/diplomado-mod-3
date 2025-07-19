import { Routes } from '@angular/router';
import { KeyPairGeneratorComponent } from './key-pair-generator/key-pair-generator.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { UsersComponent } from './users/users.component';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: '', component: KeyPairGeneratorComponent, canActivate: [authGuard] },
  { path: 'key-generator', component: KeyPairGeneratorComponent, canActivate: [authGuard] },
  { path: 'users', component: UsersComponent, canActivate: [authGuard] },
  { path: 'files', component: FileUploadComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
