import { DUNGEONS_LICENSE_NOTICE_REGEX } from "#src/services/dungeons/loader/constants";
import { dungeonsLock } from "#src/services/dungeons/loader/dungeonsLock";
import { readDungeonsPreloadSet } from "#src/services/dungeons/loader/readDungeonsPreloadSet";
import { CloudflareEnvironment, HostedAssetOriginMap } from "@esposter/db-schema";
import { getHostedAssetUrl } from "hosted-assets";
import { describe, expect, test } from "vitest";

describe(readDungeonsPreloadSet, () => {
  const origin = HostedAssetOriginMap[CloudflareEnvironment.Development];

  test("a license notice is hosted but never preloaded", () => {
    expect.hasAssertions();

    const noticeUrls = Object.entries(dungeonsLock.objects)
      .filter(([key]) => DUNGEONS_LICENSE_NOTICE_REGEX.test(key))
      .map(([, object]) => getHostedAssetUrl(origin, object));
    const { files } = readDungeonsPreloadSet(origin);

    expect(noticeUrls).toHaveLength(7);
    expect(files.filter(({ url }) => noticeUrls.includes(url))).toStrictEqual([]);
    expect(files).toHaveLength(Object.keys(dungeonsLock.objects).length - noticeUrls.length);
  });
});
