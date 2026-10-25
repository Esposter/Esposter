import { APP_DIRECTORY } from "#src/services/shared/constants";
import { APP_RELATIVE_PREFIXES } from "@esposter/configuration";

export const getAppRelative = (path: string): string | undefined => {
  const appPrefix = `${APP_DIRECTORY}/`;
  if (!path.startsWith(appPrefix)) return undefined;
  const relative = path.slice(appPrefix.length);
  return APP_RELATIVE_PREFIXES.some((prefix) => relative.startsWith(prefix)) ? relative : undefined;
};
