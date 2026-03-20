import type { MultiWatchSources, WatchHandle, WatchSource } from "vue";

export const useOnlineSubscribable = <TSource>(
  source: WatchSource<TSource> | MultiWatchSources,
  callback: (value: TSource) => (() => void) | void,
) => {
  const online = useOnline();
  let watchHandle: undefined | WatchHandle;

  onMounted(() => {
    const sources = (Array.isArray(source) ? [...source, online] : [source, online]) as MultiWatchSources;
    watchHandle = watchImmediate(sources, (values) => {
      if (!online.value) return;
      const value = (Array.isArray(source) ? values.slice(0, -1) : values[0]) as TSource;
      return callback(value);
    });
  });

  onUnmounted(() => {
    watchHandle?.();
  });
};
