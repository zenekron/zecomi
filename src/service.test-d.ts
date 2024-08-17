import { describe, expectTypeOf, it } from "vitest";
import type { Middleware } from "./middleware.js";
import { type Service, ServiceBuilder } from "./service.js";

class ParseIntMiddleware<I extends string, O>
  implements Middleware<I, O, number, O>
{
  public invoke(input: I, next: Service<number, O>): O {
    // biome-ignore lint/style/useNumberNamespace: we do not have access to `Number.parseInt`
    return next.invoke(parseInt(input, 10));
  }
}

class IsPositiveMiddleware<I extends number, O>
  implements Middleware<I, O, boolean, O>
{
  public invoke(input: I, next: Service<boolean, O>): O {
    return next.invoke(input >= 0);
  }
}

describe("ServiceBuilder", () => {
  it("generates a properly-typed service", () => {
    const svc = ServiceBuilder.create<string, string>();

    expectTypeOf(svc.build)
      .parameter(0)
      .toEqualTypeOf<Service<string, string>>();
    expectTypeOf(svc.build).returns.toEqualTypeOf<Service<string, string>>();
  });

  it("retains the correct service type even with middlewares", () => {
    const svc = ServiceBuilder.create<string, string>().use(
      new ParseIntMiddleware(),
    );

    expectTypeOf(svc.build)
      .parameter(0)
      .toEqualTypeOf<Service<number, string>>();
    expectTypeOf(svc.build).returns.toEqualTypeOf<Service<string, string>>();
  });

  it("allows chaining multiple middlewares", () => {
    const svc = ServiceBuilder.create<string, string>()
      .use(new ParseIntMiddleware())
      .use(new IsPositiveMiddleware());

    expectTypeOf(svc.build)
      .parameter(0)
      .toEqualTypeOf<Service<boolean, string>>();
    expectTypeOf(svc.build).returns.toEqualTypeOf<Service<string, string>>();
  });
});
