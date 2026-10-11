import type { CharacterTermsEncoding } from "#src/models/character/CharacterTermsEncoding";

// A pack's terms as text, and the encoding its file was written in
export interface CharacterPackTerms {
  encoding: CharacterTermsEncoding;
  text: string;
}
