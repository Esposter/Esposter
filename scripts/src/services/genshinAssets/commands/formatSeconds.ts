// A duration in milliseconds as seconds to three decimal places
export const formatSeconds = (milliseconds: number): string => `${(milliseconds / 1000).toFixed(3)} s`;
