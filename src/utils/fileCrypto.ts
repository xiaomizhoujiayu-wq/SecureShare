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
import { downloadFile } from "@/lib/api";

export const handleDownloadFile = async (file: {
  id: string;
  name: string;
}) => {
  const response = await downloadFile(file.id);

  const encryptedBuffer = await response.data.arrayBuffer();

  const keyBase64 = response.headers["x-session-key"];

  if (!keyBase64) {
    throw new Error("Missing key");
  }

  const encryptedBytes = new Uint8Array(encryptedBuffer);

  const iv = encryptedBytes.slice(0, 12);
  const ciphertext = encryptedBytes.slice(12);

  const base64ToBytes = (base64: string) => {
    const binary = atob(base64);
    return Uint8Array.from(binary, (c) => c.charCodeAt(0));
  };

  const rawKey = base64ToBytes(keyBase64);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    rawKey,
    { name: "AES-GCM" },
    false,
    ["decrypt"],
  );

  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv,
    },
    cryptoKey,
    ciphertext,
  );

  const blob = new Blob([decrypted]);

  return blob;
};
