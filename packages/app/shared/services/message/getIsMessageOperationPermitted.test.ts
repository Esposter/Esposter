import { MessageOperation } from "#shared/models/message/MessageOperation";
import { getIsMessageOperationPermitted } from "#shared/services/message/getIsMessageOperationPermitted";
import { getMessageOperationPermission } from "#shared/services/message/getMessageOperationPermission";
import { MessageType, MessageTypes } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

describe(getIsMessageOperationPermitted, () => {
  // Re-derived here so a new operation widens the matrix instead of silently going untested
  const messageOperations = Object.values(MessageOperation);
  const author = { hasManageMessages: false, isAuthor: true };
  const member = { hasManageMessages: false, isAuthor: false };
  const moderator = { hasManageMessages: true, isAuthor: false };
  const getPermittedOperations = (type: MessageType, caller: { hasManageMessages: boolean; isAuthor: boolean }) =>
    messageOperations.filter((operation) =>
      getIsMessageOperationPermitted(getMessageOperationPermission(type, operation), caller),
    );

  test("resolves which operations each caller may perform on each message type", () => {
    expect.hasAssertions();

    const matrix = Object.fromEntries(
      MessageTypes.map((type) => [
        type,
        {
          author: getPermittedOperations(type, author),
          member: getPermittedOperations(type, member),
          moderator: getPermittedOperations(type, moderator),
        },
      ]),
    );

    expect(matrix).toMatchInlineSnapshot(`
      {
        "Call": {
          "author": [],
          "member": [],
          "moderator": [],
        },
        "EditRoom": {
          "author": [],
          "member": [],
          "moderator": [],
        },
        "Message": {
          "author": [
            "Delete",
            "Pin",
            "Update",
          ],
          "member": [],
          "moderator": [
            "Delete",
            "Pin",
            "Update",
          ],
        },
        "PinMessage": {
          "author": [],
          "member": [],
          "moderator": [],
        },
        "Poll": {
          "author": [
            "Delete",
            "Pin",
            "Vote",
          ],
          "member": [
            "Vote",
          ],
          "moderator": [
            "Delete",
            "Pin",
            "Vote",
          ],
        },
        "System": {
          "author": [],
          "member": [],
          "moderator": [],
        },
        "Webhook": {
          "author": [],
          "member": [],
          "moderator": [
            "Delete",
            "Pin",
            "Update",
          ],
        },
      }
    `);
  });

  test("refuses an operation the message type does not support even to a caller with manage messages", () => {
    expect.hasAssertions();

    const permission = getMessageOperationPermission(MessageType.Poll, MessageOperation.Update);

    expect(permission).toBeUndefined();
    expect(getIsMessageOperationPermitted(permission, moderator)).toBe(false);
  });
});
