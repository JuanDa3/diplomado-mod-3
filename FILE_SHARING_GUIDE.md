# File Sharing and Signing Guide

## Overview

This application now includes comprehensive file sharing and digital signing functionality that allows users to:

1. **Share files** with other users
2. **View shared files** from other users
3. **Sign shared files** with their private keys
4. **Track signatures** on shared files

## Features

### File Sharing
- Share files with specific users
- Set permissions (download, sign)
- View files shared with you
- View files you've shared with others

### Digital Signing
- Sign files with your private key
- View all signatures on a file
- Verify signature authenticity
- Track who has signed each file

## How to Use

### Sharing a File

1. **Navigate to Files Tab**
   - Go to the "Files" section in the navigation menu
   - Upload or select an existing file

2. **Share the File**
   - Click the "Share" button on any file
   - Select users to share with from the dialog
   - Set permissions (Download, Sign)
   - Click "Share File"

3. **Manage Shared Files**
   - View files shared with you in the "Shared Files" tab
   - Download shared files (if permitted)
   - Sign shared files (if permitted)

### Signing a Shared File

1. **Access Shared Files**
   - Go to "Shared Files" in the navigation menu
   - Find files shared with you that have signing permission

2. **Sign the File**
   - Click the "Sign" button on a shared file
   - Enter your private key when prompted
   - The file will be signed and marked as signed by you

3. **View Signatures**
   - Click "Signatures" to see all signatures on a file
   - View who has signed and when

### Viewing Shared Files

1. **Files Shared With You**
   - Navigate to "Shared Files" tab
   - See all files shared with you by other users
   - View permissions and signing status

2. **Files You've Shared**
   - Check the "Files" tab for files marked as shared
   - See sharing status and recipient information

## Database Schema

The application uses the following tables for file sharing:

### `user_files`
- Stores file metadata
- Includes `is_shared` flag
- Links files to their owners

### `shared_files`
- Tracks file sharing relationships
- Stores permissions (can_sign, can_download)
- Links files to shared users

### `file_signatures`
- Stores digital signatures
- Links signatures to files and signers
- Prevents duplicate signatures from same user

## API Endpoints

### File Sharing
- `POST /api/files/:fileId/share` - Share a file with users
- `GET /api/files/shared` - Get files shared with current user
- `GET /api/files/shared-by-me` - Get files shared by current user
- `DELETE /api/files/:fileId/share/:userId` - Remove file sharing

### File Signing
- `POST /api/files/:fileId/sign` - Sign a file
- `GET /api/files/:fileId/signatures` - Get file signatures
- `POST /api/files/:fileId/verify-signature` - Verify a signature

## Security Features

- **Authentication Required**: All file operations require valid authentication
- **Permission-Based Access**: Users can only access files they own or have been shared with
- **Digital Signatures**: Cryptographic verification of file integrity and signer identity
- **Private Key Protection**: Private keys are never stored on the server

## User Interface

### Files Tab
- Upload and manage your own files
- Share files with other users
- Download, verify, and delete files

### Shared Files Tab
- View files shared with you
- Sign shared files with your private key
- View file signatures and permissions

### Navigation
- "Files" - Your own files
- "Shared Files" - Files shared with you
- "Signing" - File signing interface

## Technical Implementation

### Frontend Components
- `FileUploadComponent` - File management with sharing
- `SharedFilesComponent` - View and interact with shared files
- `ShareFileDialogComponent` - File sharing interface

### Backend Features
- File sharing API endpoints
- Permission management
- Digital signature creation and verification
- Database schema for sharing relationships

## Best Practices

1. **Key Management**: Keep your private keys secure and never share them
2. **File Permissions**: Set appropriate permissions when sharing files
3. **Signature Verification**: Always verify signatures before trusting file authenticity
4. **Regular Backups**: Backup your private keys and important files

## Troubleshooting

### Common Issues

1. **Can't Share File**
   - Ensure you own the file
   - Check that target users exist in the system

2. **Can't Sign File**
   - Verify you have signing permission
   - Ensure you haven't already signed the file
   - Check your private key format

3. **Can't Download Shared File**
   - Verify you have download permission
   - Check that the file still exists

### Support

For technical issues or questions about the file sharing functionality, please refer to the application documentation or contact the development team. 