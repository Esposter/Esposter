import type { SettingSource } from "@anthropic-ai/claude-agent-sdk";

// Frames that tell the host nothing the page shows: `command_lifecycle` follows each prompt through the SDK's queue,
// Which the prompt's own events and the session's state already say, and the terminal prints nothing for it
export const IGNORED_SDK_MESSAGE_TYPES: string[] = ["command_lifecycle"];
export const DEFAULT_DENY_MESSAGE = "The user denied this tool call.";
// Every settings layer the terminal reads, so CLAUDE.md, skills, hooks, plugins and output styles apply exactly as
// They do there
export const SETTING_SOURCES: SettingSource[] = ["user", "project", "local"];
// The most recent sessions across every project — the page lists what a person is likely to pick up, not the whole
// History on disk
export const SESSION_LIST_LIMIT = 50;
