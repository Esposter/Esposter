// What a SigV4 signature is made with: the key pair, and the scope its signing key is derived for. R2's S3 API signs as
// The `s3` service in the `auto` region
export interface SigV4Credentials {
  accessKeyId: string;
  region: string;
  secretAccessKey: string;
  service: string;
}
