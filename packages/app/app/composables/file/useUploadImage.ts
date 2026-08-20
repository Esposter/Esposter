import { getSingleFileSasEntities } from "@/services/file/getSingleFileSasEntities";
import { uploadFileToSas } from "@/services/file/uploadFileToSas";
import { withFinalizerAsync } from "@esposter/shared";

// Mints a SAS for the single file, puts it there, and hands back the public url — returned rather than written,
// Because each caller owns a different model. `isLoading` clears on a failed upload as well as a successful one
export const useUploadImage = (generateUploadUrl: () => Promise<{ publicUrl: string; sasUrl: string }>) => {
  const isLoading = ref(false);
  const uploadImage = async (file: File, finalizer?: () => void) =>
    withFinalizerAsync(
      async () => {
        isLoading.value = true;
        const { publicUrl, sasUrl } = await generateUploadUrl();
        await uploadFileToSas({ files: [file], generateUploadFileSasEntities: getSingleFileSasEntities(sasUrl) });
        return publicUrl;
      },
      () => {
        isLoading.value = false;
        finalizer?.();
      },
    );
  return { isLoading, uploadImage };
};
