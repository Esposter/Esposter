import type { PinnedTool } from "#src/models/shared/PinnedTool";

import { findExecutable } from "#src/services/shared/findExecutable";
import { installPinnedTool } from "#src/services/shared/installPinnedTool";
import { withFinalizerAsync } from "@esposter/shared";

// The one installation of each tool's folder this process runs, which every call finding the folder empty awaits while
// It runs. It is dropped once settled, so a call after a failed one tries again
const installationMap = new Map<string, Promise<string>>();

// A pinned tool's executable: fetched, checked against its checksum and unpacked the first time it is needed, and found
// In its folder after that. A bare executable is the download itself, kept under the name its pattern names
export const resolvePinnedTool = (pinnedTool: PinnedTool): Promise<string> => {
  const { directory, executablePattern } = pinnedTool;
  const held = findExecutable(directory, executablePattern);
  if (held) return Promise.resolve(held);
  let installation = installationMap.get(directory);
  if (!installation) {
    installation = withFinalizerAsync(
      () => installPinnedTool(pinnedTool),
      () => {
        installationMap.delete(directory);
      },
    );
    installationMap.set(directory, installation);
  }
  return installation;
};
