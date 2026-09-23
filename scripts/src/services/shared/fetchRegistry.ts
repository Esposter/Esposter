import { NPM_REGISTRY_URL, REGISTRY_FETCH_TIMEOUT_MS } from "#src/services/shared/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

/** Fetch `packageName` (optionally a sub-`path` like `/latest`) from the npm registry and parse the JSON body. */
export const fetchRegistry = async <T>(packageName: string, path = ""): Promise<T> => {
  const response = await fetch(`${NPM_REGISTRY_URL}/${encodeURIComponent(packageName).replace(/^%40/u, "@")}${path}`, {
    signal: AbortSignal.timeout(REGISTRY_FETCH_TIMEOUT_MS),
  });
  if (!response.ok)
    throw new InvalidOperationError(
      Operation.Read,
      fetchRegistry.name,
      `${packageName}: ${response.status} ${response.statusText}`,
    );

  return (await response.json()) as T;
};
