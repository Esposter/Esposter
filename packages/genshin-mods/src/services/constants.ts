/* oxlint-disable typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation a template literal or a pattern would otherwise infer */
// The game's own interface gold, the accent wherever the persona publishes no character
export const ACCENT_COLOR = "#d3bc8e";
// The prompt cache's lifetime, which the engine chooses and does not report: an hour on a subscription
export const CACHE_LIFETIME_MS: number = Temporal.Duration.from({ hours: 1 }).total("milliseconds");
export const CACHE_LOW_MS: number = Temporal.Duration.from({ minutes: 10 }).total("milliseconds");
export const CACHE_WARNING_MS: number = Temporal.Duration.from({ minutes: 5 }).total("milliseconds");
export const USAGE_WARNING_PERCENTAGE = 80;
// The only model a subagent launches on: the main session thinks, and everything it delegates runs on haiku
export const AGENT_MODEL = "haiku";
const MODEL_SCOPE_SENTENCE = `Work too judged for ${AGENT_MODEL} stays in the main session, and a spec ${AGENT_MODEL} cannot carry still has a call open.`;
// What a launch on any other model, or a fork, is told instead
export const AGENT_MODEL_REFUSAL: string = `A subagent runs on "${AGENT_MODEL}" alone: pass model "${AGENT_MODEL}", and never a fork, which runs on the session's own model. ${MODEL_SCOPE_SENTENCE}`;
// What a workflow launch is refused with when its agents cannot all be seen to run on haiku
export const WORKFLOW_MODEL_REFUSAL: string = `A workflow runs its agents on "${AGENT_MODEL}" alone: pass model "${AGENT_MODEL}" in each agent() call's own options. A saved workflow named with no script, or a script the guard cannot read as code, is refused. ${MODEL_SCOPE_SENTENCE}`;
export const MAX_WAYPOINTS = 3;
export const MAX_SHOWN_TASKS = 8;
// Whole minutes as the band writes them, `12m`
export const MINUTE_FORMATTER: Intl.NumberFormat = new Intl.NumberFormat("en", {
  style: "unit",
  unit: "minute",
  unitDisplay: "narrow",
});
// The share of a commission's tasks done, `75%`
export const PERCENT_FORMATTER: Intl.NumberFormat = new Intl.NumberFormat("en", { style: "percent" });
export const WARD_WINDOW_MS: number = Temporal.Duration.from({ minutes: 30 }).total("milliseconds");
export const NO_WAYPOINTS_ANSWER = "NONE";
export const WAYPOINTS_QUESTION: string = `Leave the conversation as it is and answer one side question. List the next steps worth taking from here, at most ${MAX_WAYPOINTS}, most useful first: each one short imperative line the person could send you as their next prompt, with no numbering, no markup and nothing else. When the work is finished or waits on the person, answer ${NO_WAYPOINTS_ANSWER}.`;
export const WARM_QUESTION = "Answer with the one word OK.";
export const HANDOFF_QUESTION =
  "Write a handoff of this session for a fresh conversation that will carry on the work with no other context. Write it as the prompt that conversation starts with: the goal, what is done, what is next in order, the files, commands and decisions that matter with their reasons, and any open question. Be complete but compact, plain markdown, nothing before or after it.";
export const VEIL_SECTION_ID = "genshin-mods-veil";
export const VEIL_SYSTEM_SECTION =
  "Recording mode is on: the screen is being recorded or shared. Never write an email address, a phone number, a money amount, an API key, a token or a password in a reply; write a placeholder such as [email], [phone], [amount] or [secret] instead, even when asked for the value. Tool calls still use the real values.";
// The tool a session launches a subagent with
export const AGENT_TOOL = "Agent";
// The tools that look something up, the tools that change files, and the shell whose command decides which it is
export const LOOKUP_TOOLS = ["Read", "WebFetch"] as const;
export const RESET_TOOLS = [AGENT_TOOL, "Edit", "NotebookEdit", "Write"] as const;
export const SHELL_TOOLS = ["Bash"] as const;
// The `export` and `cd` a session chains ahead of its command, each stripped as one leading segment
export const LEADING_SEGMENT_REGEX: RegExp = /^\s*(?:export\s[^&;]*&&|cd\s[^&;]*&&|cd\s[^&;]*;)\s*/u;
// The commands that only read, a whole first word each so `catalog` is not `cat`. No interpreter is one, since what it
// Runs may write as readily as read
export const LOOKUP_COMMAND_REGEX: RegExp =
  /^\s*(?:cat|sed|grep|rg|find|ls|head|tail|awk|wc|git\s+(?:show|log|diff)|gh\s+run\s+view)(?:\s|$)/u;
// The reads that write as well: sed's in-place edit, find's actions that write, and a redirection into a file, the
// Stderr and stdout merges and the null device aside
export const WRITING_LOOKUP_REGEX: RegExp =
  /\bsed\b.*\s(?:-[a-zA-Z]*i|--in-place)|\bfind\b.*\s-(?:delete|exec|execdir|ok|okdir|fprint0?|fprintf|fls)\b|>(?!&|\s*\/dev\/null\b)/iu;
// Every third lookup in a row, the chain a haiku agent should answer as one bounded question
export const DELEGATION_NUDGE_EVERY = 3;
export const DELEGATION_NUDGE =
  "Third lookup in a row with no decision between them: by the llm-delegation skill's hop rule this chain goes to a haiku agent as one bounded question.";
// The repository's watcher, which the pulse runs as its child and reads the lines of
export const MACHINE_WATCHER_SCRIPT = "scripts/src/machine/watch/index.ts";
// How long after its watcher exits a session starts one again, so a session whose watcher found another's lock held takes
// Over the watching once that watcher's session ends
export const MACHINE_WATCHER_RETRY_MILLISECONDS: number = Temporal.Duration.from({ minutes: 1 }).total("milliseconds");
