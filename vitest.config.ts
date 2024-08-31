import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, "./.direnv"],

    coverage: {
      exclude: [...(configDefaults.coverage.exclude ?? []), "./examples"],
    },

    typecheck: {
      exclude: [...configDefaults.typecheck.exclude, "./.direnv"],
    },
  },
});
