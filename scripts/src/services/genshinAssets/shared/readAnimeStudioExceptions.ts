// The exception lines in AnimeStudio's output. It catches what an asset throws, logs it and goes on, and still exits 0,
// So a run whose output names an exception skipped what threw — a native that fails on a block reads as a clean run
// Unless its exceptions are read off the output
const EXCEPTION_LINE_REGEX = /^.*\b[A-Z]\w*Exception\b.*$/gmu;

export const readAnimeStudioExceptions = (output: string): string[] => output.match(EXCEPTION_LINE_REGEX) ?? [];
