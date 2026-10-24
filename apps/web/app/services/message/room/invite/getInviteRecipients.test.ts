import { createRoom } from "@/services/message/room/createRoom.test";
import { getInviteRecipients } from "@/services/message/room/invite/getInviteRecipients";
import { createUser } from "@/services/message/user/createUser.test";
import { RoomType } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

describe(getInviteRecipients, () => {
  const alice = createUser({ name: "Alice" });
  const bob = createUser({ name: "Bob" });
  const carol = createUser({ name: "Carol" });
  const dave = createUser({ name: "Dave" });
  const bobDirectMessage = createRoom("", RoomType.DirectMessage);
  const groupDirectMessage = createRoom("Trip", RoomType.DirectMessage);
  const carolDirectMessage = createRoom("", RoomType.DirectMessage);
  const participantsMap = new Map([
    [bobDirectMessage.id, [bob]],
    [carolDirectMessage.id, [carol]],
    [groupDirectMessage.id, [bob, dave]],
  ]);
  const getDirectMessageParticipants = (directMessageId: string) => participantsMap.get(directMessageId) ?? [];
  const checkIsGroupDirectMessage = (directMessageId: string) =>
    getDirectMessageParticipants(directMessageId).length > 1;

  test("leads with the friend or group talked to in the newest direct message, and ends with a friend in none in the friends list's order", () => {
    expect.hasAssertions();

    const recipients = getInviteRecipients(
      [alice, bob, carol],
      [bobDirectMessage, groupDirectMessage, carolDirectMessage],
      checkIsGroupDirectMessage,
      getDirectMessageParticipants,
    );

    expect(recipients.map(({ isGroup, name }) => ({ isGroup, name }))).toStrictEqual([
      { isGroup: false, name: "Bob" },
      { isGroup: true, name: "Trip" },
      { isGroup: false, name: "Carol" },
      { isGroup: false, name: "Alice" },
    ]);
  });
});
