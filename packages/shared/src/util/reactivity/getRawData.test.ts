import { getRawData } from "@/util/reactivity/getRawData";
import { describe, expect, test } from "vitest";
import { reactive } from "vue";

describe(getRawData, () => {
  test("returns raw data for reactive objects", () => {
    expect.hasAssertions();

    const data = {};
    const reactiveData = reactive(data);

    expect(getRawData(reactiveData)).toStrictEqual(data);
    expect(getRawData(reactiveData)).not.toBe(reactiveData);
  });

  test("returns same data for non-reactive objects", () => {
    expect.hasAssertions();

    const data = {};

    expect(getRawData(data)).toBe(data);
  });
});
