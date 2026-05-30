import { describe, it, expect } from "vitest";
import { buildSelectedTags } from "./encryptionUtils";

describe("buildSelectedTags", () => {
  it("should expand Level tags correctly and keep other tags", () => {
    const selected = [{ rawTag: "Role:Engineer" }, { rawTag: "Level:3" }];
    const result = buildSelectedTags("group", selected, "");
    expect(result).toBe("Role:Engineer,Level:1,Level:2,Level:3");
  });

  it("should join multiple non-level tags with commas", () => {
    const selected = [{ rawTag: "Role:Engineer" }, { rawTag: "Department:IT" }];
    const result = buildSelectedTags("group", selected, "");
    expect(result).toBe("Role:Engineer,Department:IT");
  });

  it("should handle private mode", () => {
    const result = buildSelectedTags("private", [], "user123");
    expect(result).toBe("ID:user123");
  });
});
