import { assertEquals } from "jsr:@std/assert";
import { describe, it as test } from "jsr:@std/testing/bdd";
import { Router } from "./router.ts";
import { expect } from "jsr:@std/expect";

describe("Test router", () => {
    test("normal case", async () => {
        const request = new Request("https://example.com", {
            method: "GET",
        });

        const router = new Router();

        router.add("GET", "/", (request, params) => {
            return new Response("Hello!!!!");
        });

        const response = await router.match(request);

        expect(response).toBeInstanceOf(Response);

        if (response) {
            expect(response.status).toBe(200);
            expect(await response.text()).toBe("Hello!!!!");
        }
    });

    test("normal case with params", async () => {
        const request = new Request("https://example.com/foo/bar", {
            method: "GET",
        });

        const router = new Router();

        router.add("GET", "/foo/:id", (request, params) => {
            return new Response(params.id);
        });

        const response = await router.match(request);

        expect(response).toBeInstanceOf(Response);

        if (response) {
            expect(response.status).toBe(200);
            expect(await response.text()).toBe("bar");
        }
    });

    test("Test not match", async () => {
        const request = new Request("https://example.com/foo22222", {
            method: "GET",
        });

        const router = new Router();

        router.add("GET", "/foo", (request, params) => {
            return new Response("Hello!!!!");
        });

        const response = await router.match(request);

        expect(response).toBeUndefined();
    });

    test("Test match, but return 404", async () => {
        const request = new Request("https://example.com", {
            method: "GET",
        });

        const router = new Router();

        router.add("GET", "/", (request, params) => {
            return new Response("Hello!!!! Sorry not found!", {
                status: 404,
            });
        });

        const response = await router.match(request);

        expect(response).toBeInstanceOf(Response);

        if (response) {
            expect(response.status).toBe(404);
            expect(await response.text()).toBe("Hello!!!! Sorry not found!");
        }
    });

    test("Test match pattern, but different method", async () => {
        const request = new Request("https://example.com", {
            method: "GET",
        });

        const router = new Router();

        router.add("POST", "/", (request, params) => {
            return new Response("You should not see this!");
        });

        const response = await router.match(request);

        expect(response).toBeUndefined();
    });

    test("Test match same pattern, multiple methods", async () => {
        const request = new Request("https://example.com", {
            method: "GET",
        });

        const request2 = new Request("https://example.com", {
            method: "POST",
        });

        const router = new Router();

        router.add("GET", "/", (request, params) => {
            return new Response("1");
        });

        router.add("POST", "/", (request, params) => {
            return new Response("2");
        });

        const response = await router.match(request);

        expect(response).toBeInstanceOf(Response);

        if (response) {
            expect(response.status).toBe(200);
            expect(await response.text()).toBe("1");
        }

        const response2 = await router.match(request2);

        expect(response2).toBeInstanceOf(Response);

        if (response2) {
            expect(response2.status).toBe(200);
            expect(await response2.text()).toBe("2");
        }
    });

    test("Test async handler", async () => {
        const request = new Request("https://example.com", {
            method: "GET",
        });

        const router = new Router();

        router.add("GET", "/", async (request, params) => {
            return new Response("Hello!!!!");
        });

        const response = await router.match(request);

        expect(response).toBeInstanceOf(Response);

        if (response) {
            expect(response.status).toBe(200);
            expect(await response.text()).toBe("Hello!!!!");
        }
    });
});

Deno.test({
    name: "Test with Deno.serve (Example)",
    fn: async () => {
        const router = new Router();

        // Add your routes
        router.add("GET", "/", (request, params) => {
            return new Response("Hello World!");
        });

        router.add("GET", "/foo/:id", (request, params) => {
            return new Response(params.id);
        });

        const ac = new AbortController();
        const server = Deno.serve({
            port: 8000,
            hostname: "127.0.0.1",
            signal: ac.signal
        }, async (request) => {
            // Match here
            const response = await router.match(request);
            if (response) {
                return response;
            }

            // Return 404 if no route matches
            return new Response("404 Not Found", { status: 404 });
        });
        server.finished.then(() => console.log("Server closed"));

        let response = await fetch("http://127.0.0.1:8000/");
        let text = await response.text();
        assertEquals(text, "Hello World!");

        response = await fetch("http://127.0.0.1:8000/foo/bar");
        text = await response.text();
        assertEquals(text, "bar");

        console.log("Closing server...");
        ac.abort();
    },
});
