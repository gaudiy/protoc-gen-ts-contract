import type { DescFile, DescMessage } from "@bufbuild/protobuf";
import type { Schema, GeneratedFile } from "@bufbuild/protoplugin";
import { fieldTypePrintable } from "./typeMapping.js";
import { generateContractFileName, inputTypeName } from "./naming.js";
import type { PluginOptions } from "./options.js";
import {
  isRequiredField,
  resolveValidateFieldExtension,
} from "./validateRules.js";

export function generateTs(schema: Schema<PluginOptions>, _target: "ts"): void {
  const validateExtension = resolveValidateFieldExtension(schema.allFiles);
  const packageMatchers = createPackageMatchers(schema.options.skipPackages);
  for (const file of schema.files) {
    if (shouldSkipFile(file, packageMatchers)) continue;

    const outputName = generateContractFileName(file);
    const gen = schema.generateFile(outputName);
    gen.preamble(file);

    const messages = collectMessages(schema, file);
    for (const [index, message] of messages.entries()) {
      printMessageInput(gen, file, message, validateExtension);

      // Add a blank line between messages, but not after the last one
      // to avoid trailing empty lines in the generated file.
      if (index < messages.length - 1) {
        gen.print();
      }
    }
  }
}

/**
 * Converts package name patterns to regular expressions.
 *
 * Why not use plain regex? Users can write simple patterns like `google.*`
 * without regex knowledge. The `*` wildcard is converted to `.*`, and `^`/`$`
 * anchors are automatically added to ensure whole-string matching (prevents
 * partial matches). User-provided anchors are preserved.
 */
function createPackageMatchers(patterns: readonly string[]): RegExp[] {
  return patterns.map((pattern) => {
    const hasStartAnchor = pattern.startsWith("^");
    const hasEndAnchor = pattern.endsWith("$");
    const source = pattern.replace(/\*/g, ".*");
    const anchored = `${hasStartAnchor ? "" : "^"}${source}${
      hasEndAnchor ? "" : "$"
    }`;
    return new RegExp(anchored);
  });
}

function shouldSkipFile(
  file: DescFile,
  packageMatchers: readonly RegExp[]
): boolean {
  return packageMatchers.some((matcher) => matcher.test(file.proto.package));
}

/**
 * Collects all message types from a file, excluding map entry messages.
 *
 * Map entry messages are internal implementation details created by protobuf
 * for `map<K, V>` fields. They are not user-facing types and should not be
 * generated as contract interfaces. Map fields are instead represented as
 * `Record<K, V>` in the generated TypeScript code.
 */
function collectMessages(schema: Schema, file: DescFile): DescMessage[] {
  return Array.from(schema.typesInFile(file))
    .filter(
      (type): type is DescMessage =>
        type.kind === "message" && !isMapEntry(type)
    )
    .sort((a, b) => (a.typeName > b.typeName ? 1 : -1));
}

function isMapEntry(message: DescMessage): boolean {
  return message.proto.options?.mapEntry === true;
}

function printMessageInput(
  gen: GeneratedFile,
  file: DescFile,
  message: DescMessage,
  extension: ReturnType<typeof resolveValidateFieldExtension>
): void {
  const interfaceName = inputTypeName(message);
  gen.print(gen.export("interface", interfaceName), " {");
  const fields = [...message.fields].sort((a, b) => a.number - b.number);
  for (const field of fields) {
    // Skip oneof fields in the current version (not supported). proto3Optional
    // fields are treated as regular optional fields, so they are not skipped.
    if (field.oneof && field.proto.proto3Optional !== true) {
      continue;
    }
    const required =
      field.fieldKind === "list" || field.fieldKind === "map"
        ? false
        : isRequiredField(field, extension);
    const optionalMarker = required ? "" : "?";
    const typePrintable = fieldTypePrintable(field, { file, gen });
    gen.print(`  ${field.localName}${optionalMarker}: `, typePrintable, ";");
  }
  gen.print("}");
}
