// @vitest-environment nuxt
import { DRAFT_DEBOUNCE_MS } from "#src/services/message/draft/constants";
import { draftsSerializer } from "#src/services/message/draft/draftsSerializer";
import { LocalStorageKey } from "#src/services/shared/LocalStorageKey";
import { useInputStore } from "#src/store/message/input/index";
import { setRouteId } from "#src/util/router/setRouteId.test";
import { marked } from "marked";
import { v7 } from "uuid";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

// Both helpers go through the serializer the store itself uses, so the test speaks the persisted format rather
// Than a second spelling of it
const readStoredDrafts = () => draftsSerializer.read(localStorage.getItem(LocalStorageKey.Drafts) ?? "{}");
const readStoredDraft = (composerKey: string) => readStoredDrafts().get(composerKey);
const setStoredDraft = (composerKey: string, content: string) => {
  const storedDrafts = readStoredDrafts();
  storedDrafts.set(composerKey, { content, updatedAt: new Date() });
  localStorage.setItem(LocalStorageKey.Drafts, draftsSerializer.write(storedDrafts));
};

describe(useInputStore, () => {
  const roomId1 = v7();
  const roomId2 = v7();
  const draftContent = marked.parse("draftContent", { async: false });
  const scriptTag = "<script></script>";

  beforeEach(() => {
    // Frozen rather than merely faked, so a draft's `updatedAt` is an exact value instead of "some Date"
    vi.useFakeTimers({ now: 0 });
    setRouteId(roomId1);
  });

  afterEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  test("populates drafts from localStorage on init", () => {
    expect.hasAssertions();

    setStoredDraft(roomId1, draftContent);
    setStoredDraft(roomId2, draftContent);
    const inputStore = useInputStore();
    const { drafts } = storeToRefs(inputStore);

    expect(drafts.value.get(roomId1)?.content).toBe(draftContent);
    expect(drafts.value.get(roomId2)?.content).toBe(draftContent);
  });

  test("restores a draft under the stamp the previous session stored", () => {
    expect.hasAssertions();

    setStoredDraft(roomId1, draftContent);
    // The clock moves between the write and the boot that restores it, so a re-stamped draft is visible: the
    // Drafts list is ordered by this, and re-stamping on boot would reorder every draft
    vi.advanceTimersByTime(DRAFT_DEBOUNCE_MS);
    useInputStore();

    expect(readStoredDraft(roomId1)?.updatedAt).toStrictEqual(new Date(0));
  });

  test.each([marked.parse("", { async: false }), scriptTag])(
    "removes stored draft content that sanitizes to empty: %s",
    (content) => {
      expect.hasAssertions();

      setStoredDraft(roomId1, content);
      const inputStore = useInputStore();
      const { drafts, input } = storeToRefs(inputStore);

      // And drops the key rather than leaving it to be re-scanned on every boot
      expect(readStoredDraft(roomId1)).toBeUndefined();
      expect(input.value).toBe("");
      expect(drafts.value.has(roomId1)).toBe(false);
    },
  );

  test("ignores unparseable draft content", () => {
    expect.hasAssertions();

    localStorage.setItem(LocalStorageKey.Drafts, draftContent);
    const inputStore = useInputStore();
    const { drafts, input } = storeToRefs(inputStore);

    expect(readStoredDraft(roomId1)).toBeUndefined();
    expect(input.value).toBe("");
    expect(drafts.value.has(roomId1)).toBe(false);
  });

  test("clearComposer removes the room's draft from drafts, localStorage and input", () => {
    expect.hasAssertions();

    setStoredDraft(roomId1, draftContent);
    const inputStore = useInputStore();
    const { drafts, input } = storeToRefs(inputStore);
    const { clearComposer } = inputStore;
    clearComposer({ roomId: roomId1, threadRootId: 0 });

    expect(drafts.value.has(roomId1)).toBe(false);
    expect(readStoredDraft(roomId1)).toBeUndefined();
    expect(input.value).toBe("");
  });

  test("saves non-empty input to localStorage after debounce delay", async () => {
    expect.hasAssertions();

    const inputStore = useInputStore();
    const { drafts, input } = storeToRefs(inputStore);
    input.value = draftContent;
    await nextTick();
    vi.advanceTimersByTime(DRAFT_DEBOUNCE_MS);
    await nextTick();

    expect(readStoredDraft(roomId1)?.content).toBe(draftContent);
    // The debounce is what elapsed the frozen clock, so the stamp is that instant exactly
    expect(readStoredDraft(roomId1)?.updatedAt).toStrictEqual(new Date(DRAFT_DEBOUNCE_MS));
    expect(input.value).toBe(draftContent);
    expect(drafts.value.has(roomId1)).toBe(true);
  });

  test("setDraft saves draft content and updated at", () => {
    expect.hasAssertions();

    const inputStore = useInputStore();
    const { drafts, input } = storeToRefs(inputStore);
    const { setDraft } = inputStore;
    setDraft(roomId1, draftContent);

    expect(readStoredDraft(roomId1)?.content).toBe(draftContent);
    expect(readStoredDraft(roomId1)?.updatedAt).toStrictEqual(new Date(0));
    expect(input.value).toBe(draftContent);
    expect(drafts.value.has(roomId1)).toBe(true);
  });

  test("setDraft updates the stored draft for a room that already has one", () => {
    expect.hasAssertions();

    const updatedDraftContent = marked.parse("updatedDraftContent", { async: false });
    setStoredDraft(roomId1, draftContent);
    const inputStore = useInputStore();
    const { drafts } = storeToRefs(inputStore);
    const { setDraft } = inputStore;
    setDraft(roomId1, updatedDraftContent);

    expect(drafts.value.get(roomId1)?.content).toBe(updatedDraftContent);
    expect(readStoredDraft(roomId1)?.content).toBe(updatedDraftContent);
  });

  test("setDraft removes draft content that sanitizes to empty", () => {
    expect.hasAssertions();

    const inputStore = useInputStore();
    const { drafts, input } = storeToRefs(inputStore);
    const { setDraft } = inputStore;
    setDraft(roomId1, scriptTag);

    expect(readStoredDraft(roomId1)).toBeUndefined();
    expect(input.value).toBe("");
    expect(drafts.value.has(roomId1)).toBe(false);
  });

  test.each(["", scriptTag])("removes localStorage draft when input is empty after sanitizing: %s", async (content) => {
    expect.hasAssertions();

    setStoredDraft(roomId1, draftContent);
    const inputStore = useInputStore();
    const { drafts, input } = storeToRefs(inputStore);
    input.value = content;
    await nextTick();
    vi.advanceTimersByTime(DRAFT_DEBOUNCE_MS);
    await nextTick();

    expect(readStoredDraft(roomId1)).toBeUndefined();
    expect(drafts.value.has(roomId1)).toBe(false);
  });

  // The editor holds what the user typed and the store persists the sanitized form of it. The autosave writing
  // That sanitized text back into `input` would rewrite the composer under a user who is still typing in it —
  // Which is the one thing the three draft writers disagree on, and so the one thing worth pinning
  test("keeps the raw editor text in input while persisting the sanitized draft", async () => {
    expect.hasAssertions();

    const unsafeContent = `${draftContent}<script></script>`;
    const inputStore = useInputStore();
    const { drafts, input } = storeToRefs(inputStore);
    input.value = unsafeContent;
    await nextTick();
    vi.advanceTimersByTime(DRAFT_DEBOUNCE_MS);
    await nextTick();

    expect(input.value).toBe(unsafeContent);
    expect(drafts.value.get(roomId1)?.content).toBe(draftContent);
    expect(readStoredDraft(roomId1)?.content).toBe(draftContent);
  });

  test("persists the outgoing room's draft when the room changes within the debounce window", async () => {
    expect.hasAssertions();

    const inputStore = useInputStore();
    const { input } = storeToRefs(inputStore);
    input.value = draftContent;
    await nextTick();
    vi.advanceTimersByTime(DRAFT_DEBOUNCE_MS - 1);
    setRouteId(roomId2);
    await nextTick();
    vi.advanceTimersByTime(DRAFT_DEBOUNCE_MS);
    await nextTick();

    expect(readStoredDraft(roomId1)?.content).toBe(draftContent);
  });

  test("does not save before debounce delay elapses", async () => {
    expect.hasAssertions();

    const inputStore = useInputStore();
    const { input } = storeToRefs(inputStore);
    input.value = draftContent;
    await nextTick();
    vi.advanceTimersByTime(DRAFT_DEBOUNCE_MS - 1);
    await nextTick();

    expect(readStoredDraft(roomId1)).toBeUndefined();
  });
});
