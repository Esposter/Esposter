// The account and the R2 S3 keys a client signs its requests with. Read from the environment and never written to disk
export interface R2Credentials {
  accessKeyId: string;
  accountId: string;
  secretAccessKey: string;
}
