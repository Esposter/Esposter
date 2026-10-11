// A missing part and a wildcard both leave that part unconstrained
const ANY_PART_REGEX = /^[*xX]?$/u;

export const checkIsAnyPart = (part: string): boolean => ANY_PART_REGEX.test(part);
