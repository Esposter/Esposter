// A push subscription's keys are base64url bytes of a fixed size — a 16-byte auth secret and a 65-byte P-256
// Public key — so these are their padded encodings, the longest form a browser hands over
export const PUSH_SUBSCRIPTION_AUTH_MAX_LENGTH = 24;
export const PUSH_SUBSCRIPTION_P256DH_MAX_LENGTH = 88;
