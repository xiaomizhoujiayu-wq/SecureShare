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
