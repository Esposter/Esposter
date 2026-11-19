import { SITE_NAME } from "#shared/services/app/constants";

// @unocss-include
export const MAX_HISTORY_SIZE = 50;
// The palette group every sheet command is listed under
export const SHEET_COMMAND_GROUP = "Sheet";
// The sheet's own clipboard format, carrying the exact values a copy made. The browser names a custom format with a
// `web ` prefix, and a paste reads it back before the text, which a spreadsheet's paste reads instead
export const SHEET_CLIPBOARD_MIME_TYPE = `application/x-${SITE_NAME.toLowerCase()}-sheet+json`;
export const SHEET_CLIPBOARD_TYPE = `web ${SHEET_CLIPBOARD_MIME_TYPE}`;
// A value far from its column's mean, tinted in the warning colour
export const OUTLIER_HIGHLIGHT_CLASS = "bg-warning/25";
export const OUTLIER_STANDARD_DEVIATION_MULTIPLIER = 2;
