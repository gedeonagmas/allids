import { writeFile, mkdir, readFile, unlink } from 'fs/promises';
import { join, resolve } from 'path';
import { existsSync } from 'fs';
import * as CryptoJS from 'crypto-js';

const STORAGE_PATH = process.env.DOCUMENT_STORAGE_PATH 
  ? resolve(process.env.DOCUMENT_STORAGE_PATH)
  : resolve('./storage/documents');
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production';

/**
 * Store encrypted document file
 */
export async function storeEncryptedDocument(
  documentId: string,
  imageBase64: string,
): Promise<string> {
  // Ensure base storage directory exists
  if (!existsSync(STORAGE_PATH)) {
    await mkdir(STORAGE_PATH, { recursive: true });
  }

  // Encrypt the image data
  const encrypted = CryptoJS.AES.encrypt(imageBase64, ENCRYPTION_KEY).toString();

  // Store encrypted file directly in base storage directory (no subdirectories)
  const filePath = join(STORAGE_PATH, `${documentId}.enc`);
  await writeFile(filePath, encrypted, 'utf8');

  return filePath;
}

/**
 * Retrieve and decrypt document file
 */
export async function retrieveEncryptedDocument(filePath: string): Promise<string> {
  if (!existsSync(filePath)) {
    throw new Error(`Document file not found: ${filePath}`);
  }

  const encrypted = await readFile(filePath, 'utf8');
  const bytes = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

/**
 * Delete encrypted document file from storage
 */
export async function deleteEncryptedDocument(filePath: string): Promise<void> {
  if (!filePath) {
    return; // No file path, nothing to delete
  }

  if (!existsSync(filePath)) {
    // File doesn't exist, that's okay - might have been deleted already
    return;
  }

  try {
    await unlink(filePath);
  } catch (error: any) {
    // Log but don't throw - file deletion failure shouldn't block the operation
    console.warn(`Failed to delete document file ${filePath}:`, error.message);
  }
}

