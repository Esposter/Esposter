import type { InterfaceClip } from "#src/models/InterfaceClip";

import { InterfaceClipProperty } from "#src/models/InterfaceClipProperty";

const PROPERTIES: readonly string[] = Object.values(InterfaceClipProperty);
const checkIsProperty = (property: string): property is InterfaceClipProperty => PROPERTIES.includes(property);
// A clip as a fit writes it, its properties plain strings in the JSON, read as an interface clip: a track whose
// Property is not one a screen draws is dropped rather than cast
export const readInterfaceClip = ({
  durationMs,
  tracks,
}: {
  durationMs: number;
  tracks: { keyframes: number[][]; property: string; target: string }[];
}): InterfaceClip => ({
  durationMs,
  tracks: tracks.flatMap(({ keyframes, property, target }) =>
    checkIsProperty(property)
      ? [{ keyframes: keyframes.map(([offset = 0, value = 0]): [number, number] => [offset, value]), property, target }]
      : [],
  ),
});
