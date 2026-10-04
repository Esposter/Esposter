import type { EngineInterface, Register } from "claude-code";

import { atom, read, update } from "claude-code";

import type { PersonaSpinner, PersonaStatus } from "../types";

import { hashString } from "../src/util/hashString";
import { CardVerbs, VerbDescriptionMap } from "./VerbDescriptionMap";

// The persona's surfaces drawn by the engine itself, so nothing is written into the person's settings: a spinner and
// A hint of this session's own character, its colour published for the mods, the spoken replies and one command per
// Verb. Every read of game data, state or audio is the plugin's node scripts, run as commands, since a hooks module
// Has no Node
const characterAtom = atom({ key: "character", plugin: "genshin-persona" } as const, {
  color: "",
  displayName: "",
  name: "",
});
const isCharacterRecordedAtom = atom({ key: "isCharacterRecorded", plugin: "genshin-persona" } as const, false);
const spinnerAtom = atom({ key: "spinner", plugin: "genshin-persona" } as const, { label: "", tips: [], verbs: [] });
const tipIndexAtom = atom({ key: "tipIndex", plugin: "genshin-persona" } as const, 0);
// The spinner's lines cost the data package or the wiki on a first read, so its script gets the longest run allowed
const SPINNER_TIMEOUT_MS = Temporal.Duration.from({ minutes: 10 }).total("milliseconds");

const readStateDirectory = async ($: EngineInterface) => {
  const home = (await $.env.get("HOME")) ?? (await $.env.get("USERPROFILE")) ?? "";
  return `${home}/.claude/genshin-persona`;
};

// The session's character, from the record its start hook wrote, else the pin, else the birthday pick; the spinner
// Is read again only when the character or the language that spells them changed
const refresh = async ($: EngineInterface) => {
  const sessionId = await $.session.id();
  const status = await $.process.run(["node", `${$.plugin.root}/scripts/status.mjs`], {
    stdin: JSON.stringify({ session_id: sessionId }),
  });
  if (!status.stdout.trim()) return;
  // oxlint-disable-next-line no-restricted-properties -- The plugin's own script prints this shape, with no date in it, and a mod cannot import the shared reviver
  const { character, isRecorded } = JSON.parse(status.stdout) as PersonaStatus;
  await update($, isCharacterRecordedAtom, () => isRecorded);
  const previous = await read($, characterAtom);
  await update($, characterAtom, () => character);
  if (previous.name === character.name && previous.displayName === character.displayName) return;

  const spinner = await $.process.run(["node", `${$.plugin.root}/scripts/spinner.mjs`, character.name], {
    timeoutMs: SPINNER_TIMEOUT_MS,
  });
  // oxlint-disable-next-line no-restricted-properties -- The plugin's own script prints this shape, with no date in it, and a mod cannot import the shared reviver
  if (spinner.stdout.trim()) await update($, spinnerAtom, () => JSON.parse(spinner.stdout) as PersonaSpinner);
};

// Off the dispatch that asked, so neither the session's start nor a verb's answer waits on a node start
const refreshLater = ($: EngineInterface) => {
  $.clock.after(0, () => {
    // oxlint-disable-next-line typescript/no-floating-promises -- The engine's timer slot takes no promise
    refresh($);
  });
};

export const register: Register = (on) => {
  on("session.start", async ($, e, next) => {
    await Promise.all(
      Object.entries(VerbDescriptionMap).map(([verb, description]) =>
        $.command.register({ argumentHint: "[name or value]", description, name: `genshin-${verb}` }),
      ),
    );
    refreshLater($);
    return next(e);
  });

  // Each verb runs the plugin's own script in this session, which the script reads off the environment, and the
  // Character it may have switched is read again behind the answer
  for (const verb of Object.keys(VerbDescriptionMap))
    on("command.run", { command: `genshin-${verb}` }, async ($, e) => {
      const sessionId = await $.session.id();
      const { stderr, stdout } = await $.process.run(
        ["node", `${$.plugin.root}/scripts/genshin.mjs`, verb, ...e.args.split(" ").filter(Boolean)],
        { env: { CLAUDE_CODE_SESSION_ID: sessionId } },
      );
      refreshLater($);
      const text = [stdout, stderr].filter(Boolean).join("\n").trim();
      return CardVerbs.some((cardVerb) => cardVerb === verb)
        ? { context: ["Answer as the card this printed from this reply on."], text }
        : { text };
    });

  // A `/clear` or a resume carries on under another session id with no `session.start` for it, and the start hook
  // Picks for that id, so the character is unsettled again until its record is read
  on("session.end", async ($, e, next) => {
    if (e.reason === "clear" || e.reason === "resume") await update($, isCharacterRecordedAtom, () => false);
    return next(e);
  });

  // The character is read again at each turn's start until the start hook's record exists, since the pick may land
  // After the session start's first read
  on("turn.start", async ($, e, next) => {
    if (!(await read($, isCharacterRecordedAtom))) refreshLater($);
    return next(e);
  });

  on("turn.complete", async ($, e, next) => {
    const result = await next(e);
    if (e.agentId === undefined) await update($, tipIndexAtom, (index) => index + 1);
    return result;
  });

  // The engine samples a word per turn; the same word always maps to the same verb of this session's character
  on("ui.render", { component: "Spinner" }, async ($, e, next) => {
    const { verbs } = await read($, spinnerAtom);
    if (verbs.length === 0 || e.props.message !== null) return next(e);
    const word = verbs[hashString(e.props.word) % verbs.length] ?? e.props.word;
    return next({ ...e, props: { ...e.props, word } });
  });

  on("ui.render", { component: "PromptHint" }, async ($, e, next) => {
    const { label, tips } = await read($, spinnerAtom);
    const tip = tips[(await read($, tipIndexAtom)) % Math.max(tips.length, 1)];
    if (!tip || e.props.isDraft) return next(e);
    return next({ ...e, props: { ...e.props, tail: `${label}: ${tip}` } });
  });

  // The character named among the footer's mode labels, where a standing word about the session belongs: the status
  // Line is a settings command no plugin can set, and a label added to `modes` leaves every other plugin's in place
  on("ui.render", { component: "SessionMode" }, async ($, e, next) => {
    const { displayName } = await read($, characterAtom);
    if (!displayName) return next(e);
    return next({ ...e, props: { ...e.props, modes: [...e.props.modes, displayName] } });
  });

  // Every flushed piece of a reply, handed to the speak script as the settings hook handed it; a session with no
  // Voice set up, or muted, pays a file check and no node start
  on("classic.MessageDisplay", async ($, e, next) => {
    const stateDirectory = await readStateDirectory($);
    const isSpeaking =
      (await $.fs.exists(`${stateDirectory}/voice-language`)) && !(await $.fs.exists(`${stateDirectory}/muted`));
    if (isSpeaking) await $.process.run(["node", `${$.plugin.root}/scripts/speak.mjs`], { stdin: JSON.stringify(e) });
    return next(e);
  });
};
