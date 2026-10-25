import { getResult } from "@esposter/shared";

// `Temporal.Instant` is the parser rather than `new Date`, which answers an impossible day with the day it
// Overflows into — 30 February reads as 2 March — and an unparseable string with an Invalid Date object
export const parseIsoDate = (isoValue: string): Date | undefined =>
  getResult(() => new Date(Temporal.Instant.from(isoValue).epochMilliseconds)).unwrapOr(undefined);
