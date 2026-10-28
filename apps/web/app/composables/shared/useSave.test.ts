// @vitest-environment nuxt
import { useSession } from "@/services/auth/authClient.test";
import { createErrorAlert } from "@/services/trpc/createErrorAlert";
import { TRPCClientError } from "@trpc/client";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("@/services/auth/authClient"), () => import("@/services/auth/authClient.test"));
vi.mock(import("@/services/trpc/createErrorAlert"));

interface Counter {
  count: number;
  updatedAt: Date;
}

const createCounter = () => ({ count: 0, updatedAt: new Date() });

// A conflict is the server refusing a save sent under an etag the save no longer carries
const createConflictError = () =>
  TRPCClientError.from<never>({ error: { code: -32_009, data: { code: "CONFLICT" }, message: "conflict" } });

describe(useSave, () => {
  beforeEach(() => {
    useSession.mockReturnValue({ value: { data: { user: {} } } });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // Each save must carry the etag the previous one answered, or the server cannot tell it is the same writer
  test("sends each save under the etag the previous save answered", async () => {
    expect.hasAssertions();

    const state = ref(createCounter());
    const save = vi
      .fn<(value: Counter, etag: string | undefined) => Promise<{ etag: string }>>()
      .mockResolvedValueOnce({ etag: "first" })
      .mockResolvedValueOnce({ etag: "second" });
    const { save: saveState } = useSave(state, { auth: { save } });
    state.value.count = 1;
    await saveState();
    state.value.count = 2;
    await saveState();

    expect(save.mock.calls.map(([, etag]) => etag)).toStrictEqual([undefined, "first"]);
  });

  // A state loaded from the server arrives with the etag it was read under, so the first save is not sent blind
  test("sends the first save under the etag the loaded state was read under", async () => {
    expect.hasAssertions();

    const state = ref(createCounter());
    const save = vi.fn<(value: Counter, etag: string | undefined) => Promise<{ etag: string }>>(() =>
      Promise.resolve({ etag: "next" }),
    );
    const { save: saveState, setState } = useSave(state, { auth: { save } });
    const loaded = { ...createCounter(), count: 5 };
    setState(loaded, "read");
    state.value.count = 6;
    await saveState();

    expect(save).toHaveBeenCalledExactlyOnceWith({ ...loaded, count: 6 }, "read");
  });

  // Another session wrote the save first, so this page's copy is stale and reloading takes the server's
  test("reloads the page when the save is refused as a conflict", async () => {
    expect.hasAssertions();

    const reload = vi.fn<() => void>();
    vi.stubGlobal("location", { reload });
    const state = ref(createCounter());
    const save = vi.fn<(value: Counter, etag: string | undefined) => Promise<{ etag: string }>>(() =>
      Promise.reject(createConflictError()),
    );
    const { save: saveState } = useSave(state, { auth: { save } });
    state.value.count = 1;
    await saveState();

    expect(reload).toHaveBeenCalledTimes(1);
  });

  // A save that fails for any other reason is not a conflict, so the user is told rather than left with a silent loss
  test("alerts the user and does not reload when the save fails for any other reason", async () => {
    expect.hasAssertions();

    const reload = vi.fn<() => void>();
    vi.stubGlobal("location", { reload });
    const state = ref(createCounter());
    const save = vi.fn<(value: Counter, etag: string | undefined) => Promise<{ etag: string }>>(() =>
      Promise.reject(new Error("network")),
    );
    const { save: saveState } = useSave(state, { auth: { save } });
    state.value.count = 1;
    await saveState();

    expect(createErrorAlert).toHaveBeenCalledTimes(1);
    expect(reload).not.toHaveBeenCalled();
  });
});
