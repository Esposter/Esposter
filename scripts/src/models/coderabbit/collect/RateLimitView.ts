import type { RateLimitResource } from "#src/models/coderabbit/collect/RateLimitResource";

// GitHub's `rate_limit` body, one quota per resource — REST's `core`, `graphql`, `search` and the rest. A probe a
// Secondary limit refused answers with an error body instead, which holds none
export interface RateLimitView {
  resources?: Record<string, RateLimitResource>;
}
