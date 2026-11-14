// R2 takes "auto" as its region, and its S3 API answers as the "s3" service
export const R2_REGION = "auto";
export const R2_SERVICE = "s3";
// The payload is not hashed: R2 takes it unsigned, which aws4fetch already sends for S3 unless told otherwise
export const R2_UNSIGNED_PAYLOAD = "UNSIGNED-PAYLOAD";
export const R2_CONTENT_TYPE_JSON = "application/json";
export const HTTP_NOT_FOUND = 404;
