export const toShare = (logit: number): number => 1 / (1 + Math.exp(-logit));
