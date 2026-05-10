import { parseDuration } from "@/services/message/slashCommands/parseDuration";
import { describe, expect, test } from "vitest";

describe(parseDuration, () => {
  test("returns null for empty string", () => {
    expect.hasAssertions();
    expect(parseDuration("")).toBeNull();
  });

  test("returns null for zero duration", () => {
    expect.hasAssertions();
    expect(parseDuration("0m")).toBeNull();
  });

  test("returns null for invalid format", () => {
    expect.hasAssertions();
    expect(parseDuration("abc")).toBeNull();
  });

  test("parses seconds only", () => {
    expect.hasAssertions();
    expect(parseDuration("30s")).toBe(30_000);
  });

  test("parses minutes only", () => {
    expect.hasAssertions();
    expect(parseDuration("10m")).toBe(600_000);
  });

  test("parses hours only", () => {
    expect.hasAssertions();
    expect(parseDuration("1h")).toBe(3_600_000);
  });

  test("parses hours and minutes", () => {
    expect.hasAssertions();
    expect(parseDuration("1h30m")).toBe(5_400_000);
  });

  test("parses hours, minutes, and seconds", () => {
    expect.hasAssertions();
    expect(parseDuration("2h15m30s")).toBe(8_130_000);
  });

  test("is case-insensitive", () => {
    expect.hasAssertions();
    expect(parseDuration("1H30M")).toBe(5_400_000);
  });

  test("trims whitespace", () => {
    expect.hasAssertions();
    expect(parseDuration("  5m  ")).toBe(300_000);
  });
});
