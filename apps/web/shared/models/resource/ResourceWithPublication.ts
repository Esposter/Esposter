import type { Resource, ResourcePublication } from "@esposter/db-schema";

// What the cross-type resource read answers with. Publish state rides along because `resourcePublications` is
// One table for every type, so the generic read can resolve it whatever the resource turns out to be — and the
// Ownership a separate publication read would resolve is the ownership this request has already resolved.
// Null is Drizzle's own shape for an absent one-to-one relation, which `readResources` returns untouched —
// A boundary type left where it lands rather than an app-owned absent value. It is every unpublished and every
// Non-publishable resource, and consumers guard it truthily
export interface ResourceWithPublication extends Resource {
  publication: null | ResourcePublication;
}
