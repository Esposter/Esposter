// Whether a repository-relative file lies in one of the folders that ship to the browser
export const checkIsClientPath = (path: string, clientDirectories: string[]): boolean =>
  clientDirectories.some((directory) => path.startsWith(`${directory}/`));
