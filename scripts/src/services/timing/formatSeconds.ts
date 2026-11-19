// A duration in seconds to one decimal place and its unit, as the phase lines and the slow-run warning print it
export const formatSeconds = (milliseconds: number): string => `${(milliseconds / 1000).toFixed(1)}s`;
