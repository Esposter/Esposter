import type { PanzoomBox } from "#src/models/panzoom/PanzoomBox";
import type { PanzoomElement } from "#src/models/panzoom/PanzoomElement";

import { describe, vi } from "vitest";

// Happy-dom lays nothing out, so an element's drawn rectangle is its layout box scaled and moved by the transform its
// Panzoom wrote, about its centre. The stub reads that transform on every call, so a rectangle read after a write is current
export const stubPanzoomLayout = (element: PanzoomElement, layout: PanzoomBox): void => {
  vi.spyOn(element, "getBoundingClientRect").mockImplementation(() => {
    const groups = /scale\((?<scale>[^)]+)\) translate\((?<x>[^p]+)px, (?<y>[^p]+)px\)/u.exec(
      element.style.transform,
    )?.groups;
    const scale = Number(groups?.scale ?? 1);
    const x = Number(groups?.x ?? 0);
    const y = Number(groups?.y ?? 0);
    const width = layout.width * scale;
    const height = layout.height * scale;
    const centreX = layout.left + layout.width / 2 + scale * x;
    const centreY = layout.top + layout.height / 2 + scale * y;

    return new DOMRect(centreX - width / 2, centreY - height / 2, width, height);
  });
};

describe.todo("stubPanzoomLayout");
