import type { SinFigures } from "../../models/SinFigures";
import type { SinPosterior } from "../../models/SinPosterior";

// The score is the posterior mean and the spread its standard deviation, from the Beta's own variance
export const getScoreAndSpread = ({ alpha, beta }: SinPosterior): SinFigures => {
  const total = alpha + beta;
  return { score: alpha / total, spread: Math.sqrt((alpha * beta) / (total * total * (total + 1))) };
};
