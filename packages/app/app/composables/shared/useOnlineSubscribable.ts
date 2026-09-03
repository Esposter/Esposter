import type { Promisable } from "type-fest";
import type { ComponentInternalInstance, EffectScope, MultiWatchSources, WatchSource } from "vue";

import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { getResultAsync, noop } from "@esposter/shared";

export interface OnlineSubscribableContext {
  instance?: ComponentInternalInstance | null;
  scope?: EffectScope | null;
}

export const getOnlineSubscribableContext = (): OnlineSubscribableContext => ({
  instance: getCurrentInstance(),
  scope: getCurrentScope(),
});
type OnlineSubscribableSource = object | WatchSource<unknown>;

type OnlineSubscribableValues<TSources extends readonly OnlineSubscribableSource[]> = {
  -readonly [K in keyof TSources]: TSources[K] extends WatchSource<infer V> ? V : TSources[K];
};

export function useOnlineSubscribable<const TSources extends readonly OnlineSubscribableSource[]>(
  source: TSources,
  callback: (value: OnlineSubscribableValues<TSources>) => Promisable<(() => Promisable<void>) | undefined>,
  context?: OnlineSubscribableContext,
): void;
export function useOnlineSubscribable<TSource>(
  source: WatchSource<TSource>,
  callback: (value: TSource) => Promisable<(() => Promisable<void>) | undefined>,
  context?: OnlineSubscribableContext,
): void;
export function useOnlineSubscribable(
  source: MultiWatchSources | WatchSource,
  // oxlint-disable-next-line typescript/no-explicit-any
  callback: (value: any) => Promisable<(() => Promisable<void>) | undefined>,
  context?: OnlineSubscribableContext,
) {
  const instance = context?.instance ?? getCurrentInstance();
  const scope = context?.scope ?? getCurrentScope();
  const online = useOnline();
  const sources = (Array.isArray(source) ? [...source, online] : [source, online]) as MultiWatchSources;
  // One subscription is one target, so tearing the previous one down and establishing the next run as a single
  // Queued unit — and a subscribe that rejects unwinds on its own instead of wedging every later one behind it
  const { executeMutation } = useMutation();
  const key = "subscription";

  let currentCleanup: (() => Promisable<void>) | undefined;
  let isActive = true;

  const resubscribe = getSynchronizedFunction(async (value: unknown, isOnline: boolean) => {
    await executeMutation(
      async () => {
        const previousCleanup = currentCleanup;
        currentCleanup = undefined;
        await previousCleanup?.();

        if (!isOnline || !isActive) return;

        const newCleanup = await callback(value);

        if (isActive) currentCleanup = newCleanup;
        else await newCleanup?.();
      },
      // A subscription that cannot be established is a background failure of a connection that retries on the
      // Next online or source change, not something to put in front of the user
      { key, onError: console.error },
    );
  });
  const { trigger } = watchTriggerable(sources, (values) => {
    const isOnline = online.value;
    const value = isOnline ? (Array.isArray(source) ? values.slice(0, -1) : values[0]) : null;

    resubscribe(value, isOnline);
  });

  onMounted(() => {
    trigger();
  }, instance);

  // The teardown is whatever the subscribe handed back — an unsubscribe, a socket stop — and a scope disposing
  // Holds nothing to catch it, so a cleanup that rejects reports here rather than escaping the dispose
  const disposeHandler = getSynchronizedFunction(() =>
    getResultAsync(async () => {
      isActive = false;
      const cleanup = currentCleanup;
      currentCleanup = undefined;
      await cleanup?.();
    }).match(noop, console.error),
  );

  if (scope)
    scope.run(() => {
      onScopeDispose(disposeHandler);
    });
  else onScopeDispose(disposeHandler);
}
