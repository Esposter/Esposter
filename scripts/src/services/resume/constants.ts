// A pending path is grouped by this many leading path segments
export const TREE_GROUP_SEGMENT_COUNT = 2;
export const TREE_ACTION = "finish, commit or record each; never discard";
export const QUEUE_PUSH_ACTION = "git pull --rebase origin ai/queue && git push origin HEAD:ai/queue";
export const STALE_CLAIM_ACTION = "resume it from its handoff, or release with --miss naming what is left";
export const HOLD_DIED_ACTION = "hold died";
export const DELETE_PID_FILE_ACTION = "delete the pid file";
export const REMOVE_WORKTREE_SCRIPT = "bash .agents/skills/throughput/scripts/remove-worktree.sh";
export const WORKTREES_DIRECTORY = ".agents/worktrees";
export const WATCHER_ACTION =
  "pnpm ai:machine:watch, or start a session with the genshin-mods plugin, whose pulse mod starts it";
export const WATCHER_MISSING_TEXT = "machine watcher not running";
