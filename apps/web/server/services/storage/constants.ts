// How long a browser or the edge keeps a public object. Short enough that a replaced object (a profile image written under
// the same name) reaches its readers within the hour, long enough that a page of assets is fetched once per visit
export const PUBLIC_ASSET_CACHE_MAX_AGE_SECONDS = Temporal.Duration.from({ hours: 1 }).total("seconds");
