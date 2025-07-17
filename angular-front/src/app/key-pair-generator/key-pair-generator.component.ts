import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-key-pair-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './key-pair-generator.component.html',
  styleUrl: './key-pair-generator.component.css'
})
export class KeyPairGeneratorComponent {
  keyName: string = '';
  keySize: number = 2048;
  publicKey: string = '';
  privateKey: string = '';
  isGenerating: boolean = false;
  isGenerated: boolean = false;
  errorMessage: string = '';
  savedKeys: any[] = [];
  isLoadingKeys: boolean = false;

  // API base URL - will be replaced with environment variable in production
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {
    this.loadSavedKeys();
  }

  generateKeyPair() {
    if (!this.keyName.trim()) {
      this.errorMessage = 'Please enter a key name';
      return;
    }

    this.isGenerating = true;
    this.errorMessage = '';
    this.isGenerated = false;

    const requestBody = {
      keyName: this.keyName.trim(),
      keySize: this.keySize
    };

    this.http.post(`${this.apiUrl}/generate-key-pair`, requestBody)
      .subscribe({
        next: (response: any) => {
          this.publicKey = response.publicKey;
          this.privateKey = response.privateKey;
          this.isGenerated = true;
          this.loadSavedKeys(); // Refresh the saved keys list
        },
        error: (error) => {
          console.error('Error generating key pair:', error);
          this.errorMessage = error.error?.error || 'Failed to generate key pair';
        },
        complete: () => {
          this.isGenerating = false;
        }
      });
  }

  loadSavedKeys() {
    this.isLoadingKeys = true;
    this.http.get(`${this.apiUrl}/public-keys`)
      .subscribe({
        next: (response: any) => {
          this.savedKeys = response.keys || [];
        },
        error: (error) => {
          console.error('Error loading saved keys:', error);
          this.errorMessage = 'Failed to load saved keys';
        },
        complete: () => {
          this.isLoadingKeys = false;
        }
      });
  }

  deleteKey(keyName: string) {
    if (confirm(`Are you sure you want to delete the key "${keyName}"?`)) {
      this.http.delete(`${this.apiUrl}/public-keys/${keyName}`)
        .subscribe({
          next: () => {
            this.loadSavedKeys(); // Refresh the list
            if (this.keyName === keyName) {
              this.reset();
            }
          },
          error: (error) => {
            console.error('Error deleting key:', error);
            this.errorMessage = 'Failed to delete key';
          }
        });
    }
  }

  downloadPrivateKey() {
    if (!this.privateKey) {
      this.errorMessage = 'No private key to download';
      return;
    }

    const blob = new Blob([this.privateKey], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.keyName}_private_key.pem`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  downloadPublicKey() {
    if (!this.publicKey) {
      this.errorMessage = 'No public key to download';
      return;
    }

    const blob = new Blob([this.publicKey], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.keyName}_public_key.pem`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  copyToClipboard(text: string, type: string) {
    navigator.clipboard.writeText(text).then(() => {
      // You could add a toast notification here
      console.log(`${type} copied to clipboard`);
    }).catch(err => {
      this.errorMessage = `Failed to copy ${type}: ${err}`;
    });
  }

  reset() {
    this.keyName = '';
    this.keySize = 2048;
    this.publicKey = '';
    this.privateKey = '';
    this.isGenerated = false;
    this.errorMessage = '';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }
} 