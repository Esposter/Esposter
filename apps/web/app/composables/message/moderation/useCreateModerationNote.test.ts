// @vitest-environment nuxt
import type { ModerationNoteInRoom } from "#shared/models/db/room/ModerationNoteInRoom";

import { useCreateModerationNote } from "#src/composables/message/moderation/useCreateModerationNote";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useAlertStore } from "#src/store/alert";
import { TRPCError } from "@trpc/server";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(useCreateModerationNote, () => {
  const { trpcMsw } = setupMswTrpc();
  const roomId = v7();
  const targetUserId = v7();
  const note = "a";
  const createNote = (): ModerationNoteInRoom => ({
    actorDisplayName: "",
    actorUserId: null,
    createdAt: new Date(0),
    deletedAt: null,
    id: v7(),
    note,
    roomId,
    targetUserId,
    updatedAt: new Date(0),
    version: 0,
  });

  // The note is posted once, and a second send while the first is out is not posted again, so the server holds one note
  test("sends a note once while the first is still out", async () => {
    expect.hasAssertions();

    const { promise: isSent, resolve: markSent } = Promise.withResolvers<void>();
    const { promise: answer, resolve: answerSend } = Promise.withResolvers<ModerationNoteInRoom>();
    let sendCount = 0;
    trpcMsw.message.moderation.createModerationNote.mutation(() => {
      sendCount += 1;
      markSent();
      return answer;
    });
    trpcMsw.message.moderation.readModerationNotes.query(() => ({ items: [], nextCursor: "" }));
    trpcMsw.message.moderation.readModerationNotesCount.query(() => 1);
    const { createModerationNote } = useCreateModerationNote(roomId, targetUserId);
    const firstSend = createModerationNote(note);
    await isSent;
    const isSecondKept = await createModerationNote(note);
    answerSend(createNote());
    await firstSend;

    expect(sendCount).toBe(1);
    expect(isSecondKept).toBe(false);
  });

  // The field keeps the note until the server has it, so a refusal resolves to false and leaves the note to be sent again
  test("resolves to false, with an alert, when the server refuses the note", async () => {
    expect.hasAssertions();

    trpcMsw.message.moderation.createModerationNote.mutation(() => {
      throw new TRPCError({ code: "FORBIDDEN", message: "refused" });
    });
    const { createModerationNote, isCreatePending } = useCreateModerationNote(roomId, targetUserId);
    const isKept = await createModerationNote(note);

    expect(isKept).toBe(false);
    expect(isCreatePending.value).toBe(false);
    const alertStore = useAlertStore();
    const { alerts } = storeToRefs(alertStore);
    expect(alerts.value).toHaveLength(1);
  });

  test("resolves to true once the server keeps the note", async () => {
    expect.hasAssertions();

    trpcMsw.message.moderation.createModerationNote.mutation(() => createNote());
    trpcMsw.message.moderation.readModerationNotes.query(() => ({ items: [], nextCursor: "" }));
    trpcMsw.message.moderation.readModerationNotesCount.query(() => 1);
    const { createModerationNote } = useCreateModerationNote(roomId, targetUserId);
    const isKept = await createModerationNote(note);

    expect(isKept).toBe(true);
  });
});
