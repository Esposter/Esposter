import { UiStyle } from "../app/models/ui/UiStyle.ts";

// Where Nitro serves the Temporal polyfill from its own install and where the document head loads it. Two configs
// Name the one path, and a head script pointed anywhere else is a 404 only a browser without Temporal ever sees
export const TEMPORAL_POLYFILL_BASE_URL = "polyfills/temporal";
// How much of the accent standard's tonal button mixes over whatever it sits on. The palette test composes the same
// Mix over every surface to hold its label at AA
export const STANDARD_TONAL_MIX_PERCENTAGE = 12;
// The style a reader with no cookie gets
export const DEFAULT_UI_STYLE = UiStyle.Standard;
