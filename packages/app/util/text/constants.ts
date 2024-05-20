// We want to match empty text for 2 scenarios:
// 1. Standard white space
// 2. <p></p> from tip tap rich text editor after typing and clearing the text
export const EMPTY_TEXT_REGEX = /^(\s*|<p><\/p>){1}$/;
