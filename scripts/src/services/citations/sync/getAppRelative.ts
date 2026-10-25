import { APP_DIRECTORY } from "#src/services/citations/sync/constants";
import { APP_RELATIVE_PREFIXES } from "@esposter/configuration";

export const getAppRelative = (path: string): string | undefined => {
  if (!path.startsWith(APP_DIRECTORY)) return undefined;
  const relative = path.slice(APP_DIRECTORY.length);
  return APP_RELATIVE_PREFIXES.some((prefix) => relative.startsWith(prefix)) ? relative : undefined;
};
