import type { PinnedTool } from "#src/models/shared/PinnedTool";

import { InvalidOperationError, Operation } from "@esposter/shared";
import { join } from "node:path";

// The folder a pinned tool's release is kept in: the tool's own folder, then the release tag its asset's URL names, as
// In `.../releases/download/<tag>/<file>`. A new release is a new folder, so a bump never reuses the binary it replaces
export const getPinnedToolDirectory = ({ archiveUrl, toolDirectory }: PinnedTool): string => {
  const releaseTag = archiveUrl.split("/").at(-2);
  if (!releaseTag)
    throw new InvalidOperationError(Operation.Read, archiveUrl, "has no release tag to name its folder by");
  return join(toolDirectory, releaseTag);
};
