import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';

export interface FileForSigning {
  id: number;
  originalName: string;
  fileSize: number;
  mimeType: string;
  fileHash: string;
  createdAt: string;
  ownerName: string;
  ownerEmail: string;
  isSignedByUser: boolean;
}

export interface FileSignature {
  id: number;
  signatureHash: string;
  signedAt: string;
  signerName: string;
  signerEmail: string;
  signerId: number;
}

export interface FilesForSigningResponse {
  success: boolean;
  files: FileForSigning[];
}

export interface SignaturesResponse {
  success: boolean;
  signatures: FileSignature[];
}

export interface SignResponse {
  success: boolean;
  message: string;
  signature: {
    id: number;
    signatureHash: string;
    signedAt: string;
  };
}

export interface VerifyResponse {
  success: boolean;
  isValid: boolean;
  signature: {
    id: number;
    signatureHash: string;
    signedAt: string;
    signerId: number;
  };
  message: string;
}

@Component({
  selector: 'app-file-signing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './file-signing.component.html',
  styleUrl: './file-signing.component.css'
})
export class FileSigningComponent implements OnInit {
  files: FileForSigning[] = [];
  isLoading = true;
  errorMessage = '';
  selectedFile: FileForSigning | null = null;
  privateKey = '';
  isSigning = false;
  signatures: FileSignature[] = [];
  showSignatures = false;
  private apiUrl = '/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadFilesForSigning();
  }

  loadFilesForSigning(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const headers = this.authService.getAuthHeaders();
    
    this.http.get<FilesForSigningResponse>(`${this.apiUrl}/files/available-for-signing`, { headers }).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.files = response.files;
        } else {
          this.errorMessage = 'Failed to load files for signing';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.error || 'An error occurred while loading files';
        console.error('Error loading files for signing:', error);
      }
    });
  }

  selectFile(file: FileForSigning): void {
    this.selectedFile = file;
    this.privateKey = '';
    this.signatures = [];
    this.showSignatures = false;
  }

  signFile(): void {
    if (!this.selectedFile || !this.privateKey.trim()) {
      this.errorMessage = 'Please select a file and provide your private key';
      return;
    }

    this.isSigning = true;
    this.errorMessage = '';

    const headers = this.authService.getAuthHeaders();
    
    this.http.post<SignResponse>(`${this.apiUrl}/files/${this.selectedFile.id}/sign`, 
      { privateKey: this.privateKey }, 
      { headers }
    ).subscribe({
      next: (response) => {
        this.isSigning = false;
        if (response.success) {
          alert(`✅ ${response.message}\n\nSignature Hash: ${response.signature.signatureHash}`);
          this.privateKey = '';
          this.loadFilesForSigning(); // Refresh to update signed status
        } else {
          this.errorMessage = 'Failed to sign file';
        }
      },
      error: (error) => {
        this.isSigning = false;
        this.errorMessage = error.error?.error || 'An error occurred during signing';
        console.error('Signing error:', error);
      }
    });
  }

  loadSignatures(file: FileForSigning): void {
    const headers = this.authService.getAuthHeaders();
    
    this.http.get<SignaturesResponse>(`${this.apiUrl}/files/${file.id}/signatures`, { headers }).subscribe({
      next: (response) => {
        if (response.success) {
          this.signatures = response.signatures;
          this.showSignatures = true;
        } else {
          this.errorMessage = 'Failed to load signatures';
        }
      },
      error: (error) => {
        this.errorMessage = 'Failed to load signatures';
        console.error('Error loading signatures:', error);
      }
    });
  }

  verifySignature(signature: FileSignature): void {
    const headers = this.authService.getAuthHeaders();
    
    this.http.post<VerifyResponse>(`${this.apiUrl}/files/${this.selectedFile!.id}/verify-signature`, 
      { signerId: signature.signerId }, 
      { headers }
    ).subscribe({
      next: (response) => {
        if (response.success) {
          const status = response.isValid ? '✅ VALID' : '❌ INVALID';
          alert(`${status} - ${response.message}\n\nSigner: ${signature.signerName}\nSignature Hash: ${signature.signatureHash}`);
        } else {
          this.errorMessage = 'Failed to verify signature';
        }
      },
      error: (error) => {
        this.errorMessage = 'Failed to verify signature';
        console.error('Verification error:', error);
      }
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getFileIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType === 'application/pdf') return '📄';
    if (mimeType.startsWith('text/')) return '📝';
    if (mimeType.includes('word')) return '📄';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('zip') || mimeType.includes('rar')) return '📦';
    return '📁';
  }

  closeSignatures(): void {
    this.showSignatures = false;
    this.signatures = [];
  }
} 