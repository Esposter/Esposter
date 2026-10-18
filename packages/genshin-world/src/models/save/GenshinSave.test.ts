import type { CharacterSave } from "#src/models/character/CharacterSave";

import { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import { Attribute, Attributes } from "#src/models/character/Attribute";
import { CombatTalent } from "#src/models/character/CombatTalent";
import { Currency } from "#src/models/inventory/Currency";
import { genshinSaveSchema } from "#src/models/save/GenshinSave";
import { MAX_MINOR_AFFIX_COUNT } from "#src/services/artifact/constants";
import { MAX_ITEM_QUANTITY } from "#src/services/inventory/bagLimits";
import {
  EMPTY_GENSHIN_SAVE,
  MAX_ACHIEVEMENT_COUNT,
  MAX_CHARACTER_COUNT,
  MAX_CRAFTING_RECIPE_COUNT,
  MAX_INVENTORY_ITEM_COUNT,
  MAX_OBJECTIVE_COUNT,
  MAX_OPENED_CHEST_COUNT,
  MAX_QUEST_COUNT,
  MAX_SAVE_ID_LENGTH,
  MAX_TRAVELER_NAME_LENGTH,
  MAX_UNLOCKED_LANDMARK_COUNT,
} from "#src/services/save/constants";
import { MAX_WEAPON_REFINEMENT } from "#src/services/weapon/constants";
import { CONSTELLATION_COUNT } from "#src/services/wish/constants";
import { BannerKind } from "genshin-interface/save";
import { describe, expect, test } from "vitest";

describe("genshinSaveSchema", () => {
  // A character the player holds at its least: level one, one copy, and nothing worn or wielded beyond its own weapon
  const CHARACTER: CharacterSave = {
    artifacts: [],
    ascension: 0,
    constellationCount: 0,
    copyCount: 1,
    id: 1,
    level: 1,
    stellaFortunaCount: 0,
    talentLevels: {
      [CombatTalent.ElementalBurst]: 1,
      [CombatTalent.ElementalSkill]: 1,
      [CombatTalent.NormalAttack]: 1,
    },
    weapon: { ascension: 0, experience: 0, id: 1, level: 1, refinement: 1 },
  };

  // The ceiling is each collection's cap times its longest entry, so a save with every collection at its cap, each
  // Number at its largest and each instant at its longest, is under it and passes the refine
  test("accepts a save at every cap, each number and instant at its longest", () => {
    expect.hasAssertions();
    const maxNumber = Number.MAX_SAFE_INTEGER;
    const epoch = Temporal.Instant.fromEpochMilliseconds(0);
    const maxInstant = epoch.add({ nanoseconds: 999_999_999 }).toString();
    const save = {
      achievements: Object.fromEntries(
        Array.from({ length: MAX_ACHIEVEMENT_COUNT }, (_value, index) => [
          String(maxNumber - index),
          { count: maxNumber, finishedAt: maxInstant },
        ]),
      ),
      adventureExp: maxNumber,
      characters: Array.from({ length: MAX_CHARACTER_COUNT }, (_value, index) => ({
        artifacts: Object.values(ArtifactSlot).map((slot) => ({
          experience: maxNumber,
          isLocked: true,
          level: maxNumber,
          mainAffix: Attribute.Health,
          minorAffixes: Attributes.slice(0, MAX_MINOR_AFFIX_COUNT).map((attribute) => ({
            attribute,
            value: maxNumber,
          })),
          rarity: maxNumber,
          setId: maxNumber,
          slot,
        })),
        ascension: maxNumber,
        constellationCount: CONSTELLATION_COUNT,
        copyCount: maxNumber,
        id: maxNumber - index,
        level: maxNumber,
        stellaFortunaCount: maxNumber,
        talentLevels: Object.fromEntries(Object.values(CombatTalent).map((combatTalent) => [combatTalent, maxNumber])),
        weapon: {
          ascension: maxNumber,
          experience: maxNumber,
          id: maxNumber,
          level: maxNumber,
          refinement: MAX_WEAPON_REFINEMENT,
        },
      })),
      companionshipExp: Object.fromEntries(
        Array.from({ length: MAX_CHARACTER_COUNT }, (_value, index) => [String(maxNumber - index), maxNumber]),
      ),
      crafting: {
        craftedCounts: Object.fromEntries(
          Array.from({ length: MAX_CRAFTING_RECIPE_COUNT }, (_value, index) => [String(maxNumber - index), maxNumber]),
        ),
        learnedRecipeIds: Array.from({ length: MAX_CRAFTING_RECIPE_COUNT }, (_value, index) => maxNumber - index),
      },
      inventory: {
        items: Array.from({ length: MAX_INVENTORY_ITEM_COUNT }, (_value, index) => ({
          id: maxNumber - index,
          itemId: maxNumber - index,
          level: maxNumber,
          quantity: MAX_ITEM_QUANTITY,
        })),
        nextId: maxNumber,
      },
      offerings: { frostbearingTree: { heldCount: maxNumber, level: maxNumber } },
      openedChests: Array.from({ length: MAX_OPENED_CHEST_COUNT }, (_value, index) =>
        String(index).padStart(MAX_SAVE_ID_LENGTH, "0"),
      ),
      quests: Object.fromEntries(
        Array.from({ length: MAX_QUEST_COUNT }, (_value, index) => [
          String(index).padStart(MAX_SAVE_ID_LENGTH, "0"),
          { objectiveCounts: Array.from({ length: MAX_OBJECTIVE_COUNT }, () => maxNumber), stepIndex: maxNumber },
        ]),
      ),
      reputation: { exp: maxNumber, level: maxNumber },
      travelerName: "x".repeat(MAX_TRAVELER_NAME_LENGTH),
      unlockedLandmarks: Array.from({ length: MAX_UNLOCKED_LANDMARK_COUNT }, (_value, index) =>
        String(index).padStart(MAX_SAVE_ID_LENGTH, "0"),
      ),
      wallet: {
        currencies: Object.fromEntries(Object.values(Currency).map((currency) => [currency, maxNumber])),
        originalResinChangedAt: maxInstant,
        primogemResinRefillCount: maxNumber,
        primogemResinRefillDay: epoch.toZonedDateTimeISO("UTC").toPlainDate().toString(),
      },
      wishPity: Object.fromEntries(
        Object.values(BannerKind).map((bannerKind) => [
          bannerKind,
          {
            chartedWeaponId: maxNumber,
            fatePoints: maxNumber,
            fiveStarCount: maxNumber,
            fourStarCount: maxNumber,
            isFiveStarGuaranteed: false,
            isFourStarGuaranteed: false,
            lossCount: maxNumber,
            wishCount: maxNumber,
          },
        ]),
      ),
      worldLevelAdjustment: { changedAt: maxInstant, isLowered: true },
    };

    expect(genshinSaveSchema.safeParse(save).success).toBe(true);
  });

  // A save holding more characters than the limit is refused, so none of them is read
  test("a save past the character limit is refused", () => {
    expect.hasAssertions();
    const save = {
      ...EMPTY_GENSHIN_SAVE,
      characters: Array.from({ length: MAX_CHARACTER_COUNT + 1 }, (_value, index) => ({ ...CHARACTER, id: index + 1 })),
    };

    expect(genshinSaveSchema.safeParse(save).success).toBe(false);
  });

  // A numeric id's key is read back as its number, so a key such as "01" beside "1" would lose one of the two on the
  // Next write
  test("refuses an id key that is not its number's own decimal", () => {
    expect.hasAssertions();
    const save = {
      ...EMPTY_GENSHIN_SAVE,
      crafting: { ...EMPTY_GENSHIN_SAVE.crafting, craftedCounts: { "01": 1, "1": 1 } },
    };

    expect(genshinSaveSchema.safeParse(save).success).toBe(false);
  });

  // A slice a save predates is refused rather than defaulted: a stored save is backfilled to the shape, so a default
  // Would only hide a save nobody brought to it
  test("refuses a save written before the slices were added", () => {
    expect.hasAssertions();
    const predatingSave = {
      quests: EMPTY_GENSHIN_SAVE.quests,
      unlockedLandmarks: EMPTY_GENSHIN_SAVE.unlockedLandmarks,
      wallet: EMPTY_GENSHIN_SAVE.wallet,
    };

    expect(genshinSaveSchema.safeParse(predatingSave).success).toBe(false);
  });
});
