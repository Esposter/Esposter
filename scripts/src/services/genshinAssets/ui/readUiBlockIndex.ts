import type { UiIndexManifestEntry } from "#src/models/genshinAssets/ui/UiIndexManifestEntry";

import { INSTALLED_BLOCKS_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { composeUiEntries } from "#src/services/genshinAssets/ui/composeUiEntries";
import { UI_INDEX_EXPORT_DIRECTORY } from "#src/services/genshinAssets/ui/constants";
import { exportUiBlock } from "#src/services/genshinAssets/ui/exportUiBlock";
import { getUiIndexPath } from "#src/services/genshinAssets/ui/getUiIndexPath";
import { hashBlockFile } from "#src/services/genshinAssets/ui/hashBlockFile";
import { readUiBlockDumps } from "#src/services/genshinAssets/ui/readUiBlockDumps";
import { readUiManifest } from "#src/services/genshinAssets/ui/readUiManifest";
import { toUiBlockFileName } from "#src/services/genshinAssets/ui/toUiBlockFileName";
import { writeUiBlockIndex } from "#src/services/genshinAssets/ui/writeUiBlockIndex";
import { writeUiManifest } from "#src/services/genshinAssets/ui/writeUiManifest";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync } from "node:fs";
import { rm } from "node:fs/promises";
import { join } from "node:path";

// A block's UI index path. The index is built from the block's AnimeStudio export when the block's bytes differ from the
// ones its index was built from, and reused as it stands when they match, so an unchanged block is read once
export const readUiBlockIndex = async (block: string): Promise<string> => {
  const blockPath = join(INSTALLED_BLOCKS_DIRECTORY, block);
  if (!existsSync(blockPath)) throw new InvalidOperationError(Operation.Read, block, "is not an installed block");
  const contentHash = await hashBlockFile(blockPath);
  const indexPath = getUiIndexPath(block);
  const manifest = await readUiManifest();
  if (manifest[block]?.contentHash === contentHash && existsSync(indexPath)) return indexPath;
  const exportDirectory = join(UI_INDEX_EXPORT_DIRECTORY, toUiBlockFileName(block));
  await rm(exportDirectory, { force: true, recursive: true });
  exportUiBlock(blockPath, exportDirectory);
  const dumps = await readUiBlockDumps(exportDirectory);
  const entries = composeUiEntries(block, dumps.rectTransforms, dumps.gameObjects, dumps.canvases);
  await writeUiBlockIndex(indexPath, entries);
  const indexed: UiIndexManifestEntry = { contentHash, entryCount: entries.length };
  await writeUiManifest({ ...manifest, [block]: indexed });
  await rm(exportDirectory, { force: true, recursive: true });
  return indexPath;
};
