import type { UseSubscriptionOptions } from "#src/runtime/client/models/UseSubscriptionOptions";
import type { UseSubscriptionReturn } from "#src/runtime/client/models/UseSubscriptionReturn";
import type { TRPCClientError, TRPCResolverDef, TRPCUntypedClient } from "@trpc/client";
import type { AnyTRPCRouter } from "@trpc/server";
import type { MaybeRefOrGetter } from "vue";

import { SubscriptionStatus } from "#src/runtime/client/models/SubscriptionStatus";
import { checkIsServer } from "@esposter/shared";
import { getCurrentScope, onScopeDispose, shallowRef, toValue, watch } from "vue";

type ConnectionState = Parameters<
  NonNullable<UseSubscriptionOptions<TRPCResolverDef>["onConnectionStateChange"]>
>[0]["state"];
type Unsubscribable = ReturnType<TRPCUntypedClient<AnyTRPCRouter>["subscription"]>;

const ConnectionStateSubscriptionStatusMap = {
  connecting: SubscriptionStatus.Connecting,
  idle: SubscriptionStatus.Idle,
  pending: SubscriptionStatus.Pending,
} as const satisfies Record<ConnectionState, SubscriptionStatus>;

export const useProcedureSubscription = (
  client: TRPCUntypedClient<AnyTRPCRouter>,
  path: string,
  input: MaybeRefOrGetter<unknown>,
  { enabled = true, ...options }: UseSubscriptionOptions<TRPCResolverDef> = {},
): UseSubscriptionReturn<unknown, TRPCClientError<AnyTRPCRouter>> => {
  const data = shallowRef<unknown>();
  const error = shallowRef<TRPCClientError<AnyTRPCRouter>>();
  const status = shallowRef(SubscriptionStatus.Idle);
  let unsubscribable: undefined | Unsubscribable;
  const unsubscribe = () => {
    unsubscribable?.unsubscribe();
    unsubscribable = undefined;
    status.value = SubscriptionStatus.Idle;
  };
  const subscribe = () => {
    unsubscribable?.unsubscribe();
    error.value = undefined;
    status.value = SubscriptionStatus.Connecting;
    unsubscribable = client.subscription(path, toValue(input), {
      ...options,
      onComplete: () => {
        status.value = SubscriptionStatus.Idle;
        options.onComplete?.();
      },
      onConnectionStateChange: (state) => {
        status.value = state.error ? SubscriptionStatus.Error : ConnectionStateSubscriptionStatusMap[state.state];
        options.onConnectionStateChange?.(state);
      },
      onData: (value) => {
        data.value = value;
        options.onData?.(value);
      },
      onError: (newError) => {
        error.value = newError;
        status.value = SubscriptionStatus.Error;
        options.onError?.(newError);
      },
      onStarted: (startedOptions) => {
        status.value = SubscriptionStatus.Pending;
        options.onStarted?.(startedOptions);
      },
    });
  };
  // A subscription is a live connection, which only the browser holds; a changed input resubscribes with it
  if (!checkIsServer())
    watch(
      [() => toValue(input), () => toValue(enabled)],
      ([, isEnabled]) => {
        if (isEnabled) subscribe();
        else unsubscribe();
      },
      { immediate: true },
    );
  if (getCurrentScope())
    onScopeDispose(() => {
      unsubscribe();
    });
  return {
    data,
    error,
    reset: () => {
      data.value = undefined;
      unsubscribe();
      if (toValue(enabled)) subscribe();
    },
    status,
  };
};
