import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

import { useSystemData } from "./useFileLogic";

import { getMyAttributes, getAllFiles } from "@/lib/api";

// mock api module
vi.mock("@/lib/api", () => ({
  getMyAttributes: vi.fn(),
  getAllFiles: vi.fn(),
}));

describe("useSystemData Hook Core Logic", () => {
  const currentUserId = "100";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should correctly evaluate access policies", async () => {
    // ========================================
    // mock current user attributes
    // ========================================

    (getMyAttributes as any).mockResolvedValue({
      attributes: "ID:100,Level:3,Dept:IT,Manager",
    });

    // ========================================
    // mock backend files
    // ========================================

    (getAllFiles as any).mockResolvedValue([
      // ========================================
      // my own uploaded file
      // ========================================

      {
        id: 1,
        ownerId: 100,
        filename: "my_file.pdf",
        policy: "",
      },

      // ========================================
      // private share
      // ========================================

      {
        id: 2,
        ownerId: 200,
        filename: "direct_to_me.txt",
        policy: "ID:100",
      },

      // ========================================
      // level only (allow)
      // user level = 3
      // policy level = 4
      // 3 <= 4 => allow
      // ========================================

      {
        id: 4,
        ownerId: 101,
        filename: "level_4_doc.txt",
        policy: "Level:4",
      },

      // ========================================
      // level only (deny)
      // 3 <= 2 => false
      // ========================================

      {
        id: 5,
        ownerId: 151,
        filename: "level_2_doc.txt",
        policy: "Level:2",
      },

      // ========================================
      // attribute only (allow)
      // ========================================

      {
        id: 6,
        ownerId: 87,
        filename: "it_report.txt",
        policy: "Dept:IT",
      },

      // ========================================
      // attribute only (deny)
      // ========================================

      {
        id: 7,
        ownerId: 96,
        filename: "hr_report.txt",
        policy: "Dept:HR",
      },

      // ========================================
      // AND policy (allow)
      // Level:4 + Dept:IT
      // ========================================

      {
        id: 8,
        ownerId: 31,
        filename: "combo_allow.txt",
        policy: "Level:4,Dept:IT",
      },

      // ========================================
      // AND policy (deny level)
      // ========================================

      {
        id: 9,
        ownerId: 5,
        filename: "combo_deny_level.txt",
        policy: "Level:1,Dept:IT",
      },

      // ========================================
      // AND policy (deny attribute)
      // ========================================

      {
        id: 10,
        ownerId: 4,
        filename: "combo_deny_attr.txt",
        policy: "Level:4,Dept:HR",
      },

      // ========================================
      // strict AND policy (allow)
      // must have BOTH IT and Manager
      // ========================================

      {
        id: 11,
        ownerId: 200,
        filename: "strict_and_allow.txt",
        policy: "Level:4,Dept:IT,Manager",
      },

      // ========================================
      // strict AND policy (deny)
      // missing Finance
      // ========================================

      {
        id: 12,
        ownerId: 200,
        filename: "strict_and_deny.txt",
        policy: "Level:4,Dept:IT,Finance",
      },
    ]);

    // ========================================
    // execute hook
    // ========================================

    const { result } = renderHook(() => useSystemData(currentUserId));

    // initial loading state
    expect(result.current.isLoading).toBe(true);

    // wait async loading
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // ========================================
    // verify parsed attributes
    // ========================================

    expect(result.current.myAttributes).toEqual([
      "Level:3",
      "Dept:IT",
      "Manager",
    ]);

    // ========================================
    // verify uploaded files
    // ========================================

    expect(result.current.myUploadedFiles).toHaveLength(1);

    expect(result.current.myUploadedFiles[0].name).toBe("my_file.pdf");

    // ========================================
    // verify shared files
    // ========================================

    const sharedFileNames = result.current.sharedWithMeFiles.map((f) => f.name);

    // allow cases
    expect(sharedFileNames).toContain("direct_to_me.txt");

    expect(sharedFileNames).toContain("level_4_doc.txt");

    expect(sharedFileNames).toContain("it_report.txt");

    expect(sharedFileNames).toContain("combo_allow.txt");

    expect(sharedFileNames).toContain("strict_and_allow.txt");

    // deny cases
    expect(sharedFileNames).not.toContain("level_2_doc.txt");

    expect(sharedFileNames).not.toContain("hr_report.txt");

    expect(sharedFileNames).not.toContain("combo_deny_level.txt");

    expect(sharedFileNames).not.toContain("combo_deny_attr.txt");

    expect(sharedFileNames).not.toContain("strict_and_deny.txt");

    // ========================================
    // final counts
    // ========================================

    expect(result.current.sharedWithMeFiles).toHaveLength(5);

    expect(result.current.myAccessFiles).toHaveLength(6);
  });
});
