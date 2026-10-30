import { NuxtImgStub } from "#parity/NuxtImgStub";
import { NuxtTimeStub } from "#parity/NuxtTimeStub";
import { config } from "vitest-browser-vue";

config.global.stubs = { ...config.global.stubs, NuxtImg: NuxtImgStub, NuxtTime: NuxtTimeStub };
