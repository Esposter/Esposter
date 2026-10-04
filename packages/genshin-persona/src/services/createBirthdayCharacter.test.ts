import type { Character } from "#src/models/Character";

import { createCharacter } from "#src/services/createCharacter.test";
import { describe } from "vitest";

// Named for the birthday, which is the one field a birthday's readers read and the one their assertions tell
// Characters apart by
export const createBirthdayCharacter = (birthday: string): Character =>
  createCharacter({ birthday, displayName: birthday, name: birthday });

describe.todo("createBirthdayCharacter");
