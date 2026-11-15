// The HTTP method a presigned storage url is signed for, one value per request the url can answer
export const PresignedUrlMethod = { Get: "GET", Put: "PUT" } as const;
export type PresignedUrlMethod = (typeof PresignedUrlMethod)[keyof typeof PresignedUrlMethod];
