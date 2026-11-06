// @vitest-environment nuxt
import ResourceEmailEditor from "@/components/Resource/Email/Editor.vue";
import { EmailEditor } from "#shared/models/emailEditor/data/EmailEditor";
import { EmailValidationLevel } from "#shared/models/pageBuilder/EmailValidationLevel";
import { PageBuilderDevice } from "#shared/models/pageBuilder/PageBuilderDevice";
import { DEVICE_WIDTH_MAP } from "#shared/services/pageBuilder/constants";
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import { useSession } from "@/services/auth/authClient.test";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { useResourceStore } from "@/store/resource";
import { ResourceType } from "@esposter/db-schema";
import { waitForSynchronizedFunctions } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("@/services/auth/authClient"), () => import("@/services/auth/authClient.test"));

describe("resourceEmailEditor", () => {
  const { trpcMsw } = setupMswTrpc();
  const resourceId = crypto.randomUUID();
  const createResource = () => createResourceListItem({ contentVersion: 0, id: resourceId, type: ResourceType.Email });
  const html = "a";
  const message = "b";

  beforeEach(async () => {
    Object.assign(useRouter().currentRoute.value.params, { id: resourceId });
    useSession.mockReturnValue({ data: null });
    trpcMsw.resource.readResource.query(() => ({ ...createResource(), publication: null }));
    trpcMsw.email.readResourceContent.query(() => new EmailEditor({ content: [], root: { props: {} } }));
    trpcMsw.email.readResourcePublication.query(() => undefined);
    // The page reads the row before any blade mounts, and a content load reads only the blob
    await useResourceStore().readResource();
  });

  test("a validation message is a finding in Design", async () => {
    expect.hasAssertions();

    trpcMsw.email.compile.mutation(() => ({ message, messages: [{ level: EmailValidationLevel.Strict, message }] }));
    const component = await mountSuspended(ResourceEmailEditor);
    await waitForSynchronizedFunctions();
    await flushPromises();

    expect(component.find('[aria-label="Problems: 1"]').exists()).toBe(true);
  });

  test("the device toggle applies to both modes", async () => {
    expect.hasAssertions();

    trpcMsw.email.compile.mutation(() => ({ html }));
    usePageBuilderCanvasStore().setDevice(resourceId, PageBuilderDevice.Mobile);
    const component = await mountSuspended(ResourceEmailEditor);
    await waitForSynchronizedFunctions();
    await flushPromises();
    const previewOption = component.findAll('[role="radio"]').find((option) => option.text() === "Preview");
    await previewOption?.trigger("click");
    await flushPromises();

    expect(component.get("iframe").element.style.width).toBe(`${DEVICE_WIDTH_MAP[PageBuilderDevice.Mobile]}px`);
  });
});
