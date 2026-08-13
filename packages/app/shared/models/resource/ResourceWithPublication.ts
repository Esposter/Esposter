import type { Resource, ResourcePublication } from "@esposter/db-schema";

// What the cross-type resource read answers with. Publish state rides along because `resourcePublications` is
// One table for every type, so the generic read can resolve it whatever the resource turns out to be — and the
// Ownership a separate publication read would resolve is the ownership this request has already resolved.
// Null is the resource having no publication, which is every unpublished and every non-publishable resource;
// The field is always present, so a consumer holding nothing at all has simply not loaded a resource yet
export interface ResourceWithPublication extends Resource {
  publication: null | ResourcePublication;
}
