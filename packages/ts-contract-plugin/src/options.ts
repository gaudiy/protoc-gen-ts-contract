export interface PluginOptions {
  readonly skipPackages: readonly string[];
}

export const DEFAULT_SKIP_PACKAGES = ["google.*", "buf.*"] as const;

const SKIP_PACKAGE_OPTION = "skip_pkg";

/**
 * Parse plugin options passed from protoc/buf.
 *
 * Supported options:
 * - `skip_pkg=<package>`: skip generation for packages matching the given value. Multiple entries accumulate; if omitted, defaults to `google.*` and `buf.*`.
 * - Any unknown option causes an error.
 *
 * @param rawOptions key/value pairs as received from protoc/buf option parsing
 * @returns normalized plugin options with `skipPackages`
 * @throws Error on unknown options or empty `skip_pkg` value
 */
export function parseOptions(
  rawOptions: { key: string; value: string }[]
): PluginOptions {
  const skipPackages = new Set<string>();
  const unknownOptions: string[] = [];

  for (const { key, value } of rawOptions) {
    switch (key) {
      case SKIP_PACKAGE_OPTION: {
        const trimmed = value.trim();
        if (trimmed.length === 0) {
          throw new Error("skip_pkg requires a non-empty value");
        }
        skipPackages.add(trimmed);
        break;
      }
      default:
        unknownOptions.push(value && value.length > 0 ? `${key}=${value}` : key);
    }
  }

  if (unknownOptions.length > 0) {
    throw new Error(`unknown option(s): ${unknownOptions.join(", ")}`);
  }

  return {
    skipPackages:
      skipPackages.size > 0 ? [...skipPackages] : [...DEFAULT_SKIP_PACKAGES],
  };
}
