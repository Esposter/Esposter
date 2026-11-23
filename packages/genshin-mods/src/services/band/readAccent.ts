import type { EngineInterface } from "claude-code";

import { read } from "claude-code";

import { ACCENT_COLOR } from "../constants";

// The session character's colour, which the persona publishes, else the game's interface gold
// A declaration, not an arrow: the hooks module's bundle
// oxlint-disable-next-line func-style -- follows an imported helper that takes `$` only into a function declaration
export async function readAccent($: EngineInterface): Promise<string> {
  return (await read($, { key: "character", plugin: "genshin-persona" } as const))?.color || ACCENT_COLOR;
}
