// The headers a request to GitHub's API takes: its token, when one is set, which lifts the anonymous limit of 60 requests
// An hour to 5000. Only the API is sent it, never the raw files the dump downloads
export const readGitHubHeaders = (token: string | undefined): Record<string, string> | undefined =>
  token ? { Authorization: `Bearer ${token}` } : undefined;
