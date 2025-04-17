import { readFile, writeFile } from "node:fs/promises";
import { RoutePath } from "../packages/app/shared/models/router/RoutePath.ts";
import typedocConfiguration from "../typedoc.config.js";

const path = `${typedocConfiguration.out}/index.html`;
const indexHtml = await readFile(path, "utf-8")
await writeFile(path, indexHtml.replaceAll('src="media', `src="${RoutePath.Docs}/media`))