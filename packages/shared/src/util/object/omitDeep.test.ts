import { omitDeep } from "#src/util/object/omitDeep";
import { reactive } from "vue";
import { describe, expect, test } from "vitest";

describe(omitDeep, () => {
  // Mirrors the clicker's in-memory state: a class whose fields are its save fields and its ticking counters
  class Clicker {
    boughtBuildings: { amount: number; producedValue: number }[] = [{ amount: 1, producedValue: 2 }];
    createdAt = new Date(0);
    id = "1";
    pointCount = 3;
    producedValue = 4;
    updatedAt = new Date(1);
  }

  test("omits keys at every depth of plain objects and arrays", () => {
    expect.hasAssertions();

    expect(
      omitDeep(
        {
          id: "1",
          nested: [[{ pointCount: 2, value: 3 }]],
          pointCount: 4,
          boughtBuildings: [{ amount: 5, producedValue: 6 }],
        },
        "pointCount",
        "producedValue",
      ),
    ).toStrictEqual({ boughtBuildings: [{ amount: 5 }], id: "1", nested: [[{ value: 3 }]] });
  });

  test("keeps Dates as values", () => {
    expect.hasAssertions();

    expect(omitDeep({ createdAt: new Date(0), name: "1", updatedAt: new Date(1) }, "name", "updatedAt")).toStrictEqual({
      createdAt: new Date(0),
    });
  });

  test("keeps Map and Set by reference", () => {
    expect.hasAssertions();

    const map = new Map([["key", 1]]);
    const set = new Set([1]);

    expect(omitDeep({ map, pointCount: 2, set }, "pointCount")).toStrictEqual({ map, set });
  });

  test("keeps null and undefined values", () => {
    expect.hasAssertions();

    expect(omitDeep({ missing: undefined, nothing: null, pointCount: 1 }, "pointCount")).toStrictEqual({
      missing: undefined,
      nothing: null,
    });
  });

  test("walks a null-prototype object", () => {
    expect.hasAssertions();

    expect(omitDeep(Object.assign(Object.create(null), { id: "1", pointCount: 2 }), "pointCount")).toStrictEqual({
      id: "1",
    });
  });

  test("returns primitives and null unchanged", () => {
    expect.hasAssertions();

    expect(omitDeep("1", "pointCount")).toBe("1");
    expect(omitDeep(null, "pointCount")).toBeNull();
  });

  test("omits the same keys from a reactive state as from its raw state", () => {
    expect.hasAssertions();

    expect(
      omitDeep(reactive({ id: "1", pointCount: 2, producedValue: 3 }), "pointCount", "producedValue"),
    ).toStrictEqual({ id: "1" });
  });

  test("two states differing only in an omitted key omit to equal values", () => {
    expect.hasAssertions();

    expect(omitDeep({ id: "1", pointCount: 2 }, "pointCount")).toStrictEqual(
      omitDeep({ id: "1", pointCount: 3 }, "pointCount"),
    );
  });

  // Upstream returns a class instance by reference, so the keys are never omitted from the clicker's own state
  test("walks a reactive class instance, so its keys are omitted", () => {
    expect.hasAssertions();

    expect(omitDeep(reactive(new Clicker()), "pointCount", "producedValue", "updatedAt")).toStrictEqual({
      boughtBuildings: [{ amount: 1 }],
      createdAt: new Date(0),
      id: "1",
    });
  });

  test("walks a class instance inside an array", () => {
    expect.hasAssertions();

    expect(omitDeep({ items: [new Clicker()] }, "pointCount")).toStrictEqual({
      items: [
        {
          boughtBuildings: [{ amount: 1, producedValue: 2 }],
          createdAt: new Date(0),
          id: "1",
          producedValue: 4,
          updatedAt: new Date(1),
        },
      ],
    });
  });
});
