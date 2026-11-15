// Which barrel a package generates before it builds — one option with three answers rather than a pair of flags that
// Could be set to a combination meaning nothing.
//
// - None: a package that names its entrypoints itself, so a barrel would be a file nothing is an entry for.
// - Vue: the component barrel too, ahead of the TypeScript one, because that one then reaches it.
export const ExportsGeneration = { None: "none", TypeScript: "typescript", Vue: "vue" } as const;
export type ExportsGeneration = (typeof ExportsGeneration)[keyof typeof ExportsGeneration];
