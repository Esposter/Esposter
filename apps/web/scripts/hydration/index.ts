import { checkPage } from "#scripts/hydration/checkPage";
import { SITEMAP_LOCATION_REGEX } from "#scripts/hydration/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { defineCommand, runMain } from "citty";
import { chromium, devices } from "playwright";

await runMain(
  defineCommand({
    args: {
      origin: { description: "The deployed site, e.g. https://dev.esposter.com", required: true, type: "string" },
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

      const browser = await chromium.launch();
      const failures = (
        await Promise.all(
          [devices["Desktop Chrome"], devices["Pixel 7"]].flatMap((device) =>
            locations.map((location) => checkPage(browser, device, location)),
          ),
        )
      ).flat();
      await browser.close();

      if (failures.length > 0) throw new InvalidOperationError(Operation.Read, args.origin, `\n${failures.join("\n")}`);
    },
  }),
);
