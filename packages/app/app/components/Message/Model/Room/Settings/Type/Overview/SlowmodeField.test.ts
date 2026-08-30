// @vitest-environment nuxt
import MessageModelRoomSettingsTypeOverviewSlowmodeField from "@/components/Message/Model/Room/Settings/Type/Overview/SlowmodeField.vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";
import { VTextField } from "vuetify/components";

describe("messageModelRoomSettingsTypeOverviewSlowmodeField", () => {
  // The model only emits when the value changes, so the field starts enabled and every case below moves it
  const modelValue = Temporal.Duration.from({ seconds: 5 }).total("milliseconds");
  // A number input emits whatever was typed rather than what its min allows, and every Temporal duration field
  // Must be a finite integer — so a fractional or overflowing entry threw a RangeError out of the handler and
  // Left the field stuck on the value that broke it
  test.each([
    ["1.5", Temporal.Duration.from({ seconds: 1 }).total("milliseconds")],
    ["1e999", null],
    ["0.5", null],
  ])("resolves the typed %s to a whole-second duration", async (typedSeconds, expected) => {
    expect.hasAssertions();

    const component = await mountSuspended(MessageModelRoomSettingsTypeOverviewSlowmodeField, {
      props: { modelValue },
    });
    component.findComponent(VTextField).vm.$emit("update:modelValue", typedSeconds);

    expect(component.emitted("update:modelValue")).toStrictEqual([[expected]]);
  });
});
