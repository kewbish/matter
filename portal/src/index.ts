import { Context, Hono } from "hono";
import { cors } from "hono/cors";

export interface Env {
  PORTAL: KVNamespace;
}

type User = { user: string; password: string };

const app = new Hono();

const HEADERS = { "Access-Control-Allow-Origin": "*" };

app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "OPTIONS", "HEAD"],
    exposeHeaders: ["Authorization", "Content-Type"],
    allowHeaders: ["Authorization", "Content-Type"],
    credentials: true,
    maxAge: 600,
  })
);
app.options("*", (c) => {
  return c.text("", 204);
});

app.get("/portal", async (c: Context) => {
  const userTry = await basicAuthentication(c.req);
  if (c.req.headers.has("Authorization") && userTry) {
    const data = await c.env.PORTAL.get(`${userTry.user}:${userTry.password}`);
    if (data) {
      return new Response(data, { headers: HEADERS });
    } else {
      return new Response(JSON.stringify({ error: "No portal found." }), {
        status: 404,
        headers: HEADERS,
      });
    }
  }

  return new Response(JSON.stringify({ error: "Login required." }), {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Matter Portal login.", charset="UTF-8"',
      ...HEADERS,
    },
  });
});

app.post("/create", async (c: Context) => {
  let rawBody = (await c.req.json()) as any;
  if (
    !Object.keys(rawBody).length ||
    !rawBody.user ||
    !rawBody.password ||
    !rawBody.contents
  ) {
    return new Response(
      JSON.stringify({ error: "Include user, password, and contents." }),
      { headers: HEADERS }
    );
  }

  await c.env.PORTAL.put(
    `${rawBody.user}:${rawBody.password}`,
    rawBody.contents
  );
  return new Response(JSON.stringify({}), { headers: HEADERS });
});

const basicAuthentication = async (request: Request): Promise<User | null> => {
  const Authorization = request.headers.get("Authorization");

  if (!Authorization) {
    return null;
  }

  const [scheme, encoded] = Authorization.split(" ");

  if (!encoded || scheme !== "Basic") {
    return null;
  }

  const buffer = Uint8Array.from(atob(encoded), (character) =>
    character.charCodeAt(0)
  );
  const decoded = new TextDecoder().decode(buffer).normalize();

  const index = decoded.indexOf(":");

  if (index === -1 || /[\0-\x1F\x7F]/.test(decoded)) {
    return null;
  }

  return {
    user: decoded.substring(0, index),
    password: decoded.substring(index + 1),
  };
};

export default app;
