import { parseWikiImaginariumStages } from "#src/services/genshinAssets/imaginarium/parseWikiImaginariumStages";
import { describe, expect, test } from "vitest";

describe(parseWikiImaginariumStages, () => {
  test("a domain enemies block's variants are read under their act and battle, with the Easy level", () => {
    expect.hasAssertions();

    const page = `===Act 1===
;Battle{{Colon}} Normal
* '''Stage Effects''':
{{Domain Enemies
|target1    = Defeat all opponents
|level1     = Easy Mode: 75<br>Normal Mode: 80<br>Hard/Visionary Mode: 85
|enemies1   = Geovishap (Pyro)*1//Primordial Bathysmal Vishap*1

|target2    = Defeat all opponents
|level2     = Easy Mode: 70<br>Normal Mode: 80
|enemies2   = Oprichniki Line Trooper*2;Oprichniki Hailstorm Cannoneer*1//Oprichniki Support Trooper*1
}}`;

    expect(parseWikiImaginariumStages(page)).toStrictEqual([
      {
        act: "Act 1",
        battle: "Normal",
        easyLevel: 75,
        enemyNames: ["Geovishap (Pyro)", "Primordial Bathysmal Vishap"],
        variant: 1,
      },
      {
        act: "Act 1",
        battle: "Normal",
        easyLevel: 70,
        enemyNames: ["Oprichniki Line Trooper", "Oprichniki Hailstorm Cannoneer", "Oprichniki Support Trooper"],
        variant: 2,
      },
    ]);
  });

  test("a member's count and markup are dropped from its name", () => {
    expect.hasAssertions();

    const page = `===Act 2===
;Battle{{Colon}} Elite Assault
{{Domain Enemies
|level1     = Easy Mode: 75
|enemies1   = Ruin Scout*-;Kairagi: Fiery Might*1/{{Aura|Smoldering Flames}};Frostarm Lawachurl{ text = - $ danger = 1 }
}}`;

    expect(parseWikiImaginariumStages(page)).toStrictEqual([
      {
        act: "Act 2",
        battle: "Elite Assault",
        easyLevel: 75,
        enemyNames: ["Ruin Scout", "Kairagi: Fiery Might", "Frostarm Lawachurl"],
        variant: 1,
      },
    ]);
  });

  test("a variant the wiki gives no Easy Mode level is left out, as it is not an Easy stage", () => {
    expect.hasAssertions();

    const page = `===Act 4===
;Battle{{Colon}} Defense Sequence
{{Domain Enemies
|level1     = Normal Mode: 85<br>Hard Mode: 90
|enemies1   = Ruin Guard*2
}}`;

    expect(parseWikiImaginariumStages(page)).toStrictEqual([]);
  });
});
