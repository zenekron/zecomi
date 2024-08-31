import { describe, expectTypeOf, it } from "vitest";
import type { Middleware } from "./middleware.js";

describe("Middleware", () => {
  it("is properly assignable", () => {
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
    type EM = Middleware<EIn, Response, Request, Response>;

    expectTypeOf<M>().toMatchTypeOf<EM>();
    expectTypeOf<EM>().not.toMatchTypeOf<M>();
  });
});
