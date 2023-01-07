import { Context, Hono } from "hono";
import { cors } from "hono/cors";
import bcrypt from "bcrypt";

export interface Env {
  SECRET_LINKS: KVNamespace;
}

const app = new Hono();
app.use("/*", cors());

app.get("/link/*", async (c: Context) => {
  let { pathname } = new URL(c.req.url);
  pathname.replace("/link/", "/");

  const urlParams = new URLSearchParams(c.req.url);
  const password = urlParams.get("password");

  if (!password) {
    return new Response(JSON.stringify({ error: "Password is required." }));
  }

  const redirectContents = await c.env.SECRET_LINKS.get(pathname);

  if (!redirectContents) {
    return new Response(JSON.stringify({ error: "Invalid redirect URL." }));
  }

  bcrypt.compare(redirectContents.password, password, function (err, result) {
    if (err || !result) {
      return new Response(JSON.stringify({ error: "Invalid password." }));
    }

    return new Response(atob(redirectContents.contents));
  });
});

app.post("/create", async (c: Context) => {
  const createUniqueId = async (): Promise<string> => {
    const createId = () => {
      let result = "";
      let characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-";
      let charactersLength = characters.length;
      for (let i = 0; i < 5; i++) {
        result += characters.charAt(
          Math.floor(Math.random() * charactersLength)
        );
      }
      return result;
    };
    let result = createUniqueId();
    while ((await c.env.SECRET_LINKS.get(result)) !== null) {
      result = createUniqueId();
    }
    return result;
  };

  let rawBody = (await c.req.json()) as any;
  if (!Object.keys(rawBody).length || !rawBody.password || !rawBody.contents) {
    return new Response(JSON.stringify({ error: "Include contents." }));
  }

  rawBody.contents = btoa(JSON.stringify(rawBody.contents));
  bcrypt.hash(rawBody.password, 3, async (err, hash) => {
    if (err) {
      return new Response(JSON.stringify({ error: "Hash error." }));
    }

    const uniqueLink = await createUniqueId();
    c.env.SECRET_LINKS.put(uniqueLink, { ...rawBody, password: hash });
    return new Response(JSON.stringify({ link: uniqueLink }));
  });
});

export default app;
