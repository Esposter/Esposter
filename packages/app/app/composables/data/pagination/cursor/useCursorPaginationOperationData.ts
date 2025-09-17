import type { AsyncData } from "#app";
import type { TRPCClientErrorLike } from "@trpc/client";
import type { InferrableClientTypes } from "@trpc/server/unstable-core-do-not-import";
import type { Promisable } from "type-fest";

import { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";

export const useCursorPaginationOperationData = <TItem>(cursorPaginationData: Ref<CursorPaginationData<TItem>>) => {
  const items = computed({
    get: () => cursorPaginationData.value.items,
    set: (items) => {
      cursorPaginationData.value.items = items;
    },
  });
  const nextCursor = computed({
    get: () => cursorPaginationData.value.nextCursor,
    set: (nextCursor) => {
      cursorPaginationData.value.nextCursor = nextCursor;
    },
  });
  const hasMore = computed({
    get: () => cursorPaginationData.value.hasMore,
    set: (hasMore) => {
      cursorPaginationData.value.hasMore = hasMore;
    },
  });
  const initializeCursorPaginationData = (data: CursorPaginationData<TItem>) => {
    cursorPaginationData.value = data;
  };
  const resetCursorPaginationData = () => {
    cursorPaginationData.value = new CursorPaginationData<TItem>();
  };
  const readItems = async <TDef extends InferrableClientTypes>(
    useQuery: () => Promise<Awaited<AsyncData<CursorPaginationData<TItem> | null, TRPCClientErrorLike<TDef>>>>,
    onComplete?: (data: CursorPaginationData<TItem>) => Promisable<void>,
  ) => {
    const { data, pending: isPending, status, ...rest } = await useQuery();
    const watchHandle = watchEffect(async () => {
      if (!(status.value === "success" && data.value)) return;
      initializeCursorPaginationData(data.value);
      await onComplete?.(data.value);
      watchHandle();
    });
    return { data, isPending, status, ...rest };
  };
  const readMoreItems = async (
    query: (cursor?: string) => Promise<CursorPaginationData<TItem>>,
    onComplete?: () => Promisable<void>,
  ) => {
    try {
      const { hasMore: newHasMore, items: newItems, nextCursor: newNextCursor } = await query(nextCursor.value);
      hasMore.value = newHasMore;
      nextCursor.value = newNextCursor;
      items.value.push(...newItems);
    } finally {
      await onComplete?.();
    }
  };

  return {
    hasMore,
    initializeCursorPaginationData,
    items,
    nextCursor,
    readItems,
    readMoreItems,
    resetCursorPaginationData,
  };
};
