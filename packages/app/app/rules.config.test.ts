// @vitest-environment nuxt
import type { ValidationRule } from "vuetify/lib/composables/validation.mjs";

import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

// A rule is allowed to be a bare message rather than a predicate, so the value goes through whichever the
// Builder answered with
const getRuleMessage = (rule: ValidationRule, value: string) => (typeof rule === "function" ? rule(value) : rule);
// The aliases are read through `useVRules` inside a component rather than off the config object, so the
// Assertion covers them being registered as well as what they say
const getRuleMessages = async () => {
  let messages: unknown[] = [];
  const wrapper = await mountSuspended(
    defineComponent({
      setup() {
        const rules = useVRules();
        return () => {
          messages = [
            getRuleMessage(rules.isNotProfanity(), "shit"),
            getRuleMessage(rules.minValue(5), "1"),
            getRuleMessage(rules.required(), ""),
          ];
          return h("div");
        };
      },
    }),
  );
  wrapper.unmount();
  return messages;
};

describe("rulesConfiguration", () => {
  // The built-in is asserted beside the two custom aliases because the point of the copy is that a field mixing
  // Them reads as one form — a reworded built-in here is what would break that
  test("words the custom aliases like the built-in they sit beside", async () => {
    expect.hasAssertions();

    await expect(getRuleMessages()).resolves.toStrictEqual([
      "This field cannot contain profanity",
      "You must enter a value of at least 5",
      "This field is required",
    ]);
  });
});
