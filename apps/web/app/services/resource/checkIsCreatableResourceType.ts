import type { CreatableResourceType } from "@/services/resource/CreatableResourceTypes";

import { CreatableResourceTypes } from "@/services/resource/CreatableResourceTypes";

export const checkIsCreatableResourceType = (value: string): value is CreatableResourceType =>
  CreatableResourceTypes.some((type) => type === value);
