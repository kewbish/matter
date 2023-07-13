# Syncing (Portals)

Matter has a basic 'Portal' feature to synchronize articles and personal bookmarks across devices. It uses a Cloudflare Worker and Cloudflare KV to store and retrieve your subscribed feeds and bookmark retrieval information.

To access a portal, expand the `Advanced > Matter Portal` tab in settings, and fill in a username and password. Careful with this - if your PAT scope allows read/write to your GitHub account and if your Matter Portal credentials are compromised, attackers will be able to get access to your GitHub repos.

Click 'Load Portal'. This will create a new portal with your current feeds if one doesn't already exist with that username and password combination. This will also save your feeds locally, so there's no need to load the portal each time you access Matter.

The portal Worker source is found in [`../portal/`](../portal).
