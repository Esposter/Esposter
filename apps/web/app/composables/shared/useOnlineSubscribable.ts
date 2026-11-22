import type { OnlineSubscribableContext } from "#src/models/shared/OnlineSubscribableContext";
import type { Promisable } from "type-fest";
import type { WatchSource } from "vue";

import { getResultAsync, getSynchronizedFunction, noop } from "@esposter/shared";

export const useOnlineSubscribable = <TSource>(
  source: WatchSource<TSource>,
  callback: (value: TSource) => Promisable<(() => Promisable<void>) | undefined>,
  context?: OnlineSubscribableContext,
) => {
  const instance = context?.instance ?? getCurrentInstance();
  const scope = context?.scope ?? getCurrentScope();
  // One subscription is one target, so tearing the previous one down and establishing the next run as a single
  // Queued unit — and a subscribe that rejects unwinds on its own instead of wedging every later one behind it
  const { executeBackgroundMutation } = useMutation();
  // A subscription established after an await has no active scope of its own, so the online listeners and the watch
  // It creates are made inside the captured one and stopped with it
  const setup = () => {
    const online = useOnline();
    const key = "subscription";

    let currentCleanup: (() => Promisable<void>) | undefined;
    let isActive = true;

    const resubscribe = (value: TSource, isOnline: boolean) => {
      executeBackgroundMutation(
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
        // Nothing is drawn ahead of the subscription, which is a connection rather than a value on screen
        { key, onError: console.error },
      );
    };
    // Online is watched alongside the caller's own source, and an offline tick takes no call, since the resubscribe
    // Returns before reading the value
    const { trigger } = watchTriggerable([source, online], ([value, isOnline]) => {
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
    onScopeDispose(disposeHandler);
  };

  if (scope) scope.run(setup);
  else setup();
};
