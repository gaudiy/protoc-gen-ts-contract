import {
  createRegistry,
  getOption,
  hasOption,
  type DescField,
  type DescFile,
} from "@bufbuild/protobuf";
import {
  field as validateFieldExtension,
  file_buf_validate_validate,
} from "./gen/buf/validate/validate_pb.js";

const VALIDATE_FIELD_EXTENSION_NAME = "buf.validate.field";

export function resolveValidateFieldExtension(
  files: readonly DescFile[]
): typeof validateFieldExtension {
  const registry = createRegistry(file_buf_validate_validate, ...files);
  const extension = registry.getExtension(VALIDATE_FIELD_EXTENSION_NAME);
  if (!extension) {
    throw new Error(
      `missing required extension ${VALIDATE_FIELD_EXTENSION_NAME}; ensure buf.build/bufbuild/protovalidate is available`
    );
  }
  return extension as typeof validateFieldExtension;
}

export function isRequiredField(
  field: DescField,
  extension: typeof validateFieldExtension
): boolean {
  if (!hasOption(field, extension)) {
    return false;
  }
  const rules = getOption(field, extension);
  return rules.required === true;
}
