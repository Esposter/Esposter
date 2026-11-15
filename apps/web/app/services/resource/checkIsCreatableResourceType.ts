import type { CreatableResourceType } from "#src/models/resource/CreatableResourceType";

import { CreatableResourceTypes } from "#src/models/resource/CreatableResourceType";

export const checkIsCreatableResourceType = (value: string): value is CreatableResourceType =>
  CreatableResourceTypes.some((type) => type === value);
