# File Signing and Digital Signature System

## Overview

This application provides a complete digital signature system that allows users to:
- Generate RSA key pairs for digital signatures
- Upload and share files publicly
- Sign files using their private keys
- Verify digital signatures using public keys
- View signature history and details

## Features

### 1. Key Pair Generation
- **Location**: Home page (`/`) or Key Generator page (`/key-generator`)
- **Functionality**: Generate RSA key pairs (2048-bit by default)
- **Output**: Public key (stored in database) and private key (downloadable)
- **Security**: Private keys are never stored on the server

### 2. File Management
- **Upload**: Users can upload files to their personal storage
- **Public Sharing**: Files can be made public and visible to all users
- **Access Control**: Users can only access their own files or public files

### 3. Digital Signatures
- **Signing**: Users can sign any file they have access to (owned or public)
- **Verification**: Anyone can verify signatures using the signer's public key
- **History**: Complete signature history with timestamps and signer information

## How to Use the File Signing System

### Step 1: Generate Your Key Pair

1. Navigate to the Key Generator page
2. Enter a name for your key pair (e.g., "My Personal Key")
3. Choose key size (2048-bit recommended)
4. Click "Generate Key Pair"
5. **IMPORTANT**: Download and securely store your private key
6. The public key is automatically saved to your account

### Step 2: Upload and Share Files

1. Go to the Files page
2. Upload files you want to share
3. Click "Make Public" to share files with all users
4. Public files appear in the "Public Files" section

### Step 3: Sign Files

1. Navigate to the Signing page
2. Select a file from the available files list
3. Click "Sign File" button
4. Paste your private key in the text area
5. Click "Sign File" to create the digital signature

### Step 4: Verify Signatures

1. Select any file with signatures
2. View the list of signatures with signer information
3. Click "Verify" next to any signature to verify its authenticity
4. The system will show verification results

## Technical Details

### Digital Signature Process

1. **File Hashing**: Files are hashed using SHA-256
2. **Signature Creation**: Private key signs the file hash
3. **Storage**: Signatures are stored with metadata (signer, timestamp, hash)
4. **Verification**: Public key verifies the signature against the file hash

### Security Features

- **Private Key Protection**: Private keys are never stored on the server
- **Access Control**: Users can only sign files they have access to
- **Signature Uniqueness**: Each user can only sign a file once
- **Hash Verification**: Signatures are verified using cryptographic hashes

### Database Schema

```sql
-- File signatures table
CREATE TABLE file_signatures (
  id INT AUTO_INCREMENT PRIMARY KEY,
  file_id INT NOT NULL,
  signer_id INT NOT NULL,
  signature_data TEXT NOT NULL,
  signature_hash VARCHAR(64) NOT NULL,
  signed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (file_id) REFERENCES user_files(id) ON DELETE CASCADE,
  FOREIGN KEY (signer_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_file_signer (file_id, signer_id)
);
```

## API Endpoints

### File Signing
- `POST /api/files/:fileId/sign` - Sign a file with private key
- `GET /api/files/:fileId/signatures` - Get all signatures for a file
- `POST /api/files/:fileId/verify-signature/:signatureId` - Verify a specific signature

### File Management
- `GET /api/files/available-for-signing` - Get files available for signing
- `POST /api/files/:fileId/share` - Make file public
- `DELETE /api/files/:fileId/share` - Make file private

### Key Management
- `POST /api/generate-key-pair` - Generate new RSA key pair
- `GET /api/public-keys` - Get user's public keys
- `DELETE /api/public-keys/:keyName` - Delete a public key

## User Interface

### File Signing Page (`/signing`)
- **Left Panel**: Available files for signing (owned and public)
- **Right Panel**: File signatures and signing interface
- **Signing Form**: Private key input and signing controls

### Key Features
- **File Selection**: Click on files to view their signatures
- **Signing Interface**: Expandable form for entering private keys
- **Signature Display**: Shows all signatures with verification options
- **Error Handling**: Clear error messages for invalid keys or failed operations

## Best Practices

### Key Management
- Store private keys securely (password manager, encrypted storage)
- Never share private keys
- Use different keys for different purposes
- Regularly rotate keys for sensitive operations

### File Signing
- Verify file integrity before signing
- Keep signed files unchanged to maintain signature validity
- Use descriptive key names for easy identification

### Security Considerations
- The system uses industry-standard RSA cryptography
- Signatures are cryptographically secure and tamper-evident
- Private keys are handled client-side only
- All communications use HTTPS in production

## Troubleshooting

### Common Issues

1. **"Invalid private key" error**
   - Ensure the private key is in correct PEM format
   - Check that the key hasn't been corrupted
   - Verify the key corresponds to a public key in your account

2. **"File not found or access denied" error**
   - Ensure the file exists and is public or owned by you
   - Check that you're logged in with the correct account

3. **"File already signed by this user" error**
   - Each user can only sign a file once
   - This prevents duplicate signatures

4. **Signature verification fails**
   - The file may have been modified after signing
   - The signer's public key may have changed
   - Check that the signature data is intact

## Future Enhancements

- **Batch Signing**: Sign multiple files at once
- **Signature Templates**: Predefined signature workflows
- **Advanced Verification**: Chain of trust and certificate validation
- **Audit Logs**: Detailed logging of all signing activities
- **Mobile Support**: Mobile-optimized signing interface 