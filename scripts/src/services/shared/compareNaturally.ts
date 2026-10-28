// The order the repo's lint sorts names by: case-insensitive, with a run of digits read as a number, so `deck2` sorts before
// `deck15004`
const NATURAL_COLLATOR = new Intl.Collator("en-US", { numeric: true });

export const compareNaturally = (left: string, right: string): number => NATURAL_COLLATOR.compare(left, right);
