// The handlers a subscription opened through `subscribeStarted` is given, spread into its own options. The server's
// `started` settles it, and so does a failure before that, or the connection reporting one: a socket that cannot open
// Never starts anything
export interface SubscriptionStartHandlers {
  onConnectionStateChange: (state: { error: unknown }) => void;
  onError: () => void;
  onStarted: () => void;
}
