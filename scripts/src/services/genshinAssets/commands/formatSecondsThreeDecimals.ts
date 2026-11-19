// A duration in milliseconds as seconds to three decimal places
export const formatSecondsThreeDecimals = (milliseconds: number): string => `${(milliseconds / 1000).toFixed(3)} s`;
