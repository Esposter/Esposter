import { getFilename } from "#src/util/file/getFilename";
import { trimFileExtension } from "#src/util/file/trimFileExtension";

// Icon globs are keyed by their full asset path, while every consumer looks an icon up by item id. An icon is named after
// Its item, spaces included, so its URL is encoded: a raw space splits an image's srcset candidate in two
export const toIconMap = (glob: Record<string, string>) =>
  Object.fromEntries(
    Object.entries(glob).map(([path, source]) => [trimFileExtension(getFilename(path)), encodeURI(source)]),
  );
