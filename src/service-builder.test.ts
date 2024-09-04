import { describe, expect, it } from "vitest";
import type { Middleware } from "./middleware.js";
import { ServiceBuilder } from "./service-builder.js";
import type { Service } from "./service.js";

describe("ServiceBuilder", () => {
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
