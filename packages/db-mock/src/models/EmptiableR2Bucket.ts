// The two calls emptying a bucket makes. The Workers binding and Miniflare's bucket both answer them, so either can be emptied
export interface EmptiableR2Bucket {
  delete: (keys: string[]) => Promise<unknown>;
  list: (options: { cursor?: string }) => Promise<{ cursor?: string; objects: { key: string }[]; truncated: boolean }>;
}
