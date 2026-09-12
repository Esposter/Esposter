import type { VMenu, VTooltip } from "vuetify/components";

// The app bar's height as the layout's fixed regions consume it — a css variable rather than the number, so a
// Region's box is resolved by the browser against whatever the bar currently measures
export const APP_BAR_CSS_VALUE = "var(--app-bar-height)";
export const SHOW_SCROLL_TO_TOP_OFFSET = 200;
// The app bar's controls open downward from a bar that sits at the top, so each one states the same two things
export const APP_BAR_MENU_PROPS: VMenu["$props"] = { closeOnContentClick: false, location: "bottom start" };
export const APP_BAR_TOOLTIP_PROPS: VTooltip["$props"] = { location: "bottom" };
