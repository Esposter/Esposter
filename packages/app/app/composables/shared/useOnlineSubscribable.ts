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
  let isActive = true;
  let chain: Promise<unknown> = Promise.resolve();

  const { trigger } = watchTriggerable(sources, (values) => {
    const isOnline = online.value;
    const value = isOnline ? (Array.isArray(source) ? values.slice(0, -1) : values[0]) : null;

    chain = chain.then(async () => {
      const prevCleanup = currentCleanup;
      currentCleanup = undefined;
      await prevCleanup?.();

      if (!isOnline || !isActive) return;

      const newCleanup = await callback(value);

      if (isActive) currentCleanup = newCleanup;
      else await newCleanup?.();
    });
  });

  onMounted(() => {
    trigger();
  });

  onScopeDispose(
    getSynchronizedFunction(async () => {
      isActive = false;
      const fn = currentCleanup;
      currentCleanup = undefined;
      await fn?.();
    }),
  );
}
