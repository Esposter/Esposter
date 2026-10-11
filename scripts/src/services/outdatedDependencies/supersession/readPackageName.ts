import { fetchJson } from "#src/services/shared/fetchJson";

// The name the repository's own `package.json` declares on its default branch: the package a rename moved to
export const readPackageName = async (repository: string): Promise<string> => {
  const { name } = await fetchJson<{ name: string }>(
    `https://raw.githubusercontent.com/${repository}/HEAD/package.json`,
  );

  return name;
};
