import { DOMAIN_DISORDER_SOURCE } from "#src/services/domains/constants";

// The source of one stack of a disorder's bonus, so each stack ends apart and the leave ends every one of them
export const getDomainDisorderSource = (disorder: string, stack: number): string =>
  `${DOMAIN_DISORDER_SOURCE}:${disorder}:${stack}`;
