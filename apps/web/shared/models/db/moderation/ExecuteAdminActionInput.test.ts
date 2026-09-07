import { executeAdminActionInputSchema } from "#shared/models/db/moderation/ExecuteAdminActionInput";
import { AdminActionType, MODERATION_NOTE_MAX_LENGTH } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

describe("executeAdminActionInputSchema", () => {
  const roomId = crypto.randomUUID();
  const targetUserId = crypto.randomUUID();
  const type = AdminActionType.Warn;

  test("normalizes a reason and collapses a blank one away", () => {
    expect.hasAssertions();

    expect(executeAdminActionInputSchema.parse({ reason: " spam ", roomId, targetUserId, type })).toStrictEqual({
      reason: "spam",
      roomId,
      targetUserId,
      type,
    });
    expect(executeAdminActionInputSchema.parse({ reason: "  ", roomId, targetUserId, type })).toStrictEqual({
      reason: undefined,
      roomId,
      targetUserId,
      type,
    });
  });

  // The reason is free text any member holding the permission can send, so it is bounded like every other
  // Moderator-authored string. The bound is checked after normalization, so surrounding whitespace cannot
  // Push an otherwise-legal reason over it
  test("rejects a reason longer than a moderation note", () => {
    expect.hasAssertions();

    const reason = "a".repeat(MODERATION_NOTE_MAX_LENGTH);

    expect(executeAdminActionInputSchema.safeParse({ reason: ` ${reason} `, roomId, targetUserId, type }).success).toBe(
      true,
    );
    expect(executeAdminActionInputSchema.safeParse({ reason: `${reason}a`, roomId, targetUserId, type }).success).toBe(
      false,
    );
  });
});
