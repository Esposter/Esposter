import type { Promisable } from "type-fest";
import type { MultiWatchSources, WatchHandle, WatchSource } from "vue";

export function useOnlineSubscribable<T extends Readonly<MultiWatchSources>>(
  source: [...T],
  callback: (value: { -readonly [K in keyof T]: T[K] extends WatchSource<infer V> ? V : never }) => Promisable<
    (() => void) | undefined
  >,
): void;
export function useOnlineSubscribable<TSource>(
  source: WatchSource<TSource>,
  callback: (value: TSource) => Promisable<(() => void) | undefined>,
): void;
export function useOnlineSubscribable(
  source: MultiWatchSources | WatchSource,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  callback: (value: any) => Promisable<(() => void) | undefined>,
) {
  const online = useOnline();
  let watchHandle: undefined | WatchHandle;

  onMounted(() => {
    const sources = (Array.isArray(source) ? [...source, online] : [source, online]) as MultiWatchSources;
    watchHandle = watchImmediate(sources, (values) => {
      if (!online.value) return;
      const value = (Array.isArray(source) ? values.slice(0, -1) : values[0]) as unknown;
      return callback(value);
    });
  });

  onUnmounted(() => {
    watchHandle?.();
  });
}
