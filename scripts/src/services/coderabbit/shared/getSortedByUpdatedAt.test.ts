import { CODERABBIT_REST_LOGIN } from "#src/services/coderabbit/shared/constants";
import { getSortedByUpdatedAt } from "#src/services/coderabbit/shared/getSortedByUpdatedAt";
import { describe, expect, test } from "vitest";

const createEntry = (id: number, updatedAt: string) => ({
  body: "",
  id,
  updated_at: updatedAt,
  user: { login: CODERABBIT_REST_LOGIN },
});

describe(getSortedByUpdatedAt, () => {
  const epoch = new Date(0).toISOString();
  const nextHour = new Date(Temporal.Duration.from({ hours: 1 }).total("milliseconds")).toISOString();

  // The walkthrough answers a probe by editing itself, which keeps its id below every comment posted since
  test("picks the edited comment over a newer id that has not moved", () => {
    expect.hasAssertions();

    expect(getSortedByUpdatedAt([createEntry(1, nextHour), createEntry(9, epoch)]).at(-1)).toStrictEqual(
      createEntry(1, nextHour),
    );
  });

  test("falls back to the id for two comments written in the same second", () => {
    expect.hasAssertions();

    expect(getSortedByUpdatedAt([createEntry(9, epoch), createEntry(4, epoch)]).at(-1)).toStrictEqual(
      createEntry(9, epoch),
    );
  });
});
