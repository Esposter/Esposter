import { AzureContainer } from "#shared/models/azure/blob/AzureContainer";
import { PROFILE_FILENAME } from "#shared/services/user/constants";
import { authClient } from "@/services/auth/authClient";

export const useProfileImageUrl = async () => {
  const runtimeConfig = useRuntimeConfig();
  const { data: session } = await authClient.useSession(useFetch);
  return computed(() =>
    session.value
      ? `${runtimeConfig.public.azure.blobUrl}/${AzureContainer.UserAssets}/${session.value.user.id}/${PROFILE_FILENAME}`
      : null,
  );
};
