import type { PanzoomOptions } from "#src/models/panzoom/PanzoomOptions";

import { PANZOOM_DEFAULT_EXCLUDE_CLASS } from "#src/services/panzoom/constants";

// A pointer down is ignored when its target, or an ancestor of it, is an excluded element or carries the exclude class
export const checkIsPanzoomExcluded = (
  target: Element,
  { exclude = [], excludeClass = PANZOOM_DEFAULT_EXCLUDE_CLASS }: Pick<PanzoomOptions, "exclude" | "excludeClass">,
): boolean =>
  exclude.some((excluded) => excluded.contains(target)) || target.closest(`.${CSS.escape(excludeClass)}`) !== null;
