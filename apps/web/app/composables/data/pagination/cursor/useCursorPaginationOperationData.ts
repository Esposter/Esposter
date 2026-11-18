import type { TopicRead } from "#shared/models/realtime/TopicRead";
import type { Page } from "@esposter/db-schema";
import type { Promisable } from "type-fest";

import { BACKOFF_BASE_DELAY_MS, BACKOFF_MAX_DELAY_MS } from "#shared/services/pagination/constants";
import { collectTopics } from "#src/services/realtime/collectTopics";
import { getBoundComputed } from "#src/util/vue/getBoundComputed";
import { getPropertyComputed } from "#src/util/vue/getPropertyComputed";
import { createEmptyPage } from "@esposter/db-schema";
import {
  checkIsServer,
  createExponentialBackoff,
  getResultAsync,
  getSynchronizedFunction,
  noop,
  withFinalizerAsync,
} from "@esposter/shared";

// The data a reset has replaced. A read issued against it answers a partition that no longer holds that data, so its
// Result is dropped rather than landing on the replacement. A cache hydration replaces data too, but without retiring
// It: the rows it restores are the partition's own, so a read still in flight keeps landing on them
const retiredCursorPaginationData = new WeakSet<object>();
// Empties a partition, retiring the data it held so a read issued against that data is dropped when it lands
export const emptyCursorPaginationData = <TItem>(data: Ref<Page<TItem>>, isLoaded: Ref<boolean>) => {
  retiredCursorPaginationData.add(data.value);
  data.value = createEmptyPage<TItem>();
  isLoaded.value = false;
};

// A row's id, for the rows that have one: a list of anything else has nothing for a refresh to update its rows by
const getRowId = (item: unknown) => (item instanceof Object && "id" in item ? item.id : undefined);

// What a server render hands the client for a list's first page: its rows, and the read they came from
interface HydratedPage<TItem> {
  page: Page<TItem>;
  read?: TopicRead | undefined;
}

interface ReadItemsOptions<TItem> {
  // Payload key, from `AsyncDataKey`, for a read a server render also issues. Without one the read runs twice
  // For every such page — once for the html, once again as hydration replays the same setup client-side
  key?: string;
  onComplete?: (data: Page<TItem>) => Promisable<void>;
  // What a write that changed a topic the first page came from does, in place of the default. It is handed a refresh that
  // Reads the first page again and adds the rows it has that the reader does not, at the head, updating the rest by id
  // As the default does, so the pages after the first stay. A list whose new rows arrive by that write (the notifications
  // Bell) passes one, and makes what it toasts from the rows that refresh brings in
  onTopicChange?: (refreshWithNewRows: () => Promise<void>) => Promisable<void>;
}

