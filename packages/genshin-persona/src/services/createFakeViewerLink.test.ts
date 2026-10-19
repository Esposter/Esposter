import type { ViewerLink } from "#src/models/ViewerLink";
import type { Mock } from "vitest";

import { describe, vi } from "vitest";

type FakeViewerLink = { [Method in keyof ViewerLink]: Mock<ViewerLink[Method]> };
interface FakeViewerLinkSink {
  drop: () => void;
  fireTap: () => void;
  link: FakeViewerLink;
}

// The viewer's link as a sink drives it: each message recorded by its method, the open state the test sets, and the
// Taps the test fires at the listeners the sink registered
export const createFakeViewerLink = (isInitiallyOpen = true): FakeViewerLinkSink => {
  const state = { isOpen: isInitiallyOpen };
  const listeners: (() => void)[] = [];
  const link: FakeViewerLink = {
    bubble: vi.fn<ViewerLink["bubble"]>(),
    close: vi.fn<ViewerLink["close"]>(() => {
      state.isOpen = false;
    }),
    expressionClear: vi.fn<ViewerLink["expressionClear"]>(),
    isOpen: vi.fn<ViewerLink["isOpen"]>(() => state.isOpen),
    motion: vi.fn<ViewerLink["motion"]>(),
    onTap: vi.fn<ViewerLink["onTap"]>((listener) => {
      listeners.push(listener);
    }),
    playSound: vi.fn<ViewerLink["playSound"]>(),
    soundStop: vi.fn<ViewerLink["soundStop"]>(),
  };
  return {
    drop: (): void => {
      state.isOpen = false;
    },
    fireTap: (): void => {
      for (const listener of listeners) listener();
    },
    link,
  };
};

describe.todo("createFakeViewerLink");
