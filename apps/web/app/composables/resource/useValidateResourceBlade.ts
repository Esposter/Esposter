import type { Resource } from "@esposter/db-schema";

import { checkIsValidResourceBlade } from "@/services/resource/checkIsValidResourceBlade";
import { getRouteParamString } from "@/util/router/getRouteParamString";

// Per-type blade slugs need the loaded resource's type, so the blade is 404-guarded after load rather than in the
// Page's validate, and watched because blade switches reuse the page instance
export const useValidateResourceBlade = (resource: Ref<Resource | undefined>, activeBlade: Ref<string>) => {
  const { currentRoute } = useRouter();
  watchImmediate([activeBlade, resource], ([newActiveBlade, newResource]) => {
    // A swap to another resource keeps the page it leaves mounted until the next one's setup resolves, and the
    // Route it reads already names the next resource's blade — judged against the resource still loaded, a blade
    // Only the next one's type has would 404 the page on its way out
    if (!newResource || newResource.id !== getRouteParamString(currentRoute.value.params.id)) return;

    if (!checkIsValidResourceBlade(newResource.type, newActiveBlade))
      showError(createError({ statusCode: 404, statusMessage: "Resource blade not found" }));
  });
};
