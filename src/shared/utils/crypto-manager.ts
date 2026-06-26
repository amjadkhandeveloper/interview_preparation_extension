import { STORAGE_KEYS } from '../constants';
import { Logger } from './logger';

const logger = new Logger('CryptoManager');

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

async function getOrCreateSalt(): Promise<Uint8Array> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.ENCRYPTION_SALT);
  const existing = result[STORAGE_KEYS.ENCRYPTION_SALT] as string | undefined;

  if (existing) {
    return new Uint8Array(base64ToBuffer(existing));
  }

  const salt = crypto.getRandomValues(new Uint8Array(16));
  await chrome.storage.local.set({
    [STORAGE_KEYS.ENCRYPTION_SALT]: bufferToBase64(salt.buffer),
  });
  return salt;
}

async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt.buffer as ArrayBuffer,
      iterations: 100_000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptApiKey(
  apiKey: string,
  passphrase?: string
): Promise<{ encryptedKey: string; iv: string }> {
  const salt = await getOrCreateSalt();
  const effectivePassphrase = passphrase || `extension-default-${chrome.runtime.id}`;
  const key = await deriveKey(effectivePassphrase, salt);
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(apiKey)
  );

  return {
    encryptedKey: bufferToBase64(encrypted),
    iv: bufferToBase64(iv.buffer),
  };
}

export async function decryptApiKey(
  encryptedKey: string,
  iv: string,
  passphrase?: string
): Promise<string> {
  try {
    const salt = await getOrCreateSalt();
    const effectivePassphrase = passphrase || `extension-default-${chrome.runtime.id}`;
    const key = await deriveKey(effectivePassphrase, salt);
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(base64ToBuffer(iv)) },
      key,
      base64ToBuffer(encryptedKey)
    );

    return new TextDecoder().decode(decrypted);
  } catch (error) {
    logger.error('Failed to decrypt API key');
    throw new Error('Invalid API key or passphrase', { cause: error });
  }
}
