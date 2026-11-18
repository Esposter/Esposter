import { DROPS_MODULE_INVOCATION } from "#src/services/genshinAssets/enemies/constants";
import { describe } from "vitest";

// The Template:Drops page, which invokes the drops module to give the materials of the name it is written with
export const DROPS_TEMPLATE_PAGE = `<includeonly>${DROPS_MODULE_INVOCATION}</includeonly>`;
// The drops module's entry for Avatar of Lava, as the Enemies table of Module:Drops/data writes it: its members, its
// Material set by tier, and its artifacts flag
export const AVATAR_OF_LAVA_DROPS_ENTRY = `{
			members = {'Avatar of Lava'},
			MatSet1 = {'Ignited Stone' , 'Ignited Seed of Life' , 'Ignited Seeing Eye'},
			artifacts = true
		}`;

describe.todo("constants");
