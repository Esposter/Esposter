import { createSigV4Fetch } from "#src/services/sigv4/createSigV4Fetch";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(createSigV4Fetch, () => {
  const credentials = { accessKeyId: "accessKeyId", region: "auto", secretAccessKey: "secretAccessKey", service: "s3" };
  const url = "https://bucket.example.com/key";
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    // Every wait is drawn at zero, so a retry is not held behind a timer
    vi.spyOn(Math, "random").mockReturnValue(0);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    fetchMock.mockReset();
  });

  test("sends a refused request again, signed afresh, until it is answered", async () => {
    expect.hasAssertions();

    fetchMock
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockResolvedValueOnce(new Response(null, { status: 429 }))
      .mockResolvedValueOnce(new Response(null, { status: 200 }));
    const response = await createSigV4Fetch(credentials)(url, { method: "PUT" });

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(
      fetchMock.mock.calls.every(([, init]) =>
        new Headers(init?.headers).get("Authorization")?.startsWith("AWS4-HMAC-SHA256"),
      ),
    ).toBe(true);
  });

  test("returns a client error at once", async () => {
    expect.hasAssertions();

    fetchMock.mockResolvedValueOnce(new Response(null, { status: 404 }));
    const response = await createSigV4Fetch(credentials)(url);

    expect(response.status).toBe(404);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test("returns the last refusal once the retries are spent", async () => {
    expect.hasAssertions();

    // A response with no body can be handed back for every attempt
    fetchMock.mockResolvedValue(new Response(null, { status: 500 }));
    const response = await createSigV4Fetch(credentials, { retryCount: 2 })(url);

    expect(response.status).toBe(500);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  test("#52 #65 sends a request with a streamed body once, since the first attempt spends it", async () => {
    expect.hasAssertions();

    fetchMock.mockResolvedValueOnce(new Response(null, { status: 503 }));
    const response = await createSigV4Fetch(credentials)(url, { body: new Blob([]).stream(), method: "PUT" });

    expect(response.status).toBe(503);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test("#54 sends an empty body with the method given", async () => {
    expect.hasAssertions();

    fetchMock.mockResolvedValueOnce(new Response(null, { status: 200 }));
    await createSigV4Fetch(credentials)(url, { body: "", method: "PUT" });
    const init = fetchMock.mock.calls[0]?.[1];

    expect(init?.body).toBe("");
    expect(init?.method).toBe("PUT");
  });
});
