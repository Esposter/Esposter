import { parseControllerStates } from "#src/services/genshinAssets/enemies/parseControllerStates";
import { describe, expect, test } from "vitest";

// A controller as AnimeStudio's JSON export writes it: two states, the first a blend tree over clip 1 and a node naming
// No clip, the second over clip 0. Both path IDs are past a number's exact range, so they are kept as the text written
const CONTROLLER_JSON = `{
  "m_Controller": {
    "m_StateMachineArray": [
      {
        "m_StateConstantArray": [
          { "m_NameID": 11, "m_BlendTreeConstantArray": [{ "m_NodeArray": [{ "m_ClipID": 1 }, { "m_ClipID": 4294967295 }] }] },
          { "m_NameID": 22, "m_BlendTreeConstantArray": [{ "m_NodeArray": [{ "m_ClipID": 0 }] }] }
        ]
      }
    ]
  },
  "m_TOS": { "11": "Run", "22": "Attack" },
  "m_AnimationClips": [
    { "m_FileID": 67, "m_PathID": 4973930267232703925, "Name": "", "IsNull": false },
    { "m_FileID": 53, "m_PathID": -1371186386513271745, "Name": "", "IsNull": false }
  ]
}`;

describe(parseControllerStates, () => {
  test("reads each state's name and the clips its blend tree plays, keeping each path ID as written", () => {
    expect.hasAssertions();

    expect(parseControllerStates(CONTROLLER_JSON)).toStrictEqual([
      { clipPathIds: ["-1371186386513271745"], name: "Run" },
      { clipPathIds: ["4973930267232703925"], name: "Attack" },
    ]);
  });
});
