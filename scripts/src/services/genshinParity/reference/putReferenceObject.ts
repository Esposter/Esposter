import type { ReferenceObjectTarget } from "#src/models/genshinParity/reference/ReferenceObjectTarget";

// Stores one object from the file at `localPath` in every account that does not hold it, checking each account first so
// an object is never uploaded twice. Returns how many accounts it uploaded to
export const putReferenceObject = async (
  blobName: string,
  localPath: string,
  targets: ReferenceObjectTarget[],
): Promise<number> => {
  const uploads = await Promise.all(
    targets.map(async (target): Promise<number> => {
      if (await target.exists(blobName)) return 0;
      await target.upload(blobName, localPath);
      return 1;
    }),
  );
  return uploads.reduce((total, count) => total + count, 0);
};
