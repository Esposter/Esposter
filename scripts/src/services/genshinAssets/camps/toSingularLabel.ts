import { IRREGULAR_FAMILY_LABEL_SINGULARS } from "#src/services/genshinAssets/camps/constants";

// The singular a label's variants name it by: its irregular singular, else each word's final s dropped
export const toSingularLabel = (label: string): string =>
  IRREGULAR_FAMILY_LABEL_SINGULARS.get(label) ??
  label
    .split(" ")
    .map((word) => (word.length > 3 && word.endsWith("s") && !word.endsWith("ss") ? word.slice(0, -1) : word))
    .join(" ");
