import type { ResourceRouter } from "@/models/resource/ResourceRouter";
import type { ResourceType } from "@esposter/db-schema";

import { uncapitalize } from "@esposter/shared";
// The one dispatch from a resource type to its procedures. Every type's router is named after it, so the key is
// The type itself rather than a map that has to be kept in step with the routers
export const useResourceRouter = () => {
  const { $trpc } = useNuxtApp();
  return <TType extends ResourceType>(type: TType): ResourceRouter<TType> => $trpc[uncapitalize(type)];
};
