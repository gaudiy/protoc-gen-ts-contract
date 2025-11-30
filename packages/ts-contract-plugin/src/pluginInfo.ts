import pkg from "../package.json" with { type: "json" };

export const PLUGIN_NAME = "protoc-gen-ts-contract";
export const PLUGIN_VERSION = `v${pkg.version}`;
