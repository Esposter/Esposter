import type { SearchOptions } from "@azure/search-documents";
import type { MessageEntity } from "@esposter/db-schema";

export interface ReadMessageSearchDocumentsOptions extends Pick<
  SearchOptions<MessageEntity>,
  "filter" | "orderBy" | "searchFields"
> {
  limit: number;
  offset: number;
  // Azure Search reads an empty query as "match nothing" rather than "match everything", so a caller filtering
  // On structure alone (the room's Files tab, a member's sent messages) still has to ask for the match-all
  query?: string;
}
