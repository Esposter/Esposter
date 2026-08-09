// @vitest-environment nuxt
import type { RuleAliases } from "vuetify/labs/rules";
import type { ValidationRule } from "vuetify/lib/composables/validation.mjs";

import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

// A rule is allowed to be a bare message rather than a predicate, so the value goes through whichever the
// Builder answered with
const getRuleMessage = (rule: ValidationRule, value: number | string) =>
  typeof rule === "function" ? rule(value) : rule;
// The aliases are read through `useVRules` inside a component rather than off the config object, so the
// Assertion covers them being registered as well as what they say
// `RuleAliases` rather than the composable's return type: `useVRules` is overloaded, and the argument-less
// Call that hands back the aliases is not the overload `ReturnType` resolves to
const getRuleMessages = async (readMessages: (rules: RuleAliases) => unknown[]) => {
  let messages: unknown[] = [];
  const wrapper = await mountSuspended(
    defineComponent({
      setup() {
        const rules = useVRules();
        return () => {
          messages = readMessages(rules);
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

    await expect(
      getRuleMessages((rules) => [
        getRuleMessage(rules.isNotProfanity(), "shit"),
        getRuleMessage(rules.minValue(5), "1"),
        getRuleMessage(rules.required(), ""),
      ]),
    ).resolves.toStrictEqual([
      "This field cannot contain profanity",
      "You must enter a value of at least 5",
      "This field is required",
    ]);
  });

  // A `type="number"` field hands the rule a number, so the emptiness check has to be an emptiness check — a
  // Falsiness one reads 0 as a blank field and lets the one value the minimum exists to reject straight through
  test("rejects a numeric zero while still treating an empty field as optional", async () => {
    expect.hasAssertions();

    await expect(
      getRuleMessages((rules) => [getRuleMessage(rules.minValue(5), 0), getRuleMessage(rules.minValue(5), "")]),
    ).resolves.toStrictEqual(["You must enter a value of at least 5", true]);
  });
});
