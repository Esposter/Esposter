import type { ResourceInResource } from "@esposter/db-schema";

import { omitDerivedContent } from "#server/services/resource/omitDerivedContent";
import { ResourceType } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

describe(omitDerivedContent, () => {
  test("leaves out the html a webpage baked at publish", () => {
    expect.hasAssertions();

    const resource = { type: ResourceType.Webpage } as ResourceInResource;

    expect(omitDerivedContent(resource, { html: "<html></html>", root: "root" })).toStrictEqual({ root: "root" });
  });

  // An email's working copy holds the compiled html its editor captures on every save, and nothing re-derives it.
  // So a restore must keep it for the next publish to read
  test("keeps the compiled html an email's working copy holds", () => {
    expect.hasAssertions();

    const resource = { type: ResourceType.Email } as ResourceInResource;
    const content = { html: "<mjml></mjml>", root: "root" };

    expect(omitDerivedContent(resource, content)).toStrictEqual(content);
  });
});
