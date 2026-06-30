import { REAPPLY_POSTINSTALL_COMMAND } from "@/services/exec/snapshot/constants";
// The warm snapshot freezes only the dependency closure (see pruneSnapshotUpper), so a source-derived artifact a
// Tool needs — Nuxt's `.nuxt` type graph, codegen output — is absent from a fork. Replaying the workspace's own
// Postinstall lifecycle (REAPPLY_POSTINSTALL_COMMAND) in the fork's ephemeral upper, immediately before the command,
// Regenerates it against *this* source and the warm deps: the per-run freshness a lockfile-keyed snapshot can't
// Provide, reusing the lifecycle the install already defines rather than any custom config. Composed via
// `sh -c '<postinstall> && exec "$@"'` so a failed replay aborts with its own exit code and the original argv passes
// Through verbatim — never re-quoted — as the positional params `exec` then takes over. A string command (already
// Its own `sh -c`) just chains with `&&`.
export const withReappliedPostinstall = (command: readonly string[] | string): readonly string[] | string => {
  if (typeof command === "string") return `${REAPPLY_POSTINSTALL_COMMAND} && ${command}`;
  else return ["/bin/sh", "-c", `${REAPPLY_POSTINSTALL_COMMAND} && exec "$@"`, "sh", ...command];
};
