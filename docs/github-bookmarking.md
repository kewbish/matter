# Bookmarking

Matter adds comments to a GitHub issue thread to keep track of bookmarks. (I keep a personal private repo, so I thought I'd keep my bookmarks there as well, so I can see them across devices - this design decision predated the [sync](./sync.md) feature.)

Expand the `Advanced > GitHub Settings`, and click the 'Login with GitHub' button. This will set your PAT automatically once you log in. Alternatively, enter a [PAT](https://github.com/settings/tokens/new). This PAT needs access to your desired repository, so the repo scope alone should work fine.

After a PAT has been added, either through logging in or manually, fill in the name of your repo, as well as the issue number Matter should read and write to.

Under `Advanced`, a textbox to bookmark new links can be found. A comment can be added after the link (keep the https[s]:// bit) by separating the two with a comma. (something like: `https://kewbi.sh,This is a comment`)  
New links will appear as a separate comment in the issue thread.

You can delete bookmarks from the Matter side by clicking the delete button - this will remove the comment from the GitHub issue thread.
