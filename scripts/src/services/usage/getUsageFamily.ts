import { USAGE_FAMILIES } from "#src/services/usage/constants";

// The family a model id belongs to, else the id itself
export const getUsageFamily = (model: string): string =>
  USAGE_FAMILIES.find((family) => model.includes(family)) ?? model;
