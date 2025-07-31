import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';

export interface SharedFile {
  id: number;
  originalName: string;
  fileSize: number;
  mimeType: string;
  fileHash: string;
  createdAt: string;
  ownerName: string;
  ownerEmail: string;
  canSign: boolean;
  canDownload: boolean;
  sharedAt: string;
  isSignedByUser: boolean;
}

export interface SharedFilesResponse {
  success: boolean;
  files: SharedFile[];
}

@Component({
  selector: 'app-shared-files',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shared-files.component.html',
  styleUrl: './shared-files.component.css'
})
export class SharedFilesComponent implements OnInit {
  files: SharedFile[] = [];
  isLoading = true;
  errorMessage = '';
  private apiUrl = '/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadSharedFiles();
  }

  loadSharedFiles(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const headers = this.authService.getAuthHeaders();
    
    this.http.get<SharedFilesResponse>(`${this.apiUrl}/files/shared`, { headers }).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.files = response.files;
        } else {
          this.errorMessage = 'Failed to load shared files';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.error || 'An error occurred while loading shared files';
        console.error('Error loading shared files:', error);
      }
    });
  }

  downloadFile(file: SharedFile): void {
    if (!file.canDownload) {
      this.errorMessage = 'You do not have permission to download this file';
      return;
    }

    const headers = this.authService.getAuthHeaders();
    
    this.http.get(`${this.apiUrl}/files/${file.id}/download`, { 
      headers, 
      responseType: 'blob' 
    }).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.originalName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        this.errorMessage = 'Failed to download file';
        console.error('Download error:', error);
      }
    });
  }

  signFile(file: SharedFile): void {
    if (!file.canSign) {
      this.errorMessage = 'You do not have permission to sign this file';
      return;
    }

    if (file.isSignedByUser) {
      this.errorMessage = 'You have already signed this file';
      return;
    }

    // Prompt user for private key
    const privateKey = prompt('Please enter your private key to sign this file:');
    if (!privateKey) {
      return;
    }

    const headers = this.authService.getAuthHeaders();
    
    this.http.post(`${this.apiUrl}/files/${file.id}/sign`, { privateKey }, { headers }).subscribe({
      next: (response: any) => {
        if (response.success) {
          alert('✅ File signed successfully!');
          file.isSignedByUser = true;
        }
      },
      error: (error) => {
        this.errorMessage = error.error?.error || 'Failed to sign file';
        console.error('Signing error:', error);
      }
    });
  }

  viewSignatures(file: SharedFile): void {
    const headers = this.authService.getAuthHeaders();
    
    this.http.get(`${this.apiUrl}/files/${file.id}/signatures`, { headers }).subscribe({
      next: (response: any) => {
        if (response.success) {
          const signatures = response.signatures;
          if (signatures.length === 0) {
            alert('No signatures found for this file.');
          } else {
            const signatureList = signatures.map((sig: any) => 
              `• ${sig.signerName} (${sig.signerEmail}) - ${new Date(sig.signedAt).toLocaleString()}`
            ).join('\n');
            alert(`Signatures for "${file.originalName}":\n\n${signatureList}`);
          }
        }
      },
      error: (error) => {
        this.errorMessage = 'Failed to load signatures';
        console.error('Error loading signatures:', error);
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

  getTotalSize(): string {
    const totalBytes = this.files.reduce((sum, file) => sum + file.fileSize, 0);
    return this.formatFileSize(totalBytes);
  }

  getSignedFilesCount(): number {
    return this.files.filter(file => file.isSignedByUser).length;
  }
} 