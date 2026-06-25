import { NPM_REGISTRY_URL, REGISTRY_FETCH_TIMEOUT_MS } from "@/services/constants";
/** Fetch `pkg` (optionally a sub-`path` like `/latest`) from the npm registry and return the parsed JSON body. */
export const fetchRegistry = async <T>(pkg: string, path = ""): Promise<T> => {
  const response = await fetch(`${NPM_REGISTRY_URL}/${encodeURIComponent(pkg).replace(/^%40/u, "@")}${path}`, {
    signal: AbortSignal.timeout(REGISTRY_FETCH_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`${pkg}: ${response.status} ${response.statusText}`);

  return (await response.json()) as T;
};
