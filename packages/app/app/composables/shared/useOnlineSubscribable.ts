import type { Promisable } from "type-fest";
import type { MultiWatchSources, WatchSource } from "vue";

import { getSynchronizedFunction } from "#shared/util/getSynchronizedFunction";

export function useOnlineSubscribable<T extends Readonly<MultiWatchSources>>(
  source: [...T],
  callback: (value: { -readonly [K in keyof T]: T[K] extends WatchSource<infer V> ? V : never }) => Promisable<
    (() => Promisable<void>) | undefined
  >,
): void;
export function useOnlineSubscribable<TSource>(
  source: WatchSource<TSource>,
  callback: (value: TSource) => Promisable<(() => Promisable<void>) | undefined>,
): void;
export function useOnlineSubscribable(
  source: MultiWatchSources | WatchSource,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  callback: (value: any) => Promisable<(() => Promisable<void>) | undefined>,
) {
  const online = useOnline();
  const sources = (Array.isArray(source) ? [...source, online] : [source, online]) as MultiWatchSources;
  let currentCleanup: (() => Promisable<void>) | undefined;
  let isDisposed = false;
  const { trigger } = watchTriggerable(sources, async (values, _oldValues, onCleanup) => {
    if (!online.value) return;
    const value = (Array.isArray(source) ? values.slice(0, -1) : values[0]) as unknown;

    let isCurrent = true;

    onCleanup(() => {
      isCurrent = false;
    });

    const previousCleanup = currentCleanup;
    currentCleanup = undefined;
    await previousCleanup?.();

    const cleanup = await callback(value);

    if (isCurrent && !isDisposed) currentCleanup = cleanup;
    else await cleanup?.();
  });

  onMounted(async () => {
    await trigger();
  });

  onScopeDispose(
    getSynchronizedFunction(async () => {
      isDisposed = true;
      await currentCleanup?.();
      currentCleanup = undefined;
    }),
  );
}
