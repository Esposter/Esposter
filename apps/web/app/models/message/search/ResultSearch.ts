import type { SearchMessagesInput } from "#shared/models/db/message/SearchMessagesInput";

// The search a room's results were read for, held beside them so a continuation is read for that search
export type ResultSearch = Pick<SearchMessagesInput, "filters" | "query">;
