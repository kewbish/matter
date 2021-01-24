# Matter
![Matter logo - a mobius strip with a m.](assets/matter512.png)  
An RSS links page + bookmarker. Heavily personalized.  
Made in vanilla JS, December 2020 to present.  
Created by [Kewbish](https://github.com/kewbish).  
Released under the [GNU GPLv3 License](./LICENSE).

## RSS Parsing
Add a comma-delimited list of RSS feeds (keep the http[s]:// bit in as well) to the list of feeds under `Advanced > Edit Sources`. (something like `https://kewbi.sh/blog/index.xml,https://news.ycombinator.com/rss`).  

Matter only adds the latest 10 items to the feed - I personally didn't want to deal with reading or seeing more than that.

## Bookmarking
To use the bookmarking functionality, Matter adds comments to a GitHub issue thread. (I keep a personal repo that's private, so I thought I'd keep my bookmarks there as well.)  

Expand the `Advanced > GitHub Settings`, and click the 'Login with GitHub' button. This will set your PAT automatically once you log in. Alternatively, enter a [PAT](https://github.com/settings/tokens/new). This PAT needs access to private repositories, so the repo scope alone should work fine (the rest of the fields can probably be unchecked).  

After a PAT has been added, either through logging in or manually, fill in the name of your private repo, as well as the issue number Matter should read and write to.

Under `Advanced`, a textbox to bookmark new links can be found. A comment can be added after the link (keep the https[s]:// bit) by separating the two with a comma. (something like: `https://kewbi.sh,This is a comment`)  
New links will appear as a separate comment in the thread.

You can delete bookmarks from the Matter side by clicking the delete button - this will remove the comment from the GitHub issue thread.
