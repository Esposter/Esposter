import { createCharacter } from "#src/services/createCharacter.test";
import { findCharacterByName } from "#src/services/findCharacterByName";
import { describe, expect, test } from "vitest";

describe(findCharacterByName, () => {
  const character = createCharacter({ displayName: "胡桃", name: "Hu Tao" });
  const roster = [character];

  // The English name is the identity every state file and the wiki are keyed by, and the display name is what the
  // Status line and the card show — so it is the one a person copies and has to resolve too
  test.each(["Hu Tao", "hu tao", "胡桃"])("%j resolves to the character", (name) => {
    expect.hasAssertions();

    expect(findCharacterByName(roster, name)).toBe(character);
  });

  test.each(["", "Venti"])("%j resolves to nobody", (name) => {
    expect.hasAssertions();

    expect(findCharacterByName(roster, name)).toBeUndefined();
  });
});
