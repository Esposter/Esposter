import type { SinPosterior } from "../../models/SinPosterior";

import { SIN_DISCOUNT, SIN_PRIOR } from "./constants";

// Each evidence value is replayed in order, the counts discounted before it is added, so the trail is the posterior
// After each prompt and its last entry is the posterior now
export const getPosteriorTrail = (evidences: number[]): SinPosterior[] => {
  let posterior: SinPosterior = { alpha: SIN_PRIOR, beta: SIN_PRIOR };
  return evidences.map((evidence) => {
    posterior = {
      alpha: SIN_DISCOUNT * posterior.alpha + evidence,
      beta: SIN_DISCOUNT * posterior.beta + (1 - evidence),
    };
    return posterior;
  });
};
