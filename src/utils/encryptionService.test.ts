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
import { describe, it, expect, vi, beforeEach } from "vitest";
import { encryptAndUpload } from "./encryptionService";
import { uploadAndEncryptFile } from "@/lib/api";

vi.mock("@/lib/api", () => ({
  uploadAndEncryptFile: vi.fn(),
}));

describe("encryptAndUpload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Fix random numbers to make output predictable
    vi.spyOn(globalThis.crypto, "getRandomValues").mockImplementation(
      (arr: any) => {
        for (let i = 0; i < arr.length; i++) arr[i] = 1;
        return arr;
      },
    );
    vi.spyOn(globalThis.crypto.subtle, "importKey").mockResolvedValue(
      {} as any,
    );
    vi.spyOn(globalThis.crypto.subtle, "encrypt").mockResolvedValue(
      new ArrayBuffer(16),
    );
  });

  it("should encrypt file and call upload API with correct tags", async () => {
    const file = new File(["test content"], "test.txt", { type: "text/plain" });
    const tags = "Role:Engineer";

    await encryptAndUpload(file, tags);

    expect(uploadAndEncryptFile).toHaveBeenCalledTimes(1);
    const [uploadedFile, uploadedTags, base64Key] = (
      uploadAndEncryptFile as any
    ).mock.calls[0];

    expect(uploadedFile).toBeInstanceOf(File);
    expect(uploadedFile.name).toBe("test.txt.enc");
    expect(uploadedTags).toBe(tags);
    expect(typeof base64Key).toBe("string");
    expect(base64Key).toBe("AQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQE="); // Fixed value
  });
});
