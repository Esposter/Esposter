import type { KeysOfUnion } from "type-fest";
import type { RouteParams } from "vue-router";

// Every path segment a page declares, read off the typed route map, so a reader serving more than one route names
// A segment that exists somewhere rather than any string
export type RouteParamName = KeysOfUnion<RouteParams>;
