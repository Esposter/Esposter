import type { PublishSource } from "#server/services/realtimeKit/constants";

// A connection as RealtimeKit holds it: the id its REST calls address, and what it may publish now, which a moderation
// Changes by switching its preset
export interface RealtimeKitParticipant {
  id: string;
  publishSources: PublishSource[];
}
