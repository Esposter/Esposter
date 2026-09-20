// The part of the wiki's parse API response the plugin reads, spelled as the API spells it
export interface WikiParseResponse {
  parse?: {
    wikitext?: {
      "*"?: string;
    };
  };
}
