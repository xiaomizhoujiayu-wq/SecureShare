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
