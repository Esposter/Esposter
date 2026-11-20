import { getCharacterNamePersonaReferenceMapSource } from "#src/services/voiceMatch/getCharacterNamePersonaReferenceMapSource";
import { describe, expect, test } from "vitest";

describe(getCharacterNamePersonaReferenceMapSource, () => {
  test("writes one entry per line, quoting only the names that are not identifiers", () => {
    expect.hasAssertions();

    const source = getCharacterNamePersonaReferenceMapSource(
      new Map([
        ["Albedo", { likeness: 0, stem: "Albedo Hello" }],
        ["Hu Tao", { likeness: 0.1, stem: "Hu Tao Hello" }],
      ]),
    );

    expect(source).toBe(`import type { PersonaReference } from "#src/models/PersonaReference";

export const CharacterNamePersonaReferenceMap: Record<string, PersonaReference> = {
  Albedo: { likeness: 0, stem: "Albedo Hello" },
  "Hu Tao": { likeness: 0.1, stem: "Hu Tao Hello" },
};
`);
  });
});
