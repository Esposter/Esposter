import { getSortedByUpdatedAt } from "#src/services/coderabbit/shared/getSortedByUpdatedAt";
import { describe, expect, test } from "vitest";

const createEntry = (id: number, updatedAt: string) => ({
  body: "",
  id,
  updated_at: updatedAt,
  user: { login: "coderabbitai[bot]" },
});

describe(getSortedByUpdatedAt, () => {
  // The walkthrough answers a probe by editing itself, which keeps its id below every comment posted since
  test("picks the edited comment over a newer id that has not moved", () => {
    expect.hasAssertions();

    expect(
      getSortedByUpdatedAt([createEntry(1, "2026-09-11T02:00:00Z"), createEntry(9, "2026-09-11T01:00:00Z")]).at(-1),
    ).toStrictEqual(createEntry(1, "2026-09-11T02:00:00Z"));
  });

  test("falls back to the id for two comments written in the same second", () => {
    expect.hasAssertions();

    expect(
      getSortedByUpdatedAt([createEntry(9, "2026-09-11T01:00:00Z"), createEntry(4, "2026-09-11T01:00:00Z")]).at(-1),
    ).toStrictEqual(createEntry(9, "2026-09-11T01:00:00Z"));
  });
});
