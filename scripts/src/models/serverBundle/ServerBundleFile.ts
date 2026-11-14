// One file a Worker would load as code: its size in bytes, and its path under the server output
export interface ServerBundleFile {
  bytes: number;
  file: string;
}
