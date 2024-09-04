import { describe, expectTypeOf, it } from "vitest";
import type { Middleware } from "./middleware.js";
import { type IntoService, type Service, ServiceBuilder } from "./service.js";

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

describe("Service", () => {
  const EXTRA = Symbol("extra");
  type WithExtra<T extends object, E> = T & { [EXTRA]: E };

  it("the service is contravariant over the input", () => {
    interface S<I, O> {
      // biome-ignore lint/style/useShorthandFunctionType: <explanation>
      (input: I): O;
    }

    type Wide = S<Request, Response>;
    type Narrow = S<WithExtra<Request, number>, Response>;

    // a Service that handles `Request`s can act as a service that handles
    // `WithExtra<Request, number>`s.
    expectTypeOf<Wide>().toMatchTypeOf<Narrow>();
    // but the opposite is not true
    expectTypeOf<Narrow>().not.toMatchTypeOf<Wide>();
  });

  it("is assignable if defined as a function", () => {
    interface S<I, O> {
      fn(input: I): O;
    }

    type Wide = S<Request, Response>;
    type Narrow = S<WithExtra<Request, number>, Response>;

    expectTypeOf<Wide>().toMatchTypeOf<Narrow>();
    // unlike the perious test case, `S` is not a function, as such `I` became
    // covariant instead of contravariant which causes a service that handles
    // `WithExtra<Request, number>`s to be assignable where we'd want a service
    // that handles `Request`s, which makes little sense.
    expectTypeOf<Narrow>().toMatchTypeOf<Wide>();
  });

  it("it is ", () => {
    interface _S<T extends (input: never) => unknown> {
      fn: T;
    }
    interface S<I, O> extends _S<(input: I) => O> {}

    type Wide = S<Request, Response>;
    type Narrow = S<WithExtra<Request, number>, Response>;

    expectTypeOf<Wide>().toMatchTypeOf<Narrow>();
    // `S` is still an object instead of a function, it's public API does not
    // changes but it behaves correctly.
    expectTypeOf<Narrow>().not.toMatchTypeOf<Wide>();
  });
});

describe("ServiceBuilder", () => {
  it("generates a properly-typed service", () => {
    const svc = ServiceBuilder.create<string, string>();

    expectTypeOf(svc.build)
      .parameter(0)
      .toEqualTypeOf<IntoService<string, string>>();
    expectTypeOf(svc.build).returns.toEqualTypeOf<Service<string, string>>();
  });

  it("retains the correct service type even with middlewares", () => {
    const svc = ServiceBuilder.create<string, string>().use(
      new ParseIntMiddleware(),
    );

    expectTypeOf(svc.build)
      .parameter(0)
      .toEqualTypeOf<IntoService<number, string>>();
    expectTypeOf(svc.build).returns.toEqualTypeOf<Service<string, string>>();
  });

  it("allows chaining multiple middlewares", () => {
    const svc = ServiceBuilder.create<string, string>()
      .use(new ParseIntMiddleware())
      .use(new IsPositiveMiddleware());

    expectTypeOf(svc.build)
      .parameter(0)
      .toEqualTypeOf<IntoService<boolean, string>>();
    expectTypeOf(svc.build).returns.toEqualTypeOf<Service<string, string>>();
  });

  it("preserves types", () => {
    interface Base {
      value: string;
    }

    interface Enhanced extends Base {
      extra: number;
    }

    class TypeEnrichingMiddleware<O>
      implements Middleware<Base, O, Enhanced, O>
    {
      public invoke(input: Base, next: Service<Enhanced, O>): O {
        return next.invoke({ ...input, extra: 0 });
      }
    }

    class TypeOverridingMiddleware<O> implements Middleware<Base, O> {
      public invoke(input: Base, next: Service<Base, O>): O {
        return next.invoke(input);
      }
    }

    class TypePreservingMiddleware<I extends Base, O>
      implements Middleware<I, O>
    {
      public invoke(input: I, next: Service<I, O>): O {
        return next.invoke(input);
      }
    }

    // we transform `Base` into `Enhanced`
    const a = ServiceBuilder.create<Base, string>().use(
      new TypeEnrichingMiddleware(),
    );
    expectTypeOf(a.build)
      .parameter(0)
      .toEqualTypeOf<IntoService<Enhanced, string>>();

    // `TypeOverridingMiddleware` discards the extra type information
    const b = a.use(new TypeOverridingMiddleware());
    expectTypeOf(b.build)
      .not.parameter(0)
      .toEqualTypeOf<IntoService<Enhanced, string>>();

    // `TypePreservingMiddleware` preserves the extra type information
    const c = a.use(new TypePreservingMiddleware());
    expectTypeOf(c.build)
      .parameter(0)
      .toEqualTypeOf<IntoService<Enhanced, string>>();
  });
});
