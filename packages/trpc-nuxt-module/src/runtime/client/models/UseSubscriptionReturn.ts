import type { SubscriptionStatus } from "#src/runtime/client/models/SubscriptionStatus";
import type { ShallowRef } from "vue";

export interface UseSubscriptionReturn<TData, TError> {
  data: ShallowRef<TData | undefined>;
  error: ShallowRef<TError | undefined>;
  // Drops what was received and subscribes afresh, if enabled
  reset: () => void;
  status: ShallowRef<SubscriptionStatus>;
}
