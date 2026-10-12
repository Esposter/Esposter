import { describe, expect, test } from "vitest";

import { injectSubresourceIntegrity } from "#src/runtime/services/injectSubresourceIntegrity";

describe(injectSubresourceIntegrity, () => {
  const HASHES = { "/app.js": "sha384-app", "/favicon.ico": "sha384-icon" };

  test("a script the build hashed gets its integrity attribute", () => {
    expect.hasAssertions();

    expect(injectSubresourceIntegrity('<script src="/app.js"></script>', HASHES)).toBe(
      '<script integrity="sha384-app" src="/app.js"></script>',
    );
  });

  test("#326 an icon link gets no integrity attribute, since it is not a script or stylesheet", () => {
    expect.hasAssertions();

    const html = '<link rel="icon" href="/favicon.ico">';
    expect(injectSubresourceIntegrity(html, HASHES)).toBe(html);
  });

  test("an integrity attribute the markup already carries is kept", () => {
    expect.hasAssertions();

    const html = '<script src="/app.js" integrity="sha384-own"></script>';
    expect(injectSubresourceIntegrity(html, HASHES)).toBe(html);
  });

  test("a resource the build did not hash is left alone", () => {
    expect.hasAssertions();

    const html = '<script src="/unknown.js"></script>';
    expect(injectSubresourceIntegrity(html, HASHES)).toBe(html);
  });
});
