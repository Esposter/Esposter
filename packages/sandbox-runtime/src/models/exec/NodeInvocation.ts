// The part of a parsed `node` command the in-process runner can execute. Exactly one of the two
// Fields is populated; the other is "" (the empty sentinel — never undefined): `code` for inline
// `node -e`/`--eval`, `file` for `node <file>`. The runner branches on `file === ""`.
export interface NodeInvocation {
  code: string;
  file: string;
}
