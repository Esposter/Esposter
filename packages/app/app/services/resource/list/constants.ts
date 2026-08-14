// The sort-by query parameter's own separator, deliberately not the shared composite-key one: this string is a
// Url format that lives in saved links and bookmarks, so it has a compatibility contract an internal key does
// Not — the two happen to be the same character and must stay free to diverge
export const RESOURCE_SORT_BY_SEPARATOR = ":";
