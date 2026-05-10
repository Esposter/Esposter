// @vitest-environment nuxt
import type { Router } from "vue-router";

import { useInputStore } from "@/store/message/input";
import { DRAFT_KEY_PREFIX } from "@/store/message/input/constants";
import { marked } from "marked";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

describe(useInputStore, () => {
  let router: Router;
  const roomId1 = crypto.randomUUID();
  const roomId2 = crypto.randomUUID();
  const draftContent = marked.parse("draftContent", { async: false });

  beforeAll(() => {
    router = useRouter();
  });

  beforeEach(() => {
    vi.useFakeTimers();
    setActivePinia(createPinia());
    router.currentRoute.value.params.id = roomId1;
  });

  afterEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  test("populates draftRoomIds from localStorage on init", () => {
    expect.hasAssertions();

    localStorage.setItem(`${DRAFT_KEY_PREFIX}${roomId1}`, draftContent);
    const inputStore = useInputStore();
    const { draftRoomIds } = storeToRefs(inputStore);

    expect(draftRoomIds.value.has(roomId1)).toBe(true);
  });

  test("ignores empty draft content in localStorage", () => {
    expect.hasAssertions();

    localStorage.setItem(`${DRAFT_KEY_PREFIX}${roomId1}`, marked.parse("", { async: false }));
    const inputStore = useInputStore();
    const { draftRoomIds } = storeToRefs(inputStore);

    expect(draftRoomIds.value.has(roomId1)).toBe(false);
  });

  test("populates draftRoomIds for multiple rooms", () => {
    expect.hasAssertions();

    localStorage.setItem(`${DRAFT_KEY_PREFIX}${roomId1}`, draftContent);
    localStorage.setItem(`${DRAFT_KEY_PREFIX}${roomId2}`, draftContent);
    const inputStore = useInputStore();
    const { draftRoomIds } = storeToRefs(inputStore);

    expect(draftRoomIds.value.has(roomId1)).toBe(true);
    expect(draftRoomIds.value.has(roomId2)).toBe(true);
  });

  test("clearDraft removes room from draftRoomIds", () => {
    expect.hasAssertions();

    localStorage.setItem(`${DRAFT_KEY_PREFIX}${roomId1}`, draftContent);
    const inputStore = useInputStore();
    const { draftRoomIds } = storeToRefs(inputStore);
    const { clearDraft } = inputStore;
    clearDraft(roomId1);

    expect(draftRoomIds.value.has(roomId1)).toBe(false);
  });

  test("clearDraft removes draft key from localStorage", () => {
    expect.hasAssertions();

    localStorage.setItem(`${DRAFT_KEY_PREFIX}${roomId1}`, draftContent);
    const inputStore = useInputStore();
    const { clearDraft } = inputStore;
    clearDraft(roomId1);

    expect(localStorage.getItem(`${DRAFT_KEY_PREFIX}${roomId1}`)).toBeNull();
  });

  test("clearDraft clears input data for the room", () => {
    expect.hasAssertions();

    localStorage.setItem(`${DRAFT_KEY_PREFIX}${roomId1}`, draftContent);
    const inputStore = useInputStore();
    const { input } = storeToRefs(inputStore);
    const { clearDraft } = inputStore;
    clearDraft(roomId1);

    expect(input.value).toBe("");
  });

  test("saves non-empty input to localStorage after debounce delay", async () => {
    expect.hasAssertions();

    const inputStore = useInputStore();
    const { draftRoomIds, input } = storeToRefs(inputStore);
    input.value = draftContent;
    await nextTick();
    vi.advanceTimersByTime(300);
    await nextTick();

    expect(localStorage.getItem(`${DRAFT_KEY_PREFIX}${roomId1}`)).toBe(draftContent);
    expect(input.value).toBe(draftContent);
    expect(draftRoomIds.value.has(roomId1)).toBe(true);
  });

  test("removes localStorage key when input becomes empty", async () => {
    expect.hasAssertions();

    localStorage.setItem(`${DRAFT_KEY_PREFIX}${roomId1}`, draftContent);
    const inputStore = useInputStore();
    const { draftRoomIds, input } = storeToRefs(inputStore);
    input.value = "";
    await nextTick();
    vi.advanceTimersByTime(300);
    await nextTick();

    expect(localStorage.getItem(`${DRAFT_KEY_PREFIX}${roomId1}`)).toBeNull();
    expect(draftRoomIds.value.has(roomId1)).toBe(false);
  });

  test("does not save before debounce delay elapses", async () => {
    expect.hasAssertions();

    const inputStore = useInputStore();
    const { input } = storeToRefs(inputStore);
    input.value = draftContent;
    await nextTick();
    vi.advanceTimersByTime(299);
    await nextTick();

    expect(localStorage.getItem(`${DRAFT_KEY_PREFIX}${roomId1}`)).toBeNull();
  });
});
