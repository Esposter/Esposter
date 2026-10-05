import type { FittedInterfaceClip } from "#src/models/FittedInterfaceClip";
import type { InterfaceClip } from "#src/models/InterfaceClip";
import type { InterfaceClipProperty } from "#src/models/InterfaceClipProperty";

import { InterfaceClipProperties } from "#src/models/InterfaceClipProperty";

// Widened to strings, so a property a fit wrote can be looked up in it
const INTERFACE_CLIP_PROPERTY_NAMES: readonly string[] = InterfaceClipProperties;
const checkIsProperty = (property: string): property is InterfaceClipProperty =>
  INTERFACE_CLIP_PROPERTY_NAMES.includes(property);
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
