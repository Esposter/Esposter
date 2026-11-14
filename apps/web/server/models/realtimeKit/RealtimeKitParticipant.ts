import type { PublishSource } from "#server/services/realtimeKit/constants";

// A connection as RealtimeKit holds it: the id its REST calls address, and what it may publish now, which a moderation
// Changes by switching its preset. A revoke that narrows it replaces the connection, and `isRejoining` is set while the
// Old one is being kicked, so the webhook does not read that kick as its user leaving the call
export interface RealtimeKitParticipant {
  id: string;
  isRejoining: boolean;
  publishSources: PublishSource[];
}
