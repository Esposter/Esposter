export const BOOLEAN_VALUES = new Set(["false", "true"]);
export const DATE_FORMATS = [
  // Slash-separated: DD first, then MM, then YYYY-leading
  "D/M/YYYY",
  "DD/MM/YYYY",
  "M/D/YYYY",
  "MM/DD/YYYY",
  "YYYY/MM/DD",
  // Dash-separated: DD first, then MM, then YYYY-leading
  "DD-MM-YYYY",
  "MM-DD-YYYY",
  "YYYY-MM-DD",
  // ISO datetime
  "YYYY-MM-DDTHH:mm:ss",
  "YYYY-MM-DDTHH:mm:ssZ",
];
