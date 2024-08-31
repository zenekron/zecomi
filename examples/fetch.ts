import {
  type AsyncMiddleware,
  type Service,
  ServiceBuilder,
} from "../src/index.js";

/**
 * Middleware that appends the appropriate auth information to outgoing
 * requests.
 */
class AuthMiddleware<I extends Request, O extends Response>
  implements AsyncMiddleware<I, O, I, O>
{
  /**
   * Getter that returns our auth token, the actual implementation would vary.
   */
  private get token(): string {
    return "my-token";
  }

  public invoke(input: I, next: Service<I, Promise<O>>): Promise<O> {
    // we populate the "Authorization" header with the token
    input.headers.set("Authorization", `Bearer ${this.token}`);
    // and we forward the input to the next service or middleware
    return next.invoke(input);
  }
}

const fetchService =
  // we create a new ServiceBuilder
  ServiceBuilder.create<Request, Promise<Response>>()
    // we chain a new instance of our `AuthMiddleware`
    .use(new AuthMiddleware())
    // and finally provide the service that consumes inputs and returns outputs
    .build({ invoke: fetch });

async function main() {
  // any request made using our new `fetchService` will go through the
  // `AuthMiddleware` and will have its `Authorization` header populated.
  const response = await fetchService.invoke(new Request("/user"));

  response.ok; // => true
}

main().catch(console.error);
