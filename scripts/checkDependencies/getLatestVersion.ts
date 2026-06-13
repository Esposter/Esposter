const registryUrl = "https://registry.npmjs.org";
const registryRetryCount = 3;

export const getLatestVersion = async (pkg: string): Promise<string> => {
  let lastError: unknown;

  for (let attempt = 1; attempt <= registryRetryCount; attempt++)
    try {
      const response = await fetch(`${registryUrl}/${encodeURIComponent(pkg).replace(/^%40/u, "@")}/latest`);
      if (!response.ok) throw new Error(`${pkg}: ${response.status} ${response.statusText}`);

      const body: unknown = await response.json();
      if (!body || typeof body !== "object" || !("version" in body) || typeof body.version !== "string")
        throw new Error(`${pkg}: registry response did not include a version`);

      return body.version;
    } catch (error) {
      lastError = error;
    }

  throw lastError instanceof Error ? lastError : new Error(`${pkg}: ${String(lastError)}`);
};
