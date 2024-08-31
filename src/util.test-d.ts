import { expectTypeOf, test } from "vitest";
import type { IsEqual } from "./util.js";

test("IsEqual", () => {
  expectTypeOf<IsEqual<1, 1>>().toEqualTypeOf<true>();
  expectTypeOf<IsEqual<boolean, boolean>>().toEqualTypeOf<true>();
  expectTypeOf<IsEqual<true, true>>().toEqualTypeOf<true>();
  expectTypeOf<IsEqual<[1], [1]>>().toEqualTypeOf<true>();

  expectTypeOf<IsEqual<boolean, true>>().toEqualTypeOf<false>();
  expectTypeOf<IsEqual<{ a: 1 }, { a: 1; b: 2 }>>().toEqualTypeOf<false>();
});
