import type { GoFloat } from "#src/models/genshinAssets/kits/gcsim/GoFloat";
import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";

// Whether a value is a whole-valued float, the one float a bare number does not carry
export const checkIsGoFloat = (value: GoValue | undefined): value is GoFloat =>
  typeof value === "object" && value !== null && !Array.isArray(value) && "float" in value;
