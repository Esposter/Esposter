import type { Types } from "phaser";

import { trimFileExtension } from "@/util/file/trimFileExtension";
import { ContentTypePhaserMethodMap, PHASER_ROOT_DIRECTORY } from "@@/scripts/phaser/constants";
import { outputFile } from "@@/scripts/services/outputFile";
import { createEnumString } from "@@/scripts/util/createEnumString";
import {
  CLOUDFLARE_ACCOUNT_ID,
  CloudflareAssetType,
  getCloudflareResourceName,
  StorageBucket,
} from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { AwsClient } from "aws4fetch";
import { existsSync } from "node:fs";
import { format } from "oxfmt";

import formatterConfiguration from "../../../../../oxfmt.config.ts";

const XML_ENTITY_CHARACTERS: Record<string, string> = { amp: "&", apos: "'", gt: ">", lt: "<", quot: '"' };

// The names of every object in the bucket, one ListObjectsV2 page after another. S3 writes that listing in one fixed
// Shape, so its tags are read directly, and a name's markup characters come back as the entities they were written as
const listObjectNames = async (client: AwsClient, bucketUrl: string, continuationToken?: string): Promise<string[]> => {
  const url = new URL(bucketUrl);
  url.searchParams.set("list-type", "2");
  if (continuationToken !== undefined) url.searchParams.set("continuation-token", continuationToken);
  const xml = await (await client.fetch(url)).text();
  const names = Array.from(xml.matchAll(/<Key>(?<name>[^<]*)<\/Key>/gu), ({ groups }) =>
    (groups?.name ?? "").replaceAll(
      /&(?<entity>amp|apos|gt|lt|quot);/gu,
      (_match, entity: string) => XML_ENTITY_CHARACTERS[entity] ?? "",
    ),
  );
  const nextContinuationToken = /<NextContinuationToken>([^<]*)<\/NextContinuationToken>/u.exec(xml)?.[1];
  return nextContinuationToken === undefined
    ? names
    : [...names, ...(await listObjectNames(client, bucketUrl, nextContinuationToken))];
};

export const createFilePack = async () => {
  if (existsSync(".env")) process.loadEnvFile();
  const bucketUrl = `https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com/${getCloudflareResourceName(process.env.CLOUDFLARE_ENVIRONMENT, CloudflareAssetType.R2Bucket, StorageBucket.PublicDungeonsAssets)}`;
  const client = new AwsClient({
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    region: "auto",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    service: "s3",
  });
  const files: Types.Loader.FileConfig[] = [];
  const fileKeys = new Set<string>();
  const enumName = "FileKey";

  // A listing carries no content type, so each object's type is read from its own headers
  for (const name of await listObjectNames(client, bucketUrl)) {
    const response = await client.fetch(`${bucketUrl}/${name.split("/").map(encodeURIComponent).join("/")}`, {
      method: "HEAD",
    });
    if (!response.ok) throw new InvalidOperationError(Operation.Read, name, `responds ${response.status}`);

    const contentType = response.headers.get("Content-Type");
    if (!contentType) throw new InvalidOperationError(Operation.Read, "Content Type", `Missing Content Type: ${name}`);

    for (const [matchedContentType, phaserMethod] of Object.entries(ContentTypePhaserMethodMap))
      if (contentType.includes(matchedContentType)) {
        const key = trimFileExtension(name).replaceAll("/", "");
        if (fileKeys.has(key)) throw new InvalidOperationError(Operation.Push, enumName, `Duplicate key: ${key}`);

        fileKeys.add(key);
        files.push({ cache: false, key, type: phaserMethod, url: name });
      }
  }

  await Promise.all([
    outputFile(PHASER_ROOT_DIRECTORY, `${enumName}.ts`, createEnumString(enumName, [...fileKeys])),
    (async () => {
      const { code } = await format("files.json", JSON.stringify(files), formatterConfiguration);
      await outputFile(PHASER_ROOT_DIRECTORY, "files.json", code);
    })(),
  ]);
};
