import { COMMISSION_STEP } from "#src/services/handbook/constants";

// The game places its rows by pitch rather than by flow, so each row's top is its place in the list times the step
export const toCommissionRowTop = (index: number): string =>
  `calc(var(--reference-pixel) * ${index * COMMISSION_STEP})`;
