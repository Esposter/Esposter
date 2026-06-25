import { getRawData } from "@/util/reactivity/getRawData";
import { describe, expect, test } from "vitest";
import { reactive, readonly } from "vue";

describe(getRawData, () => {
  test("returns raw data for reactive objects", () => {
    expect.hasAssertions();

    const data = {};
    const reactiveData = reactive(data);

    expect(getRawData(reactiveData)).toBe(data);
  });

  test("returns raw data for readonly objects", () => {
    expect.hasAssertions();

    const data = {};
    const readonlyData = readonly(data);

    expect(getRawData(readonlyData)).toBe(data);
  });

  test("returns raw data for nested readonly reactive objects", () => {
    expect.hasAssertions();

    const data = {};
    const nestedData = readonly(reactive(data));

    expect(getRawData(nestedData)).toBe(data);
  });

  test("returns same data for non-reactive objects", () => {
    expect.hasAssertions();

    const data = {};

    expect(getRawData(data)).toBe(data);
  });
});
