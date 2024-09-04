import { describe, expectTypeOf, it } from "vitest";

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
