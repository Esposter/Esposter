import { getSingleFilePresignedUrlEntities } from "#src/services/file/getSingleFilePresignedUrlEntities";
import { uploadFilesToPresignedUrls } from "#src/services/file/uploadFilesToPresignedUrls";
import { withFinalizerAsync } from "@esposter/shared";

// Mints a presigned url for the single file, puts it there, and hands back the public url — returned rather than
// Written, because each caller owns a different model. `isLoading` clears on a failed upload as well as a successful
// One
export const useUploadImage = (
  generateUploadUrl: (file: File) => Promise<{ presignedUrl: string; publicUrl: string }>,
) => {
  const isLoading = ref(false);
  const uploadImage = (file: File, finalizer?: () => void) =>
    withFinalizerAsync(
      async () => {
        isLoading.value = true;
        // The url is signed to the file's own type and size, so the file is what asks for it
        const { presignedUrl, publicUrl } = await generateUploadUrl(file);
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
