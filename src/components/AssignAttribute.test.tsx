import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdminPanel } from "./AssignAttribute";
import { vi, it, describe, beforeEach, afterEach, expect } from "vitest";
import * as api from "@/lib/api";

// Mock all API functions used inside AdminPanel
vi.mock("@/lib/api", () => ({
  getAdminUsers: vi.fn(),
  getCatalog: vi.fn(),
  addCatalogAttr: vi.fn(),
  deleteCatalogAttr: vi.fn(),
  assignUserAttrs: vi.fn(),
  createSubAdmin: vi.fn(),
}));

// Mock user data
const mockUsers = [
  {
    id: 1,
    username: "admin_user",
    email: "admin@test.com",
    attributes: "Dept:IT",
    role: "ADMIN",
  },
  {
    id: 2,
    username: "sub_admin_1",
    email: "sub@test.com",
    attributes: "Role:Manager",
    role: "SUB_ADMIN",
  },
];

// Mock attribute catalog
const mockCatalog = [
  { id: 1, name: "Dept:IT" },
  { id: 2, name: "Role:Manager" },
];

describe("AdminPanel Component", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    // Clear all previous mocks before every test
    vi.clearAllMocks();

    // Mock auth token in localStorage
    Storage.prototype.getItem = vi.fn(() => "fake-auth-token");

    // Mock window.location
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { href: "" },
    });

    // Mock API responses
    (api.getAdminUsers as any).mockResolvedValue(mockUsers);
    (api.getCatalog as any).mockResolvedValue(mockCatalog);
  });

  afterEach(() => {
    // Restore original window.location after tests
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
  });

  it("renders correctly and fetches users and catalog on mount", async () => {
    // Render component
    render(<AdminPanel />);

    // Verify loading state appears initially
    expect(screen.getByText(/Loading users.../i)).toBeInTheDocument();

    // Wait for API calls to complete
    await waitFor(() => {
      expect(api.getAdminUsers).toHaveBeenCalledTimes(1);
      expect(api.getCatalog).toHaveBeenCalledTimes(1);
    });

    // Verify user data is displayed
    expect(screen.getByText("admin_user")).toBeInTheDocument();
    expect(screen.getByText("sub_admin_1")).toBeInTheDocument();

    // Verify catalog attribute appears
    expect(screen.getAllByText("Dept:IT").length).toBeGreaterThan(0);
  });

  it("redirects to /signin if token is missing", () => {
    // Remove auth token
    Storage.prototype.getItem = vi.fn(() => null);

    render(<AdminPanel />);

    // Verify redirect happens
    expect(window.location.href).toBe("/signin");
  });

  it("filters users by role correctly", async () => {
    render(<AdminPanel />);

    // Wait for initial users to load
    await waitFor(() =>
      expect(screen.getByText("admin_user")).toBeInTheDocument(),
    );

    const user = userEvent.setup();

    // Click Sub-Admins filter button
    const subAdminFilterBtn = screen.getByRole("button", {
      name: "Sub-Admins",
    });

    await user.click(subAdminFilterBtn);

    // Verify only sub-admin is visible
    expect(screen.getByText("sub_admin_1")).toBeInTheDocument();

    // Verify admin user is hidden
    expect(screen.queryByText("admin_user")).not.toBeInTheDocument();

    // Verify non-existing normal user is absent
    expect(screen.queryByText("normal_user")).not.toBeInTheDocument();
  });

  it("adds a new attribute to the catalog", async () => {
    // Mock successful API response
    vi.mocked(api.addCatalogAttr).mockResolvedValueOnce({});

    render(<AdminPanel />);

    // Wait for component to finish loading
    await waitFor(() =>
      expect(screen.getByText("admin_user")).toBeInTheDocument(),
    );

    const user = userEvent.setup();

    // Find attribute input field
    const input = screen.getByPlaceholderText("e.g., Dep:IT, Role:staff");

    // Type new attribute
    await user.type(input, "Region:Asia");

    // Find add button
    const addButton = screen.getByRole("button", {
      name: /Add to Catalog/i,
    });

    // Click add button
    await user.click(addButton);

    // Verify API call parameters
    expect(api.addCatalogAttr).toHaveBeenCalledWith("Region:Asia");

    // Verify success message appears
    await waitFor(() => {
      expect(
        screen.getByText('Attribute "Region:Asia" added successfully!'),
      ).toBeInTheDocument();
    });
  });

  it("opens assign modal and submits new attributes", async () => {
    // Mock successful assignment API
    vi.mocked(api.assignUserAttrs).mockResolvedValueOnce({});

    render(<AdminPanel />);

    // Wait until users appear
    await waitFor(() =>
      expect(screen.getByText("admin_user")).toBeInTheDocument(),
    );

    const user = userEvent.setup();

    // Find all Assign buttons
    const assignButtons = screen.getAllByRole("button", {
      name: /Assign/i,
    });

    // Click first Assign button
    await user.click(assignButtons[0]);

    // Verify modal is opened
    expect(screen.getByText(/Assign Attributes for/i)).toBeInTheDocument();

    // Verify correct username shown in modal
    expect(
      screen.getByRole("heading", {
        name: /Assign Attributes for admin_user/i,
      }),
    ).toBeInTheDocument();

    // Find textarea
    const textarea = screen.getByPlaceholderText(/Dept:Finance, Role:Manager/i);

    // Clear existing attributes
    await user.clear(textarea);

    // Type new attribute
    await user.type(textarea, "Role:SuperAdmin");

    // Find update button
    const updateBtn = screen.getByRole("button", {
      name: /Update Attributes/i,
    });

    // Submit update
    await user.click(updateBtn);

    // Verify API receives correct parameters
    await waitFor(() => {
      expect(api.assignUserAttrs).toHaveBeenCalledWith(1, "Role:SuperAdmin");
    });
  });

  it("creates a new sub-admin successfully", async () => {
    // Mock successful sub-admin creation
    vi.mocked(api.createSubAdmin).mockResolvedValueOnce({});

    render(<AdminPanel />);

    // Wait for page data to load
    await waitFor(() =>
      expect(screen.getByText("admin_user")).toBeInTheDocument(),
    );

    const user = userEvent.setup();

    // Open create sub-admin modal
    const newSubAdminBtn = screen.getByRole("button", {
      name: /New Sub-Admin/i,
    });

    await user.click(newSubAdminBtn);

    // Fill username input
    await user.type(
      screen.getByPlaceholderText("Enter username"),
      "new_sub_admin",
    );

    // Fill email input
    await user.type(
      screen.getByPlaceholderText("Enter email"),
      "newsub@test.com",
    );

    // Fill password input
    await user.type(
      screen.getByPlaceholderText("Enter password"),
      "securepass123",
    );

    // Find submit button
    const submitBtn = screen.getByRole("button", {
      name: /Confirm Creation/i,
    });

    // Submit form
    await user.click(submitBtn);

    // Verify API request payload
    await waitFor(() => {
      expect(api.createSubAdmin).toHaveBeenCalledWith({
        username: "new_sub_admin",
        email: "newsub@test.com",
        password: "securepass123",
      });

      // Verify success message appears
      expect(
        screen.getByText("Sub-Admin new_sub_admin created successfully!"),
      ).toBeInTheDocument();
    });
  });
});
