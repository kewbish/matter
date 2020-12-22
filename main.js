const RSSES = [
    'https://kewbi.sh/blog/index.xml',
    'https://jvns.ca/atom.xml'
];

const main = document.querySelector(".grid");
const article = document.querySelector("#m-item");
var feeds = [];

function addItem(ln, title, desc) {
    var clone = article.content.cloneNode(true);
    clone.querySelector("a").href = ln;
    clone.querySelector("h2").innerText = title;
    clone.querySelector("p").innerText = desc;
    main.appendChild(clone);
}

function rerender() {
    main.innerHTML = "";
    feeds = feeds.slice().sort((a, b) => b.date - a.date);
    feeds.forEach(item => {
        addItem(item.link, item.title, item.desc);
    });
}

function parseFeed(feed) {
    fetch(`https://cors-anywhere.herokuapp.com/${feed}`, { method: "GET", headers: { "X-Requested-With": "https://kewbi.sh/matter/" } })
        .then(text => text.text())
        .then(texml => {
            const xml = new DOMParser().parseFromString(texml, 'text/xml');
            const map = (c, f) => Array.prototype.slice.call(c, 0).map(f);
            const tag = (item, name) =>
              (item.getElementsByTagName(name)[0] || {}).textContent;
            switch (xml.documentElement.nodeName) {
              case 'rss':
                feeds = feeds.concat(map(xml.documentElement.getElementsByTagName('item'), item => ({
                  link: tag(item, 'link'),
                  title: tag(item, 'title'),
                  desc: tag(item, 'description'),
                  date: new Date(tag(item, 'pubDate')),
                })));
                rerender();
                return;
              case 'feed':
                feeds = feeds.concat(map(xml.documentElement.getElementsByTagName('entry'), item => ({
                  link: tag(item, 'link[rel]'),
                  title: tag(item, 'title'),
                  desc: tag(item, 'updated'),
                  date: new Date(tag(item, 'updated')),
                })));
                rerender();
                return;
            }
        });
}

RSSES.forEach(rss => {
    parseFeed(rss);
});

