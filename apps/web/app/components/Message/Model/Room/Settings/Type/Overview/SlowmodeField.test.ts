// @vitest-environment nuxt
import MessageModelRoomSettingsTypeOverviewSlowmodeField from "@/components/Message/Model/Room/Settings/Type/Overview/SlowmodeField.vue";
import { MAX_SLOWMODE_MS } from "@esposter/db-schema";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("messageModelRoomSettingsTypeOverviewSlowmodeField", () => {
  // The model only emits when the value changes, so the field starts enabled and every case below moves it
  const modelValue = Temporal.Duration.from({ seconds: 5 }).total("milliseconds");

  // A number field emits whatever was typed rather than what its rules allow, and a Temporal duration rejects a
  // Field that is not a finite integer as well as one past the range it can represent — so a fractional or
  // Oversized entry threw a RangeError out of the handler, leaving the field stuck on it
  test.each([
    ["1.5", Temporal.Duration.from({ seconds: 1 }).total("milliseconds")],
    ["1e999", 0],
    ["1e16", 0],
    ["0.5", 0],
  ])("resolves the typed %s to a whole-second duration", async (typedSeconds, expected) => {
    expect.hasAssertions();

    const component = await mountSuspended(MessageModelRoomSettingsTypeOverviewSlowmodeField, {
      props: { modelValue },
    });
    await component.get("input").setValue(typedSeconds);

    expect(component.emitted("update:modelValue")).toStrictEqual([[expected]]);
  });

  // An untruncated display renders the largest storable duration as a fraction of a second, which no whole-second
  // Duration the handler writes back can hold — so touching the field would throw rather than keep what is stored
  test("displays the largest storable duration as whole seconds within it", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(MessageModelRoomSettingsTypeOverviewSlowmodeField, {
      props: { modelValue: MAX_SLOWMODE_MS },
    });
    const displaySeconds = Number(component.get("input").element.value);

    expect(Temporal.Duration.from({ seconds: displaySeconds }).total("milliseconds")).toBeLessThanOrEqual(
      MAX_SLOWMODE_MS,
    );
  });
});
