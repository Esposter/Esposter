// The signed transport to the account's R2 S3 API: the endpoint every bucket's URL sits under, and a fetch that signs
// Each request With the account's R2 token
export interface R2Transport {
  endpoint: string;
  fetch: (url: string, init?: RequestInit) => Promise<Response>;
}
