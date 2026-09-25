/* eslint-disable perfectionist/sort-objects -- smallest first, the order the thresholds apply */
export const BREAKPOINTS = {
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1280,
  xl: 1920,
  xxl: 2560,
} as const;

export const UNOCSS_BREAKPOINTS = Object.fromEntries(
  Object.entries(BREAKPOINTS).map(([key, value]) => [key, `${value}px`]),
);
