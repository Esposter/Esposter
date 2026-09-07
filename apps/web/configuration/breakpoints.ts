/* eslint-disable perfectionist/sort-objects */
import type { DisplayThresholds } from "vuetify";

const breakpoints: DisplayThresholds = {
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1280,
  xl: 1920,
  xxl: 2560,
};

export const forVuetify = breakpoints;

export const forUnoCSS = Object.fromEntries(Object.entries(breakpoints).map(([key, value]) => [key, `${value}px`]));
