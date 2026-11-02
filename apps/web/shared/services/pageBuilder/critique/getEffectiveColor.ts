import type { CritiqueSources } from "#shared/models/pageBuilder/CritiqueSources";
import type { StyleValue } from "#shared/models/pageBuilder/StyleValue";
import type { SrgbColor } from "#shared/models/shared/SrgbColor";

// A colour a node draws in: the one its own style sets, read through the caller's reader, or else the one it inherits
export const getEffectiveColor = (
  value: StyleValue | undefined,
  inherited: SrgbColor | undefined,
  readColor: CritiqueSources["readColor"],
): SrgbColor | undefined => (value ? readColor(value) : inherited);
