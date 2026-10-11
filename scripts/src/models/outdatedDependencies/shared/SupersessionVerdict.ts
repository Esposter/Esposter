import type { SupersededRepository } from "#src/models/outdatedDependencies/shared/SupersededRepository";
import type { Except } from "type-fest";

// What GitHub says of a package's repository, kept per catalog version: a superseded repository without its package name
export type SupersessionVerdict = Except<SupersededRepository, "packageName">;
