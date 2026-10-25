import { getSingulars } from "#src/services/sweeps/fileOrganization/getSingulars";

export const checkIsSameWord = (a: string, b: string): boolean =>
  a === b || getSingulars(a).some((singular) => getSingulars(b).includes(singular));
