// @vitest-environment nuxt

import { dayjs } from "#shared/services/dayjs";
import { getDraft } from "@/services/message/draft/getDraft";
import { setCurrentRoomId } from "@/services/message/room/setCurrentRoomId.test";
import { LocalStorageKey } from "@/services/shared/LocalStorageKey";
import { useInputStore } from "@/store/message/input";
import { marked } from "marked";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const setStoredDraft = (roomId: string, content: string) => {
  localStorage.setItem(LocalStorageKey.Draft(roomId), JSON.stringify({ content, updatedAt: new Date() }));
};

describe(useInputStore, () => {
  const roomId1 = crypto.randomUUID();
  const roomId2 = crypto.randomUUID();
  const draftContent = marked.parse("draftContent", { async: false });
  const debounceMs = dayjs.duration(0.3, "seconds").asMilliseconds();

  beforeEach(() => {
    // Frozen rather than merely faked, so a draft's `updatedAt` is an exact value instead of "some Date"
    vi.useFakeTimers({ now: 0 });
    setActivePinia(createPinia());
    setCurrentRoomId(roomId1);
  });

  afterEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  test("populates drafts from localStorage on init", () => {
    expect.hasAssertions();

    setStoredDraft(roomId1, draftContent);
    const inputStore = useInputStore();
    const { drafts } = storeToRefs(inputStore);

    expect(drafts.value.has(roomId1)).toBe(true);
  });

  test("ignores empty draft content in localStorage", () => {
    expect.hasAssertions();

    setStoredDraft(roomId1, marked.parse("", { async: false }));
    const inputStore = useInputStore();
    const { drafts } = storeToRefs(inputStore);

    expect(drafts.value.has(roomId1)).toBe(false);
    // And drops the key rather than leaving it to be re-scanned on every boot
    expect(getDraft(roomId1)).toBeUndefined();
  });

  test("ignores unparseable draft content", () => {
    expect.hasAssertions();

    localStorage.setItem(LocalStorageKey.Draft(roomId1), draftContent);
    const inputStore = useInputStore();
    const { drafts, input } = storeToRefs(inputStore);

    expect(getDraft(roomId1)).toBeUndefined();
    expect(input.value).toBe("");
    expect(drafts.value.has(roomId1)).toBe(false);
  });

  test("removes stored draft content that sanitizes to empty", () => {
    expect.hasAssertions();

    setStoredDraft(roomId1, "<script>alert(1)</script>");
    const inputStore = useInputStore();
    const { drafts, input } = storeToRefs(inputStore);

    expect(getDraft(roomId1)).toBeUndefined();
    expect(input.value).toBe("");
    expect(drafts.value.has(roomId1)).toBe(false);
  });

  test("populates drafts for multiple rooms", () => {
    expect.hasAssertions();

    setStoredDraft(roomId1, draftContent);
    setStoredDraft(roomId2, draftContent);
    const inputStore = useInputStore();
    const { drafts } = storeToRefs(inputStore);

    expect(drafts.value.has(roomId1)).toBe(true);
    expect(drafts.value.has(roomId2)).toBe(true);
  });

  test("clearDraft removes room from drafts", () => {
    expect.hasAssertions();

    setStoredDraft(roomId1, draftContent);
    const inputStore = useInputStore();
    const { drafts } = storeToRefs(inputStore);
    const { clearDraft } = inputStore;
    clearDraft(roomId1);

    expect(drafts.value.has(roomId1)).toBe(false);
  });

  test("clearDraft removes draft from localStorage", () => {
    expect.hasAssertions();

    setStoredDraft(roomId1, draftContent);
    const inputStore = useInputStore();
    const { clearDraft } = inputStore;
    clearDraft(roomId1);

    expect(getDraft(roomId1)).toBeUndefined();
  });

  test("clearDraft clears input data for the room", () => {
    expect.hasAssertions();

    setStoredDraft(roomId1, draftContent);
    const inputStore = useInputStore();
    const { input } = storeToRefs(inputStore);
    const { clearDraft } = inputStore;
    clearDraft(roomId1);

    expect(input.value).toBe("");
  });

  test("saves non-empty input to localStorage after debounce delay", async () => {
    expect.hasAssertions();

    const inputStore = useInputStore();
    const { drafts, input } = storeToRefs(inputStore);
    input.value = draftContent;
    await nextTick();
    vi.advanceTimersByTime(debounceMs);
    await nextTick();

    expect(getDraft(roomId1)?.content).toBe(draftContent);
    // The debounce is what elapsed the frozen clock, so the stamp is that instant exactly
    expect(getDraft(roomId1)?.updatedAt).toStrictEqual(new Date(debounceMs));
    expect(input.value).toBe(draftContent);
    expect(drafts.value.has(roomId1)).toBe(true);
  });

  test("storeDraft saves draft content and updated at", () => {
    expect.hasAssertions();

    const inputStore = useInputStore();
    const { drafts, input } = storeToRefs(inputStore);
    const { storeDraft } = inputStore;
    storeDraft(roomId1, draftContent);

    expect(getDraft(roomId1)?.content).toBe(draftContent);
    expect(getDraft(roomId1)?.updatedAt).toStrictEqual(new Date(0));
    expect(input.value).toBe(draftContent);
    expect(drafts.value.has(roomId1)).toBe(true);
  });

  test("storeDraft updates the stored draft for a room that already has one", () => {
    expect.hasAssertions();

    const updatedDraftContent = marked.parse("updatedDraftContent", { async: false });
    setStoredDraft(roomId1, draftContent);
    const inputStore = useInputStore();
    const { drafts } = storeToRefs(inputStore);
    const { storeDraft } = inputStore;
    storeDraft(roomId1, updatedDraftContent);

    expect(drafts.value.get(roomId1)?.content).toBe(updatedDraftContent);
    expect(getDraft(roomId1)?.content).toBe(updatedDraftContent);
  });

  test("storeDraft removes draft content that sanitizes to empty", () => {
    expect.hasAssertions();

    const inputStore = useInputStore();
    const { drafts, input } = storeToRefs(inputStore);
    const { storeDraft } = inputStore;
    storeDraft(roomId1, "<script>alert(1)</script>");

    expect(getDraft(roomId1)).toBeUndefined();
    expect(input.value).toBe("");
    expect(drafts.value.has(roomId1)).toBe(false);
  });

  test("removes localStorage draft when input becomes empty", async () => {
    expect.hasAssertions();

    setStoredDraft(roomId1, draftContent);
    const inputStore = useInputStore();
    const { drafts, input } = storeToRefs(inputStore);
    input.value = "";
    await nextTick();
    vi.advanceTimersByTime(debounceMs);
    await nextTick();

    expect(getDraft(roomId1)).toBeUndefined();
    expect(drafts.value.has(roomId1)).toBe(false);
  });

  test("removes localStorage draft when input sanitizes to empty", async () => {
    expect.hasAssertions();

    const inputStore = useInputStore();
    const { drafts, input } = storeToRefs(inputStore);
    input.value = "<script>alert(1)</script>";
    await nextTick();
    vi.advanceTimersByTime(debounceMs);
    await nextTick();

    expect(getDraft(roomId1)).toBeUndefined();
    expect(drafts.value.has(roomId1)).toBe(false);
  });

  // The editor holds what the user typed and the store persists the sanitized form of it. The autosave writing
  // That sanitized text back into `input` would rewrite the composer under a user who is still typing in it —
  // Which is the one thing the three draft writers disagree on, and so the one thing worth pinning
  test("keeps the raw editor text in input while persisting the sanitized draft", async () => {
    expect.hasAssertions();

    const unsafeContent = `${draftContent}<script>alert(1)</script>`;
    const inputStore = useInputStore();
    const { drafts, input } = storeToRefs(inputStore);
    input.value = unsafeContent;
    await nextTick();
    vi.advanceTimersByTime(debounceMs);
    await nextTick();

    expect(input.value).toBe(unsafeContent);
    expect(drafts.value.get(roomId1)?.content).toBe(draftContent);
    expect(getDraft(roomId1)?.content).toBe(draftContent);
  });

  // The room is one of the watched sources, so switching it inside the debounce window cancels the pending save
  // And reschedules it against the room moved to. The outgoing keystrokes stay in the map, so nothing looks
  // Wrong until a reload finds they were never persisted
  test("persists the outgoing room's draft when the room changes within the debounce window", async () => {
    expect.hasAssertions();

    const inputStore = useInputStore();
    const { input } = storeToRefs(inputStore);
    input.value = draftContent;
    await nextTick();
    vi.advanceTimersByTime(debounceMs - 1);
    setCurrentRoomId(roomId2);
    await nextTick();
    vi.advanceTimersByTime(debounceMs);
    await nextTick();

    expect(getDraft(roomId1)?.content).toBe(draftContent);
  });

  test("does not save before debounce delay elapses", async () => {
    expect.hasAssertions();

    const inputStore = useInputStore();
    const { input } = storeToRefs(inputStore);
    input.value = draftContent;
    await nextTick();
    vi.advanceTimersByTime(debounceMs - 1);
    await nextTick();

    expect(getDraft(roomId1)).toBeUndefined();
  });
});
