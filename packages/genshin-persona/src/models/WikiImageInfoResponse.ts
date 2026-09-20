// The part of the wiki's imageinfo query the plugin reads, spelled as the API spells it: the pages by id, and how
// The titles asked for were normalised to the ones answered under
export interface WikiImageInfoResponse {
  query?: {
    normalized?: { from?: string; to?: string }[];
    pages?: Record<string, { imageinfo?: { url?: string }[]; title?: string }>;
  };
}
