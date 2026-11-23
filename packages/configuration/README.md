# @esposter/configuration

[![Apache-2.0 licensed][badge-license]][url-license]

It provides shared build configuration for all Esposter packages: TSConfig bases, the oxfmt formatter settings and the tsdown build configurations that each package's `tsdown.config.ts` composes.

Design notes live in [the specs](https://github.com/Esposter/Esposter/tree/main/openspec/specs).

## Table of Contents

- 📝 [Usage](#usage)
- ⚖️ [License](#license)

---

## <a name="usage">📝 Usage</a>

```ts
// tsdown.config.ts
import { getTsdownConfiguration } from "@esposter/configuration";

export default getTsdownConfiguration();
```

```ts
// oxfmt.config.ts — the formatter's settings, which a generator formatting its own output reads too
import oxfmtConfiguration from "@esposter/configuration/oxfmt";

export default oxfmtConfiguration;
```

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
