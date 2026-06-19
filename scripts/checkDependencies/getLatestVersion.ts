import { getResultAsync } from "@esposter/shared";

const registryUrl = "https://registry.npmjs.org";
const registryRetryCount = 3;

const fetchLatestVersion = async (pkg: string): Promise<string> => {
  const response = await fetch(`${registryUrl}/${encodeURIComponent(pkg).replace(/^%40/u, "@")}/latest`);
  if (!response.ok) throw new Error(`${pkg}: ${response.status} ${response.statusText}`);

  const body: unknown = await response.json();
  if (!body || typeof body !== "object" || !("version" in body) || typeof body.version !== "string")
    throw new Error(`${pkg}: registry response did not include a version`);

  return body.version;
};

export const getLatestVersion = (pkg: string): Promise<string> =>
  Array.from({ length: registryRetryCount - 1 }, () => 0)
    .reduce(
      (result) => result.orElse(() => getResultAsync(() => fetchLatestVersion(pkg))),
      getResultAsync(() => fetchLatestVersion(pkg)),
    )
    .match(
      (version) => version,
      (error) => {
        throw error;
      },
    );
