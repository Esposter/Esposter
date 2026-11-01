import type { FittedInterfaceClip } from "#src/models/FittedInterfaceClip";
import type { InterfaceClip } from "#src/models/InterfaceClip";

import { checkIsProperty } from "#src/services/checkIsProperty";

// A clip as a fit writes it, its properties plain strings in the JSON, read as an interface clip: a track whose
// Property is not one a screen draws is dropped rather than cast
export const toInterfaceClip = ({ durationMs, tracks }: FittedInterfaceClip): InterfaceClip => ({
  durationMs,
  tracks: tracks.flatMap(({ keyframes, property, target }) =>
    checkIsProperty(property)
      ? [{ keyframes: keyframes.map(([offset = 0, value = 0]): [number, number] => [offset, value]), property, target }]
      : [],
  ),
});
