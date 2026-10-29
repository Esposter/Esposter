// The screen folders with no fixture yet, each named with the reason it has no reference, so the coverage test reads the list
// without loading the Vue components the screen list imports
export const pendingScreens: { directory: string; reason: string }[] = [
  { directory: "Achievement/Screen", reason: "no reference sampled yet" },
  { directory: "Archive/Screen", reason: "no reference sampled yet" },
  { directory: "Domain/Screen", reason: "no reference sampled yet" },
  { directory: "Fishing/Screen", reason: "no reference sampled yet" },
  { directory: "Mail/Screen", reason: "no reference sampled yet" },
  { directory: "Menu/Screen", reason: "no reference sampled yet" },
  { directory: "PaimonsBargains/Screen", reason: "no reference sampled yet" },
  { directory: "Party/Screen", reason: "no reference sampled yet" },
  { directory: "Shop/Screen", reason: "no reference sampled yet" },
  { directory: "Statue/Screen", reason: "no reference sampled yet" },
];
