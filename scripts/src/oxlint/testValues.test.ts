/* oxlint-disable test-values/no-typed-date -- the fixtures spell the violations the rule reports */
import { setupPluginSuite } from "#src/services/oxlint/shared/setupPluginSuite.test";
import { describe } from "vitest";

describe("testValues", () => {
  const DATE = "Date";
  const INSTANT_FROM = "Temporal.Instant.from";
  const PLAIN_DATE = "Temporal.PlainDate.from";
  const RULE = "test-values/no-typed-date";
  const FIXTURES = [
    { name: "calendarString", source: `export const a = "1971-01-01";`, violations: 1 },
    { name: "stampString", source: `export const a = "1971-01-01T00:00:00.000Z";`, violations: 1 },
    { name: "calendarTemplate", source: "export const a = `datetime'1971-01-01'`;", violations: 1 },
    // A string handed to a date constructor is typed whatever year it carries, and reported once
    { name: "dateFromEpochString", source: `export const a = new ${DATE}("1970-01-02");`, violations: 1 },
    { name: "dateFromLaterString", source: `export const a = new ${DATE}("1971-01-01");`, violations: 1 },
    { name: "dateFromTemplate", source: `export const a = new ${DATE}(\`1970-01-02\`);`, violations: 1 },
    { name: "plainDateFromString", source: `export const a = ${PLAIN_DATE}("1970-01-01");`, violations: 1 },
    { name: "instantFromString", source: `export const a = ${INSTANT_FROM}("1970-01-01T00:00:00Z");`, violations: 1 },
    { name: "localPartsLaterYear", source: `export const a = new ${DATE}(1971, 0, 1);`, violations: 1 },
    // The epoch, computed
    { name: "epoch", source: `export const a = new ${DATE}(0);`, violations: 0 },
    {
      name: "epochPlusDuration",
      source: `export const a = new ${DATE}(Temporal.Duration.from({ days: 1 }).total("a"));`,
      violations: 0,
    },
    { name: "epochInstant", source: `export const a = Temporal.Instant.fromEpochMilliseconds(0);`, violations: 0 },
    { name: "isoOfComputed", source: `export const a = new ${DATE}(0).toISOString().slice(0, 10);`, violations: 0 },
    // A shape a parser reads stays in the epoch's own year
    { name: "epochYearShape", source: `export const a = "1970-13-01";`, violations: 0 },
    { name: "epochLocalParts", source: `export const a = new ${DATE}(1970, 0, 2, 13);`, violations: 0 },
    // A length is not a date, and a number that is not a year is not local parts
    { name: "durationFromString", source: `export const a = Temporal.Duration.from("a");`, violations: 0 },
    { name: "millisecondCount", source: `export const a = new ${DATE}(1);`, violations: 0 },
    { name: "identifierArgument", source: `export const a = new ${DATE}(now);`, violations: 0 },
    { name: "digitsNotADate", source: `export const a = "11971-01-011";`, violations: 0 },
  ];
  setupPluginSuite({ fixtures: FIXTURES, plugin: "testValues", rules: [RULE] });
});
