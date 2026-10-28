import hidePoweredBy from "#src/runtime/nitro/plugins/hidePoweredBy";
import { createNitroApp, PAGE_PATHNAME, PAGE_ROUTE_RULES } from "#src/runtime/nitro/plugins/page.fixture";
import { createRouteRulesPlugin } from "#src/runtime/nitro/plugins/routeRules";
import { H3Event } from "nitro/h3";
import { describe, expect, test } from "vitest";

describe(hidePoweredBy, () => {
  test("the framework's X-Powered-By header is removed from the response it builds, after the event's headers are copied into it", async () => {
    expect.hasAssertions();

    const app = createNitroApp();
    await createRouteRulesPlugin({ "/**": { ...PAGE_ROUTE_RULES["/**"], hidePoweredBy: true } })(app.nitroApp);
    await hidePoweredBy(app.nitroApp);

    const event = new H3Event(new Request(new URL(PAGE_PATHNAME, "http://localhost")));
    await app.nitroApp.hooks.callHook("request", event);
    // The renderer writes the header onto the event's headers, then builds the response from them, so a later removal
    // From the event alone misses the copy the response already holds
    event.res.headers.set("x-powered-by", "Nuxt");
    const response = new Response("", { headers: event.res.headers });
    app.run("response", response, event);

    expect(response.headers.get("x-powered-by")).toBeNull();
  });
});
