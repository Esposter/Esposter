import { toRawDeep } from "@/util/reactivity/toRawDeep";
import { describe, expect, test } from "vitest";
import { reactive } from "vue";

describe(toRawDeep, () => {
  test("unwraps nested reactive objects", () => {
    expect.hasAssertions();

    expect(toRawDeep(reactive({ "": reactive({}) }))).toStrictEqual({ "": {} });
  });
});
