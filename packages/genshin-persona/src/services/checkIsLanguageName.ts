// What a language name can be before anything is done with it: the data package spells every one of them as a bare
// Run of letters, and the name reaches a file path in the roster cache, so a hand-edited or half-written state file
// Holding anything else is not a language rather than a path. Every other state reader validates what it reads the
// Same way; this one cannot check the name against the package, which costs the better part of a second to load, so
// It checks the shape and lets `readRoster` fall back for a well-formed name the package does not answer in
const LANGUAGE_NAME_REGEX = /^[A-Za-z]+$/u;

export const checkIsLanguageName = (name: string): boolean => LANGUAGE_NAME_REGEX.test(name);
