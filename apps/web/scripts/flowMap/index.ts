import { FLOW_MAP_PATH } from "@@/scripts/flowMap/constants";
import { getFlowMap } from "@@/scripts/flowMap/services/getFlowMap";
import { outputFile } from "fs-extra";

await outputFile(FLOW_MAP_PATH, getFlowMap());
