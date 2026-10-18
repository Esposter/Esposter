import { takeOne } from "#src/util/array/takeOne";
import { clonePlainDeep } from "#src/util/object/clonePlainDeep";
import { describe, expect, test } from "vitest";
import { isProxy, reactive } from "vue";

describe(clonePlainDeep, () => {
  test("copies every array and plain object, so writing into the copy leaves the original whole", () => {
    expect.hasAssertions();

    const data = { series: [{ data: [1] }] };
    const clone = clonePlainDeep(data);
    takeOne(clone.series).data.splice(0);

    expect(data).toStrictEqual({ series: [{ data: [1] }] });
  });

  test("shares a function and a date rather than copying them", () => {
    expect.hasAssertions();

    const date = new Date(0);
    const clone = clonePlainDeep({ date, legend: { formatter: String } });

    expect(clone.legend.formatter).toBe(String);
    expect(clone.date).toBe(date);
  });

  test("keeps a cycle as a cycle in the copy", () => {
    expect.hasAssertions();

    const data: { self?: unknown } = {};
    data.self = data;
    const clone = clonePlainDeep(data);

    expect(clone.self).toBe(clone);
    expect(clone).not.toBe(data);
  });

  test("leaves no reactive proxy in the copy", () => {
    expect.hasAssertions();

    const clone = clonePlainDeep(reactive({ series: [{ data: [1] }] }));

    expect([isProxy(clone), isProxy(clone.series), isProxy(takeOne(clone.series))]).toStrictEqual([
      false,
      false,
      false,
    ]);
  });
});
