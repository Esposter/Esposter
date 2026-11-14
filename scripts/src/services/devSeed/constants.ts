/* oxlint-disable typescript/no-inferrable-types -- `isolatedDeclarations` demands every exported constant's annotation */
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { join } from "node:path";

// The seed's friend, the one friendship's other side. It shares the users table with the driven user, so it steps the
// Last digit from the driven user's id, keeping the version-7 shape `z.uuidv7()` accepts. Only this package reads it
export const SEED_FRIEND_USER_ID: string = "00000000-0000-7000-8000-000000000002";
// Every row the seed writes carries a fixed time, so a rerun writes the same rows the first run did
export const SEED_DATE: Date = new Date(0);
// The migrations each database is migrated from before the seed writes, the same folders the app's own migrator runs
export const CORE_MIGRATIONS_FOLDER: string = join(
  REPOSITORY_ROOT,
  "apps",
  "web",
  "server",
  "db",
  "migrations",
  "core",
);
// The persistence root `nuxt dev` gives its local Miniflare, which keeps each D1 database under its `d1` folder by name.
// Writing here is writing the databases the dev server reads, so the seed is in the app once the server starts
export const DEV_SEED_PERSIST_ROOT: string = join(REPOSITORY_ROOT, "apps", "web", ".wrangler", "state", "v3");
