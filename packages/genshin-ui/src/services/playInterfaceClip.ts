import type { InterfaceClip } from "#src/models/InterfaceClip";

import { InterfaceClipProperty } from "#src/models/InterfaceClipProperty";

// A track's value as the CSS property it drives: opacity and scale as they are, an offset as a translation in canvas
// Units with Unity's upward y turned downward
const InterfaceClipPropertyKeyframeMap: Record<InterfaceClipProperty, (value: number) => Keyframe> = {
  [InterfaceClipProperty.Opacity]: (value) => ({ opacity: value }),
  [InterfaceClipProperty.Scale]: (value) => ({ scale: String(value) }),
  [InterfaceClipProperty.X]: (value) => ({ translate: `calc(var(--canvas-unit) * ${value}) 0` }),
  [InterfaceClipProperty.Y]: (value) => ({ translate: `0 calc(var(--canvas-unit) * ${-value})` }),
};
// Plays one of the game's interface clips on a screen through Web Animations: each track animates the element of the
// Root whose `data-clip-target` is its piece's path (the root itself for the empty path), holding its last keyframe
// Once the clip ends. A track whose piece the screen does not draw is skipped. The animations are handed back, for a
// Host to await or to pause and seek as the parity page does
export const playInterfaceClip = (root: HTMLElement, { durationMs, tracks }: InterfaceClip): Animation[] =>
  tracks.flatMap(({ keyframes, property, target }) => {
    const element = target ? root.querySelector<HTMLElement>(`[data-clip-target="${target}"]`) : root;
    if (!element) return [];
    return [
      element.animate(
        keyframes.map(([offset, value]) => ({ ...InterfaceClipPropertyKeyframeMap[property](value), offset })),
        // An offset along x and one along y on the same piece add, as both drive its translation
        {
          composite: property === InterfaceClipProperty.X || property === InterfaceClipProperty.Y ? "add" : "replace",
          duration: durationMs,
          fill: "forwards",
        },
      ),
    ];
  });
