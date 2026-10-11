export const SubscriptionStatus = {
  Connecting: "connecting",
  Error: "error",
  Idle: "idle",
  Pending: "pending",
} as const;
export type SubscriptionStatus = (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];
