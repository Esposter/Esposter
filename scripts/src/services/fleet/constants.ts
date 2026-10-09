import { SITE_NAME } from "@esposter/shared";
import { homedir } from "node:os";
import { join } from "node:path";

export const FLEET_REMOTE = "origin";
export const CLAIM_REF_PREFIX = "refs/claims/";
export const MACHINE_REF_PREFIX = "refs/machines/";
// Where `git fetch` mirrors the remote's refs locally, so a read names the local mirror and never the remote
export const FLEET_LOCAL_CLAIM_PREFIX = "refs/fleet/claims/";
export const FLEET_LOCAL_MACHINE_PREFIX = "refs/fleet/machines/";
// The empty tree every claim and heartbeat commit points at, the same in every repository, so a commit carries its message alone
export const EMPTY_TREE_SHA = "4b825dc642cb6eb9a060e54bf8d69288fbee4904";
// A fresh machine may have no commit identity configured, and nothing reads the identity of a claim or a heartbeat
export const FLEET_IDENTITY_ARGUMENTS: readonly string[] = [
  "-c",
  `user.name=${SITE_NAME.toLowerCase()}-fleet`,
  "-c",
  "user.email=fleet@esposter.invalid",
];
// A holder renews its claim, and a machine its heartbeat, on this interval
export const MILLISECONDS_PER_MINUTE: number = Temporal.Duration.from({ minutes: 1 }).total("milliseconds");
export const RENEW_MILLISECONDS: number = Temporal.Duration.from({ minutes: 10 }).total("milliseconds");
// A claim unrenewed for this long is stale, and any machine may take it over
export const STALE_MILLISECONDS: number = Temporal.Duration.from({ minutes: 30 }).total("milliseconds");
// A renewal's load line samples the machine over this window, so a renewal is quick
export const LOAD_SAMPLE_MILLISECONDS: number = Temporal.Duration.from({ seconds: 1 }).total("milliseconds");
export const MACHINE_PROFILE_PATH: string = join(homedir(), `.${SITE_NAME.toLowerCase()}`, "machine.json");
// A running hold has one file per entry here, which a release deletes to stop the hold on this machine at once
export const HOLDS_DIRECTORY: string = join(homedir(), `.${SITE_NAME.toLowerCase()}`, "holds");
// How often a hold checks its entry's file between renewals, so a local release is seen within this interval
export const LOCAL_HOLD_POLL_MILLISECONDS: number = Temporal.Duration.from({ seconds: 5 }).total("milliseconds");
// The areas a machine holds when its profile is new: every area, until the user lends it fewer
export const ALL_AREAS: readonly string[] = ["*"];
// The capabilities read off the machine itself, which every run rewrites. Any other capability in a profile was set by
// The user, and is kept
export const DETECTED_CAPABILITIES: readonly string[] = [
  "game-exports",
  "game-install",
  "linux",
  "macos",
  "media-engine",
  "windows",
];
export const MEDIA_ENGINE_ACCELERATION = "d3d11va";
export const ROADMAP_PATH = "apps/web/content/docs/genshin/roadmap.md";
// The compute queue's heading in the roadmap, which the queue section runs under
export const COMPUTE_QUEUE_HEADING = "## Compute queue";
// A worker's name: letters, digits and dashes, since it names a pid file and follows the slash in `machine/worker`
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this pattern would otherwise infer
export const WORKER_NAME_REGEX: RegExp = /^[\w-]+$/u;
