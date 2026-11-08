// One entry of a directory's tree from the GitHub Git Trees API: its path from the directory, its kind (a file is a blob)
// And the SHA-1 git names its content by
export interface TreeEntry {
  path: string;
  sha: string;
  type: string;
}
