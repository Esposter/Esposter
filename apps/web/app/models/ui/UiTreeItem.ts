// One node of a tree: a leaf holds no children, and its id is what the tree's selection holds
export interface UiTreeItem {
  children: UiTreeItem[];
  id: string;
  title: string;
}
