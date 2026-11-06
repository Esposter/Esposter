import { ScreenKind } from "#src/models/screen/ScreenKind";
import { ScreenKindOpener } from "#src/models/screen/ScreenKindOpener";
import { PAIMON_MENU_CONTENTS, PAIMON_MENU_SIDE_BAR } from "#src/services/menu/constants";
import { findUnreachableScreenKinds } from "#src/services/screen/findUnreachableScreenKinds";
import { InputActionScreenKindMap } from "#src/services/screen/InputActionScreenKindMap";
import { ScreenKindOpenerMap } from "#src/services/screen/ScreenKindOpenerMap";
import { ShortcutWheelDirectionCountScreenKindsMap } from "#src/services/shortcutWheel/ShortcutWheelDirectionCountScreenKindsMap";
import { describe, expect, test } from "vitest";

describe("findUnreachableScreenKinds", () => {
  // The menu lists its contents and its side bar, and the shortcuts are the input actions' map and the wheel's entries
  const menuScreenKinds = new Set(
    [...PAIMON_MENU_CONTENTS, ...PAIMON_MENU_SIDE_BAR].map(({ screenKind }) => screenKind),
  );
  const inputActionScreenKinds = new Set(
    Object.values(InputActionScreenKindMap).filter((screenKind) => screenKind !== undefined),
  );
  const wheelScreenKinds = new Set(Object.values(ShortcutWheelDirectionCountScreenKindsMap).flat());

  test("a screen kind whose claimed opener does not hold is unreachable", () => {
    expect.hasAssertions();
    const claimedScreenKindOpenerMap = { ...ScreenKindOpenerMap, [ScreenKind.Chat]: ScreenKindOpener.PaimonMenu };

    expect(
      findUnreachableScreenKinds(claimedScreenKindOpenerMap, {
        inputActionScreenKinds,
        menuScreenKinds,
        wheelScreenKinds,
      }),
    ).toStrictEqual([ScreenKind.Chat]);
  });

  test("the real tables name no unreachable screen kind", () => {
    expect.hasAssertions();

    expect(
      findUnreachableScreenKinds(ScreenKindOpenerMap, { inputActionScreenKinds, menuScreenKinds, wheelScreenKinds }),
    ).toStrictEqual([]);
  });
});
