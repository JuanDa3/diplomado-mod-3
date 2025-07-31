import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export interface PublicFile {
  id: number;
  originalName: string;
  fileSize: number;
  mimeType: string;
  fileHash: string;
  createdAt: string;
  ownerName: string;
  ownerEmail: string;
  isPublic: boolean;
}

export interface FileForSigning {
  id: number;
  originalName: string;
  fileSize: number;
  mimeType: string;
  fileHash: string;
  createdAt: string;
  ownerName: string;
  ownerEmail: string;
  isPublic: boolean;
  fileType: 'owned' | 'public';
}

export interface FileSignature {
  id: number;
  signatureData: string;
  signatureHash: string;
  signedAt: string;
  signerName: string;
  signerEmail: string;
  publicKey?: string;
  keySize?: number;
}

export interface SignatureVerification {
  success: boolean;
  isValid: boolean;
  signerName: string;
  signerEmail: string;
  signedAt: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class FileSharingService {
  private apiUrl = '/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Make a file public
  makeFilePublic(fileId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/files/${fileId}/share`, {}, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // Get public files
  getPublicFiles(): Observable<{ success: boolean; files: PublicFile[] }> {
    return this.http.get<{ success: boolean; files: PublicFile[] }>(`${this.apiUrl}/files/shared`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // Get files shared by current user
  getFilesSharedByMe(): Observable<{ success: boolean; files: PublicFile[] }> {
    return this.http.get<{ success: boolean; files: PublicFile[] }>(`${this.apiUrl}/files/shared-by-me`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // Make a file private
  makeFilePrivate(fileId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/files/${fileId}/share`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // Get all available files for signing
  getFilesForSigning(): Observable<{ success: boolean; files: FileForSigning[] }> {
    return this.http.get<{ success: boolean; files: FileForSigning[] }>(`${this.apiUrl}/files/available-for-signing`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // Get file signatures
  getFileSignatures(fileId: number): Observable<{ success: boolean; signatures: FileSignature[] }> {
    return this.http.get<{ success: boolean; signatures: FileSignature[] }>(`${this.apiUrl}/files/${fileId}/signatures`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // Verify file signature
  verifySignature(fileId: number, signatureId: number): Observable<SignatureVerification> {
    return this.http.post<SignatureVerification>(`${this.apiUrl}/files/${fileId}/verify-signature/${signatureId}`, {}, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // Sign a file
  signFile(fileId: number, privateKey: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/files/${fileId}/sign`, { privateKey }, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // Download a public file
  downloadPublicFile(fileId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/files/${fileId}/download`, {
      headers: this.authService.getAuthHeaders(),
      responseType: 'blob'
    });
  }
} 