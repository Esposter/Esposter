// @vitest-environment nuxt
import type { Resource } from "@esposter/db-schema";

import { useRenameResource } from "@/composables/resource/list/useRenameResource";
import { createResourceListItem } from "@/services/resource/list/createResourceListItem.test";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { TRPCError } from "@trpc/server";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test, vi } from "vitest";

describe(useRenameResource, () => {
  const server = setupMswTrpc();
  const name = "a";
  const newName = "b";
  const createResource = () => ref<Resource>(createResourceListItem({ name }));

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  test("renames the row optimistically and keeps the server's answer on success", async () => {
    expect.hasAssertions();

    const resource = createResource();
    const refresh = vi.fn<() => Promise<void>>(() => Promise.resolve());
    server.use(trpcMsw.sheet.updateResource.mutation(() => ({ ...resource.value, name: newName })));
    await useRenameResource(resource, refresh)(newName);

    expect(resource.value.name).toBe(newName);
    // Called once, not called with nothing: the success path is `onSuccess: refresh`, so the mutation hands it
    // The server row that `refresh` ignores
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  // The name a local rollback would restore is whatever this call read, which for a second rename of the same row
  // Is itself the first call's optimistic value — and only the newest call's handlers run, so restoring it leaves
  // A name the server never accepted on the row. The server's answer is the only true name
  test("re-reads for the server's name instead of restoring one it never accepted", async () => {
    expect.hasAssertions();

    const resource = createResource();
    const refresh = vi.fn<() => Promise<void>>(() => Promise.resolve());
    server.use(
      trpcMsw.sheet.updateResource.mutation(() => {
        throw new TRPCError({ code: "BAD_REQUEST", message: name });
      }),
    );
    await useRenameResource(resource, refresh)(newName);

    expect(refresh).toHaveBeenCalledExactlyOnceWith();
  });
});
