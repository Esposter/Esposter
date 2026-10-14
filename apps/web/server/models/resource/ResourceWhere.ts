import type { AuthedContext } from "#server/models/auth/AuthedContext";

export type ResourceWhere = NonNullable<
  NonNullable<Parameters<AuthedContext["db"]["query"]["resourcesInResource"]["findMany"]>[0]>["where"]
>;
