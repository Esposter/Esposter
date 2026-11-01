import type { WitnessMaterialFactory } from "#src/models/scene/WitnessMaterialFactory";

import { ToonNodeMaterial } from "genshin-engine";
import { describe } from "vitest";

export const createMaterialFactory: WitnessMaterialFactory = () => new ToonNodeMaterial({}, false);

describe.todo("createMaterialFactory");
