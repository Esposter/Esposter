// Backslashes become slashes, a drive letter becomes its `/c` folder, and a trailing glob and slash go, so "C:\", "/c/",
// "C:/" and "/c/*" all name "/c": a folder's glob expands to its entries, whose scan reads the whole folder
export const normalizePath = (token: string) => {
  const slashed = token.replaceAll("\\", "/");
  const path = /^[A-Za-z]:/u.test(slashed) ? `/${slashed.charAt(0).toLowerCase()}${slashed.slice(2)}` : slashed;
  return path.replace(/(?<=\/)\*$/u, "").replace(/(?<=.)\/+$/u, "");
};
