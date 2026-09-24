import type { CreatableResourceType } from "@/models/resource/CreatableResourceType";

import { CreatableResourceTypes } from "@/models/resource/CreatableResourceType";

export const checkIsCreatableResourceType = (value: string): value is CreatableResourceType =>
  CreatableResourceTypes.some((type) => type === value);
