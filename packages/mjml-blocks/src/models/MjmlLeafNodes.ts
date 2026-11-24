// The leaf nodes a consumer adds beside MJML's built-in types, which a column or a hero holds.
// A consumer declares each one by merging its type into this interface, keyed by its type tag.
// The interface is empty here, since MJML's own document holds no leaf nodes.
// oxlint-disable-next-line typescript/no-empty-object-type -- empty until a consumer merges its leaf types in
export interface MjmlLeafNodes {}
