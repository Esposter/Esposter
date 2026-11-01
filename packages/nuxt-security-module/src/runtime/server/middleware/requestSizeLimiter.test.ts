import requestSizeLimiter from "#src/runtime/server/middleware/requestSizeLimiter";
import { getSecurityRules } from "#src/runtime/services/getSecurityRules";
import { H3Event } from "nitro/h3";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("#src/runtime/services/getSecurityRules"), () => ({
  getSecurityRules: vi.fn<typeof getSecurityRules>(),
}));

describe(requestSizeLimiter, () => {
  const LIMITS = { maxRequestSizeInBytes: 10, maxUploadFileRequestInBytes: 20 };
  const URL = "https://localhost/api";
  const JSON_TYPE = "application/json";

  // A body given as a string is sent with no Content-Length, as a chunked transfer is
  const createEvent = (body: string): H3Event =>
    new H3Event(new Request(URL, { body, headers: { "content-type": JSON_TYPE }, method: "POST" }));

  beforeEach(() => {
    vi.mocked(getSecurityRules).mockReturnValue({ enabled: true, requestSizeLimiter: LIMITS });
  });

  test("refuses a chunked body past the limit with no content length", async () => {
    expect.hasAssertions();

    const event = createEvent(" ".repeat(LIMITS.maxRequestSizeInBytes + 1));

    requestSizeLimiter(event, () => undefined);

    await expect(event.req.text()).rejects.toThrowErrorMatchingInlineSnapshot(
      `[HTTPError: Request body size exceeds the limit of ${LIMITS.maxRequestSizeInBytes} bytes]`,
    );
  });

  test("a chunked body within the limit is read whole", async () => {
    expect.hasAssertions();

    const body = " ".repeat(LIMITS.maxRequestSizeInBytes - 1);
    const event = createEvent(body);

    requestSizeLimiter(event, () => undefined);

    const read = await event.req.text();

    expect(read).toBe(body);
  });
});