export const useCursorPaginationOperationData = <TItem>(
  bindCursorPaginationData: () => Ref<Page<TItem>>,
  // Whether the rows this slice holds are its own, recorded the moment a read or a hydration lands rather than
  // Inferred from the list — an empty list is either "not loaded yet" or "loaded and genuinely empty", and only
  // The load knows which. Bound the same way, and for the same reason, as the slice it describes
  bindIsLoaded: () => Ref<boolean>,
) => {
  const nuxtApp = useNuxtApp();
  const online = useOnline();
  // The waypoint re-arms via onComplete even when the query fails, so pace retries instead of spinning hot
  const executeWithBackoff = createExponentialBackoff(BACKOFF_BASE_DELAY_MS, BACKOFF_MAX_DELAY_MS);
  const cursorPaginationData = getBoundComputed(bindCursorPaginationData);
  const isLoaded = getBoundComputed(bindIsLoaded);
  const items = getPropertyComputed(cursorPaginationData, "items");
  const nextCursor = getPropertyComputed(cursorPaginationData, "nextCursor");
  // A list goes on while it has a cursor to continue from
  const hasMore = computed(() => Boolean(nextCursor.value));
  const resetCursorPaginationData = () => {
    emptyCursorPaginationData(cursorPaginationData, isLoaded);
  };
  // The first page's topics are watched under one target per list: the list on screen is the one being read, so a read
  // Of another partition replaces the watch of the one before it
  const watchTopics = useWatchTopics();
  const topicsTarget = Symbol("readItems");
  const readItems = async (
    query: () => Promise<Page<TItem>>,
    { key, onComplete, onTopicChange }: ReadItemsOptions<TItem> = {},
  ) => {
    const isPending = ref(true);
    // Whether the last read failed, so a list shows its error state rather than reading as empty; a refresh clears it
    const isError = ref(false);
    const boundCursorPaginationData = bindCursorPaginationData();
    const boundIsLoaded = bindIsLoaded();
    const storeCursorPaginationData = async (data: Page<TItem>) => {
      boundCursorPaginationData.value = data;
      boundIsLoaded.value = true;
      // Absorbs onComplete errors so data already set above is never lost
      await Promise.allSettled([onComplete?.(data)]);
    };
    // One read of the first page: `apply` lands its rows, then its topics are watched. A read issued against data
    // A reset has retired answers a partition that no longer holds that data, so it lands nothing and watches nothing
    const readFirstPage = (
      apply: (read: { issued: Page<TItem>; page: Page<TItem>; topicRead?: TopicRead | undefined }) => Promisable<void>,
    ) => {
      const issuedCursorPaginationData = boundCursorPaginationData.value;
      return getResultAsync(async () => {
        const { read: topicRead, result: page } = await collectTopics(query);
        // Answers a reset that landed while the read was in flight: the rows are of the order the reset left behind
        if (retiredCursorPaginationData.has(issuedCursorPaginationData)) return;

        await apply({ issued: issuedCursorPaginationData, page, topicRead });
        watchTopics(topicsTarget, topicRead, getSynchronizedFunction(changeOnTopic));
      });
    };
    // A write that changed a topic the first page came from reads it again and updates, by id, the rows it names: a
    // Reader who has paged on keeps their place, since the later pages and the cursor are left as they are. A row
    // Another writer added or removed waits for the next refresh, unless the read adds it, which is the list's choice
    const refreshRows = async (addsNewRows = false) => {
      await readFirstPage(({ issued, page }) => {
        const heldIds = new Set(issued.items.map((item) => getRowId(item)));
        const idRowMap = new Map<unknown, TItem>();
        for (const item of page.items) {
          const id = getRowId(item);
          if (id !== undefined) idRowMap.set(id, item);
        }
        const newRows = addsNewRows
          ? page.items.filter((item) => {
              const id = getRowId(item);
              return id !== undefined && !heldIds.has(id);
            })
          : [];
        issued.items = [
          ...newRows,
          ...issued.items.map((item) => {
            const id = getRowId(item);
            return id === undefined ? item : (idRowMap.get(id) ?? item);
          }),
        ];
      }).match(noop, console.error);
    };
    // What a write that changed a topic the first page came from does: the list's own handler when it passed one, which is
    // Handed the refresh that also adds the rows the page has and the reader does not; the row update by default
    const changeOnTopic = async () => {
      await (onTopicChange ? onTopicChange(() => refreshRows(true)) : refreshRows());
    };
    // A failed read is recorded rather than thrown, so component setup never fails on it and a retry is a plain call;
    // The tRPC link chain still alerts it
    const refresh = async () => {
      isPending.value = true;
      isError.value = false;
      await readFirstPage(async ({ page, topicRead }) => {
        await storeCursorPaginationData(page);
        // The page the html was rendered from rides to the client with the read it came from, so hydration adopts
        // The rows already on screen, and watches their topics from the time the render read them, with no second read
        if (key && checkIsServer()) nuxtApp.payload.data[key] = { page, read: topicRead } satisfies HydratedPage<TItem>;
      }).match(noop, () => {
        isError.value = true;
      });
      isPending.value = false;
    };
    // Only the hydrating render may adopt the payload — a sort change, a pull to refresh and a client-side
    // Navigation all read live. A server read that failed wrote nothing, so hydration issues it again and the
    // TRPC error link surfaces what the server render swallowed
    const hydratedPage =
      key && nuxtApp.isHydrating ? (nuxtApp.payload.data[key] as HydratedPage<TItem> | undefined) : undefined;
    if (hydratedPage) {
      await storeCursorPaginationData(hydratedPage.page);
      watchTopics(topicsTarget, hydratedPage.read, getSynchronizedFunction(changeOnTopic));
      isPending.value = false;
    } else await refresh();
    return { isError, isPending, refresh };
  };
  const readMoreItems = async (
    query: (cursor: string) => Promise<Page<TItem>>,
    onComplete?: () => Promisable<void>,
  ) => {
    const boundCursorPaginationData = bindCursorPaginationData();
    await withFinalizerAsync(async () => {
      if (!online.value) return;
      const issuedCursorPaginationData = boundCursorPaginationData.value;
      const { items: newItems, nextCursor: newNextCursor } = await executeWithBackoff(() =>
        query(issuedCursorPaginationData.nextCursor),
      );
      // A page of an order a reset has since replaced belongs to no partition the reader is looking at
      if (retiredCursorPaginationData.has(issuedCursorPaginationData)) return;

      // The page lands on the list it was read for, so a newer read that replaced that list keeps its own rows: the
      // Newest read of a list wins
      issuedCursorPaginationData.nextCursor = newNextCursor;
      issuedCursorPaginationData.items.push(...newItems);
    }, onComplete);
  };

  return { hasMore, isLoaded, items, readItems, readMoreItems, resetCursorPaginationData };
};
