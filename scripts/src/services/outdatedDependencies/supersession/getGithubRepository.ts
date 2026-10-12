// The host is read from the start of the URL, past its scheme and any user, so a path that merely contains github.com names no
// Repository
const GITHUB_REPOSITORY_REGEX =
  /^(?:[a-z+]+:\/\/(?:[^@/\s]+@)?|[^@/\s]+@)github\.com[/:](?<repository>[^/\s]+\/[^/\s#]+?)(?:\.git)?\/?(?:#.*)?$/u;

// The `owner/repo` a package's npm `repository.url` names on GitHub, or `""` when it names no GitHub repository
export const getGithubRepository = (repositoryUrl: string): string =>
  GITHUB_REPOSITORY_REGEX.exec(repositoryUrl)?.groups?.repository ?? "";
