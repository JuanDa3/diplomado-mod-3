import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, LoginRequest } from '../auth/auth.service';

declare var google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit, AfterViewInit {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  googleInitialized = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Initialize Google Sign-In
    this.initializeGoogleSignIn();
  }

  ngAfterViewInit(): void {
    // Render Google Sign-In button after view is initialized
    this.renderGoogleSignInButton();
  }

  private initializeGoogleSignIn(): void {
    // Wait for Google script to load
    const checkGoogle = () => {
      if (typeof google !== 'undefined' && google.accounts) {
        this.googleInitialized = true;
        this.renderGoogleSignInButton();
      } else {
        setTimeout(checkGoogle, 100);
      }
    };
    checkGoogle();
  }

  private renderGoogleSignInButton(): void {
    if (!this.googleInitialized) return;

    try {
      google.accounts.id.initialize({
        client_id: '52426363202-l70p16ngub3nm3tumn37vnit7lhmislb.apps.googleusercontent.com',
        callback: this.handleGoogleSignIn.bind(this)
      });

      google.accounts.id.renderButton(
        document.getElementById('google-signin-button'),
        { 
          theme: 'outline', 
          size: 'large',
          width: '100%',
          text: 'signin_with'
        }
      );
    } catch (error) {
      console.error('Error rendering Google Sign-In button:', error);
    }
  }

  private handleGoogleSignIn(response: any): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.googleLogin(response.credential).subscribe({
      next: (authResponse) => {
        this.isLoading = false;
        if (authResponse.success) {
          this.authService.setAuthData(authResponse.user, authResponse.token);
          this.router.navigate(['/']);
        } else {
          this.errorMessage = 'Google login failed';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.error || 'An error occurred during Google login';
        console.error('Google login error:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const credentials: LoginRequest = this.loginForm.value;

      this.authService.login(credentials).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.authService.setAuthData(response.user, response.token);
            this.router.navigate(['/']);
          } else {
            this.errorMessage = 'Login failed';
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.error || 'An error occurred during login';
          console.error('Login error:', error);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.loginForm.get(controlName);
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} is required`;
      }
      if (control.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (control.errors['minlength']) {
        return `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} must be at least ${control.errors['minlength'].requiredLength} characters`;
      }
    }
    return '';
  }
} 