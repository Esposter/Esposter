import type { Character } from "#src/models/Character";

import { describe } from "vitest";

export const createCharacter = (overrides: Partial<Character> = {}): Character => ({
  affiliation: "",
  birthday: "",
  constellation: "",
  description: "",
  displayElement: "",
  displayName: "",
  element: "",
  name: "",
  region: "",
  title: "",
  version: "",
  weapon: "",
  ...overrides,
});

describe.todo("createCharacter");
