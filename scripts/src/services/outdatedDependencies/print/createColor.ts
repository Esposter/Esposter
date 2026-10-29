import type { ColorPalette } from "#src/models/shared/ColorPalette";

import { wrap } from "#src/services/outdatedDependencies/print/wrap";

export const createColor = (isColorEnabled: boolean): ColorPalette => ({
  cyan: (text) => (isColorEnabled ? wrap(36, text) : text),
  green: (text) => (isColorEnabled ? wrap(32, text) : text),
  red: (text) => (isColorEnabled ? wrap(31, text) : text),
  yellow: (text) => (isColorEnabled ? wrap(33, text) : text),
});
