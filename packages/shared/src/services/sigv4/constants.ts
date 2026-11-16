export const SIGV4_ALGORITHM = "AWS4-HMAC-SHA256";
// The last component of a credential scope, which every SigV4 signing key is derived for
export const SIGV4_SCOPE_TERMINATOR = "aws4_request";
// S3 accepts a payload left out of the signature, so a body is streamed as it is rather than read and hashed first
export const UNSIGNED_PAYLOAD = "UNSIGNED-PAYLOAD";
export const SIGV4_CONTENT_SHA256_HEADER = "X-Amz-Content-Sha256";
// The longest a presigned URL may live, which S3 and R2 both refuse past
export const MAX_PRESIGNED_URL_EXPIRES_MS: number = 7 * 24 * 60 * 60 * 1000;
// A 5xx or a 429 is retried this many times, each wait drawn at random below a ceiling that doubles from the first
export const SIGV4_FETCH_RETRY_COUNT = 10;
export const SIGV4_FETCH_FIRST_RETRY_CEILING_MS = 50;
