// The game's own interface gold, the accent wherever the persona publishes no character
export const ACCENT_COLOR = "#d3bc8e";
// The prompt cache's lifetime, which the engine chooses and does not report: an hour on a subscription
export const CACHE_LIFETIME_MS: number = Temporal.Duration.from({ hours: 1 }).total("milliseconds");
export const CACHE_LOW_MS: number = Temporal.Duration.from({ minutes: 10 }).total("milliseconds");
export const CACHE_WARNING_MS: number = Temporal.Duration.from({ minutes: 5 }).total("milliseconds");
export const CLOCK_TICK_MS: number = Temporal.Duration.from({ minutes: 1 }).total("milliseconds");
export const USAGE_WARNING_PERCENTAGE = 80;
export const MAX_WAYPOINTS = 3;
export const MAX_SHOWN_TASKS = 8;
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
