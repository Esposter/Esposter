import { readGcsimTravels } from "#src/services/genshinAssets/kits/gcsim/readGcsimTravels";
import { describe, expect, test } from "vitest";

describe(readGcsimTravels, () => {
  test("gives each hitmark constant the travel its function defaults to, the first where two disagree", () => {
    expect.hasAssertions();

    const source = `package amber

func (c *char) Aimed(p map[string]int) (action.Info, error) {
	travel, ok := p["travel"]
	if !ok {
		travel = 10
	}
	c.Core.QueueAttack(ai, ap, aimedHitmarks[hold], aimedHitmarks[hold]+travel)
}

func (c *char) Attack(p map[string]int) (action.Info, error) {
	c.Core.QueueAttack(ai, ap, attackHitmarks[c.NormalCounter], attackHitmarks[c.NormalCounter]+travel)
}

func (c *char) Skill(p map[string]int) (action.Info, error) {
	travel = 20
	c.Core.QueueAttack(ai, ap, aimedHitmarks[0], aimedHitmarks[0]+travel)
	c.Core.QueueAttack(ai, ap, skillRelease, skillRelease + travel)
}
`;

    expect(readGcsimTravels([{ path: "aimed.go", source }])).toStrictEqual(
      new Map([
        ["aimedHitmarks", { file: "aimed.go", frames: 10, line: 6 }],
        ["skillRelease", { file: "aimed.go", frames: 20, line: 16 }],
      ]),
    );
  });
  test("gives the constant under a `windup` operand its travel, and the constants a struct field is set to its travel", () => {
    expect.hasAssertions();

    const source = `package xianyun

func (c *char) ChargeAttack(p map[string]int) (action.Info, error) {
	travel, ok := p["travel"]
	if !ok {
		travel = 10
	}
	c.Core.QueueAttack(ai, ap, chargeHitmark-windup, chargeHitmark-windup+travel)
}

func (c *char) Aimed(p map[string]int) (action.Info, error) {
	travel = 10
	a := action.Info{CanQueueAfter: aimedHitmarks[hold]}
	c.Core.QueueAttack(ai, ap, a.CanQueueAfter, a.CanQueueAfter+travel)
}
`;

    expect(readGcsimTravels([{ path: "charge.go", source }])).toStrictEqual(
      new Map([
        ["chargeHitmark", { file: "charge.go", frames: 10, line: 6 }],
        ["windup", { file: "charge.go", frames: 10, line: 6 }],
        ["aimedHitmarks", { file: "charge.go", frames: 10, line: 12 }],
      ]),
    );
  });
});
