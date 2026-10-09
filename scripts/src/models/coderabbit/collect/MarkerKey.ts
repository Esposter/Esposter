import type { CommitPatch } from "#src/models/coderabbit/collect/CommitPatch";
import type { FailureSignature } from "#src/models/coderabbit/collect/FailureSignature";

// What a hidden marker is about (`getMarker`): a review by its id, a commit by its sha or by its patch, or a red by its
// Failure signature
export type MarkerKey = CommitPatch | FailureSignature | number | string;
