// Whether a machine holds every capability a unit needs, a unit with no needs being met by any machine
export const checkNeedsMet = (needs: readonly string[], capabilities: readonly string[]): boolean =>
  needs.every((need) => capabilities.includes(need));
