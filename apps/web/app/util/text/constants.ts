// Tiptap leaves a `<p></p>` behind once text is typed and then cleared, so an empty document is either that
// Or whitespace
export const EMPTY_TEXT_REGEX = /^(?<text>\s*|<p><\/p>)$/u;
