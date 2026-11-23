// The last segment RFC 6901 gives an add that appends to an array
export const APPEND_SEGMENT = "-";
// RFC 6901: empty for the whole document, or segments each led by a slash, where a "~" only ever starts "~0" or "~1"
// `isolatedDeclarations` demands
// oxlint-disable-next-line typescript/no-inferrable-types -- the annotation a regex literal would otherwise infer
export const JSON_POINTER_REGEX: RegExp = /^(?:\/(?:[^/~]|~[01])*)*$/u;
