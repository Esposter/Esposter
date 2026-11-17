// Word boundaries as the runtime's own segmenter draws them, pinned to one locale so a count reads the same for every reader
export const EN_US_WORD_SEGMENTER: Intl.Segmenter = new Intl.Segmenter("en-US", { granularity: "word" });
