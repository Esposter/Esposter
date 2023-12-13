// A convenient wrapper for generics to extend from
// and allow default generic values so we don't have to always specify them C:
export type Item = object & { id?: string | number };
