# RSS Parsing

Add a comma-delimited list of RSS feeds (keep the http[s]:// bit in as well) to the list of feeds under `Advanced > Edit Sources`. (something like `https://kewbi.sh/blog/index.xml,https://news.ycombinator.com/rss`).

Matter only adds the latest 10 items to the feed - I personally didn't want to deal with reading or seeing more than that. If you fork your own instance, you can change [this line](https://github.com/kewbish/matter/blob/master/main.js#L178) to have a higher or lower value. (See [self hosting](./self-hosting.md))
