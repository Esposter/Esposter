// @vitest-environment nuxt
import type { Resource } from "@esposter/db-schema";

import { CacheTag } from "@/models/cache/CacheTag";
import { createResourceListItem } from "@/services/resource/list/createResourceListItem.test";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useCacheStore } from "@/store/cache";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe(useRecordResourceAccess, () => {
  const server = setupMswTrpc();
  const resource = createResourceListItem();

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  // Recent is read once per session, so the visit this records stays invisible to Home until the write drops
  // That cache. Recording the visit and leaving the cached ordering alone leaves Recent stale for a whole
  // Session, listing the set as it was before anything was opened
  test("invalidates the recency caches once the visit is recorded", async () => {
    expect.hasAssertions();

    server.use(trpcMsw.resource.recordAccess.mutation(() => undefined));
    // Registered against every tag rather than driving the recent store, so this asserts the wiring the write
    // Owns — which tags it drops — and not the recent store's own re-read policy, which is its own test.
    // Recording a visit reorders the recents and nothing else: dropping Resources here would re-read the
    // Favorites on every navigation, since that cache re-reads the moment it is invalidated
    const { promise: invalidated, resolve: onInvalidated }: PromiseWithResolvers<void> = Promise.withResolvers();
    const invalidatedTags: CacheTag[] = [];
    const cacheStore = useCacheStore();
    const { registerCache } = cacheStore;
    for (const tag of Object.values(CacheTag))
      registerCache([tag], () => {
        invalidatedTags.push(tag);
        if (tag === CacheTag.Recents) onInvalidated();
      });
    const scope = effectScope();
    scope.run(() => {
      useRecordResourceAccess(ref<Resource | undefined>(resource));
    });
    // The invalidation itself is the completion signal — the write fires from a watcher, so there is no
    // Promise to await at the call site, and awaiting anything earlier would race the write's own onSuccess
    await invalidated;

    expect(invalidatedTags).toStrictEqual([CacheTag.Recents]);

    scope.stop();
  });
});
