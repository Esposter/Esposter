import { createSystemRoomMessage } from "#server/services/message/createSystemRoomMessage";
import { AzureTable } from "@esposter/db-schema";
import { noop, takeOne } from "@esposter/shared";
import { MockTableDatabase } from "azure-mock";
import { afterEach, assert, describe, expect, test } from "vitest";

describe(createSystemRoomMessage, () => {
  afterEach(() => {
    MockTableDatabase.clear();
  });

  // The entity's own `""` default is what a line written without a reply target must keep, never an `undefined`
  // Handed through on top of it
  test("stores the empty replyRowKey when none is given", async () => {
    expect.hasAssertions();

    await expect(
      createSystemRoomMessage(crypto.randomUUID(), crypto.randomUUID(), "", crypto.randomUUID()).match(
        noop,
        (error) => error,
      ),
    ).resolves.toBeUndefined();
    const messagesTable = MockTableDatabase.get(AzureTable.Messages);
    assert.exists(messagesTable);

    expect(takeOne([...messagesTable.values()]).replyRowKey).toBe("");
  });
});
