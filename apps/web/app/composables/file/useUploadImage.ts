import { getSingleFilePresignedUrlEntities } from "@/services/file/getSingleFilePresignedUrlEntities";
import { uploadFilesToPresignedUrls } from "@/services/file/uploadFilesToPresignedUrls";
import { withFinalizerAsync } from "@esposter/shared";

// Mints a presigned url for the single file, puts it there, and hands back the public url — returned rather than written,
// Because each caller owns a different model. `isLoading` clears on a failed upload as well as a successful one
export const useUploadImage = (generateUploadUrl: () => Promise<{ presignedUrl: string; publicUrl: string }>) => {
  const isLoading = ref(false);
  const uploadImage = (file: File, finalizer?: () => void) =>
    withFinalizerAsync(
      async () => {
        isLoading.value = true;
        const { presignedUrl, publicUrl } = await generateUploadUrl();
        await uploadFilesToPresignedUrls({
          files: [file],
          generateUploadFilePresignedUrlEntities: getSingleFilePresignedUrlEntities(presignedUrl),
        });
        return publicUrl;
      },
      () => {
        isLoading.value = false;
        finalizer?.();
      },
    );
  return { isLoading, uploadImage };
};
