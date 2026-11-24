import { trimFileExtension } from "#src/util/file/trimFileExtension";
import { getFilename } from "@esposter/shared";

// Icon globs are keyed by their full asset path, while every consumer looks an icon up by item id. An icon is named
// After its item, spaces included: a dev server's URL has the space encoded already, a build's keeps it raw, and a raw
// Space splits an image's srcset candidate in two, so only the space is encoded, which leaves an encoded URL as it is
export const toIconMap = (glob: Record<string, string>) =>
  Object.fromEntries(
    Object.entries(glob).map(([path, source]) => [trimFileExtension(getFilename(path)), source.replaceAll(" ", "%20")]),
  );
