// @vitest-environment nuxt
import MessageModelMessageTypeIndex from "#src/components/Message/Model/Message/Type/Index.vue";
import { createOptimisticMessage } from "#src/services/message/createOptimisticMessage";
import { createUser } from "#src/services/message/user/createUser.test";
import { MessageType } from "@esposter/db-schema";
import { getZonedDateTime } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { v7 } from "uuid";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe("messageModelMessageTypeIndex", () => {
  const roomId = v7();
  const creator = createUser();
  const editor = "a";
  // The local midnight of the epoch's day, so its time and day read the same in every zone
  const createdAt = getZonedDateTime(new Date(0)).startOfDay().toInstant();
  const createMessage = (isForward: boolean) => {
    const message = createOptimisticMessage(
      { message: "<p>message</p>", roomId, type: MessageType.Message },
      creator.id,
    );
    message.editedAt = new Date();
    message.isForward = isForward;
    return message;
  };

  beforeEach(() => {
    vi.useFakeTimers({ now: 0, toFake: ["Date", "Temporal"] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // Both branches render the one body, so a forward that re-implements it drops the edited marker and the slot
  // The inline editor arrives through — each branch is its own test, because a whole-text snapshot holds one value
  test("marks an edited message as edited", async () => {
    expect.hasAssertions();

    vi.setSystemTime(createdAt);
    const component = await mountSuspended(MessageModelMessageTypeIndex, {
      props: { creator, message: createMessage(false) },
    });

    expect(component.text()).toMatchInlineSnapshot(`"Nname0:00message(edited)"`);
  });

  test("marks an edited forward as edited", async () => {
    expect.hasAssertions();

    vi.setSystemTime(createdAt);
    const component = await mountSuspended(MessageModelMessageTypeIndex, {
      props: { creator, message: createMessage(true) },
    });

    expect(component.text()).toMatchInlineSnapshot(`"Nname0:00 Forwarded message(edited)"`);
  });

  test("renders the inline editor slot", async () => {
    expect.hasAssertions();

    vi.setSystemTime(createdAt);
    const component = await mountSuspended(MessageModelMessageTypeIndex, {
      props: { creator, message: createMessage(false) },
      slots: { default: editor },
    });

    expect(component.text()).toMatchInlineSnapshot(`"Nname0:00a"`);
  });

  test("renders the inline editor slot of a forward", async () => {
    expect.hasAssertions();

    vi.setSystemTime(createdAt);
    const component = await mountSuspended(MessageModelMessageTypeIndex, {
      props: { creator, message: createMessage(true) },
      slots: { default: editor },
    });

    expect(component.text()).toMatchInlineSnapshot(`"Nname0:00 Forwarded a"`);
  });
});
