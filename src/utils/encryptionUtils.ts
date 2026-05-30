// utils/encryptionUtils.ts

export function buildSelectedTags(
  sharingMode: "group" | "private",
  selectedAttributes: { rawTag: string }[],
  targetUid: string,
): string {
  if (sharingMode === "group") {
    const expandedTags = new Set();
    selectedAttributes.forEach((a) => {
      const tag = a.rawTag;
      if (tag.toLowerCase().startsWith("level:")) {
        const targetLevel = parseInt(tag.split(":")[1], 10);
        if (!isNaN(targetLevel)) {
          for (let i = 1; i <= targetLevel; i++) {
            expandedTags.add(`Level:${i}`);
          }
        } else {
          expandedTags.add(tag);
        }
      } else {
        expandedTags.add(tag);
      }
    });
    return Array.from(expandedTags).join(",");
  } else {
    return `ID:${targetUid}`;
  }
}
