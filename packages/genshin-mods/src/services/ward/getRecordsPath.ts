import type { EngineInterface } from "claude-code";

// One file every session on the machine reads afresh, beside the persona's state, so an edit made a moment ago in
// Another session is always seen
export const getRecordsPath = async ($: EngineInterface): Promise<string> => {
  const home = (await $.env.get("HOME")) ?? (await $.env.get("USERPROFILE")) ?? "";
  return `${home}/.claude/genshin-mods/ward.json`;
};
