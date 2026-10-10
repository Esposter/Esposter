// A pending path is grouped by this many leading path segments
export const TREE_GROUP_SEGMENT_COUNT = 2;
export const QUEUE_REMOTE_REF = "origin/ai/queue";
export const COLLECTOR_WORKFLOW = "ReviewCollector.yaml";
export const TREE_ACTION = "finish, commit or record each; never discard";
export const QUEUE_PUSH_ACTION = "pnpm ai:queue:push";
export const STALE_CLAIM_ACTION = "resume it from its handoff, or release with --miss naming what is left";
export const MISSED_CLAIM_ACTION = "the coordinator's call";
export const HOLD_DIED_ACTION = "hold died";
export const DELETE_PID_FILE_ACTION = "delete the pid file";
export const RED_PATH_ACTION = "the review-queue skill's red path";
export const REMOVE_WORKTREE_SCRIPT = "bash .agents/skills/throughput/scripts/remove-worktree.sh";
export const FAILED_RUN_CONCLUSIONS: readonly string[] = ["failure", "startup_failure", "timed_out"];
