// The delivery bound every application event subscription carries, declared once because it is set in two
// Places: the Pulumi resources themselves, and the hard-coded PUT bodies the budget-guard restore Logic Apps
// Replay when they recreate those subscriptions. Drifting apart is silent — the restored subscription simply
// Carries the older policy, and Pulumi reports no diff until someone refreshes.
const AzureEventSubscriptionRetryPolicy = {
  eventTimeToLiveInMinutes: 60,
  maxDeliveryAttempts: 10,
};

export default AzureEventSubscriptionRetryPolicy;
