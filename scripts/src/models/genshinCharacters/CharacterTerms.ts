import type { CharacterTermsEncoding } from "#src/models/genshinCharacters/CharacterTermsEncoding";

// A pack's terms as text, and the encoding its file was written in
export interface CharacterTerms {
  encoding: CharacterTermsEncoding;
  text: string;
}
