import { NPM_REGISTRY_URL } from "@/services/constants";
/** Fetch `pkg` (optionally a sub-`path` like `/latest`) from the npm registry and return the parsed JSON body. */
export const fetchRegistry = async <T>(pkg: string, path = ""): Promise<T> => {
  const response = await fetch(`${NPM_REGISTRY_URL}/${encodeURIComponent(pkg).replace(/^%40/u, "@")}${path}`);
  if (!response.ok) throw new Error(`${pkg}: ${response.status} ${response.statusText}`);

  return (await response.json()) as T;
};
