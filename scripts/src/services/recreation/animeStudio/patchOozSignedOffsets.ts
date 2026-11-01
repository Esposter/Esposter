import { replaceCounted } from "#src/services/recreation/animeStudio/replaceCounted";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The Leviathan decoder keeps each match's offset as a size_t, so its copy source, dst + offset, wraps for every backward match.
// That overflow is undefined: the optimizer may move a copy's load above the store of the copy before it, reading a stale byte.
// Windows' build never reads one, so the offset is signed.
export const patchOozSignedOffsets = (oozDirectory: string): void => {
  const path = join(oozDirectory, "kraken.cpp");
  const source = readFileSync(path, "utf8");
  const patched = replaceCounted(
    replaceCounted(source, path, "size_t last_offset", "ptrdiff_t last_offset", 12),
    path,
    "  size_t offset = -8;\n",
    "  ptrdiff_t offset = -8;\n",
    1,
  );
  writeFileSync(path, patched);
};
