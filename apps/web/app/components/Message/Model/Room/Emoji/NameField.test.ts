// @vitest-environment nuxt
import MessageModelRoomEmojiNameField from "@/components/Message/Model/Room/Emoji/NameField.vue";
import { SuggestionTrigger } from "@/models/shared/SuggestionTrigger";
import { noop } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("messageModelRoomEmojiNameField", () => {
  // The model holds the name without its colon, and a parent that keeps it does not redraw the field, so the typed colon
  // Has to be written back out of the field itself rather than left on screen beside a name that does not have one
  test("removes a typed colon from the field, not only from the model", async () => {
    expect.hasAssertions();

    const modelValue = "a";
    const component = await mountSuspended(MessageModelRoomEmojiNameField, {
      props: { modelValue, "onUpdate:modelValue": noop },
    });
    const input = component.get("input");
    await input.setValue(`${modelValue}${SuggestionTrigger.Emoji}`);

    expect(input.element.value).toBe(modelValue);
  });
});
