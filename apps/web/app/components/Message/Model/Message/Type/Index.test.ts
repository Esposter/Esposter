// @vitest-environment nuxt
import MessageModelMessageTypeIndex from "@/components/Message/Model/Message/Type/Index.vue";
import { createOptimisticMessage } from "@/services/message/createOptimisticMessage";
import { createUser } from "@/services/message/user/createUser.test";
import { MessageType } from "@esposter/db-schema";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe("messageModelMessageTypeIndex", () => {
  const roomId = v7();
  const creator = createUser();
  const editor = "editor";
  const createMessage = (isForward: boolean) => {
    const message = createOptimisticMessage(
      { message: "<p>message</p>", roomId, type: MessageType.Message },
      creator.id,
    );
    message.isEdited = true;
    message.isForward = isForward;
    return message;
  };

  // Both branches render the one body, so a forward that re-implements it drops the edited marker and the slot
  // The inline editor arrives through — matrixed over the flag because that branch is the only thing differing
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
