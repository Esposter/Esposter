import { afterEach, beforeEach, describe, vi } from "vitest";

// A parent holding one element, attached to the body for each test, and removed with everything else the test attached
export const setupPanzoomDom = (): { getElement: () => HTMLDivElement; getParent: () => HTMLDivElement } => {
  let element: HTMLDivElement;
  let parent: HTMLDivElement;

  beforeEach(() => {
    parent = document.createElement("div");
    element = document.createElement("div");
    parent.append(element);
    document.body.append(parent);
  });
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.replaceChildren();
  });

  return { getElement: () => element, getParent: () => parent };
};

describe.todo("setupPanzoomDom");
