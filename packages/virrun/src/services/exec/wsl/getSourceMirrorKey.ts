import { createHash } from "node:crypto";
// The mirror entry key for a host cwd: sha256 of the absolute host path, so distinct repos/worktrees never collide
// And the same repo always resolves the same entry. Shared by the Linux-path (getWslSourceMirrorEntryPath) and
// UNC-path (getWslSourceMirrorEntryUnc) resolvers so the two views of one entry can never drift apart.
export const getSourceMirrorKey = (cwd: string): string => createHash("sha256").update(cwd).digest("hex");
