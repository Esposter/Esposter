import type { AuthedContext } from "#server/models/auth/AuthedContext";
import type { EmptyFilter } from "drizzle-orm/relations";

export type ResourceWhere = Exclude<
  NonNullable<NonNullable<Parameters<AuthedContext["db"]["query"]["resourcesInResource"]["findMany"]>[0]>["where"]>,
  EmptyFilter
>;
