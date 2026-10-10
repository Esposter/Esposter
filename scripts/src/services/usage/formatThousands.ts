// An average turn's context in thousands of tokens, the way the usage table reads it
export const formatThousands = (tokens: number): string => `${Math.round(tokens / 1000)}K`;
