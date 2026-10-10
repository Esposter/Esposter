import { readYamlList } from "#src/services/coderabbit/collect/readYamlList";

// The globs `reviews.path_filters` lists — a `!` before one leaves its paths out of the bot's review and its file count,
// And any without one narrows both to the paths it matches
export const readPathFilters = (coderabbitYamlText: string): string[] =>
  readYamlList(coderabbitYamlText.split("\n"), "path_filters");
