# Matter

![Matter logo - a mobius strip with a m.](assets/matter192.png)  
A RSS feed aggregator with bookmarking and sync support.  
Made in vanilla JS/TS, primarily December 2020 to February 2021.  
Created by [Kewbish](https://github.com/kewbish).  
Released under the [GNU GPLv3 License](./LICENSE).

Hosted instance at [kewbi.sh/matter/](https://kewbi.sh/matter).

> Note: the page may take some time to fetch articles on load - this is because the CORS side of things needs to wake up.

Matter is made up of a static frontend, a server hosting GitHub OAuth and CORS proxy (currently deployed on Fly.io), and a syncing function deployed on Cloudflare Workers. See the documentation in [the `docs` folder](./docs).
