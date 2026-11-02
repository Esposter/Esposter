// @vitest-environment nuxt
import type { RoomFilterInMessage } from "@esposter/db-schema";

import MessageModelRoomSettingsTypeWordFilterForm from "@/components/Message/Model/Room/Settings/Type/WordFilter/Form.vue";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { WordFilterAction } from "@esposter/db-schema";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test, vi } from "vitest";

describe("messageModelRoomSettingsTypeWordFilterForm", () => {
  const { trpcMsw } = setupMswTrpc();
  const roomId = crypto.randomUUID();
  const createFilter = (words: string[]): RoomFilterInMessage => ({
    action: WordFilterAction.Reject,
    roomId,
    timeoutDurationMs: null,
    words,
  });

  // The form read the list as [a]; another moderator has since added c. The reader's own word is written over the list
  // The room holds now, so c survives the save rather than being overwritten by a list that never had it
  test("keeps a word another moderator added after the form read the list", async () => {
    expect.hasAssertions();

    const upsertedWords: string[][] = [];
    trpcMsw.room.filter.readRoomFilter.query(() => createFilter(["a", "c"]));
    trpcMsw.room.filter.upsertRoomFilter.mutation(({ input }) => {
      upsertedWords.push(input.words);
      return createFilter(input.words);
    });
    const component = await mountSuspended(MessageModelRoomSettingsTypeWordFilterForm, {
      props: { filter: createFilter(["a"]), roomId },
    });
    const wordInput = component.get('input[placeholder="Add a word..."]');
    await wordInput.setValue("b");
    await wordInput.trigger("keydown.enter");
    component
      .findAll("button")
      .find((button) => button.text() === "Save changes")
      ?.trigger("click");

    await vi.waitFor(() => {
      expect(upsertedWords).toStrictEqual([["a", "c", "b"]]);
    });
  });
});
