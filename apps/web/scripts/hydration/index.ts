import { checkPage } from "#scripts/hydration/checkPage";
import { SITEMAP_LOCATION_REGEX } from "#scripts/hydration/constants";
import { HYDRATION_CHECK_SESSION_ROUTE } from "#shared/services/hydrationCheck/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { defineCommand, runMain } from "citty";
import { chromium, devices, request } from "playwright";

await runMain(
  defineCommand({
    args: {
      origin: { description: "The deployed site, e.g. https://dev.esposter.com", required: true, type: "string" },
      "signed-in": {
        description: "Also load every page signed in, with the secret in HYDRATION_CHECK_SECRET",
        type: "boolean",
      },
    },
    meta: {
      // A server render and the client bundle disagreeing shows only between a production server and a browser, so
      // Every page the sitemap lists, the site's server-rendered surface, is loaded at a desktop and a phone size
      description: "Load every page the sitemap lists in a browser, and fail on any hydration mismatch",
      name: "hydration:check",
    },
    run: async ({ args }) => {
      const sitemap = await (await fetch(new URL("/sitemap.xml", args.origin))).text();
      // A sitemap names the site's configured origin, so each page is re-aimed at the one checked: a local build too
      const locations = Array.from(sitemap.matchAll(SITEMAP_LOCATION_REGEX), (match) => {
        const { pathname, search } = new URL(match.groups?.location ?? "/");
        return new URL(`${pathname}${search}`, args.origin).href;
      });
      if (locations.length === 0)
        throw new InvalidOperationError(Operation.Read, args.origin, "its sitemap lists no page");

      // Signed in, a page renders what a guest never sees, so the sitemap is loaded again as the check's own user. One
      // Session serves every context: the route revokes the user's earlier sessions on each call, so a session per page
      // Would sign the others out mid-run. The secret is read from the environment, never an argument a log would echo
      const session = args["signed-in"] ? await request.newContext({ baseURL: args.origin }) : undefined;
      if (session) {
        const response = await session.post(HYDRATION_CHECK_SESSION_ROUTE, {
          headers: { authorization: `Bearer ${process.env.HYDRATION_CHECK_SECRET}` },
        });
        if (response.status() !== 204)
          throw new InvalidOperationError(
            Operation.Create,
            HYDRATION_CHECK_SESSION_ROUTE,
            `answered ${response.status()}`,
          );
      }
      const storageStates = [undefined, ...(session ? [await session.storageState()] : [])];

      const browser = await chromium.launch();
      const pageFailures = (
        await Promise.all(
          storageStates.flatMap((storageState) =>
            [devices["Desktop Chrome"], devices["Pixel 7"]].flatMap((device) =>
              locations.map((location) => checkPage(browser, device, location, storageState)),
            ),
          ),
        )
      ).flat();
      await browser.close();
      // Signed out once every page is in, so the session outlives the run by nothing. better-auth refuses a sign-out
      // From an origin it does not trust, and a refused one leaves the session live until the next run revokes it
      const signOut = await session?.post("/api/auth/sign-out", { headers: { origin: args.origin } });
      await session?.dispose();
      const failures = [
        ...pageFailures,
        ...(signOut && !signOut.ok() ? [`the check's session was not signed out: ${signOut.status()}`] : []),
      ];

      if (failures.length > 0) throw new InvalidOperationError(Operation.Read, args.origin, `\n${failures.join("\n")}`);
    },
  }),
);
