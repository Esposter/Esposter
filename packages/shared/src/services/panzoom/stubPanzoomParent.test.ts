import type { PanzoomBox } from "#src/models/panzoom/PanzoomBox";
import type { PanzoomElement } from "#src/models/panzoom/PanzoomElement";

import { describe, vi } from "vitest";

// Happy-dom resolves no computed border or padding, so the parent's inset is stubbed with its rectangle, the same on every side
export const stubPanzoomParent = (
  parent: PanzoomElement,
  box: PanzoomBox,
  { border = 0, padding = 0 }: { border?: number; padding?: number } = {},
): void => {
  vi.spyOn(parent, "getBoundingClientRect").mockReturnValue(new DOMRect(box.left, box.top, box.width, box.height));
  vi.spyOn(globalThis, "getComputedStyle").mockReturnValue({
    borderBottomWidth: `${border}px`,
    borderLeftWidth: `${border}px`,
    borderRightWidth: `${border}px`,
    borderTopWidth: `${border}px`,
    paddingBottom: `${padding}px`,
    paddingLeft: `${padding}px`,
    paddingRight: `${padding}px`,
    paddingTop: `${padding}px`,
  } as CSSStyleDeclaration);
};

describe.todo("stubPanzoomParent");
