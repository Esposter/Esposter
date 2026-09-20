// What the reference selection measured for one character: the line the clone is conditioned on, and how close
// The clone of a carrier sentence came to the character's own voice
export interface PersonaReference {
  // The cosine between the clone's speaker embedding and the character's profile, to two decimals
  likeness: number;
  // The wiki file stem of the chosen line — the title after the dub prefix and before the extension
  stem: string;
}
