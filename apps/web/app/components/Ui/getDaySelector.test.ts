import { describe } from "vitest";

// A day of a date grid, found by the ISO date it carries
export const getDaySelector = (isoDate: string) => `[data-date="${isoDate}"]`;

describe.todo("getDaySelector");
