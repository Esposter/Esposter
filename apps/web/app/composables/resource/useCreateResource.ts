import type { CreatableResourceType } from "@/services/resource/CreatableResourceTypes";

// Creation goes through the same type-to-router dispatch every other resource action does, so a new creatable
// Type is a router and a gallery entry rather than a third place listing every type
export const useCreateResource = () => {
  const getResourceRouter = useResourceRouter();
  return (type: CreatableResourceType, name: string) => getResourceRouter(type).createResource.mutate({ name });
};
