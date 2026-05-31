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
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SubAdminPanel } from "./SubadminPanel";
import { within } from "@testing-library/react";
import { vi, it, describe, beforeEach, afterEach, expect } from "vitest";

import * as api from "@/lib/api";

// Mock API functions
vi.mock("@/lib/api", () => ({
  getAdminUsers: vi.fn(),
  getMyAttributes: vi.fn(),
  assignUserAttrs: vi.fn(),
}));

// Mock users
const mockUsers = [
  {
    id: 1,
    username: "John",
    email: "john@test.com",
    attributes: "Dept:IT",
  },
  {
    id: 2,
    username: "Lisa",
    email: "lisa@test.com",
    attributes: "Dept:Finance",
  },
];

// Mock attribute catalog returned from sub-admin account
const mockMyAttributes = {
  attributes: "Dept:IT, Role:Manager, Dept:Finance",
};

describe("SubAdminPanel Component", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    // Clear all previous mocks
    vi.clearAllMocks();

    // Mock auth token
    Storage.prototype.getItem = vi.fn(() => "fake-auth-token");

    // Mock location
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { href: "" },
    });

    // Mock API responses
    (api.getAdminUsers as any).mockResolvedValue(mockUsers);
    (api.getMyAttributes as any).mockResolvedValue(mockMyAttributes);
  });

  afterEach(() => {
    // Restore original location
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
  });

  it("renders correctly and fetches users", async () => {
    render(<SubAdminPanel />);

    // Loading state appears
    expect(screen.getByText(/Loading users/i)).toBeInTheDocument();

    // Wait for API calls
    await waitFor(() => {
      expect(api.getAdminUsers).toHaveBeenCalledTimes(1);
      expect(api.getMyAttributes).toHaveBeenCalledTimes(1);
    });

    // Verify users appear
    expect(screen.getByText("John")).toBeInTheDocument();
    expect(screen.getByText("Lisa")).toBeInTheDocument();

    // Verify attributes appear
    expect(screen.getAllByText("Dept:IT").length).toBeGreaterThan(0);
  });

  it("redirects to signin if token is missing", () => {
    // Remove token
    Storage.prototype.getItem = vi.fn(() => null);

    render(<SubAdminPanel />);

    // Verify redirect
    expect(window.location.href).toBe("/signin");
  });

  it("opens assign modal correctly", async () => {
    render(<SubAdminPanel />);

    await waitFor(() => expect(screen.getByText("John")).toBeInTheDocument());

    const user = userEvent.setup();

    // Open assign modal
    const assignButtons = screen.getAllByRole("button", {
      name: /Assign/i,
    });

    await user.click(assignButtons[0]);

    // Verify modal opens
    expect(screen.getByText(/Assign Attributes for/i)).toBeInTheDocument();

    // Verify selected user shown
    expect(
      screen.getByRole("heading", {
        name: /Assign Attributes for John/i,
      }),
    ).toBeInTheDocument();
  });

  it("adds catalog attribute into textarea when clicked", async () => {
    render(<SubAdminPanel />);

    await waitFor(() => expect(screen.getByText("John")).toBeInTheDocument());

    const user = userEvent.setup();

    // Open modal
    const assignButtons = screen.getAllByRole("button", {
      name: /Assign/i,
    });

    await user.click(assignButtons[0]);

    // Find modal
    const modal = screen.getByRole("dialog");

    // Only search inside modal
    const financeAttrButton = within(modal).getByRole("button", {
      name: "Dept:Finance",
    });

    // Click attribute
    await user.click(financeAttrButton);

    // Find textarea
    const textarea = within(modal).getByPlaceholderText(
      /Dept:Finance, Role:Manager/i,
    );

    // Verify value updated
    expect(textarea).toHaveValue("Dept:IT, Dept:Finance");
  });

  it("submits updated attributes successfully", async () => {
    // Mock successful API response
    vi.mocked(api.assignUserAttrs).mockResolvedValueOnce({});

    render(<SubAdminPanel />);

    await waitFor(() => expect(screen.getByText("John")).toBeInTheDocument());

    const user = userEvent.setup();

    // Open assign modal
    const assignButtons = screen.getAllByRole("button", {
      name: /Assign/i,
    });

    await user.click(assignButtons[0]);

    // Find textarea
    const textarea = screen.getByPlaceholderText(/Dept:Finance, Role:Manager/i);

    // Clear old attributes
    await user.clear(textarea);

    // Type new attributes
    await user.type(textarea, "Role:Manager");

    // Submit
    const updateButton = screen.getByRole("button", {
      name: /Update Attributes/i,
    });

    await user.click(updateButton);

    // Verify API call
    await waitFor(() => {
      expect(api.assignUserAttrs).toHaveBeenCalledWith(1, "Role:Manager");
    });
  });

  it("shows validation error if attributes are empty", async () => {
    render(<SubAdminPanel />);

    await waitFor(() => expect(screen.getByText("John")).toBeInTheDocument());

    const user = userEvent.setup();

    // Open modal
    const assignButtons = screen.getAllByRole("button", {
      name: /Assign/i,
    });

    await user.click(assignButtons[0]);

    // Clear textarea
    const textarea = screen.getByPlaceholderText(/Dept:Finance, Role:Manager/i);

    await user.clear(textarea);

    // Find update button
    const updateButton = screen.getByRole("button", {
      name: /Update Attributes/i,
    });

    // Button should be disabled
    expect(updateButton).toBeDisabled();
  });
});
