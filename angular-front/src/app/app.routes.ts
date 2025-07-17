import { Routes } from '@angular/router';
import { KeyPairGeneratorComponent } from './key-pair-generator/key-pair-generator.component';

export const routes: Routes = [
  { path: '', component: KeyPairGeneratorComponent },
  { path: 'key-generator', component: KeyPairGeneratorComponent }
];
