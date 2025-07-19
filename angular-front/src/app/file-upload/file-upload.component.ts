import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';

export interface UserFile {
  id: number;
  originalName: string;
  storedName: string;
  fileSize: number;
  mimeType: string;
  fileHash: string;
  createdAt: string;
}

export interface FilesResponse {
  success: boolean;
  files: UserFile[];
}

export interface UploadResponse {
  success: boolean;
  file: UserFile;
}

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.css'
})
export class FileUploadComponent implements OnInit {
  files: UserFile[] = [];
  isLoading = true;
  isUploading = false;
  isDragOver = false;
  errorMessage = '';
  uploadProgress = 0;
  private apiUrl = '/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadFiles();
  }

  loadFiles(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const headers = this.authService.getAuthHeaders();
    
    this.http.get<FilesResponse>(`${this.apiUrl}/files`, { headers }).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.files = response.files;
        } else {
          this.errorMessage = 'Failed to load files';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.error || 'An error occurred while loading files';
        console.error('Error loading files:', error);
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.uploadFile(file);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.uploadFile(files[0]);
    }
  }

  uploadFile(file: File): void {
    this.isUploading = true;
    this.errorMessage = '';
    this.uploadProgress = 0;

    const formData = new FormData();
    formData.append('file', file);

    const headers = this.authService.getAuthHeaders();
    
    this.http.post<UploadResponse>(`${this.apiUrl}/files/upload`, formData, { headers }).subscribe({
      next: (response) => {
        this.isUploading = false;
        this.uploadProgress = 100;
        if (response.success) {
          this.files.unshift(response.file); // Add to beginning of array
          this.errorMessage = '';
        } else {
          this.errorMessage = 'Upload failed';
        }
      },
      error: (error) => {
        this.isUploading = false;
        this.errorMessage = error.error?.error || 'An error occurred during upload';
        console.error('Upload error:', error);
      }
    });
  }

  downloadFile(file: UserFile): void {
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

  verifyFileIntegrity(file: UserFile): void {
    const headers = this.authService.getAuthHeaders();
    
    this.http.post(`${this.apiUrl}/files/${file.id}/verify`, {}, { headers }).subscribe({
      next: (response: any) => {
        if (response.success) {
          if (response.integrity) {
            alert(`✅ ${response.message}\n\nStored Hash: ${response.storedHash}\nCurrent Hash: ${response.currentHash}`);
          } else {
            alert(`❌ ${response.message}\n\nStored Hash: ${response.storedHash}\nCurrent Hash: ${response.currentHash}`);
          }
        }
      },
      error: (error) => {
        this.errorMessage = 'Failed to verify file integrity';
        console.error('Verification error:', error);
      }
    });
  }

  deleteFile(file: UserFile): void {
    if (confirm(`Are you sure you want to delete "${file.originalName}"?`)) {
      const headers = this.authService.getAuthHeaders();
      
      this.http.delete(`${this.apiUrl}/files/${file.id}`, { headers }).subscribe({
        next: () => {
          this.files = this.files.filter(f => f.id !== file.id);
        },
        error: (error) => {
          this.errorMessage = 'Failed to delete file';
          console.error('Delete error:', error);
        }
      });
    }
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
} 