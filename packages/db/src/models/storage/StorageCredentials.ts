// The R2 token a presigned url is signed with, the account whose S3 endpoint that url is for, and the prefix the account's
// bucket names carry: `dev-` in a development account, empty in production. A binding names a bucket without it, since
// the binding is declared per environment, but the S3 endpoint takes the full name
export interface StorageCredentials {
  accessKeyId: string;
  accountId: string;
  bucketPrefix: string;
  secretAccessKey: string;
}
