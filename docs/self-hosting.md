# Self-Hosting

Everything is done entirely client-side, so `git clone` this repo and host the files on any server.

If you'll be heavily using this or expect many users, kindly host your own instance of [cors-anywhere](https://github.com/Rob--W/cors-anywhere) and replace the `matter-cors.fly.dev` [here](https://github.com/kewbish/matter/blob/master/main.js#L2) (make sure not to include an extra slash at the end of your URL).

I've added a custom auth handler to Cors-Anywhere. The modifications I've made are below - copy paste this into the source of your hosted instance. You'll have to replace the `client_id` and `client_secret` with values of your own [GitHub App](https://github.com/settings/apps/new).

> :warning: Note that this doesn't handle malformed queries.

```js
// before the getHandler
async function auth(location, res) {
  fetch(
    `https://github.com/login/oauth/access_token?client_id=[id]&client_secret=[secret]&code=${
      location.query.split("=")[1]
    }`,
    { method: "POST" }
  )
    .then((tex) => tex.text())
    .then((rx) => {
      res.writeHead(200);
      res.end(rx);
    });
}

// ... then in getHandler after the 'iscorsneeded' check
if (
  location.query != null &&
  location.query.includes("code") &&
  location.host === "auth"
) {
  auth(location, res);
  return;
}
```

You can also choose to self-host your Matter sync function - see [this page](./sync.md) for more details.

Otherwise, feel free to use the instance at [kewbi.sh/matter/](https://kewbi.sh/matter).
