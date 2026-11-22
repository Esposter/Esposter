import type {
  ResourceFavoriteInResource,
  ResourceInResource,
  ResourcePublicationInResource,
} from "@esposter/db-schema";

// What the cross-type resource read answers with. Publish state and the viewer's star ride along because each is one table
// For every type, so the generic read can resolve them whatever the resource turns out to be — and the ownership a separate
// Read would resolve is the ownership this request has already resolved. Null is Drizzle's own shape for an absent
// One-to-one relation, which `readResources` returns untouched — a boundary type left where it lands rather than an
// App-owned absent value. It is every unpublished and every non-publishable resource, and every resource the viewer never
// Starred, and consumers guard each one truthily
export interface ResourceWithState extends ResourceInResource {
  favorite: null | ResourceFavoriteInResource;
  publication: null | ResourcePublicationInResource;
}
