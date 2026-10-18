import type { CharacterSave } from "#src/models/character/CharacterSave";
import type { GenshinSave } from "#src/models/save/GenshinSave";

import { useWorldSaveSync } from "#src/composables/useWorldSaveSync";
import { CombatTalent } from "#src/models/character/CombatTalent";
import { EMPTY_GENSHIN_SAVE } from "#src/services/save/constants";
import { readGenshinSave } from "#src/services/save/readGenshinSave";
import { assert, describe, expect, test, vi } from "vitest";
import { effectScope, shallowRef } from "vue";

describe(useWorldSaveSync, () => {
  const CHARACTER_ID = 6;
  const COPY_COUNT = 2;
  const LEVEL = 5;
  const HELD_CHARACTER: CharacterSave = {
    artifacts: [],
    ascension: 0,
    constellationCount: 0,
    copyCount: COPY_COUNT,
    id: CHARACTER_ID,
    level: LEVEL,
    stellaFortunaCount: 0,
    talentLevels: {
      [CombatTalent.ElementalBurst]: 1,
      [CombatTalent.ElementalSkill]: 1,
      [CombatTalent.NormalAttack]: 1,
    },
    weapon: { ascension: 0, experience: 0, id: 1, level: 1, refinement: 1 },
  };
  const HELD_SAVE: GenshinSave = {
    ...EMPTY_GENSHIN_SAVE,
    characters: [HELD_CHARACTER],
    companionshipExp: { [CHARACTER_ID]: 0 },
  };

  test("a held character survives a reload", () => {
    expect.hasAssertions();
    const savedState = readGenshinSave(HELD_SAVE, {}, new Map(), new Map(), new Map());
    const characters = shallowRef(savedState.characters);
    const characterCopyCountMap = shallowRef(savedState.characterCopyCountMap);
    const emitSave = vi.fn<(save: GenshinSave) => void>();
    const scope = effectScope();
    scope.run(() =>
      useWorldSaveSync({
        emitSave,
        getSaveState: () => ({
          ...savedState,
          characterCopyCountMap: characterCopyCountMap.value,
          characters: characters.value,
        }),
      }),
    );
    // The session hands its roster back as the world holds it, which the sync writes on the change
    characters.value = [...characters.value];
    scope.stop();

    const [emittedSave] = emitSave.mock.lastCall ?? [];
    assert.exists(emittedSave);
    expect(readGenshinSave(emittedSave, {}, new Map(), new Map(), new Map())).toStrictEqual(savedState);
  });
});
