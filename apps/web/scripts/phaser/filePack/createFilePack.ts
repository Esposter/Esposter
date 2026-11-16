/* oxlint-disable no-await-in-loop -- Stop at the first: a missing object throws, and the objects behind it are not read */
import type { Types } from "phaser";

import { ContentTypePhaserMethodMap, PHASER_ROOT_DIRECTORY } from "#scripts/phaser/constants";
import { outputFile } from "#scripts/services/outputFile";
import { createValueSetString } from "#scripts/util/createValueSetString";
import { trimFileExtension } from "#src/util/file/trimFileExtension";
import formatterConfiguration from "@esposter/configuration/oxfmt";
import { listBucketObjects } from "@esposter/db";
import {
  CLOUDFLARE_ACCOUNT_ID,
  CloudflareAssetType,
  getCloudflareResourceName,
  StorageBucket,
} from "@esposter/db-schema";
import { createSigV4Fetch, InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync } from "node:fs";
import { format } from "oxfmt";

export const createFilePack = async () => {
  if (existsSync(".env")) process.loadEnvFile();
  const bucketUrl = `https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com/${getCloudflareResourceName(process.env.CLOUDFLARE_ENVIRONMENT, CloudflareAssetType.R2Bucket, StorageBucket.PublicDungeonsAssets)}`;
  const signedFetch = createSigV4Fetch({
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    region: "auto",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    service: "s3",
  });
  const files: Types.Loader.FileConfig[] = [];
  const fileKeys = new Set<string>();
  const valueSetName = "FileKey";

  // A listing carries no content type, so each object's type is read from its own headers
  for (const { key: name } of await listBucketObjects(signedFetch, bucketUrl)) {
    const response = await signedFetch(
      `${bucketUrl}/${name
        .split("/")
        .map((segment) => encodeURIComponent(segment))
        .join("/")}`,
      { method: "HEAD" },
    );
    if (!response.ok) throw new InvalidOperationError(Operation.Read, name, `responds ${response.status}`);

    const contentType = response.headers.get("Content-Type");
    if (!contentType) throw new InvalidOperationError(Operation.Read, "Content Type", `Missing Content Type: ${name}`);

    for (const [matchedContentType, phaserMethod] of Object.entries(ContentTypePhaserMethodMap))
      if (contentType.includes(matchedContentType)) {
        const key = trimFileExtension(name).replaceAll("/", "");
        if (fileKeys.has(key)) throw new InvalidOperationError(Operation.Push, valueSetName, `Duplicate key: ${key}`);

        fileKeys.add(key);
        files.push({ cache: false, key, type: phaserMethod, url: name });
      }
  }

  await Promise.all([
    outputFile(PHASER_ROOT_DIRECTORY, `${valueSetName}.ts`, createValueSetString(valueSetName, [...fileKeys])),
    (async () => {
      const { code } = await format("files.json", JSON.stringify(files), formatterConfiguration);
      await outputFile(PHASER_ROOT_DIRECTORY, "files.json", code);
    })(),
  ]);
};
