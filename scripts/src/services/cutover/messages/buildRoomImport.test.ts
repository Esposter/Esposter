import type { LegacyMessage } from "#src/models/cutover/LegacyMessage";
import type { TableParents } from "#src/models/cutover/TableParents";

import { buildRoomImport } from "#src/services/cutover/messages/buildRoomImport";
import { rewriteOldIds } from "#src/services/cutover/ids/rewriteOldIds";
import { AZURE_SELF_DESTRUCT_TIMER, MessageType } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

describe(buildRoomImport, () => {
  const getRowKey = (epochMilliseconds: number): string =>
    (BigInt(AZURE_SELF_DESTRUCT_TIMER) - BigInt(epochMilliseconds) * 1000000n).toString();
  const epochMilliseconds = 1700000000000;
  const ROOT_ROW_KEY = getRowKey(epochMilliseconds);
  const REPLY_ROW_KEY = getRowKey(epochMilliseconds + 1000);
  const ROOM_OLD_ID = "0196a2e4-1f3b-4c7d-8e9f-0a1b2c3d4e5f";
  const USER_OLD_ID = "0196a2e4-aaaa-4bbb-8ccc-dddddddddddd";
  const USER_NEW_ID = "0196a2e5-0000-7000-8000-000000000002";
  const GONE_USER_OLD_ID = "0196a2e4-bbbb-4ccc-8ddd-eeeeeeeeeeee";
  const parents: TableParents = {
    apiKeyIds: new Set(),
    appUserIds: new Set(),
    resourceIds: new Set(),
    roomIds: new Set([ROOM_OLD_ID]),
    userIds: new Set([USER_NEW_ID]),
  };
  const idMap = { rewrite: (text: string) => rewriteOldIds(text, new Map([[USER_OLD_ID, USER_NEW_ID]])) };
  const createMessage = (overrides: Partial<LegacyMessage>): LegacyMessage => ({
    partitionKey: ROOM_OLD_ID,
    rowKey: ROOT_ROW_KEY,
    type: MessageType.Message,
    ...overrides,
  });
  const numberByRowKey = new Map([
    [ROOT_ROW_KEY, 1],
    [REPLY_ROW_KEY, 2],
  ]);
  const getNumber = (rowKey: string) => numberByRowKey.get(rowKey);

  test("names a reply and a reaction by the number of the message they point at", () => {
    expect.hasAssertions();

    const roomImport = buildRoomImport({
      emojis: [
        {
          emojiTag: "thumbs",
          messageRowKey: ROOT_ROW_KEY,
          partitionKey: ROOM_OLD_ID,
          rowKey: ROOT_ROW_KEY,
          userIds: [USER_OLD_ID],
        },
      ],
      getNumber,
      idMap,
      messages: [
        { message: createMessage({ rowKey: ROOT_ROW_KEY, userId: USER_OLD_ID }), timestamp: undefined },
        {
          message: createMessage({ replyRowKey: ROOT_ROW_KEY, rowKey: REPLY_ROW_KEY, userId: USER_OLD_ID }),
          timestamp: undefined,
        },
      ],
      parents,
      scheduledMessages: [],
    });

    expect(roomImport.messages.map(({ id, replyToId }) => ({ id, replyToId }))).toStrictEqual([
      { id: 1, replyToId: null },
      { id: 2, replyToId: 1 },
    ]);
    expect(roomImport.reactions).toStrictEqual([{ emojiTag: "thumbs", messageId: 1, userIds: [USER_NEW_ID] }]);
  });

  test("keeps a message whose sender is gone with no author, so its reply keeps the root", () => {
    expect.hasAssertions();

    const roomImport = buildRoomImport({
      emojis: [],
      getNumber,
      idMap,
      messages: [
        { message: createMessage({ rowKey: ROOT_ROW_KEY, userId: GONE_USER_OLD_ID }), timestamp: undefined },
        {
          message: createMessage({ replyRowKey: ROOT_ROW_KEY, rowKey: REPLY_ROW_KEY, userId: USER_OLD_ID }),
          timestamp: undefined,
        },
      ],
      parents,
      scheduledMessages: [],
    });

    expect(roomImport.messages.map(({ id, replyToId, userId }) => ({ id, replyToId, userId }))).toStrictEqual([
      { id: 1, replyToId: null, userId: null },
      { id: 2, replyToId: 1, userId: USER_NEW_ID },
    ]);
  });

  test("leaves a reply whose root was never numbered as a plain message", () => {
    expect.hasAssertions();

    const roomImport = buildRoomImport({
      emojis: [],
      getNumber: (rowKey) => (rowKey === REPLY_ROW_KEY ? 2 : undefined),
      idMap,
      messages: [
        {
          message: createMessage({ replyRowKey: ROOT_ROW_KEY, rowKey: REPLY_ROW_KEY, userId: USER_OLD_ID }),
          timestamp: undefined,
        },
      ],
      parents,
      scheduledMessages: [],
    });

    expect(roomImport.messages).toMatchObject([{ id: 2, replyToId: null }]);
  });

  test("rewrites every old id in a message's text and mentions through the id map", () => {
    expect.hasAssertions();

    const roomImport = buildRoomImport({
      emojis: [],
      getNumber,
      idMap,
      messages: [
        {
          message: createMessage({ message: `hi ${USER_OLD_ID}`, mentions: [USER_OLD_ID], userId: USER_OLD_ID }),
          timestamp: undefined,
        },
      ],
      parents,
      scheduledMessages: [],
    });

    expect(roomImport.messages[0]).toMatchObject({ message: `hi ${USER_NEW_ID}`, mentions: [USER_NEW_ID] });
  });
});
