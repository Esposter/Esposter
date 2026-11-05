import type { SearchClient } from "@azure/search-documents";

// An API key or an Entra ID token, whichever a search client is built to authenticate with
export type SearchCredential = ConstructorParameters<typeof SearchClient>[2];
