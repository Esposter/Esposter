// @vitest-environment nuxt
import MessageModelRoomSettingsTypeOverviewSlowmodeField from "@/components/Message/Model/Room/Settings/Type/Overview/SlowmodeField.vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";
import { VTextField } from "vuetify/components";

describe("messageModelRoomSettingsTypeOverviewSlowmodeField", () => {
  // The model only emits when the value changes, so the field starts enabled and every case below moves it
  const modelValue = Temporal.Duration.from({ seconds: 5 }).total("milliseconds");
  // The largest value the `integer` column can hold, which is not a whole number of seconds
  const maxSlowmodeMs = 2_147_483_647;

  // A number input emits whatever was typed rather than what its min and max allow, and a Temporal duration
  // Rejects a field that is not a finite integer as well as one past the range it can represent — so a
  // Fractional or oversized entry threw a RangeError out of the handler, leaving the field stuck on it
  test.each([
    ["1.5", Temporal.Duration.from({ seconds: 1 }).total("milliseconds")],
    ["1e999", null],
    ["1e16", null],
    ["0.5", null],
  ])("resolves the typed %s to a whole-second duration", async (typedSeconds, expected) => {
    expect.hasAssertions();

    const component = await mountSuspended(MessageModelRoomSettingsTypeOverviewSlowmodeField, {
      props: { modelValue },
    });
    component.findComponent(VTextField).vm.$emit("update:modelValue", typedSeconds);

    expect(component.emitted("update:modelValue")).toStrictEqual([[expected]]);
  });

  // An untruncated display renders the largest storable duration above the field's own max, and editing that
  // Value back through the handler truncates it — silently reducing what is stored just by touching the field
  test("displays the largest storable duration within the maximum it advertises", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(MessageModelRoomSettingsTypeOverviewSlowmodeField, {
      props: { modelValue: maxSlowmodeMs },
    });
    const input = component.find("input");

    expect(input.element.value).toBe(input.attributes("max"));
  });
});
