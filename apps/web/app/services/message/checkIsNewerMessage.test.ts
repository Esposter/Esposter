import { checkIsNewerMessage } from "@/services/message/checkIsNewerMessage";
import { createMessage } from "@/services/message/message/createMessage.test";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(checkIsNewerMessage, () => {
  const roomId = v7();
  const createdAt = new Date(0);
  const laterCreatedAt = new Date(1);
  const lowerId = 1;
  const higherId = 2;
  const createMessageWith = (messageCreatedAt: Date, id: number) => ({
    ...createMessage(roomId),
    createdAt: messageCreatedAt,
    id,
  });

  test("a message created later is newer than one created earlier", () => {
    expect.hasAssertions();

    expect(
      checkIsNewerMessage(createMessageWith(laterCreatedAt, lowerId), createMessageWith(createdAt, higherId)),
    ).toBe(true);
    expect(
      checkIsNewerMessage(createMessageWith(createdAt, higherId), createMessageWith(laterCreatedAt, lowerId)),
    ).toBe(false);
  });

  test("breaks a tie on the same creation time by id", () => {
    expect.hasAssertions();

    expect(checkIsNewerMessage(createMessageWith(createdAt, higherId), createMessageWith(createdAt, lowerId))).toBe(
      true,
    );
    expect(checkIsNewerMessage(createMessageWith(createdAt, lowerId), createMessageWith(createdAt, higherId))).toBe(
      false,
    );
  });
});
