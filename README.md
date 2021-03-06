# Matter
![Matter logo - a mobius strip with a m.](assets/matter192.png)  
An RSS links page + bookmarker.  
Made in vanilla JS, December 2020 to February 2021.  
Created by [Kewbish](https://github.com/kewbish).  
Released under the [GNU GPLv3 License](./LICENSE).

> Note: the page may take some time to fetch articles on load - this is because the CORS side of things needs to wake up.

## RSS Parsing
Add a comma-delimited list of RSS feeds (keep the http[s]:// bit in as well) to the list of feeds under `Advanced > Edit Sources`. (something like `https://kewbi.sh/blog/index.xml,https://news.ycombinator.com/rss`).  

Matter only adds the latest 10 items to the feed - I personally didn't want to deal with reading or seeing more than that. If you fork your own instance, you can change [this line](https://github.com/kewbish/matter/blob/master/main.js#L178) to have a higher or lower value. (See [self hosting](#self-hosting))

### Findka
Thanks to [Findka](https://findka.com)'s [custom RSS feeds](https://findka.com/blog/use-rss/), you can also rate Findka articles in your Matter feed.

## Bookmarking
To use the bookmarking functionality, Matter adds comments to a GitHub issue thread. (I keep a personal repo that's private, so I thought I'd keep my bookmarks there as well.)  

Expand the `Advanced > GitHub Settings`, and click the 'Login with GitHub' button. This will set your PAT automatically once you log in. Alternatively, enter a [PAT](https://github.com/settings/tokens/new). This PAT needs access to your desired repository, so the repo scope alone should work fine.  

After a PAT has been added, either through logging in or manually, fill in the name of your repo, as well as the issue number Matter should read and write to.

Under `Advanced`, a textbox to bookmark new links can be found. A comment can be added after the link (keep the https[s]:// bit) by separating the two with a comma. (something like: `https://kewbi.sh,This is a comment`)  
New links will appear as a separate comment in the issue thread.

You can delete bookmarks from the Matter side by clicking the delete button - this will remove the comment from the GitHub issue thread.

## Self-Hosting
Everything is done entirely client-side, so `git clone` this repo and host the files on any server. (GitHub Pages will do very nicely.)

If you'll be heavily using this or expect many users, kindly host your own instance of [cors-anywhere](https://github.com/Rob--W/cors-anywhere) and replace the `matter-cors.herokuapp.com` [here](https://github.com/kewbish/matter/blob/master/main.js#L2) (make sure not to include an extra slash at the end of your URL).

I've added a custom auth handler to Cors-Anywhere. The modifications I've made are below - copy paste this into the source of your hosted instance. You'll have to replace the `client_id` and `client_secret` with values of your own [GitHub App](https://github.com/settings/apps/new).

> :warning: Note that this doesn't protect against or deal with queries that aren't well formed.

```js
// before the getHandler
async function auth(location, res) {
  fetch(`https://github.com/login/oauth/access_token?client_id=[id]&client_secret=[secret]&code=${location.query.split("=")[1]}`, { method: "POST" })
  .then(tex => tex.text())
  .then(rx => {
    res.writeHead(200);
    res.end(rx);
  });
}

// ... then in getHandler after the 'iscorsneeded' check
if ((location.query != null && location.query.includes('code')) && location.host === 'auth') {
  auth(location, res);
  return;
}
```

Otherwise, feel free to use the instance at [kewbi.sh/matter/](https://kewbi.sh/matter).

