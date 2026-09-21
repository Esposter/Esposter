/* eslint-disable perfectionist/sort-objects */
import type { DisplayThresholds } from "vuetify";

export const BREAKPOINTS: DisplayThresholds = {
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1280,
  xl: 1920,
  xxl: 2560,
};

export const UNOCSS_BREAKPOINTS = Object.fromEntries(
  Object.entries(BREAKPOINTS).map(([key, value]) => [key, `${value}px`]),
);
