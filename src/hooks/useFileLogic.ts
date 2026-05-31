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
import { getMyAttributes, getAllFiles } from "@/lib/api";
import { useMemo, useEffect, useState } from "react";

interface BackendFileResponse {
  id: number;
  owner_id: number;
  filename: string;
  upload_time: string;
  policy: string;
  accessible?: boolean;
}

interface FileItem {
  id: string;
  name: string;
  ownerId: number;
  ownerName: string;
  uploadDate: string;
  policy: string;
  size: string;
  accessible: boolean;
  policyDetails: string;
}

export const useSystemData = (userId: string) => {
  const [allFiles, setAllFiles] = useState<FileItem[]>([]);
  const [myAttributes, setMyAttributes] = useState<string[]>([]);
  const [userUID, setUserUID] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // 2. useEffect (initData)
  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      try {
        const attrData = await getMyAttributes();
        const rawAttrString = attrData.attributes || "";
        const attrArray = rawAttrString.trim() ? rawAttrString.split(",") : [];

        const businessAttributes = attrArray.filter(
          (attr: string) => !attr.startsWith("ID:"),
        );

        setMyAttributes(businessAttributes);

        const idAttribute = attrArray.find((attr: string) =>
          attr.startsWith("ID:"),
        );

        if (idAttribute) {
          setUserUID(idAttribute.substring(3));
        }

        const rawFiles: BackendFileResponse[] = await getAllFiles();
        console.log("rawFiles:", rawFiles);
        const formattedFiles: FileItem[] = rawFiles.map((item: any) => {
          const isPrivate = item.policy && item.policy.startsWith("ID:");

          return {
            id: String(item.id),
            name: item.filename,
            ownerId: item.ownerId,
            ownerName: `User ${item.ownerId}`,
            uploadDate: item.uploadTime
              ? new Date(item.uploadTime).toLocaleDateString()
              : "Unknown time",
            policy: isPrivate ? "Private Share" : item.policy || "Public",
            size: "-- MB",
            accessible: item.accessible ?? true,
            policyDetails: item.policy || "No details provided",
          };
        });

        setAllFiles(formattedFiles);
      } catch (error) {
        console.error("loading fail:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initData();
  }, [setAllFiles, setMyAttributes, setUserUID]);

  // function myLevel() sharedWithMeFiles() myUploadedFiles()
  const myLevel = useMemo(() => {
    const levelAttr = myAttributes.find((attr) =>
      attr.toLowerCase().startsWith("level:"),
    );
    if (levelAttr) {
      const parts = levelAttr.split(":");
      const levelValue = parseInt(parts[1], 10);
      if (!isNaN(levelValue)) return levelValue;
    }
    return 5; // if didn't set level, set the default level into 5
  }, [myAttributes]);
  console.log(myAttributes);
  console.log(myLevel);
  //files shared with me
  const sharedWithMeFiles = useMemo(() => {
    if (!userId || !userUID) return [];

    return allFiles.filter((file) => {
      // 1. not my file
      const isNotMine = String(file.ownerId) !== String(userId);
      if (!isNotMine) return false;

      //
      const rawPolicy = file.policyDetails;

      //
      let policyArray: string[] = [];
      if (
        typeof rawPolicy === "string" &&
        rawPolicy !== "No details provided"
      ) {
        policyArray = rawPolicy.split(",");
      } else if (Array.isArray(rawPolicy)) {
        policyArray = rawPolicy;
      }

      // 2. level base
      const levelTags = policyArray.filter((p) =>
        p.toLowerCase().startsWith("level:"),
      );

      let hasLevelAccess = false;

      // smaller number = higher clearance
      if (levelTags.length > 0) {
        const allowedLevels = levelTags
          .map((tag) => parseInt(tag.split(":")[1], 10))
          .filter((num) => !isNaN(num));

        if (allowedLevels.length > 0) {
          const maxRequiredLevel = Math.max(...allowedLevels);

          hasLevelAccess = myLevel <= maxRequiredLevel;
        }
      } else {
        // 如果策略中没有 level 要求，则等级条件视为满足
        hasLevelAccess = true;
      }

      // 3. private share
      const isDirectlySharedWithMe = policyArray.includes(`ID:${userUID}`);

      // 4. attribute base
      const requiredAttributes = policyArray.filter(
        (p) => !p.toLowerCase().startsWith("level:") && !p.startsWith("ID:"),
      );

      const hasAllAttributes = requiredAttributes.every((attr) =>
        myAttributes.includes(attr),
      );

      // 5. access control logic

      // private share bypass
      if (isDirectlySharedWithMe) {
        return true;
      }

      // AND policy evaluation
      return hasLevelAccess && hasAllAttributes;
    });
  }, [allFiles, userId, myAttributes, myLevel, userUID]);

  //files that I upload
  const myUploadedFiles = useMemo(() => {
    if (!userId) return [];
    return allFiles.filter((file) => String(file.ownerId) === String(userId));
  }, [allFiles, userId]);
  console.log(myUploadedFiles);
  //my access files
  const myAccessFiles = useMemo(() => {
    return [...myUploadedFiles, ...sharedWithMeFiles];
  }, [myUploadedFiles, sharedWithMeFiles]);
  // policies count
  const policiesCount = myAttributes.length === 0 ? 1 : 2;

  return {
    isLoading,
    allFiles,
    setAllFiles,
    setMyAttributes,
    setUserUID,
    myAttributes,
    sharedWithMeFiles,
    myUploadedFiles,
    policiesCount,
    myUploadsCount: myUploadedFiles.length,
    sharedWithMeCount: sharedWithMeFiles.length,
    myAccessFiles,
  };
};
