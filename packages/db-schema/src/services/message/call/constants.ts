export const CALL_ID_LENGTH = 12;
// Deliberately unanchored: the join form runs it over a pasted invite link to lift the code out of the middle
// Of a url. The select schema pairs it with an exact length, which is what anchors it where the id is the whole
// Input, so anchoring the pattern itself would only break the paste
export const CALL_ID_REGEX = new RegExp(String.raw`[A-Za-z0-9]{${CALL_ID_LENGTH}}`, "u");
