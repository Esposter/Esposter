import { getFilename } from "@/util/file/getFilename";
import { trimFileExtension } from "@/util/file/trimFileExtension";

// Icon globs are keyed by their full asset path, while every consumer looks an icon up by item id
export const toIconMap = (glob: Record<string, string>) =>
  Object.fromEntries(Object.entries(glob).map(([path, source]) => [trimFileExtension(getFilename(path)), source]));
