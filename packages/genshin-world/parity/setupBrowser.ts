import { NuxtImgStub } from "#parity/NuxtImgStub";
import { config } from "vitest-browser-vue";

config.global.stubs = { ...config.global.stubs, NuxtImg: NuxtImgStub };
