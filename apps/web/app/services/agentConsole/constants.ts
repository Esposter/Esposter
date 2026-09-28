import { RoutePath } from "@esposter/shared";
import { DEFAULT_HOSTNAME, DEFAULT_PORT } from "agent-console-server/contracts";

// Reconnecting backs off from the first delay to the cap and stays there, so a host that is down is retried for as
// Long as the page is open and costs nothing while it is
export const MIN_RECONNECT_DELAY_MS = Temporal.Duration.from({ seconds: 1 }).total("milliseconds");
export const MAX_RECONNECT_DELAY_MS = Temporal.Duration.from({ seconds: 30 }).total("milliseconds");
// How close to automatic compaction the context gauge starts warning, as a share of the compaction threshold
export const CONTEXT_WARNING_RATIO = 0.9;
export const MAIN_LANE_TITLE = "Main agent";
// The hook event Claude Code names a session-start hook by, whose context a theme reads the avatar from
export const SESSION_START_HOOK_EVENT = "SessionStart";
// The persona plugin's line naming the session's character, spelled as the plugin spells it: the plugin installs on
// Its own, so the two sides share the text rather than a module
export const GENSHIN_CHARACTER_LINE_PREFIX = "Character: ";
// A token count at the precision a gauge is read at — 30.3K of 1M rather than every digit
export const TOKEN_COUNT_FORMAT = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1, notation: "compact" });
// How many lines of a tool's result show under it before the call is unfolded, as the terminal shows
export const RESULT_PREVIEW_LINE_COUNT = 3;
// How often the working line's count of seconds moves on
export const ELAPSED_TICK_MS = Temporal.Duration.from({ seconds: 1 }).total("milliseconds");
// How many unchanged lines a diff keeps beside a change before folding the rest of the run, as a unified diff does
export const DIFF_CONTEXT_LINE_COUNT = 3;
// What the console's keys are listed under in the shortcuts dialog
export const AGENT_CONSOLE_COMMAND_GROUP = "Agent console";
// How long a reply's first line stays over the world with the console closed before it has faded, as a game's chat
// Line does, and how many show at once
export const CHAT_LINE_DURATION_MS = Temporal.Duration.from({ seconds: 6 }).total("milliseconds");
export const MAX_CHAT_LINE_COUNT = 3;
// The Windows host attached to the newest release: one file carrying its runtime and the Claude Code binary it runs
export const HOST_INSTALLER_URL = `${RoutePath.Github}/releases/latest/download/agent-console-host.exe`;
// Where this computer's host listens, the address a page's Connect pairs with
export const LOCAL_HOST_ADDRESS = `ws://${DEFAULT_HOSTNAME}:${DEFAULT_PORT}`;
// The size a shell starts at, before its terminal has measured the space it is drawn in
export const INITIAL_SHELL_SIZE = { cols: 80, rows: 24 } as const;
// The one-time code a page's Connect opens the host with
export const PAIRING_CODE_BYTE_LENGTH = 32;
