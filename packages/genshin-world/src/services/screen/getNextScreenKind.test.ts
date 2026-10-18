import { ScreenKind } from "#src/models/screen/ScreenKind";
import { getNextScreenKind } from "#src/services/screen/getNextScreenKind";
import { InputAction } from "genshin-engine";
import { describe, expect, test } from "vitest";

describe(getNextScreenKind, () => {
  test.each<[ScreenKind, InputAction, ScreenKind]>([
    [ScreenKind.World, InputAction.OpenMap, ScreenKind.Map],
    [ScreenKind.World, InputAction.OpenPaimonMenu, ScreenKind.PaimonMenu],
    [ScreenKind.World, InputAction.Cancel, ScreenKind.World],
    [ScreenKind.Map, InputAction.OpenMap, ScreenKind.World],
    [ScreenKind.Map, InputAction.OpenInventory, ScreenKind.Map],
    [ScreenKind.Map, InputAction.OpenPaimonMenu, ScreenKind.World],
    [ScreenKind.Map, InputAction.Cancel, ScreenKind.World],
    [ScreenKind.PaimonMenu, InputAction.OpenPaimonMenu, ScreenKind.World],
    [ScreenKind.Dialogue, InputAction.OpenPaimonMenu, ScreenKind.Dialogue],
    [ScreenKind.Dialogue, InputAction.OpenMap, ScreenKind.Dialogue],
  ])("from %s, %s leaves %s open", (screenKind, action, nextScreenKind) => {
    expect.hasAssertions();

    expect(getNextScreenKind(screenKind, new Set([action]), false)).toBe(nextScreenKind);
  });

  test("a restricted step keeps the Paimon menu shut", () => {
    expect.hasAssertions();

    expect(getNextScreenKind(ScreenKind.World, new Set([InputAction.OpenPaimonMenu]), true)).toBe(ScreenKind.World);
  });

  test("a step with no restriction opens the Paimon menu", () => {
    expect.hasAssertions();

    expect(getNextScreenKind(ScreenKind.World, new Set([InputAction.OpenPaimonMenu]), false)).toBe(
      ScreenKind.PaimonMenu,
    );
  });
});
