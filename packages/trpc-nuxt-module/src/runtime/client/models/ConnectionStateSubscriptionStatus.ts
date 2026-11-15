export const ConnectionStateSubscriptionStatus = {
  Connecting: "connecting",
  Idle: "idle",
  Pending: "pending",
} as const;
export type ConnectionStateSubscriptionStatus =
  (typeof ConnectionStateSubscriptionStatus)[keyof typeof ConnectionStateSubscriptionStatus];
