import { EN_US_PLURAL_RULES } from "#shared/services/intl/constants";

export const pluralize = (word: string, count = 2) => (EN_US_PLURAL_RULES.select(count) === "one" ? word : `${word}s`);
