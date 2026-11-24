// @vitest-environment nuxt
import MessageModelRoomEmojiNameField from "#src/components/Message/Model/Room/Emoji/NameField.vue";
import { SuggestionTrigger } from "#src/models/shared/SuggestionTrigger";
import { noop } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("messageModelRoomEmojiNameField", () => {
  // The model holds the name without its colon, and a parent that keeps it does not redraw the field.
  // So a typed colon has to be written back out of the field itself, not left beside a name without one.
  test("removes a typed colon from the field, not only from the model", async () => {
    expect.hasAssertions();

    const modelValue = "";
    const component = await mountSuspended(MessageModelRoomEmojiNameField, {
      props: { modelValue, "onUpdate:modelValue": noop },
    });
    const input = component.get("input");
    await input.setValue(SuggestionTrigger.Emoji);

    expect(input.element.value).toBe(modelValue);
  });
});
