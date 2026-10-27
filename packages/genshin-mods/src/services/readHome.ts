import type { EngineInterface } from "claude-code";

// The person's home folder, read from the engine's environment: HOME where it is set, else the Windows profile folder
// oxlint-disable-next-line func-style -- A declaration, not an arrow: the hooks module's bundle follows an imported helper that takes `$` only into a function declaration
export async function readHome($: EngineInterface): Promise<string> {
  return (await $.env.get("HOME")) ?? (await $.env.get("USERPROFILE")) ?? "";
}
