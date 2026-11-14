import type { StorageBucket } from "@esposter/db-schema";

// The stable url a public bucket's object is served at, through the web Worker's asset route. A row stores this url, so
// it is built here and nowhere else: a bucket's name is the path segment, and the key is encoded one segment at a time
export const getPublicAssetUrl = (storageBucket: StorageBucket, key: string) =>
  `${process.env.PUBLIC_ASSETS_BASE_URL}/${storageBucket}/${key.split("/").map(encodeURIComponent).join("/")}`;
