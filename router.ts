export class Router {
    private routeList: Route[] = [];

    add(method: string, pattern: string, handler: Handler): void {
        method = method.toUpperCase();
        const route = new Route(
            method,
            new URLPattern({
                pathname: pattern,
            }),
            handler,
        );
        this.routeList.push(route);
    }

    async match(request: Request) : Promise<Response | undefined> {
        for (const route of this.routeList) {
            if (request.method === route.method) {
                const result = route.urlPattern.exec(request.url);
                if (result) {
                    const params = result.pathname.groups;
                    for (const key in params) {
                        if (params[key]) {
                            params[key] = decodeURIComponent(params[key]);
                        }
                    }

                    const r = route.handler(request, params, result);

                    if (r instanceof Response) {
                        return r;
                    } else {
                        return await r;
                    }
                }
            }
        }
    }
}

export type URLPatternResultParams = { [key: string]: string | undefined };
export type Handler = (
    request: Request,
    params: URLPatternResultParams,
    urlPatternResult: URLPatternResult,
) => Response | Promise<Response>;

export class Route {
    constructor(
        public method: string,
        public urlPattern: URLPattern,
        public handler: Handler,
    ) {}
}
