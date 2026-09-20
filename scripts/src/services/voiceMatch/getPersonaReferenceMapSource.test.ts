import { getPersonaReferenceMapSource } from "#src/services/voiceMatch/getPersonaReferenceMapSource";
import { describe, expect, test } from "vitest";

describe(getPersonaReferenceMapSource, () => {
  test("writes one entry per line, quoting only the names that are not identifiers", () => {
    expect.hasAssertions();

    const source = getPersonaReferenceMapSource(
      new Map([
        ["Albedo", { likeness: 0, stem: "Albedo Hello" }],
        ["Hu Tao", { likeness: 0.1, stem: "Hu Tao Hello" }],
      ]),
    );

    expect(source).toBe(`import type { PersonaReference } from "#src/models/PersonaReference";

export const PersonaReferenceMap: Record<string, PersonaReference> = {
  Albedo: { likeness: 0, stem: "Albedo Hello" },
  "Hu Tao": { likeness: 0.1, stem: "Hu Tao Hello" },
};
`);
  });
});
