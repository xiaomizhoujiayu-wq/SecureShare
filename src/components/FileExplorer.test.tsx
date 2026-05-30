import { describe, it, expect, vi } from "vitest";
import { handleDownloadFile } from "@/utils/fileCrypto";
import { downloadFile } from "@/lib/api";

vi.mock("@/lib/api", () => ({
  downloadFile: vi.fn(),
}));

describe("fileCrypto", () => {
  it("should download + decrypt file", async () => {
    (downloadFile as any).mockResolvedValue({
      data: {
        arrayBuffer: async () => new ArrayBuffer(16),
      },
      headers: {
        "x-session-key": btoa("1234567890123456"),
      },
    });

    vi.spyOn(globalThis.crypto.subtle, "importKey").mockResolvedValue(
      {} as any,
    );

    vi.spyOn(globalThis.crypto.subtle, "decrypt").mockResolvedValue(
      new TextEncoder().encode("hello").buffer,
    );

    const blob = await handleDownloadFile({
      id: "1",
      name: "test.enc",
    });

    expect(downloadFile).toHaveBeenCalledWith("1");
    expect(blob).toBeInstanceOf(Blob);
  });
});
