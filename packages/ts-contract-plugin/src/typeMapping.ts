import type { GeneratedFile, Printable } from "@bufbuild/protoplugin";
import type { DescField, DescFile, DescMessage } from "@bufbuild/protobuf";
import { scalarTypeScriptType } from "@bufbuild/protobuf/codegenv2";
import { generateContractFileName, inputTypeName } from "./naming.js";

export interface FieldTypeContext {
  readonly file: DescFile;
  readonly gen: GeneratedFile;
}

type ValueKind = "scalar" | "enum" | "message";

export function fieldTypePrintable(
  field: DescField,
  context: FieldTypeContext,
): Printable {
  const kind = field.fieldKind;
  switch (kind) {
    case "scalar": {
      return valuePrintable("scalar", field, context);
    }
    case "enum": {
      return valuePrintable("enum", field, context);
    }
    case "message": {
      return valuePrintable("message", field, context);
    }
    case "list": {
      return [valuePrintable(field.listKind, field, context), "[]"];
    }
    case "map": {
      const value = valuePrintable(field.mapKind, field, context);
      return ["Record<string, ", value, ">"];
    }
    default: {
      throw new Error(`unsupported field kind ${String(kind)}`);
    }
  }
}

function valuePrintable(
  kind: ValueKind,
  field: Pick<DescField, "scalar" | "enum" | "message">,
  context: FieldTypeContext,
): Printable {
  switch (kind) {
    case "scalar": {
      if (field.scalar === undefined) {
        throw new Error("scalar kind requires scalar type");
      }
      return scalarTypeScriptType(field.scalar, false);
    }
    case "enum": {
      if (field.enum === undefined) {
        throw new Error("enum kind requires enum descriptor");
      }
      return context.gen.importShape(field.enum);
    }
    case "message": {
      if (field.message === undefined) {
        throw new Error("message kind requires message descriptor");
      }
      return messageInputReference(field.message, context);
    }
    default: {
      const unreachable: never = kind;
      throw new Error(`unknown value kind ${unreachable}`);
    }
  }
}

function messageInputReference(
  message: DescMessage,
  context: FieldTypeContext,
): Printable {
  if (message.file.proto.package.startsWith("google.")) {
    return context.gen.importShape(message);
  }
  if (message.file === context.file) {
    return inputTypeName(message);
  }
  const symbol = inputTypeName(message);
  const target = `./${generateContractFileName(message.file).replace(
    /\.ts$/,
    ".js",
  )}`;
  return context.gen.import(symbol, target, true);
}
