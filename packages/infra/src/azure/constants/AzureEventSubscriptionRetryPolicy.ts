import { EVENT_GRID_DELIVERY_TTL_MINUTES } from "@esposter/db-schema";

// The delivery bound every application event subscription carries, declared once because it is set in two
// Places: the Pulumi resources themselves, and the hard-coded PUT bodies the budget-guard restore Logic Apps
// Replay when they recreate those subscriptions. Drifting apart is silent — the restored subscription simply
// Carries the older policy, and Pulumi reports no diff until someone refreshes.
// The time-to-live is taken from `EVENT_GRID_DELIVERY_TTL_MINUTES` rather than written here, because a consumer
// Outside this package is bounded by the same window — the storage ledger keeps a hold alive for exactly as
// Long as a `BlobCreated` for it can still be redelivered (/docs/platform/storage-quotas).
const AzureEventSubscriptionRetryPolicy: { eventTimeToLiveInMinutes: number; maxDeliveryAttempts: number } = {
  eventTimeToLiveInMinutes: EVENT_GRID_DELIVERY_TTL_MINUTES,
  maxDeliveryAttempts: 10,
};

export default AzureEventSubscriptionRetryPolicy;
