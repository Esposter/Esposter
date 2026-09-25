export const UNNAMED_MESSAGE =
  "Assign the store to a named variable first (`const fooStore = useFooStore()`), then destructure it — never destructure, spread or call straight off `useFooStore()`. See the pinia skill.";
export const NAME_MESSAGE =
  "Name a store binding after the store it asks for (`const fooBarStore = useFooBarStore()`); a qualifier goes in front of the whole name (`newFooBarStore`). See the pinia skill.";
// Pinia's own naming for the hook `defineStore` is assigned to, which is what makes a call to one a store lookup
// Rather than any composable: the captured part is what the binding spells
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex would otherwise infer
export const STORE_HOOK_REGEX: RegExp = /^use(?<storeName>[A-Z][\dA-Za-z]*Store)$/u;
