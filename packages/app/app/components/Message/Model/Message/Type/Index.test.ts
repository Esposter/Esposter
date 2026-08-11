// @vitest-environment nuxt
import MessageModelMessageTypeIndex from "@/components/Message/Model/Message/Type/Index.vue";
import { createUser } from "@/services/message/user/createUser.test";
import { createMessageEntity, MessageType } from "@esposter/db-schema";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("messageModelMessageTypeIndex", () => {
  const roomId = crypto.randomUUID();
  const creator = createUser();
  const editor = "editor";
  // The `isForward` column is a literal-true optional, so the unforwarded arm leaves it unset rather than false
  const createMessage = (isForward: boolean) => {
    const message = createMessageEntity({
      message: "<p>message</p>",
      roomId,
      type: MessageType.Message,
      userId: creator.id,
    });
    message.isEdited = true;
    if (isForward) message.isForward = true;
    return message;
  };

  // The forward branch used to re-implement the body, so forwarding a message silently dropped both the edited
  // Marker and the slot the inline editor arrives through — matrixed over the flag because one branch is the
  // Only thing that differs
  test.each([false, true])("marks an edited message as edited with isForward %s", async (isForward) => {
    expect.hasAssertions();

    const component = await mountSuspended(MessageModelMessageTypeIndex, {
      props: { creator, message: createMessage(isForward) },
    });

    expect(component.text()).toContain("(edited)");
  });

  test.each([false, true])("renders the inline editor slot with isForward %s", async (isForward) => {
    expect.hasAssertions();

    const component = await mountSuspended(MessageModelMessageTypeIndex, {
      props: { creator, message: createMessage(isForward) },
      slots: { default: editor },
    });

    expect(component.text()).toContain(editor);
  });
});
