// The game's own interface gold, the accent wherever the persona publishes no character
export const ACCENT_COLOR = "#d3bc8e";
// The prompt cache's lifetime, which the engine chooses and does not report: an hour on a subscription
export const CACHE_LIFETIME_MS: number = Temporal.Duration.from({ hours: 1 }).total("milliseconds");
export const CACHE_LOW_MS: number = Temporal.Duration.from({ minutes: 10 }).total("milliseconds");
export const CACHE_WARNING_MS: number = Temporal.Duration.from({ minutes: 5 }).total("milliseconds");
export const CLOCK_TICK_MS: number = Temporal.Duration.from({ minutes: 1 }).total("milliseconds");
export const USAGE_WARNING_PERCENTAGE = 80;
export const USAGE_RESERVE_PERCENTAGE = 90;
export const MAX_WAYPOINTS = 3;
export const MAX_SHOWN_TASKS = 8;
// Whole minutes as the band writes them, `12m`
export const MINUTE_FORMATTER: Intl.NumberFormat = new Intl.NumberFormat("en", {
  style: "unit",
  unit: "minute",
  unitDisplay: "narrow",
});
export const WARD_WINDOW_MS: number = Temporal.Duration.from({ minutes: 30 }).total("milliseconds");
export const NO_WAYPOINTS_ANSWER = "NONE";
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this template literal would otherwise infer
export const WAYPOINTS_QUESTION: string = `Leave the conversation as it is and answer one side question. List the next steps worth taking from here, at most ${MAX_WAYPOINTS}, most useful first: each one short imperative line the person could send you as their next prompt, with no numbering, no markup and nothing else. When the work is finished or waits on the person, answer ${NO_WAYPOINTS_ANSWER}.`;
export const WARM_QUESTION = "Answer with the one word OK.";
export const HANDOFF_QUESTION =
  "Write a handoff of this session for a fresh conversation that will carry on the work with no other context. Write it as the prompt that conversation starts with: the goal, what is done, what is next in order, the files, commands and decisions that matter with their reasons, and any open question. Be complete but compact, plain markdown, nothing before or after it.";
export const VEIL_SECTION_ID = "genshin-mods-veil";
export const VEIL_SYSTEM_SECTION =
  "Recording mode is on: the screen is being recorded or shared. Never write an email address, a phone number, a money amount, an API key, a token or a password in a reply; write a placeholder such as [email], [phone], [amount] or [secret] instead, even when asked for the value. Tool calls still use the real values.";
export const RESERVE_SECTION_ID = "genshin-mods-reserve";
// The reserve's section ends on this instruction, the same for every window so only the window and its reset time vary
export const RESERVE_INSTRUCTION =
  "Until it resets, start no new agent or workflow that writes code or designs; have each running one commit what builds and end on a handoff spec; commit and push the work in hand; write every open item down with what it takes to resume it cold (its paths, what is done, the calls made, the next step); clean up idle servers, shells and monitors; keep only long-running compute going.";
// The tools that look something up, the tools that change files, and the shells whose command decides which it is
export const LOOKUP_TOOLS: readonly string[] = ["Glob", "Grep", "Read", "WebFetch"];
export const RESET_TOOLS: readonly string[] = ["Agent", "Edit", "NotebookEdit", "Write"];
export const SHELL_TOOLS: readonly string[] = ["Bash", "PowerShell"];
// The `export` and `cd` a session chains ahead of its command, each stripped as one leading segment
export const LEADING_SEGMENT_REGEX = /^\s*(?:export\s[^&;]*&&|cd\s[^&;]*&&|cd\s[^&;]*;)\s*/u;
// The commands that only read, a whole first word each so `catalog` is not `cat`. No interpreter is one, since what
// It runs may write as readily as read; PowerShell's cmdlets are matched in any case, as PowerShell matches them
export const LOOKUP_COMMAND_REGEX =
  /^\s*(?:cat|sed|grep|rg|find|ls|head|tail|awk|wc|get-content|get-childitem|select-string|git\s+(?:show|log|diff)|gh\s+run\s+view)(?:\s|$)/iu;
// Every third lookup in a row, the chain a haiku agent should answer as one bounded question
export const DELEGATION_NUDGE_EVERY = 3;
export const DELEGATION_NUDGE =
  "Third lookup in a row with no decision between them: by the llm-delegation skill's hop rule this chain goes to a haiku agent as one bounded question.";
