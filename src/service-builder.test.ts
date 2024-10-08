import { describe, expect, it } from "vitest";
import type { Middleware } from "./middleware.js";
import { ServiceBuilder } from "./service-builder.js";
import type { Service } from "./service.js";

describe("ServiceBuilder", () => {
  it("allows providing functions instead of middlewares and services", async () => {
    type WithFoo<T extends object> = T & { foo: string };
    function withFoo<T extends object>(obj: T, foo: string): WithFoo<T> {
      return Object.assign(obj, { foo });
    }

    const svc = ServiceBuilder.createAsync<Request, WithFoo<Response>>()
      // no transforms
      .use((input, next) => next.invoke(input))
      // input transform
      .use<WithFoo<Request>>((input, next) =>
        next.invoke(withFoo(input, "bar")),
      )
      // output transform
      .use<WithFoo<Request>, Promise<Response>>(async (input, next) =>
        withFoo(await next.invoke(input), "baz"),
      )
      .build((input) => Promise.resolve(new Response(input.url)));

    const input = new Request("https://example.local");
    const output = await svc.invoke(input);
    expect(await output.text()).toStrictEqual(input.url);
    expect(output.foo).toBe("baz");
  });

  it("chains middlewares in the correct order", () => {
    interface OrderInput {
      inputs: number[];
      outputs: number[];
    }

    interface OrderOutput extends OrderInput {}

    class OrderMiddleware<I extends OrderInput, O extends OrderOutput>
      implements Middleware<I, O>
    {
      public constructor(private readonly value: number) {}

      public invoke(input: I, next: Service<I, O>): O {
        input.inputs.push(this.value);
        const res = next.invoke(input);
        res.outputs.push(this.value);
        return res;
      }
    }

    const service = ServiceBuilder.create<OrderInput, OrderOutput>()
      .use(new OrderMiddleware(1))
      .use(new OrderMiddleware(2))
      .use(new OrderMiddleware(3))
      .build({
        invoke(input) {
          return input;
        },
      });

    const output = service.invoke({ inputs: [], outputs: [] });
    expect(output).toStrictEqual<typeof output>({
      inputs: [1, 2, 3],
      outputs: [3, 2, 1],
    });
  });
});
