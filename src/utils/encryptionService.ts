/*
 * Copyright (C) 2026 Yumi/acdd233/puchen-star
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
// encryptionService.ts
export async function encryptAndUpload(
  file: File,
  selectedTags: string,
  _options?: {
    onProgress?: (progress: number) => void;
  },
): Promise<void> {
  // 1. Generate a 32-byte AES key
  const rawKeyBytes = new Uint8Array(32);
  window.crypto.getRandomValues(rawKeyBytes);

  // 2. Base64 encode the key (to send to the backend)
  const base64Key = bytesToBase64(rawKeyBytes);

  // 3. Frontend AES-GCM encryption
  const fileBuffer = await file.arrayBuffer();
  const cryptoKey = await window.crypto.subtle.importKey(
    "raw",
    rawKeyBytes,
    { name: "AES-GCM" },
    false,
    ["encrypt"],
  );

  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    cryptoKey,
    fileBuffer,
  );

  // 4. Combine IV + ciphertext
  const combinedData = new Uint8Array(iv.length + encryptedBuffer.byteLength);
  combinedData.set(iv, 0);
  combinedData.set(new Uint8Array(encryptedBuffer), iv.length);

  const encryptedFile = new File([combinedData], `${file.name}.enc`, {
    type: "application/octet-stream",
  });

  // 5. Call backend upload API
  const { uploadAndEncryptFile } = await import("@/lib/api");
  await uploadAndEncryptFile(encryptedFile, selectedTags, base64Key);
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
  return btoa(binary);
}
