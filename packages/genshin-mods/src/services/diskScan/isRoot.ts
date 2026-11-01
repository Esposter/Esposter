import { normalizePath } from "./normalizePath";

// A root in any spelling is a folder whose scan reads the whole disk: the drive's folders, the users' folders and the
// Home folder by name, once Windows drive letters and backslashes are read as Git Bash's `/c/...` form
const ROOT_REGEX =
  /^(?:\/[a-z]?|\/(?:c\/)?Users(?:\/[^/]+)?|\/home(?:\/[^/]+)?|~|\$HOME|\$\{HOME\}|\$USERPROFILE|%USERPROFILE%)$/u;

export const isRoot = (token: string) => ROOT_REGEX.test(normalizePath(token));
