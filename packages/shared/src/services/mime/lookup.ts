import { PATH_SEPARATOR_REGEXP } from "#src/services/mime/constants";
import { getExtensionMimeTypeMap } from "#src/services/mime/getExtensionMimeTypeMap";

// The extension a path ends in, read the way Node's `path.extname` reads its last segment. A dotfile has none, but
// A bare name with no separator is itself the extension, so `.json` and `json` both name it
const getExtension = (path: string): string => {
  const name = path.split(PATH_SEPARATOR_REGEXP).at(-1) ?? "";
  const dotIndex = name.lastIndexOf(".");
  if (path === name) return name.slice(dotIndex + 1);
  return dotIndex > 0 ? name.slice(dotIndex + 1) : "";
};

// The media type for a file path or an extension, or `false` when none is known
export const lookup = (path: string): string | false => {
  const extension = getExtension(path).toLowerCase();
  if (!extension) return false;
  return getExtensionMimeTypeMap().get(extension) ?? false;
};
