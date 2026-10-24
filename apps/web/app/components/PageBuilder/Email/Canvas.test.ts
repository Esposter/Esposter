// @vitest-environment nuxt
import { PageBuilderDevice } from "#shared/models/pageBuilder/PageBuilderDevice";
import { MAX_EMAIL_NODES } from "#shared/services/pageBuilder/email/constants";
import { emailBodyChildrenSchema } from "#shared/services/pageBuilder/email/emailNodeSchema";
import { emailRegistry } from "#shared/services/pageBuilder/email/emailRegistry";
import { noteRichText } from "#shared/services/pageBuilder/email/noteRichText";
import EmailCanvas from "@/components/PageBuilder/Email/Canvas.vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { parseMjmlDocument } from "mjml-blocks";
import { describe, expect, test } from "vitest";

describe("emailCanvas", () => {
  test("switching to tablet draws the email at tablet width", async () => {
    expect.hasAssertions();

    const result = parseMjmlDocument(
      `<mjml><mj-body><mj-section><mj-column><mj-text>Hello</mj-text></mj-column></mj-section></mj-body></mjml>`,
      emailRegistry,
      emailBodyChildrenSchema,
      noteRichText,
      MAX_EMAIL_NODES,
    );
    if (!result.success) throw new Error("the test email should parse");

    const component = await mountSuspended(EmailCanvas, {
      props: { device: PageBuilderDevice.Tablet, email: result.data },
    });

    expect(component.get<HTMLIFrameElement>("iframe").element.style.width).toBe("768px");
  });
});
