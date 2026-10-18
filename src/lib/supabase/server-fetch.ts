export const fetchWithShortConnections: typeof fetch = async (input, init) => {
  const headers = new Headers(input instanceof Request ? input.headers : undefined);
  new Headers(init?.headers).forEach((value, name) => headers.set(name, value));
  headers.set("connection", "close");
  const parentSignal = init?.signal ?? (input instanceof Request ? input.signal : undefined);
  const method = init?.method ?? (input instanceof Request ? input.method : "GET");
  const attempts = method.toUpperCase() === "GET" ? 3 : 1;
  for (let attempt = 0; ; attempt++) {
    try {
      const timeout = AbortSignal.timeout(2500);
      const response = await fetch(input, {
        ...init, headers, cache: "no-store",
        signal: parentSignal ? AbortSignal.any([parentSignal, timeout]) : timeout,
      });
      if ([502, 503, 504].includes(response.status) && attempt < attempts - 1) {
        await response.body?.cancel();
        continue;
      }
      const bytes = await response.arrayBuffer();
      const responseHeaders = new Headers(response.headers);
      responseHeaders.delete("content-encoding");
      responseHeaders.delete("content-length");
      return new Response([204, 205, 304].includes(response.status) ? null : bytes, {
        status: response.status, statusText: response.statusText, headers: responseHeaders,
      });
    } catch (error) {
      if (attempt >= attempts - 1 || parentSignal?.aborted) throw error;
    }
  }
};
