import { NPM_REGISTRY_URL } from "#src/services/shared/constants";
import { fetchJson } from "#src/services/shared/fetchJson";

/** Fetch `packageName` (optionally a sub-`path` like `/latest`) from the npm registry and parse the JSON body. */
export const fetchRegistry = <T>(packageName: string, path = ""): Promise<T> =>
  fetchJson<T>(`${NPM_REGISTRY_URL}/${encodeURIComponent(packageName).replace(/^%40/u, "@")}${path}`);
