import { readHeldCommits } from "#src/services/coderabbit/collect/readHeldCommits";

// The commits the held branches carry (`parkCommits`), as the last fetch saw them
export const readHeldTipShas = (cwd?: string): string[] => readHeldCommits(cwd).map(({ sha }) => sha);
