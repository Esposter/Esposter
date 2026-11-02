// @vitest-environment nuxt
import MessageModelRoomSettingsTypeOverviewSlowmodeField from "@/components/Message/Model/Room/Settings/Type/Overview/SlowmodeField.vue";
import { MAX_SLOWMODE_MS } from "@esposter/db-schema";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("messageModelRoomSettingsTypeOverviewSlowmodeField", () => {
  // The model only emits when the value changes, so the field starts enabled and every case below moves it
  const modelValue = Temporal.Duration.from({ seconds: 5 }).total("milliseconds");

  // A number field emits whatever was typed rather than what its rules allow, and a Temporal duration rejects a
  // Field that is not a finite integer as well as one past the range it can represent — so a fractional entry is
  // Truncated to whole seconds rather than thrown out of the handler
  test("resolves a fractional entry to its whole-second duration", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(MessageModelRoomSettingsTypeOverviewSlowmodeField, {
      props: { modelValue },
    });
    await component.get("input").setValue("1.5");

    expect(component.emitted("update:modelValue")).toStrictEqual([
      [Temporal.Duration.from({ seconds: 1 }).total("milliseconds")],
    ]);
  });

  // An entry the field refuses keeps the stored slowmode: the form saves on blur, and a 0 written here would switch
  // Slowmode off without the reader asking for it
  test.each(["1e999", "1e16", "0.5", "0", "-5"])(
    "keeps the stored slowmode for the refused entry %s",
    async (typedSeconds) => {
      expect.hasAssertions();

      const component = await mountSuspended(MessageModelRoomSettingsTypeOverviewSlowmodeField, {
        props: { modelValue },
      });
      await component.get("input").setValue(typedSeconds);

      expect(component.emitted("update:modelValue")).toBeUndefined();
    },
  );

  test("turns slowmode off when the field is emptied", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(MessageModelRoomSettingsTypeOverviewSlowmodeField, {
      props: { modelValue },
    });
    await component.get("input").setValue("");

    expect(component.emitted("update:modelValue")).toStrictEqual([[0]]);
  });

  // An untruncated display renders the largest storable duration as a fraction of a second, which no whole-second
  // Duration the handler writes back can hold — so touching the field would throw rather than keep what is stored
  test("displays the largest storable duration as whole seconds within it", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(MessageModelRoomSettingsTypeOverviewSlowmodeField, {
      props: { modelValue: MAX_SLOWMODE_MS },
    });
    const displaySeconds = Number(component.get("input").element.value);

    expect(displaySeconds).toBe(Math.floor(MAX_SLOWMODE_MS / 1000));
  });
});
