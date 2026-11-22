import type { EngineInterface } from "claude-code";

// The engine's theme row names a light theme with "light" in it, and any other theme reads as dark
// oxlint-disable-next-line func-style -- A declaration, not an arrow: the hooks module's bundle follows an imported helper that takes `$` only into a function declaration
export async function readIsLightTheme($: EngineInterface): Promise<boolean> {
  const theme = (await $.config.list()).find(({ key }) => key === "theme");
  return String(theme?.value ?? "").includes("light");
}
