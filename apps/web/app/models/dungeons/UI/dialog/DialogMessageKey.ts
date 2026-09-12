export type DialogMessageKey<TTypeKey extends string> =
  | `${TTypeKey}${TTypeKey extends "" ? "d" : "D"}ialogMessage`
  | `${TTypeKey}${TTypeKey extends "" ? "t" : "T"}extDisplayWidth`;
