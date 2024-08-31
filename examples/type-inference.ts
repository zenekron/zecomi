import {
  type AsyncMiddleware,
  type Service,
  ServiceBuilder,
} from "../src/index.js";

/*!
 * Let's assume we want to create a middleware that consumes `Request`s and
 * generates `Response`s, we might be tempted to write it as follows:
 */

class MyMiddleware implements AsyncMiddleware<Request, Response> {
  public invoke(
    input: Request,
    next: Service<Request, Promise<Response>>,
  ): Promise<Response> {
    return next.invoke(input);
  }
}

/*!
 * The problem with this approach is that `MyMiddleware` is stating that the
 * input type for the following components of the pipeline is exactly `Request`,
 * thus, if another component had enriched the input type before `MyMiddleware`,
 * that information will be lost, e.g.:
 */

type WithStartDate<T extends object> = T & { startedAt: Date };

/**
 * Middleware that enriches the input type with the `Date` at which the input
 * was encountered.
 */
class DateMiddleware
  implements
    AsyncMiddleware<Request, Response, WithStartDate<Request>, Response>
{
  public invoke(
    input: Request,
    next: Service<WithStartDate<Request>, Promise<Response>>,
  ): Promise<Response> {
    return next.invoke(Object.assign(input, { startedAt: new Date() }));
  }
}

ServiceBuilder.createAsync<Request, Response>()
  .use(new DateMiddleware())
  // `input` is now `WithStartDate<Request>`
  .use(new MyMiddleware())
  // `input` is `Request`, information was lost
  .build({
    // @ts-expect-error
    invoke(input: WithStartDate<Request>) {
      input;
      throw new Error("not implemented");
    },
  });

/*!
 * If we had defined our middleware to be generic over the input and output
 * types instead, this information could've been preserved:
 */

class MyGenericMiddleware<I extends Request, O extends Response>
  implements AsyncMiddleware<I, O>
{
  public invoke(input: I, next: Service<I, Promise<O>>): Promise<O> {
    return next.invoke(input);
  }
}

ServiceBuilder.createAsync<Request, Response>()
  .use(new DateMiddleware())
  .use(new MyGenericMiddleware())
  .build({
    invoke(input: WithStartDate<Request>) {
      console.log(input.startedAt);
      throw new Error("not implemented");
    },
  });
