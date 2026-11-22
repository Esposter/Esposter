import type { SinPosterior } from "../../models/SinPosterior";

import { SIN_PRIOR } from "./constants";

// The posterior now is the trail's last entry, and a sin with no evidence reads as the prior: an even half with the spread
// Of one count of each outcome
export const getPosterior = (trail: SinPosterior[]): SinPosterior =>
  trail.at(-1) ?? { alpha: SIN_PRIOR, beta: SIN_PRIOR };
