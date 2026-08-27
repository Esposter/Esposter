import { EN_US_PLURAL_RULES } from "#shared/services/intl/constants";

// The plural is spelled out only where suffixing an `s` is wrong — the count rule stays in one place either way
export const pluralize = (word: string, count = 2, plural = `${word}s`) =>
  EN_US_PLURAL_RULES.select(count) === "one" ? word : plural;
