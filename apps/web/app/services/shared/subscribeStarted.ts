import type { SubscriptionStartHandlers } from "@/models/shared/SubscriptionStartHandlers";
import type { Unsubscribable } from "@trpc/server/observable";

// Resolves with a subscription once the server has started it, which tRPC reports as `started`. A procedure's event
// Listener is registered before the server says it has started, so a read issued after this resolves cannot miss a
// Change its answer leaves out. A subscription that fails first settles too, as does a socket reporting that it cannot
// Connect: the read is then the best state there is, and the error is the link's to report
export const subscribeStarted = async <TSubscription extends Unsubscribable>(
  subscribe: (handlers: SubscriptionStartHandlers) => TSubscription,
): Promise<TSubscription> => {
  const { promise, resolve } = Promise.withResolvers<void>();
  const subscription = subscribe({
    onConnectionStateChange: ({ error }) => {
      if (error) resolve();
    },
    onError: () => resolve(),
    onStarted: () => resolve(),
  });
  await promise;
  return subscription;
};
