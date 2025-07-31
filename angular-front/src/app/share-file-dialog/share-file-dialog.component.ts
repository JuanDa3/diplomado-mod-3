import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface UsersResponse {
  success: boolean;
  users: User[];
}

export interface ShareResponse {
  success: boolean;
  message: string;
  sharedUsers: User[];
}

@Component({
  selector: 'app-share-file-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './share-file-dialog.component.html',
  styleUrl: './share-file-dialog.component.css'
})
export class ShareFileDialogComponent implements OnInit {
  @Input() fileId: number = 0;
  @Input() fileName: string = '';
  @Input() isVisible: boolean = false;
  @Output() closeDialog = new EventEmitter<void>();
  @Output() fileShared = new EventEmitter<void>();

  users: User[] = [];
  selectedUserIds: number[] = [];
  canSign: boolean = true;
  canDownload: boolean = true;
  isLoading = false;
  isSharing = false;
  errorMessage = '';
  private apiUrl = '/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const headers = this.authService.getAuthHeaders();
    
    this.http.get<UsersResponse>(`${this.apiUrl}/users`, { headers }).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.users = response.users;
        } else {
          this.errorMessage = 'Failed to load users';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.error || 'An error occurred while loading users';
        console.error('Error loading users:', error);
      }
    });
  }

  toggleUserSelection(userId: number): void {
    const index = this.selectedUserIds.indexOf(userId);
    if (index > -1) {
      this.selectedUserIds.splice(index, 1);
    } else {
      this.selectedUserIds.push(userId);
    }
  }

  isUserSelected(userId: number): boolean {
    return this.selectedUserIds.includes(userId);
  }

  shareFile(): void {
    if (this.selectedUserIds.length === 0) {
      this.errorMessage = 'Please select at least one user to share with';
      return;
    }

    this.isSharing = true;
    this.errorMessage = '';

    const headers = this.authService.getAuthHeaders();
    const shareData = {
      userIds: this.selectedUserIds,
      canSign: this.canSign,
      canDownload: this.canDownload
    };

    this.http.post<ShareResponse>(`${this.apiUrl}/files/${this.fileId}/share`, shareData, { headers }).subscribe({
      next: (response) => {
        this.isSharing = false;
        if (response.success) {
          alert(`✅ ${response.message}`);
          this.fileShared.emit();
          this.closeDialog.emit();
        } else {
          this.errorMessage = 'Failed to share file';
        }
      },
      error: (error) => {
        this.isSharing = false;
        this.errorMessage = error.error?.error || 'Failed to share file';
        console.error('Error sharing file:', error);
      }
    });
  }

  onClose(): void {
    this.closeDialog.emit();
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
} 