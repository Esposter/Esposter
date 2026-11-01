import type { ReferenceEntryPlan } from "#src/models/genshinParity/reference/ReferenceEntryPlan";

export const hasScreenshot = ({ mainPath, missing }: ReferenceEntryPlan): boolean =>
  !missing.some(({ path }) => path === mainPath);
