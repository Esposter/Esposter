import { extname } from "node:path";

// The Tiled definitions and maps a product publishes, whose key keeps its extension's name: a tileset's `.tsx` shares its
// Stem with its image, so the two would otherwise derive one key
const TILED_EXTENSIONS: ReadonlySet<string> = new Set([".json", ".tsx"]);

// Capitalised here rather than taken from @esposter/shared, since the install derives its keys before any package is built
const capitalizeSegment = (segment: string): string => `${segment.charAt(0).toUpperCase()}${segment.slice(1)}`;

// A file's key is its path under the product's folder, each segment capitalised and joined with no separator, the extension
// Dropped, so `scene/battle/forestBackground.png` is `SceneBattleForestBackground`. The key is the file's name in the lock
// And in the generated key map, which a loader reads it by
export const toHostedAssetFileKey = (path: string): string => {
  const extension = extname(path);
  const stem = path.slice(0, path.length - extension.length);
  const suffix = TILED_EXTENSIONS.has(extension) ? capitalizeSegment(extension.slice(1)) : "";
  return `${stem
    .split("/")
    .map((segment) => capitalizeSegment(segment))
    .join("")}${suffix}`;
};
