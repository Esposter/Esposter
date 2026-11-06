import type { ScreenKind } from "#src/models/screen/ScreenKind";

import { ScreenKinds } from "#src/models/screen/ScreenKind";
import { ScreenKindOpener } from "#src/models/screen/ScreenKindOpener";
import { exhaustiveGuard } from "@esposter/shared";

// The screen kinds whose claimed opener the menus do not hold: a Paimon menu claim needs the menu to list the kind, and
// A shortcut claim needs an input action or a wheel entry to open it. An interaction or the world claims nothing to
// Read, so it holds
export const findUnreachableScreenKinds = (
  screenKindOpenerMap: Readonly<Record<ScreenKind, ScreenKindOpener>>,
  {
    inputActionScreenKinds,
    menuScreenKinds,
    wheelScreenKinds,
  }: {
    inputActionScreenKinds: ReadonlySet<ScreenKind>;
    menuScreenKinds: ReadonlySet<ScreenKind>;
    wheelScreenKinds: ReadonlySet<ScreenKind>;
  },
): ScreenKind[] =>
  ScreenKinds.filter((screenKind) => {
    const opener = screenKindOpenerMap[screenKind];
    switch (opener) {
      case ScreenKindOpener.Interaction:
      case ScreenKindOpener.World:
        return false;
      case ScreenKindOpener.PaimonMenu:
        return !menuScreenKinds.has(screenKind);
      case ScreenKindOpener.Shortcut:
        return !inputActionScreenKinds.has(screenKind) && !wheelScreenKinds.has(screenKind);
      default:
        return exhaustiveGuard(opener);
    }
  });
