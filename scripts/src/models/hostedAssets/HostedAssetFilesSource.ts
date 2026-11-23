// A files product's source: the repository folder its files are published from and pulled to, and the extensions of the files
// Under it that the product never publishes, since they are code the app imports or authoring sources kept in git
export interface HostedAssetFilesSource {
  folder: string;
  kind: "files";
  unhostedExtensions: readonly string[];
}
