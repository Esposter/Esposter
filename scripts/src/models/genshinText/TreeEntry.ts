// One entry of a directory's tree from the GitHub Git Trees API: its path from the directory, its kind (a file is a blob)
// And its size in bytes, which a subtree has none of
export interface TreeEntry {
  path: string;
  size?: number;
  type: string;
}
