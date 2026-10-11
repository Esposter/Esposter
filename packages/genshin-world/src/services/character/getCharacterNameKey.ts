// A character's name as it is matched: in one Unicode form and case, and with no spaces, since a pack spells a name as it
// Likes
export const getCharacterNameKey = (name: string): string => name.normalize("NFKC").toLowerCase().replaceAll(" ", "");
