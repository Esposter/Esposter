// Native Intl API singletons — constructing these is expensive, so they are created once and shared
export const COMPACT_NUMBER_FORMATTER = new Intl.NumberFormat(undefined, { notation: "compact" });
export const EN_US_COMPARATOR = new Intl.Collator("en-US");
export const EN_US_CONJUNCTION_FORMATTER = new Intl.ListFormat("en-US", { type: "conjunction" });
export const EN_US_DISJUNCTION_FORMATTER = new Intl.ListFormat("en-US", { type: "disjunction" });
export const EN_US_GRAPHEME_SEGMENTER = new Intl.Segmenter("en-US", { granularity: "grapheme" });
export const EN_US_PLURAL_RULES = new Intl.PluralRules("en-US");
export const EN_US_SEGMENTER = new Intl.Segmenter("en-US");
export const PERCENT_FORMATTER = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2, style: "percent" });
export const USD_CURRENCY_FORMATTER = new Intl.NumberFormat(undefined, { currency: "USD", style: "currency" });
