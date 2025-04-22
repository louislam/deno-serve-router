# deno-serve-router

A very simple router implementation for `Deno.serve()` using [URL Pattern API](https://developer.mozilla.org/en-US/docs/Web/API/URLPattern).

No fancy, just works.

- Supports URL patterns such as `/user/:id`
- Using the standard API:
  - [URL Pattern API](https://developer.mozilla.org/en-US/docs/Web/API/URLPattern) to match your routes
  - [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) - `Request` and `Response`

## How to Use

1. Add the dependency to your deno project:

    ```bash
    deno add jsr:@louislam/deno-serve-router
    ```

    ```typescript
    import { Router } from "@louislam/deno-serve-router";
    ```

    or just import it directly:

    ```typescript
    import { Router } from "jsr:@louislam/deno-serve-router";
    ```

1. Import and add your routes:

    ```typescript
    const router = new Router();
    router.add("GET", "/", (request, params) => {
        return new Response("Hello World!");
    });
    ```

1. And then, inside the handler of `Deno.serve(...)`, you can match your routes like this:

    ```typescript
    const response = await router.match(request);
    ```

1. Since it is possible that no route matches, you should check if `response` is not `undefined` before returning it:

    ```typescript
    if (response) {
        return response;
    }
    ```

## Simple Full Example

```typescript
import { Router } from "jsr:@louislam/deno-serve-router";

const router = new Router();

// Add your routes
router.add("GET", "/", (request, params) => {
    return new Response("Hello World!");
});

Deno.serve(async (request) => {
    // Match here
    const response = await router.match(request);
    if (response) {
        return response;
    }
    // Return 404 if no route matches
    return new Response("404 Not Found", { status: 404 });
});
```

## Advanced Usage

### Params

```typescript
router.add("GET", "/hello/:myName", (request, params) => {
    return new Response("Hello " + params.myName);
});
```

### URLPatternResult

The third parameter is the `URLPatternResult` object.

Check the [URL Pattern API](https://developer.mozilla.org/en-US/docs/Web/API/URLPattern) for more information.

```typescript
router.add("GET", "/hello/:myName", (request, params, urlPatternResult) => {
    return new Response("Hello " + params.myName);
});
```
