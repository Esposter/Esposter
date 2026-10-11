const GITHUB_REPOSITORY_REGEX = /github\.com[/:](?<repository>[^/\s]+\/[^/\s#]+?)(?:\.git)?\/?(?:#.*)?$/u;

// The `owner/repo` a package's npm `repository.url` names on GitHub, or `""` when it names no GitHub repository
export const getGithubRepository = (repositoryUrl: string): string =>
  GITHUB_REPOSITORY_REGEX.exec(repositoryUrl)?.groups?.repository ?? "";
