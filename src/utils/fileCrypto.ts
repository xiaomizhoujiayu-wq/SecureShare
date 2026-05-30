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
