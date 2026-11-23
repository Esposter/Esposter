// @vitest-environment nuxt
import { EmailEditor } from "#shared/models/emailEditor/data/EmailEditor";
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import ResourceEmailImportDialog from "#src/components/Resource/Email/ImportDialog.vue";
import { useReadOpenResource } from "#src/composables/resource/useReadOpenResource";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useEmailImportDialogStore } from "#src/store/emailEditor/importDialog";
import { ResourceType } from "@esposter/db-schema";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { beforeEach, describe, expect, test } from "vitest";

describe("resourceEmailImportDialog", () => {
  const { trpcMsw } = setupMswTrpc();
  const resourceId = v7();
  const createResource = () => createResourceListItem({ contentVersion: 0, id: resourceId, type: ResourceType.Email });

  beforeEach(async () => {
    Object.assign(useRouter().currentRoute.value.params, { id: resourceId });
    trpcMsw.resource.readResource.query(() => ({ ...createResource(), favorite: null, publication: null }));
    trpcMsw.email.readResourceContent.query(
      () => new EmailEditor({ content: [], root: { props: { lang: "", title: "" } } }),
    );
    trpcMsw.email.readResourcePublication.query(() => undefined);
    const { readResource } = useReadOpenResource();
    await readResource();
  });

  test("keeps the dialog open when the email's types refuse the source", async () => {
    expect.hasAssertions();

    const emailImportDialogStore = useEmailImportDialogStore();
    const { openImport } = emailImportDialogStore;
    const { isImportOpen } = storeToRefs(emailImportDialogStore);
    openImport(resourceId);
    const component = await mountSuspended(ResourceEmailImportDialog, { attachTo: document.body });
    await component
      .find("textarea")
      .setValue('<mjml><mj-head><mj-include path="a"></mj-include></mj-head><mj-body></mj-body></mjml>');
    await flushPromises();
    await component
      .findAll("button")
      .find((button) => button.text() === "Import")
      ?.trigger("click");

    expect(isImportOpen.value).toBe(true);
  });
});
