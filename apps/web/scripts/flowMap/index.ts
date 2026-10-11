import { FLOW_MAP_PATH } from "@@/scripts/flowMap/constants";
import { getFlowMap } from "@@/scripts/flowMap/services/getFlowMap";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

await mkdir(dirname(FLOW_MAP_PATH), { recursive: true });
await writeFile(FLOW_MAP_PATH, getFlowMap());
