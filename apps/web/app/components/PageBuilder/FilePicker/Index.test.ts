// @vitest-environment nuxt
import type { ResourceFile } from "#shared/models/resource/ResourceFile";
import type { UiMenuItem } from "#src/models/ui/UiMenuItem";

import PageBuilderFilePicker from "#src/components/PageBuilder/FilePicker/Index.vue";
import UiSelect from "#src/components/Ui/Select/Index.vue";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { MimeCategory, ResourceType } from "@esposter/db-schema";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe("pageBuilderFilePicker", () => {
  const { trpcMsw } = setupMswTrpc();
  const resourceId = v7();
  const IMAGE_FILE: ResourceFile = { mimetype: "image/png", size: 2048, url: "/api/resource-assets/a" };
  const OTHER_IMAGE_FILE: ResourceFile = { mimetype: "image/webp", size: 1024, url: "/api/resource-assets/b" };
  const VIDEO_FILE: ResourceFile = { mimetype: "video/mp4", size: 4096, url: "/api/resource-assets/c" };

  test("the picker lists the files the resource holds", async () => {
    expect.hasAssertions();

    trpcMsw.webpage.readResourceFiles.query(() => [IMAGE_FILE, OTHER_IMAGE_FILE]);
    const component = await mountSuspended(PageBuilderFilePicker, {
      props: { category: MimeCategory.Image, resourceId, type: ResourceType.Webpage },
    });
    await flushPromises();

    expect((component.findComponent(UiSelect).props() as { items: UiMenuItem<string>[] }).items).toStrictEqual([
      { title: "image/png, 2 KB", value: IMAGE_FILE.url },
      { title: "image/webp, 1 KB", value: OTHER_IMAGE_FILE.url },
    ]);
  });

  test("a video picker lists videos alone", async () => {
    expect.hasAssertions();

    trpcMsw.webpage.readResourceFiles.query(() => [IMAGE_FILE, VIDEO_FILE]);
    const component = await mountSuspended(PageBuilderFilePicker, {
      props: { category: MimeCategory.Video, resourceId, type: ResourceType.Webpage },
    });
    await flushPromises();

    expect((component.findComponent(UiSelect).props() as { items: UiMenuItem<string>[] }).items).toStrictEqual([
      { title: "video/mp4, 4 KB", value: VIDEO_FILE.url },
    ]);
  });
});
