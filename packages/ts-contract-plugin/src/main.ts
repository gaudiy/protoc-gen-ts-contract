import { createEcmaScriptPlugin, runNodeJs } from "@bufbuild/protoplugin";
import { generateTs } from "./generator.js";
import { parseOptions } from "./options.js";
import { PLUGIN_NAME, PLUGIN_VERSION } from "./pluginInfo.js";

export const plugin = createEcmaScriptPlugin({
  name: PLUGIN_NAME,
  version: PLUGIN_VERSION,
  parseOptions,
  generateTs,
});

export function main(): void {
  runNodeJs(plugin);
}
