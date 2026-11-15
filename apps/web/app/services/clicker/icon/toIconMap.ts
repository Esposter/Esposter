import { getFilename } from "@/util/file/getFilename";
import { trimFileExtension } from "@/util/file/trimFileExtension";

// Icon globs are keyed by their full asset path, while every consumer looks an icon up by item id. An icon is named after
// Its item, spaces included, so its URL is encoded: a raw space splits an image's srcset candidate in two. The dev server
// Hands the path raw and a production build hands it already encoded, so it is decoded first and encoded exactly once
export const toIconMap = (glob: Record<string, string>) =>
  Object.fromEntries(
    Object.entries(glob).map(([path, source]) => [trimFileExtension(getFilename(path)), encodeURI(decodeURI(source))]),
  );
