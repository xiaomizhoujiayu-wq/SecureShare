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
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { IdentityStatus } from "./IdentityStatus";
import * as api from "@/lib/api";

// 1. mock api
vi.mock("@/lib/api", () => ({
  getMyAttributes: vi.fn(),
}));

describe("IdentityStatus Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // mock Clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    });
  });

  it("should show loading sign when loading", () => {
    (api.getMyAttributes as any).mockReturnValue(new Promise(() => {}));
    render(<IdentityStatus />);
    expect(document.querySelector(".animate-spin")).toBeDefined();
  });

  it("User UIDs and attributes should be rendered correctly", async () => {
    const mockData = {
      userId: "123",
      attributes: "ID:USER-999,Role:Admin,Dept:Engineering",
    };
    (api.getMyAttributes as any).mockResolvedValue(mockData);

    render(<IdentityStatus />);

    // waiting for the data loading
    await waitFor(() => {
      expect(screen.getByText("USER-999")).toBeDefined();
    });

    // attribute render
    expect(screen.getByText("Role:")).toBeDefined();
    expect(screen.getByText("Admin")).toBeDefined();
    expect(screen.getByText("Dept:")).toBeDefined();
    expect(screen.getByText("Engineering")).toBeDefined();
  });

  it("click copy btn to call the api", async () => {
    (api.getMyAttributes as any).mockResolvedValue({
      userId: "123",
      attributes: "ID:USER-999",
    });

    render(<IdentityStatus />);

    const copyButton = await screen.findByTitle("Copy UID");
    fireEvent.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("USER-999");
    expect(screen.getByText("Copied!")).toBeDefined();
  });

  it("should show alert notification when fail to call api", async () => {
    (api.getMyAttributes as any).mockRejectedValue(new Error("API Fail"));

    render(<IdentityStatus />);

    await waitFor(() => {
      expect(screen.getByText("Error Loading ID")).toBeDefined();
    });
  });
});
