import { describe, expectTypeOf, it, test } from "vitest";
import type { Middleware, MiddlewareChain } from "./middleware.js";

describe("Middleware", () => {
  test("assignability", () => {
    const EXTRA = Symbol("extra");
    type WithExtra<T extends object, E> = T & { [EXTRA]: E };

    type In = Request;
    type Out = Response;
    type EIn = WithExtra<In, string>;
    type EOut = WithExtra<Out, string>;

    expectTypeOf<EIn>().toMatchTypeOf<In>();
    expectTypeOf<In>().not.toMatchTypeOf<EIn>();

    expectTypeOf<EOut>().toMatchTypeOf<Out>();
    expectTypeOf<Out>().not.toMatchTypeOf<EOut>();

    type M = Middleware<Request, Response, Request, Response>;
    type EM = Middleware<EIn, Response, EIn, Response>;

    expectTypeOf<EM>().toMatchTypeOf<M>();
    expectTypeOf<M>().not.toMatchTypeOf<EM>();
  });
});

describe("MiddlewareChain", () => {
  type StringMiddlewares = MiddlewareChain<string, string, string, string>;

  type S2S = Middleware<string, string, string, string>;
  type S2N = Middleware<string, string, number, number>;
  type N2S = Middleware<number, number, string, string>;
  type N2B = Middleware<number, number, boolean, boolean>;

  it("can be empty if the internal and external I/O types match", () => {
    const it = expectTypeOf<[]>();
    it.toMatchTypeOf<MiddlewareChain<string, string, string, string>>();
    it.not.toMatchTypeOf<MiddlewareChain<string, string, number, string>>();
    it.not.toMatchTypeOf<MiddlewareChain<string, string, string, number>>();
  });

  it("works with a single middleware", () => {
    expectTypeOf<[S2S]>().toMatchTypeOf<StringMiddlewares>();
    expectTypeOf<[S2N]>().not.toMatchTypeOf<StringMiddlewares>();
  });

  describe("chain of 2 middlewares", () => {
    it("works for properly chained middlewares", () => {
      expectTypeOf<[S2N, N2S]>().toMatchTypeOf<StringMiddlewares>();
    });

    it("rejects chains with mismatched outer I/O types", () => {
      expectTypeOf<[S2N, N2B]>().not.toMatchTypeOf<StringMiddlewares>();
      expectTypeOf<[S2N, N2B]>().toMatchTypeOf<
        MiddlewareChain<string, string, boolean, boolean>
      >();
    });

    // it("rejects chains with mismatched inner I/O types", () => {
    //   expectTypeOf<[S2N, N2S, N2S]>().not.toMatchTypeOf<StringMiddlewares>();
    // });
  });
});
