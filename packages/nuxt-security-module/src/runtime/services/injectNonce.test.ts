import { injectNonce } from "#src/runtime/services/injectNonce";
import { describe, expect, test } from "vitest";

describe(injectNonce, () => {
  const NONCE = "abc";

  test("#594 a start tag inside a quoted attribute is not rewritten, so sanitised markup stays inert", () => {
    expect.hasAssertions();

    const html = '<p title="<script>alert(1)</script>">x</p>';
    expect(injectNonce(html, NONCE)).toBe(html);
  });

  test("#586 an element that already names a nonce has it replaced, not duplicated", () => {
    expect.hasAssertions();

    expect(injectNonce('<script nonce="old" src="/a.js"></script>', NONCE)).toBe(
      '<script nonce="abc" src="/a.js"></script>',
    );
  });

  test("#667 an inline payload script whose text holds a quote is still given the nonce", () => {
    expect.hasAssertions();

    expect(injectNonce('<script type="application/json">{"text":"it\'s"}</script>', NONCE)).toBe(
      '<script nonce="abc" type="application/json">{"text":"it\'s"}</script>',
    );
  });

  test("#393 text and entities outside the tags pass through unchanged", () => {
    expect.hasAssertions();

    expect(injectNonce("<p>Grüße &amp; co</p><script></script>", NONCE)).toBe(
      '<p>Grüße &amp; co</p><script nonce="abc"></script>',
    );
  });

  test("a link element carries the nonce as well", () => {
    expect.hasAssertions();

    expect(injectNonce('<link rel="stylesheet" href="/s.css">', NONCE)).toBe(
      '<link nonce="abc" rel="stylesheet" href="/s.css">',
    );
  });
});
