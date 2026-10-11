import { FillKind } from "#src/models/fleet/FillKind";
import { claimFillEntries } from "#src/services/fleet/claimFillEntries";
import { describe, expect, test } from "vitest";

describe(claimFillEntries, () => {
  const KINDS = [FillKind.Unit, FillKind.Cpu, FillKind.Page] as const;

  test("asks each kind in turn, drops a kind that has nothing, and stops at the shortfall", async () => {
    expect.hasAssertions();

    const remaining = { [FillKind.Cpu]: ["c1", "c2"], [FillKind.Page]: ["p1"], [FillKind.Unit]: ["u1"] };
    const asked: FillKind[] = [];
    const claims = await claimFillEntries(4, KINDS, (kind) => {
      asked.push(kind);
      return Promise.resolve(remaining[kind].shift());
    });

    expect(asked).toStrictEqual([FillKind.Unit, FillKind.Cpu, FillKind.Page, FillKind.Unit, FillKind.Cpu]);
    expect(claims).toStrictEqual(["u1", "c1", "p1", "c2"]);
  });

  test("asks nothing when the shortfall is met", async () => {
    expect.hasAssertions();

    const asked: FillKind[] = [];
    const claims = await claimFillEntries(0, KINDS, (kind) => {
      asked.push(kind);
      return Promise.resolve("entry");
    });

    expect(asked).toStrictEqual([]);
    expect(claims).toStrictEqual([]);
  });
});
