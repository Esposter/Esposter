// A thunk a probed kit module adds as it evaluates a span, by the id of the site it reads
export type KitProbeEntry = [siteId: string, thunk: () => unknown];
