import type { pickCharacter as basePickCharacter } from "#src/services/pickCharacter";
import type { pickCharacterByLore as basePickCharacterByLore } from "#src/services/pickCharacterByLore";
import type { readTypeSafeKey as baseReadTypeSafeKey } from "#src/services/readTypeSafeKey";
import type { ChoiceResponse } from "@typesafe-ai/sdk";

import { TEST_EPOCH_DATE } from "#src/services/constants.test";
import { createCharacter } from "#src/services/createCharacter.test";
import { pickCurrentCharacter } from "#src/services/pickCurrentCharacter";
import { describe, expect, test, vi } from "vitest";

const { pickCharacter, pickCharacterByLore, readTypeSafeKey } = vi.hoisted(() => ({
  pickCharacter: vi.fn<typeof basePickCharacter>(),
  pickCharacterByLore: vi.fn<typeof basePickCharacterByLore>(),
  readTypeSafeKey: vi.fn<typeof baseReadTypeSafeKey>(),
}));

vi.mock(import("#src/services/pickCharacter"), () => ({ pickCharacter }));

vi.mock(import("#src/services/pickCharacterByLore"), () => ({ pickCharacterByLore }));

vi.mock(import("#src/services/readTypeSafeKey"), () => ({ readTypeSafeKey }));

describe(pickCurrentCharacter, () => {
  const key = "key";
  const character = createCharacter({ name: "name" });
  const birthdayCharacter = createCharacter({ name: " " });
  const response: ChoiceResponse = {
    choice: character.name,
    confidence: 0.1,
    probabilities: { [character.name]: 0.1 },
    type: "choice",
  };

  test("carries the tier's whole answer beside the character it named", async () => {
    expect.hasAssertions();

    readTypeSafeKey.mockReturnValue(key);
    pickCharacterByLore.mockResolvedValue({ character, response });

    await expect(pickCurrentCharacter([character], TEST_EPOCH_DATE)).resolves.toStrictEqual({
      character,
      loreFailure: "",
      loreResponse: response,
    });
    expect(pickCharacter).toHaveBeenCalledTimes(0);
  });

  // The failure rides with the fallback rather than going to a hook's stderr, which reaches nobody
  test("falls back to the birthday pick with the reason the tier gave none", async () => {
    expect.hasAssertions();

    const failure = "failure";
    readTypeSafeKey.mockReturnValue(key);
    pickCharacterByLore.mockResolvedValue({ failure });
    pickCharacter.mockReturnValue(birthdayCharacter);

    await expect(pickCurrentCharacter([character], TEST_EPOCH_DATE)).resolves.toStrictEqual({
      character: birthdayCharacter,
      loreFailure: failure,
    });
  });

  test("never asks the tier without a key", async () => {
    expect.hasAssertions();

    readTypeSafeKey.mockReturnValue("");
    pickCharacter.mockReturnValue(birthdayCharacter);

    await expect(pickCurrentCharacter([character], TEST_EPOCH_DATE)).resolves.toStrictEqual({
      character: birthdayCharacter,
      loreFailure: "",
    });
    expect(pickCharacterByLore).toHaveBeenCalledTimes(0);
  });
});
