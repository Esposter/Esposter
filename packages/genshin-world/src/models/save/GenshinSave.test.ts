import { Currency } from "#src/models/inventory/Currency";
import { genshinSaveSchema } from "#src/models/save/GenshinSave";
import { MAX_ITEM_QUANTITY } from "#src/services/inventory/bagLimits";
import {
  EMPTY_GENSHIN_SAVE,
  MAX_ACHIEVEMENT_COUNT,
  MAX_CHARACTER_COUNT,
  MAX_CRAFTING_RECIPE_COUNT,
  MAX_INVENTORY_ITEM_COUNT,
  MAX_OBJECTIVE_COUNT,
  MAX_QUEST_COUNT,
  MAX_SAVE_ID_LENGTH,
  MAX_UNLOCKED_LANDMARK_COUNT,
} from "#src/services/save/constants";
import { BannerKind } from "genshin-interface/save";
import { describe, expect, test } from "vitest";

describe("genshinSaveSchema", () => {
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
          String(index).padStart(MAX_SAVE_ID_LENGTH, "0"),
          { count: maxNumber, finishedAt: maxInstant },
        ]),
      ),
      adventureExp: maxNumber,
      companionshipExp: Object.fromEntries(
        Array.from({ length: MAX_CHARACTER_COUNT }, (_value, index) => [
          String(index).padStart(MAX_SAVE_ID_LENGTH, "0"),
          maxNumber,
        ]),
      ),
      crafting: {
        craftedCounts: Object.fromEntries(
          Array.from({ length: MAX_CRAFTING_RECIPE_COUNT }, (_value, index) => [
            String(index).padStart(MAX_SAVE_ID_LENGTH, "0"),
            maxNumber,
          ]),
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
      quests: Object.fromEntries(
        Array.from({ length: MAX_QUEST_COUNT }, (_value, index) => [
          String(index).padStart(MAX_SAVE_ID_LENGTH, "0"),
          { objectiveCounts: Array.from({ length: MAX_OBJECTIVE_COUNT }, () => maxNumber), stepIndex: maxNumber },
        ]),
      ),
      reputation: { exp: maxNumber, level: maxNumber },
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
    };

    expect(genshinSaveSchema.safeParse(save).success).toBe(true);
  });

  // A slice a save predates takes its empty value, so a save written before the slice existed still loads with every
  // Other slice as it was
  test("parses a save missing a slice with that slice empty and every other slice intact", () => {
    expect.hasAssertions();
    const save = { ...EMPTY_GENSHIN_SAVE, adventureExp: 1 };
    const predatingSave = Object.fromEntries(Object.entries(save).filter(([key]) => key !== "crafting"));

    expect(genshinSaveSchema.parse(predatingSave)).toStrictEqual(save);
  });

  test("parses a save missing two slices with both empty and every other slice intact", () => {
    expect.hasAssertions();
    const save = { ...EMPTY_GENSHIN_SAVE, adventureExp: 1 };
    const predatingSave = Object.fromEntries(
      Object.entries(save).filter(([key]) => key !== "quests" && key !== "wallet"),
    );

    expect(genshinSaveSchema.parse(predatingSave)).toStrictEqual(save);
  });

  test("parses a full save unchanged", () => {
    expect.hasAssertions();
    const save = {
      ...EMPTY_GENSHIN_SAVE,
      adventureExp: 1,
      crafting: { craftedCounts: { 1: 2 }, learnedRecipeIds: [3] },
    };

    expect(genshinSaveSchema.parse(save)).toStrictEqual(save);
  });

  test("refuses a slice that is present but invalid", () => {
    expect.hasAssertions();
    const save = { ...EMPTY_GENSHIN_SAVE, crafting: { craftedCounts: {}, learnedRecipeIds: [0] } };

    expect(genshinSaveSchema.safeParse(save).success).toBe(false);
  });
});
