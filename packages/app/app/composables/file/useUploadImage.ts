import { getSingleFileSasEntities } from "@/services/file/getSingleFileSasEntities";
import { uploadFileToSas } from "@/services/file/uploadFileToSas";
import { withFinalizerAsync } from "@esposter/shared";

// The profile-image upload every surface that has one performs: mint a SAS for the single file, put it there,
// And hand back the public url the caller stores. The url is returned rather than written, because each caller
// Owns a different model — the store's flag is what they actually share, and it has to clear on a failed upload
// As well as a successful one, which is the half that gets forgotten when this is written out by hand
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
