// Tokens in millions to one decimal, the way the usage table reads them at a glance
export const formatMillions = (tokens: number): string => `${(tokens / 1_000_000).toFixed(1)}M`;
