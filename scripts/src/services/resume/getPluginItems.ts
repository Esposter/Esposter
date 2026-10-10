import type { ResumeItem } from "#src/models/resume/ResumeItem";

// The marketplace's plugins the user has not installed, keyed `<plugin>@<marketplace>` as Claude Code records them
export const getPluginItems = (
  marketplaceName: string,
  pluginNames: readonly string[],
  installedKeys: readonly string[],
): ResumeItem[] =>
  pluginNames
    .map((pluginName) => `${pluginName}@${marketplaceName}`)
    .filter((key) => !installedKeys.includes(key))
    .map((key) => ({ action: `claude plugin install ${key} --scope user`, text: `${key} missing` }));
