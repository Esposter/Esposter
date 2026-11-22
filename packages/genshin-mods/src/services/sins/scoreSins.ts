import type { EngineInterface } from "claude-code";

import { atom, read, update } from "claude-code";

import { InitialState } from "../InitialState";
import { SinStatusKind } from "../models/SinStatusKind";
import { readHome } from "../readHome";
import { veilText } from "../veil/veilText";
import { appendSinEvidence } from "./appendSinEvidence";
import { SINS_API_URL, SINS_TIMEOUT_MS } from "./constants";
import { getSinQuestions } from "./getSinQuestions";
import { parseSinsResult } from "./parseSinsResult";
import { readTypeSafeKey } from "./readTypeSafeKey";
import { SINS_SCRIPT } from "./sinsScript";

const enabledModsAtom = atom({ key: "enabledMods", plugin: "genshin-mods" } as const, InitialState.enabledMods);
const sinHistoryAtom = atom({ key: "sinHistory", plugin: "genshin-mods" } as const, InitialState.sinHistory);
const sinSessionAtom = atom({ key: "sinSession", plugin: "genshin-mods" } as const, InitialState.sinSession);
const sinStatusAtom = atom({ key: "sinStatus", plugin: "genshin-mods" } as const, InitialState.sinStatus);
// The sins are scored beside the prompt's turn, never in front of it: the call and the evidence log run in the plugin's
// Node script, and a run that fails, or a machine that cannot open the log, records nothing and says why in the band
// oxlint-disable-next-line func-style -- A declaration, not an arrow: the hooks module's bundle follows an imported helper that takes `$` only into a function declaration
export async function scoreSins($: EngineInterface, text: string, typeSafeKey: string): Promise<void> {
  if (!(await read($, enabledModsAtom)).sins) return;

  const key = await readTypeSafeKey($, typeSafeKey);
  if (!key) {
    await update($, sinStatusAtom, () => SinStatusKind.NoKey);
    return;
  }

  const session = (await read($, sinSessionAtom)) || (await $.clock.now());
  await update($, sinSessionAtom, () => session);
  const home = await readHome($);
  const [outcome] = await Promise.allSettled([
    $.process.run(["node", "--input-type=module", "-e", SINS_SCRIPT], {
      stdin: JSON.stringify({
        apiUrl: SINS_API_URL,
        key,
        questions: getSinQuestions(),
        session,
        state: veilText(text),
        storePath: `${home}/.claude/genshin-mods/sins.sqlite`,
      }),
      timeoutMs: SINS_TIMEOUT_MS,
    }),
  ]);
  const result =
    outcome.status === "fulfilled" && outcome.value.exitCode === 0
      ? parseSinsResult(outcome.value.stdout)
      : { result: SinStatusKind.Failed };
  // A `/clear` or a resume during the run has reset the session, and a switch turned off has turned the mod off, so this
  // Run's answers belong to nothing shown
  const sessionNow = await read($, sinSessionAtom);
  const { sins: isSinsEnabled } = await read($, enabledModsAtom);
  if (sessionNow !== session || !isSinsEnabled) return;

  if (result.result === SinStatusKind.Answered)
    await update($, sinHistoryAtom, (history) => appendSinEvidence(history, result.answers));

  await update($, sinStatusAtom, () => result.result);
}
