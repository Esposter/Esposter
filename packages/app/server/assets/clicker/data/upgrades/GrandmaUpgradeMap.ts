/* eslint-disable perfectionist/sort-objects */
import type { Upgrade } from "@/shared/models/clicker/data/upgrade/Upgrade";
import type { Except } from "type-fest";

import { EffectType } from "@/shared/models/clicker/data/effect/EffectType";
import { Target } from "@/shared/models/clicker/data/Target";
import { GrandmaUpgradeId } from "@/shared/models/clicker/data/upgrade/GrandmaUpgradeId";
import { plural } from "pluralize";

export const GrandmaUpgradeMap = {
  [GrandmaUpgradeId["Forwards From Grandma"]]: {
    description: `${plural(Target.Grandma)} are **twice** as efficient.`,
    flavorDescription: "RE:RE:thought you'd get a kick out of this ;))",
    price: 1e3,
    effects: [
      {
        value: 2,
        targets: [Target.Grandma],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Grandma, amount: 1 }],
  },
  [GrandmaUpgradeId["Steel-plated Rolling Pins"]]: {
    description: `${plural(Target.Grandma)} are **twice** as efficient.`,
    flavorDescription: "Just what you kneaded.",
    price: 5e3,
    effects: [
      {
        value: 2,
        targets: [Target.Grandma],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Grandma, amount: 5 }],
  },
  [GrandmaUpgradeId["Lubricated Dentures"]]: {
    description: `${plural(Target.Grandma)} are **twice** as efficient.`,
    flavorDescription: "squish",
    price: 5e4,
    effects: [
      {
        value: 2,
        targets: [Target.Grandma],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Grandma, amount: 25 }],
  },
  [GrandmaUpgradeId["Prune Juice"]]: {
    description: `${plural(Target.Grandma)} are **twice** as efficient.`,
    flavorDescription: "Gets me going.",
    price: 5e6,
    effects: [
      {
        value: 2,
        targets: [Target.Grandma],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Grandma, amount: 50 }],
  },
  [GrandmaUpgradeId["Double-thick Glasses"]]: {
    description: `${plural(Target.Grandma)} are **twice** as efficient.`,
    flavorDescription: "Oh... so THAT's what I've been making.",
    price: 5e8,
    effects: [
      {
        value: 2,
        targets: [Target.Grandma],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Grandma, amount: 100 }],
  },
  [GrandmaUpgradeId["Aging Agents"]]: {
    description: `${plural(Target.Grandma)} are **twice** as efficient.`,
    flavorDescription:
      "Counter-intuitively, grandmas have the uncanny ability to become more powerful the older they get.",
    price: 5e10,
    effects: [
      {
        value: 2,
        targets: [Target.Grandma],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Grandma, amount: 150 }],
  },
  [GrandmaUpgradeId["Xtreme Walkers"]]: {
    description: `${plural(Target.Grandma)} are **twice** as efficient.`,
    flavorDescription: 'Complete with flame decals and a little horn that goes "toot".',
    price: 5e13,
    effects: [
      {
        value: 2,
        targets: [Target.Grandma],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Grandma, amount: 200 }],
  },
  [GrandmaUpgradeId["The Unbridling"]]: {
    description: `${plural(Target.Grandma)} are **twice** as efficient.`,
    flavorDescription: "It might be a classic tale of bad parenting, but let's see where grandma is going with this.",
    price: 5e16,
    effects: [
      {
        value: 2,
        targets: [Target.Grandma],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Grandma, amount: 250 }],
  },
  [GrandmaUpgradeId["Reverse Dementia"]]: {
    description: `${plural(Target.Grandma)} are **twice** as efficient.`,
    flavorDescription: "Extremely unsettling, and somehow even worse than the regular kind.",
    price: 5e19,
    effects: [
      {
        value: 2,
        targets: [Target.Grandma],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Grandma, amount: 300 }],
  },
  [GrandmaUpgradeId["Timeproof Hair Dyes"]]: {
    description: `${plural(Target.Grandma)} are **twice** as efficient.`,
    flavorDescription:
      "Why do they always have those strange wispy pink dos? What do they know about candy floss that we don't?",
    price: 5e22,
    effects: [
      {
        value: 2,
        targets: [Target.Grandma],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Grandma, amount: 350 }],
  },
  [GrandmaUpgradeId["Good Manners"]]: {
    description: `${plural(Target.Grandma)} are **twice** as efficient.`,
    flavorDescription:
      'Apparently these ladies are much more amiable if you take the time to learn their strange, ancient customs, which seem to involve saying "please" and "thank you" and staring at the sun with bulging eyes while muttering eldritch curses under your breath.',
    price: 5e26,
    effects: [
      {
        value: 2,
        targets: [Target.Grandma],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Grandma, amount: 400 }],
  },
  [GrandmaUpgradeId["Generation Degeneration"]]: {
    description: `${plural(Target.Grandma)} are **twice** as efficient.`,
    flavorDescription:
      "Genetic testing shows that most of your grandmas are infected with a strange degenerative disease that only seems to further their powers; the more time passes, the older they get. This should concern you.",
    price: 5e30,
    effects: [
      {
        value: 2,
        targets: [Target.Grandma],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Grandma, amount: 450 }],
  },
  [GrandmaUpgradeId.Visits]: {
    description: `${plural(Target.Grandma)} are **twice** as efficient.`,
    flavorDescription:
      "In an extensive double-blind study (sample size: 12 millions), your researchers have found evidence that grandmas are up to twice as productive if you just come by and say hi once in a while. It's nice to check up on your grans! (Do not under any circumstances ingest any tea or tea-like substances the grandmas may offer you.).",
    price: 5e34,
    effects: [
      {
        value: 2,
        targets: [Target.Grandma],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Grandma, amount: 500 }],
  },
  [GrandmaUpgradeId["Kitchen Cabinets"]]: {
    description: `${plural(Target.Grandma)} are **twice** as efficient.`,
    flavorDescription:
      "A grandma's kitchen cabinet is a befuddling place. Through lesser-studied aggregating instincts, grandmas will tend to gradually fill all nearby cabinets with various sorts of things, such as curious coconut snacks or dietetic powders. By contract, these are legally yours, which opens up exciting opportunities for your substance investigation department.",
    price: 5e38,
    effects: [
      {
        value: 2,
        targets: [Target.Grandma],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Grandma, amount: 550 }],
  },
} as const satisfies Record<GrandmaUpgradeId, Except<Upgrade<GrandmaUpgradeId>, "id">>;
