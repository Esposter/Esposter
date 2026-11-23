// One key of a lockfile document, the keys nested beneath it, and the text after its colon when it holds one
export interface LockTreeNode {
  children: Map<string, LockTreeNode>;
  value?: string | undefined;
}
