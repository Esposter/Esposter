import { fetchJson } from "#src/services/shared/fetchJson";

// The name the repository's own `package.json` declares on its default branch, at the package's directory in a
// Monorepo: the package a rename moved to
export const readPackageName = async (repository: string, directory: string): Promise<string> => {
  const path = directory ? `${directory}/package.json` : "package.json";
  const { name } = await fetchJson<{ name: string }>(`https://raw.githubusercontent.com/${repository}/HEAD/${path}`);

  return name;
};
