import { Context, Hono } from "hono";
import { cors } from "hono/cors";
import { Buffer } from "node:buffer";

export interface Env {
  PORTAL: KVNamespace;
  PASSWORDS: KVNamespace;
}

type User = { user: string; password: string };

const app = new Hono();

const HEADERS = { "Access-Control-Allow-Origin": "*" };
const SALT = "Matter Portal Salt!";

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
  try {
    const userTry = await basicAuthentication(c.req);
    if (c.req.headers.has("Authorization") && userTry) {
      if (!(await checkAuthentication(userTry, c.env.PASSWORDS))) {
        return new Response(JSON.stringify({ error: "Wrong credentials." }), {
          status: 401,
          headers: HEADERS,
        });
      }

      const data = JSON.parse(await c.env.PORTAL.get(userTry.user));
      if (data) {
        const iv = Buffer.from(data.iv, "hex");
        const encryptedData = Buffer.from(data.encryptedData, "hex");
        const baseKey = await crypto.subtle.importKey(
          "raw",
          stoab(userTry.password),
          { name: "PBKDF2" },
          false,
          ["deriveKey"]
        );
        const key = await crypto.subtle.deriveKey(
          {
            name: "PBKDF2",
            salt: stoab(SALT),
            iterations: 100,
            hash: "SHA-256",
          },
          baseKey,
          { name: "AES-CBC", length: 128 },
          true,
          ["encrypt", "decrypt"]
        );
        const decrypted = await crypto.subtle.decrypt(
          { name: "AES-CBC", iv },
          key,
          encryptedData
        );
        return new Response(
          JSON.stringify({ data: new TextDecoder("utf-8").decode(decrypted) }),
          {
            headers: HEADERS,
          }
        );
      }
    } else {
      return new Response(JSON.stringify({ error: "No portal found." }), {
        status: 404,
        headers: HEADERS,
      });
    }

    return new Response(JSON.stringify({ error: "Login required." }), {
      status: 401,
      headers: {
        "WWW-Authenticate":
          'Basic realm="Matter Portal login.", charset="UTF-8"',
        ...HEADERS,
      },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ e: e.toString() }), {
      headers: HEADERS,
    });
  }
});

app.post("/create", async (c: Context) => {
  try {
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

    const passwordHash = await crypto.subtle.digest(
      "SHA-256",
      Buffer.from(rawBody.password)
    );
    await c.env.PASSWORDS.put(
      rawBody.user,
      Buffer.from(passwordHash).toString("hex")
    );

    const iv = crypto.getRandomValues(new Uint8Array(16));
    const baseKey = await crypto.subtle.importKey(
      "raw",
      stoab(rawBody.password),
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );
    const key = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: stoab(SALT),
        iterations: 100,
        hash: "SHA-256",
      },
      baseKey,
      { name: "AES-CBC", length: 128 },
      true,
      ["encrypt", "decrypt"]
    );
    const encryptedData = await crypto.subtle.encrypt(
      { name: "AES-CBC", iv },
      key,
      stoab(rawBody.contents)
    );

    await c.env.PORTAL.put(
      rawBody.user,
      JSON.stringify({
        iv: Buffer.from(iv).toString("hex"),
        encryptedData: Buffer.from(encryptedData).toString("hex"),
      })
    );
    return new Response(JSON.stringify({}), { headers: HEADERS });
  } catch (e: any) {
    return new Response(JSON.stringify({ e: e.toString() }), {
      headers: HEADERS,
    });
  }
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

const checkAuthentication = async (
  user: User,
  namespace: KVNamespace
): Promise<boolean> => {
  const hash = await namespace.get(user.user);
  if (!hash) {
    return false;
  }
  const unHexedHash = Buffer.from(hash, "hex").toString();

  const saltedHash = await crypto.subtle.digest(
    "SHA-256",
    Buffer.from(user.password)
  );

  return new TextDecoder("utf-8").decode(saltedHash) === unHexedHash;
};

const stoab = (str: string) => {
  var encoder = new TextEncoder();
  return encoder.encode(str);
};

export default app;
