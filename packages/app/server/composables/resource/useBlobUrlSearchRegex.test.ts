import { useBlobUrlSearchRegex } from "@@/server/composables/resource/useBlobUrlSearchRegex";
import { AzureContainer } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { MOCK_BLOB_BASE_URL } from "azure-mock";
import { describe, expect, test, vi } from "vitest";

const containerUrl = `${MOCK_BLOB_BASE_URL}/${AzureContainer.ResourceAssets}`;
// Percent-encoded by `encodeBlobUrl`, so it carries no character any context reserves and belongs in all of them.
// Its query is what a real SAS looks like: an `&` between parameters, and `%22`/`%3B` inside `rscd`
const canonicalUrl = `${containerUrl}/a%20%281%29?rscd=%22a%22&sig=a%2Fb`;
const matchOne = (content: string) => takeOne(content.match(useBlobUrlSearchRegex()) ?? []);

vi.mock(import("@@/server/composables/azure/container/useContainerBaseUrl"), () => ({
  useContainerBaseUrl: () => MOCK_BLOB_BASE_URL,
}));

// Every context a url is embedded in, and — for the ones that close on a delimiter — the content that follows the
// Closer. A url is matched whole in all of them: the opening delimiter is what says where the url ends, so the only
// Reading that has to guess is the undelimited one
const BlobUrlContextCases = [
  { name: "double-quoted html attribute", wrap: (url: string) => `<img src="${url}" alt="a">` },
  { name: "single-quoted css url()", wrap: (url: string) => `background-image:url('${url}');color:red` },
  { name: "double-quoted css url()", wrap: (url: string) => `background-image:url("${url}");color:red` },
  { name: "unquoted css url()", wrap: (url: string) => `background-image:url(${url});color:red` },
  // How GrapesJS serializes a style attribute whose own value is quoted — the delimiter arrives html-escaped
  { name: "escaped-quote css url()", wrap: (url: string) => `<div style="background:url(&quot;${url}&quot;)">` },
  { name: "escaped-apostrophe css url()", wrap: (url: string) => `<div style="background:url(&#39;${url}&#39;)">` },
  { name: "JSON-escaped html attribute", wrap: (url: string) => JSON.stringify({ html: `<img src="${url}">` }) },
  { name: "markdown image", wrap: (url: string) => `![alt](${url})` },
  { name: "unquoted html attribute", wrap: (url: string) => `<img src=${url} alt=a>` },
  { name: "srcset candidate after a comma", wrap: (url: string) => `<img srcset=a.png 1x,${url} 2x>` },
  { name: "start of content", wrap: (url: string) => url },
  // The regression the enumerated-opener reading kept producing: an opener set that lists the delimiters it knows
  // Silently matches nothing after any character it does not
  { name: "after an html entity's semicolon", wrap: (url: string) => `&nbsp;${url} rest` },
  { name: "inside brackets", wrap: (url: string) => `[${url}]` },
] as const;

// Signed before `encodeBlobUrl` existed, so the path still carries the sub-delimiters Azure leaves literal. Each
// Context permits every delimiter but the ones its own syntax reserves, which is the whole reason the match is
// Anchored on the opener — a quoted url() carries the parens an unquoted one closes on, and css forbids an unquoted
// Url() from carrying a quote at all, so no context is asked to read a url its syntax could not have produced
const LegacyBlobUrlCases = [
  { name: "double-quoted html attribute", path: `a!'()*`, wrap: (url: string) => `<img src="${url}" alt="a">` },
  { name: "single-quoted css url()", path: `a!()*`, wrap: (url: string) => `background-image:url('${url}')` },
  { name: "unquoted css url()", path: `a!*`, wrap: (url: string) => `background-image:url(${url});x:y` },
  {
    name: "escaped-quote css url()",
    path: `a!*`,
    wrap: (url: string) => `<div style="url(&quot;${url}&quot;)">`,
  },
] as const;

describe(useBlobUrlSearchRegex, () => {
  test.each(BlobUrlContextCases)("should match a canonical URL whole in a $name", ({ wrap }) => {
    expect.hasAssertions();
    expect(matchOne(wrap(canonicalUrl))).toBe(canonicalUrl);
  });

  test.each(LegacyBlobUrlCases)(
    "should keep the literal sub-delimiters of a legacy URL in a $name",
    ({ path, wrap }) => {
      expect.hasAssertions();

      const url = `${containerUrl}/${path}?sig=a%2Fb`;

      expect(matchOne(wrap(url))).toBe(url);
    },
  );

  test("should match a URL and the longer URL it is a prefix of as separate whole URLs", () => {
    expect.hasAssertions();

    const url = `${containerUrl}/a`;
    const longerUrl = `${url}b`;

    expect(`<img src="${url}"><img src="${longerUrl}">`.match(useBlobUrlSearchRegex())).toStrictEqual([url, longerUrl]);
  });

  test("should not match a URL from a different container", () => {
    expect.hasAssertions();
    expect(matchOne(`"${MOCK_BLOB_BASE_URL}/${AzureContainer.ClickerAssets}/a"`)).toBeUndefined();
  });
});
