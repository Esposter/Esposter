import { SITE_NAME } from "@esposter/shared";
import { homedir } from "node:os";
import { join } from "node:path";

// The repositories one GraphQL request names, each an aliased field of it
export const GITHUB_GRAPHQL_BATCH_SIZE = 100;
// Each package's verdict, keyed by name and locked version, so an unchanged catalog asks GitHub nothing
export const SUPERSESSION_CACHE_PATH: string = join(
  homedir(),
  `.${SITE_NAME.toLowerCase()}`,
  "supersession-cache.json",
);
// How old a read may be and still be trusted. A version-keyed verdict left standing would never report an archived
// Repository, which seldom publishes again, so a read past this age is asked again
export const SUPERSESSION_CACHE_MAX_AGE: Temporal.Duration = Temporal.Duration.from({ days: 7 });
