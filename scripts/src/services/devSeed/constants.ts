/* oxlint-disable typescript/no-inferrable-types -- `isolatedDeclarations` demands every exported constant's annotation */
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { join } from "node:path";

// The database the seed writes to, on the server the database address names. The owner's dev database is any other
// Name, so a run aimed there stops at the gate before its first write
export const SEED_DATABASE_NAME: string = "driven_session";
// The storage connection string that names the default development emulator, which the seed refuses
export const DEVELOPMENT_STORAGE_CONNECTION_STRING: string = "UseDevelopmentStorage=true";
// The seed's friend, the one friendship's other side. It shares the users table with the driven user, so it steps the
// Last digit from the driven user's id, keeping the version-4 shape `z.uuid()` accepts. Only this package reads it
export const SEED_FRIEND_USER_ID: string = "00000000-0000-4000-8000-000000000002";
// Every row the seed writes carries a fixed time, so a rerun writes the same rows the first run did
export const SEED_DATE: Date = new Date(0);
// The message's row time as epoch nanoseconds, the epoch itself, so the message's row key is fixed across runs
export const SEED_MESSAGE_EPOCH_NANOSECONDS: string =
  Temporal.Instant.fromEpochMilliseconds(0).epochNanoseconds.toString();
// The migrations the seed applies to its database before it writes, the same ones the app's own migrator runs
export const MIGRATIONS_FOLDER: string = join(REPOSITORY_ROOT, "apps", "web", "server", "db", "migrations");
