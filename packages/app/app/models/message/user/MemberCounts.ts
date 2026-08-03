import type { MemberCountByTopRole } from "#shared/models/db/room/MemberCountByTopRole";

// One room's member totals, both of which only the server can produce. A class rather than a literal so the
// Per-room map gets a fresh instance per key from its factory instead of a structured clone of a shared default
export class MemberCounts {
  count = 0;
  countsByTopRole: MemberCountByTopRole[] = [];
}
