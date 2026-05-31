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
