import { expect, test } from "vitest";
import { type Middleware, type Service, ServiceBuilder } from "../src/index.js";

const EXTRA = Symbol("extra");

type WithExtra<T extends object, E> = T & { [EXTRA]: E };

function withExtra<T extends object, E>(value: T, extra: E): WithExtra<T, E> {
  return Object.assign(value, { [EXTRA]: extra });
}

/**
 * Middleware that attaches extra information to the input.
 */
class InputEnrichingMiddleware<I extends object, O>
  implements Middleware<I, O, WithExtra<I, number>, O>
{
  public invoke(input: I, next: Service<WithExtra<I, number>, O>): O {
    return next.invoke(withExtra(input, Date.now()));
  }
}

/**
 * Middleware that attaches extra information to the output.
 */
class OutputEnrichingMiddleware<I, O extends object>
  implements Middleware<I, Promise<WithExtra<O, number>>, I, Promise<O>>
{
  public async invoke(
    input: I,
    next: Service<I, Promise<O>>,
  ): Promise<WithExtra<O, number>> {
    return withExtra(await next.invoke(input), Date.now());
  }
}

/**
 * Transparent middleware that does not alter neither the input nor the output.
 */
class TransparentMiddleware<I, O> implements Middleware<I, O, I, O> {
  public invoke(input: I, next: Service<I, O>): O {
    return next.invoke(input);
  }
}

test("fetch", async () => {
  const timeoutDuration = 100;

  const sb0 = ServiceBuilder.create<
    Request,
    Promise<WithExtra<Response, number>>
  >();
  const sb1 = sb0.use(new TransparentMiddleware());
  const sb2 = sb1.use(new InputEnrichingMiddleware());
  const sb3 = sb2.use(new TransparentMiddleware());
  const sb4 = sb3.use(new OutputEnrichingMiddleware());
  const sb5 = sb4.use(new TransparentMiddleware());

  const service = sb5.build({
    async invoke(_input) {
      // pretend to wait for a network operation
      await new Promise((cb) => setTimeout(cb, timeoutDuration));
      // return a fetch response
      return new Response(null, { status: 200, statusText: "ok" });
    },
  });

  const output = await service.invoke(new Request("http://127.0.0.1"));
  expect(output[EXTRA]).toBeGreaterThanOrEqual(timeoutDuration);
});
