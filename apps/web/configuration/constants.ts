// Where Nitro serves the Temporal polyfill from its own install and where the document head loads it. Two configs
// Name the one path, and a head script pointed anywhere else is a 404 only a browser without Temporal ever sees
export const TEMPORAL_POLYFILL_BASE_URL = "polyfills/temporal";
