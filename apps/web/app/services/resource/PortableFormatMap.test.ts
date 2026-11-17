// @vitest-environment nuxt
import { EmailEditor } from "#shared/models/emailEditor/data/EmailEditor";
import { TEST_ID, TEST_LABEL } from "#shared/services/pageBuilder/constants.test";
import { MAX_EMAIL_NODES } from "#shared/services/pageBuilder/email/constants";
import { emailBodyChildrenSchema } from "#shared/services/pageBuilder/email/emailNodeSchema";
import { emailRegistry } from "#shared/services/pageBuilder/email/emailRegistry";
import { noteRichText } from "#shared/services/pageBuilder/email/noteRichText";
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import { emailKind } from "#src/services/pageBuilder/emailKind";
import { PortableFormatMap } from "#src/services/resource/PortableFormatMap";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useAlertStore } from "#src/store/alert";
import { useEmailEditorStore } from "#src/store/emailEditor/index";
import { usePageBuilderDocumentStore } from "#src/store/pageBuilder/document";
import { useResourceStore } from "#src/store/resource/index";
import { ResourceType } from "@esposter/db-schema";
import { downloadFile, takeOne } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { parseMjmlDocument, renderMjmlDocument, serializeMjml } from "mjml-blocks";
import { v7 } from "uuid";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("@esposter/shared"), async (importOriginal) => ({
  ...(await importOriginal()),
  downloadFile: vi.fn<typeof downloadFile>(),
}));

const parseEmail = (source: string) => {
  const result = parseMjmlDocument(source, emailRegistry, emailBodyChildrenSchema, noteRichText, MAX_EMAIL_NODES);
  if (!result.success) throw new Error("the test email should parse");

  return result.data;
};
// The exports write each file as its text, so a download's body is the string the export gave
const readDownloads = () => vi.mocked(downloadFile).mock.calls as [string, string, string][];

describe("portableFormatMap", () => {
  const { trpcMsw } = setupMswTrpc();
  const resourceId = v7();
  const createResource = (contentVersion = 0) =>
    createResourceListItem({ contentVersion, id: resourceId, name: TEST_LABEL, type: ResourceType.Email });
  const emailExportFormats = PortableFormatMap[ResourceType.Email];
  const exportFormat = (label: string) => {
    const format = emailExportFormats.find((candidate) => candidate.label === label);
    if (!format?.export) throw new Error(`${label} should export`);

    return format.export;
  };
  beforeEach(async () => {
    vi.mocked(downloadFile).mockClear();
    Object.assign(useRouter().currentRoute.value.params, { id: resourceId });
    trpcMsw.resource.readResource.query(() => ({ ...createResource(), publication: null }));
    trpcMsw.email.readResourceContent.query(
      () => new EmailEditor({ content: [], root: { props: { lang: "", title: "" } } }),
    );
    trpcMsw.email.readResourcePublication.query(() => undefined);
    trpcMsw.email.saveResourceContent.mutation(() => createResource(1));
    const resourceStore = useResourceStore();
    const { readResource } = resourceStore;
    await readResource();
    const emailEditorStore = useEmailEditorStore();
    const { loadContent } = emailEditorStore;
    await loadContent();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const { setEmailDocument } = pageBuilderDocumentStore;
    setEmailDocument(
      resourceId,
      emailKind,
      parseEmail(
        `<mjml><mj-body><mj-section><mj-column><mj-text>a</mj-text></mj-column></mj-section></mj-body></mjml>`,
      ),
    );
  });

  test("the email offers its three exports", () => {
    expect.hasAssertions();

    expect(emailExportFormats.map(({ label }) => label)).toStrictEqual(["HTML", "MJML source", "Personalized HTML"]);
  });

  test("an unbound email downloads as one HTML file", async () => {
    expect.hasAssertions();

    trpcMsw.email.generateEmailHtml.query(() => ({ html: "<p>a</p>" }));

    await exportFormat("HTML")();

    const alertStore = useAlertStore();
    expect(alertStore.alerts.map(({ text }) => text)).toStrictEqual([]);
    expect(readDownloads()).toStrictEqual([[`${TEST_LABEL}.html`, "<p>a</p>", "text/html"]]);
  });

  test("an email that fails strict validation is not downloaded", async () => {
    expect.hasAssertions();

    trpcMsw.email.generateEmailHtml.query(() => {
      throw new TRPCError({ code: "BAD_REQUEST", message: "mj-text is not allowed here" });
    });

    await exportFormat("HTML")();

    const alertStore = useAlertStore();
    expect(readDownloads()).toHaveLength(0);
    expect(alertStore.alerts.map(({ text }) => text)).toStrictEqual(["mj-text is not allowed here"]);
  });

  test("a merge field stays as its token in the file", async () => {
    expect.hasAssertions();

    trpcMsw.email.generateEmailHtml.query(() => ({ html: "<p>{{name}}</p>" }));

    await exportFormat("HTML")();

    expect(takeOne(readDownloads())[1]).toBe("<p>{{name}}</p>");
  });

  test("an image in the HTML file needs a signed-in session", async () => {
    expect.hasAssertions();

    trpcMsw.email.generateEmailHtml.query(() => ({ html: `<img src="/api/resource-assets/${TEST_ID}">` }));

    await exportFormat("HTML")();

    expect(takeOne(readDownloads())[1]).toContain(`${window.location.origin}/api/resource-assets/${TEST_ID}`);
  });

  test("a refused save stops the download", async () => {
    expect.hasAssertions();

    trpcMsw.email.saveResourceContent.mutation(() => {
      throw new TRPCError({ code: "BAD_REQUEST", message: "the email was refused" });
    });
    trpcMsw.email.generateEmailHtml.query(() => ({ html: "<p>a</p>" }));

    await exportFormat("HTML")();

    const alertStore = useAlertStore();
    expect(readDownloads()).toHaveLength(0);
    expect(alertStore.alerts.length).toBeGreaterThan(0);
  });

  test("the mjml source downloads as one file", async () => {
    expect.hasAssertions();

    await exportFormat("MJML source")();

    const [fileName, source, mimeType] = takeOne(readDownloads());
    expect([fileName, mimeType]).toStrictEqual([`${TEST_LABEL}.mjml`, "text/plain"]);
    expect(source).toContain("<mj-text><p>a</p></mj-text>");
  });

  test("the mjml source imports back to the same email", async () => {
    expect.hasAssertions();

    await exportFormat("MJML source")();

    const source = takeOne(readDownloads())[1];
    expect(
      serializeMjml(
        renderMjmlDocument(parseEmail(source), emailRegistry, {
          context: { origin: window.location.origin },
          isStampingIds: false,
        }),
      ),
    ).toBe(source);
  });
});
