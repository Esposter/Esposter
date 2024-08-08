import type { Upgrade } from "@/models/clicker/data/upgrade/Upgrade";
import type { Except } from "type-fest";

import { EffectType } from "@/models/clicker/data/effect/EffectType";
import { Target } from "@/models/clicker/data/Target";
import { GrandmaUpgradeId } from "@/models/clicker/data/upgrade/GrandmaUpgradeId";
import { plural } from "pluralize";

export const GrandmaUpgradeMap = {
  [GrandmaUpgradeId.Visits]: {
    description: `${plural(Target.Grandma)} are **twice** as efficient.`,
    effects: [
      {
        configuration: {
          type: EffectType.Multiplicative,
        },
        targets: [Target.Grandma],
        value: 2,
      },
    ],
    flavorDescription:
      "In an extensive double-blind study (sample size: 12 millions), your researchers have found evidence that grandmas are up to twice as productive if you just come by and say hi once in a while. It's nice to check up on your grans! (Do not under any circumstances ingest any tea or tea-like substances the grandmas may offer you.).",
    price: 5e34,
    unlockConditions: [{ amount: 500, id: Target.Grandma, type: Target.Building }],
  },
  [GrandmaUpgradeId["Aging Agents"]]: {
    description: `${plural(Target.Grandma)} are **twice** as efficient.`,
    effects: [
      {
        configuration: {
          type: EffectType.Multiplicative,
        },
        targets: [Target.Grandma],
        value: 2,
      },
    ],
    flavorDescription:
      "Counter-intuitively, grandmas have the uncanny ability to become more powerful the older they get.",
    price: 5e10,
    unlockConditions: [{ amount: 150, id: Target.Grandma, type: Target.Building }],
  },
  [GrandmaUpgradeId["Double-thick Glasses"]]: {
    description: `${plural(Target.Grandma)} are **twice** as efficient.`,
    effects: [
      {
        configuration: {
          type: EffectType.Multiplicative,
        },
        targets: [Target.Grandma],
        value: 2,
      },
    ],
    flavorDescription: "Oh... so THAT's what I've been making.",
    price: 5e8,
    unlockConditions: [{ amount: 100, id: Target.Grandma, type: Target.Building }],
  },
  [GrandmaUpgradeId["Forwards From Grandma"]]: {
    description: `${plural(Target.Grandma)} are **twice** as efficient.`,
    effects: [
      {
        configuration: {
          type: EffectType.Multiplicative,
        },
        targets: [Target.Grandma],
        value: 2,
      },
    ],
    flavorDescription: "RE:RE:thought you'd get a kick out of this ;))",
    price: 1e3,
    unlockConditions: [{ amount: 1, id: Target.Grandma, type: Target.Building }],
  },
  [GrandmaUpgradeId["Generation Degeneration"]]: {
    description: `${plural(Target.Grandma)} are **twice** as efficient.`,
    effects: [
      {
        configuration: {
          type: EffectType.Multiplicative,
        },
        targets: [Target.Grandma],
        value: 2,
      },
    ],
    flavorDescription:
      "Genetic testing shows that most of your grandmas are infected with a strange degenerative disease that only seems to further their powers; the more time passes, the older they get. This should concern you.",
    price: 5e30,
    unlockConditions: [{ amount: 450, id: Target.Grandma, type: Target.Building }],
  },
  [GrandmaUpgradeId["Good Manners"]]: {
    description: `${plural(Target.Grandma)} are **twice** as efficient.`,
    effects: [
      {
        configuration: {
          type: EffectType.Multiplicative,
        },
        targets: [Target.Grandma],
        value: 2,
      },
    ],
    flavorDescription:
      'Apparently these ladies are much more amiable if you take the time to learn their strange, ancient customs, which seem to involve saying "please" and "thank you" and staring at the sun with bulging eyes while muttering eldritch curses under your breath.',
    price: 5e26,
    unlockConditions: [{ amount: 400, id: Target.Grandma, type: Target.Building }],
  },
  [GrandmaUpgradeId["Kitchen Cabinets"]]: {
    description: `${plural(Target.Grandma)} are **twice** as efficient.`,
    effects: [
      {
        configuration: {
          type: EffectType.Multiplicative,
        },
        targets: [Target.Grandma],
        value: 2,
      },
    ],
    flavorDescription:
      "A grandma's kitchen cabinet is a befuddling place. Through lesser-studied aggregating instincts, grandmas will tend to gradually fill all nearby cabinets with various sorts of things, such as curious coconut snacks or dietetic powders. By contract, these are legally yours, which opens up exciting opportunities for your substance investigation department.",
    price: 5e38,
    unlockConditions: [{ amount: 550, id: Target.Grandma, type: Target.Building }],
  },
  [GrandmaUpgradeId["Lubricated Dentures"]]: {
    description: `${plural(Target.Grandma)} are **twice** as efficient.`,
    effects: [
      {
        configuration: {
          type: EffectType.Multiplicative,
        },
        targets: [Target.Grandma],
        value: 2,
      },
    ],
    flavorDescription: "squish",
    price: 5e4,
    unlockConditions: [{ amount: 25, id: Target.Grandma, type: Target.Building }],
  },
  [GrandmaUpgradeId["Prune Juice"]]: {
    description: `${plural(Target.Grandma)} are **twice** as efficient.`,
    effects: [
      {
        configuration: {
          type: EffectType.Multiplicative,
        },
        targets: [Target.Grandma],
        value: 2,
      },
    ],
    flavorDescription: "Gets me going.",
    price: 5e6,
    unlockConditions: [{ amount: 50, id: Target.Grandma, type: Target.Building }],
  },
  [GrandmaUpgradeId["Reverse Dementia"]]: {
    description: `${plural(Target.Grandma)} are **twice** as efficient.`,
    effects: [
      {
        configuration: {
          type: EffectType.Multiplicative,
        },
        targets: [Target.Grandma],
        value: 2,
      },
    ],
    flavorDescription: "Extremely unsettling, and somehow even worse than the regular kind.",
    price: 5e19,
    unlockConditions: [{ amount: 300, id: Target.Grandma, type: Target.Building }],
  },
  [GrandmaUpgradeId["Steel-plated Rolling Pins"]]: {
    description: `${plural(Target.Grandma)} are **twice** as efficient.`,
    effects: [
      {
        configuration: {
          type: EffectType.Multiplicative,
        },
        targets: [Target.Grandma],
        value: 2,
      },
    ],
    flavorDescription: "Just what you kneaded.",
    price: 5e3,
    unlockConditions: [{ amount: 5, id: Target.Grandma, type: Target.Building }],
  },
  [GrandmaUpgradeId["The Unbridling"]]: {
    description: `${plural(Target.Grandma)} are **twice** as efficient.`,
    effects: [
      {
        configuration: {
          type: EffectType.Multiplicative,
        },
        targets: [Target.Grandma],
        value: 2,
      },
    ],
    flavorDescription: "It might be a classic tale of bad parenting, but let's see where grandma is going with this.",
    price: 5e16,
    unlockConditions: [{ amount: 250, id: Target.Grandma, type: Target.Building }],
  },
  [GrandmaUpgradeId["Timeproof Hair Dyes"]]: {
    description: `${plural(Target.Grandma)} are **twice** as efficient.`,
    effects: [
      {
        configuration: {
          type: EffectType.Multiplicative,
        },
        targets: [Target.Grandma],
        value: 2,
      },
    ],
    flavorDescription:
      "Why do they always have those strange wispy pink dos? What do they know about candy floss that we don't?",
    price: 5e22,
    unlockConditions: [{ amount: 350, id: Target.Grandma, type: Target.Building }],
  },
  [GrandmaUpgradeId["Xtreme Walkers"]]: {
    description: `${plural(Target.Grandma)} are **twice** as efficient.`,
    effects: [
      {
        configuration: {
          type: EffectType.Multiplicative,
        },
        targets: [Target.Grandma],
        value: 2,
      },
    ],
    flavorDescription: 'Complete with flame decals and a little horn that goes "toot".',
    price: 5e13,
    unlockConditions: [{ amount: 200, id: Target.Grandma, type: Target.Building }],
  },
} as const satisfies Record<GrandmaUpgradeId, Except<Upgrade<GrandmaUpgradeId>, "id">>;
