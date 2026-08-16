// The sort-by query parameter's own separator, deliberately not the shared ID_SEPARATOR: this string is a url
// Format that lives in saved links and bookmarks, so it has a compatibility contract an internal key does not
// And must stay free to diverge
export const RESOURCE_SORT_BY_SEPARATOR = ":";
