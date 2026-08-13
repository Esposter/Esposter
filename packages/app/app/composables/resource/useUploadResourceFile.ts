import type { FileAssetsResourceType } from "#shared/models/resource/FileAssetsResourceType";

import { getFilesDirectoryName } from "#shared/services/resource/getFilesDirectoryName";
import { getResourceAssetUrl } from "#shared/services/resource/getResourceAssetUrl";
import { uploadFileToSas } from "@/services/file/uploadFileToSas";
import { ID_SEPARATOR, takeOne } from "@esposter/shared";
// The FileAssets round-trip for one file: upload through a SAS entity, then hand back the stable asset url
// The editor embeds — reads resolve through /api/resource-assets, so content never carries a signature.
// Only a FileAssets type can upload, so the capability is the parameter type rather than a check that throws
export const useUploadResourceFile = (type: FileAssetsResourceType, id: MaybeRefOrGetter<string>) => {
  const getResourceRouter = useResourceRouter();
  return async (file: File) => {
    const { generateUploadFileSasEntities } = getResourceRouter(type);
    const idValue = toValue(id);
    const { id: fileId } = takeOne(
      await uploadFileToSas({
        files: [file],
        generateUploadFileSasEntities: (files) => generateUploadFileSasEntities.query({ files, id: idValue }),
      }),
    );
    return getResourceAssetUrl(`${getFilesDirectoryName(idValue)}/${fileId}${ID_SEPARATOR}${file.name}`);
  };
};
