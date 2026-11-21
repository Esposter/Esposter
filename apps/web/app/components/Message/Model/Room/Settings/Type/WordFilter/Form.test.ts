// @vitest-environment nuxt
import type { RoomFilterInMessage } from "@esposter/db-schema";
import type { VueWrapper } from "@vue/test-utils";

import MessageModelRoomSettingsTypeWordFilterForm from "#src/components/Message/Model/Room/Settings/Type/WordFilter/Form.vue";
import MessageModelRoomSettingsTypeWordFilterWordsInput from "#src/components/Message/Model/Room/Settings/Type/WordFilter/WordsInput.vue";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { WordFilterAction } from "@esposter/db-schema";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

const clickSave = async (component: VueWrapper) => {
  await component
    .findAll("button")
    .find((button) => button.text() === "Save changes")
    ?.trigger("click");
};

describe("messageModelRoomSettingsTypeWordFilterForm", () => {
  const { trpcMsw } = setupMswTrpc();
  const roomId = v7();
  const createFilter = (words: string[]): RoomFilterInMessage => ({
    action: WordFilterAction.Reject,
    createdAt: new Date(0),
    deletedAt: null,
    roomId,
    timeoutDurationMs: null,
    updatedAt: new Date(0),
    version: 0,
    words,
  });

  // The form read the list as [a]; another moderator has since added c. The reader's own word is written over the list
  // The room holds now, so c survives the save rather than being overwritten by a list that never had it
  test("keeps a word another moderator added after the form read the list", async () => {
    expect.hasAssertions();

    const { promise: upsertedWords, resolve: resolveUpsertedWords } = Promise.withResolvers<string[]>();
    trpcMsw.room.filter.readRoomFilter.query(() => createFilter(["a", "c"]));
    trpcMsw.room.filter.upsertRoomFilter.mutation(({ input }) => {
      resolveUpsertedWords(input.words);
      return createFilter(input.words);
    });
    const component = await mountSuspended(MessageModelRoomSettingsTypeWordFilterForm, {
      props: { filter: createFilter(["a"]), roomId },
    });
    const wordInput = component.get('input[placeholder="Add a word..."]');
    await wordInput.setValue("b");
    await wordInput.trigger("keydown.enter");
    await component
      .findAll("button")
      .find((button) => button.text() === "Save changes")
      ?.trigger("click");

    await expect(upsertedWords).resolves.toStrictEqual(["a", "c", "b"]);
  });

  // A save sent while the one before it is out waits behind it, and then merges its own words against the list the one
  // Before it saved, so the second save is not dropped
  test("a second save waits behind the save in flight and sends the word it adds to the list that save kept", async () => {
    expect.hasAssertions();

    const { promise: isFirstAnswered, resolve: answerFirst } = Promise.withResolvers<RoomFilterInMessage>();
    const upsertedWords: string[][] = [];
    trpcMsw.room.filter.readRoomFilter.query(() => createFilter(["a", "b"]));
    trpcMsw.room.filter.upsertRoomFilter.mutation(({ input }) => {
      upsertedWords.push(input.words);
      return upsertedWords.length === 1 ? isFirstAnswered : createFilter(input.words);
    });
    const component = await mountSuspended(MessageModelRoomSettingsTypeWordFilterForm, {
      props: { filter: createFilter(["a"]), roomId },
    });
    const wordInput = component.get('input[placeholder="Add a word..."]');
    await wordInput.setValue("b");
    await wordInput.trigger("keydown.enter");
    await clickSave(component);
    await wordInput.setValue("c");
    await wordInput.trigger("keydown.enter");
    await clickSave(component);
    answerFirst(createFilter(["a", "b"]));
    await flushPromises();
    await flushPromises();

    expect(upsertedWords).toStrictEqual([
      ["a", "b"],
      ["a", "b", "c"],
    ]);
  });

  // A word the reader adds while a save is out is the reader's next change, so the saved list does not take it back
  test("keeps a word the reader adds while a save is out", async () => {
    expect.hasAssertions();

    const { promise: isAnswered, resolve: answerSave } = Promise.withResolvers<RoomFilterInMessage>();
    trpcMsw.room.filter.readRoomFilter.query(() => createFilter(["a", "b"]));
    trpcMsw.room.filter.upsertRoomFilter.mutation(() => isAnswered);
    const component = await mountSuspended(MessageModelRoomSettingsTypeWordFilterForm, {
      props: { filter: createFilter(["a"]), roomId },
    });
    const wordInput = component.get('input[placeholder="Add a word..."]');
    await wordInput.setValue("b");
    await wordInput.trigger("keydown.enter");
    await clickSave(component);
    await wordInput.setValue("c");
    await wordInput.trigger("keydown.enter");
    answerSave(createFilter(["a", "b"]));
    await flushPromises();

    expect(component.findComponent(MessageModelRoomSettingsTypeWordFilterWordsInput).props("modelValue")).toStrictEqual(
      ["a", "b", "c"],
    );
  });
});
