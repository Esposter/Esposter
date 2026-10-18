// Each binding of a local name, where it is bound in the file's tokens and the name its right-hand side is rooted in
export interface GoAliasBinding {
  position: number;
  rootName: string;
}
