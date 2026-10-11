export interface SupersededRepository {
  // Whether GitHub has archived the repository the package's npm entry names
  isArchived: boolean;
  // The npm package name the repository is listed under
  packageName: string;
  // The `owner/repo` GitHub now serves the repository under, or `""` when it was not renamed
  renamedTo: string;
  // The `owner/repo` the package's npm `repository.url` names
  repository: string;
  // The package name the renamed repository's own `package.json` declares, or `""` when it was not renamed
  successor: string;
}
