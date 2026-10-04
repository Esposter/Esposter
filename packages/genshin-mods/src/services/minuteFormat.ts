// Whole minutes as the band writes them, `12m`
export const minuteFormat: Intl.NumberFormat = new Intl.NumberFormat("en", {
  style: "unit",
  unit: "minute",
  unitDisplay: "narrow",
});
