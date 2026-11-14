import type { R2Bucket } from "@cloudflare/workers-types";
import type { StorageBucket } from "@esposter/db-schema";

import { env } from "cloudflare:workers";

// A bucket's binding is named by the bucket: `message-assets` is MESSAGE_ASSETS, declared under that name in the
// Worker's config, so no binding name is spelled out anywhere else
const getBindingName = (storageBucket: StorageBucket) => storageBucket.replaceAll("-", "_").toUpperCase();

// Every bucket name has a binding declared for it, so the lookup is total over the enum
export const getBucket = (storageBucket: StorageBucket): R2Bucket => Reflect.get(env, getBindingName(storageBucket));
