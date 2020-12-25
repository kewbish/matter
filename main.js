const RSSES = (atob(window.location.hash.substring(1)) || "https://kewbi.sh/blog/index.xml").split(",");

document.getElementById("sources").value = RSSES;
toURL(RSSES);

const main = document.querySelector(".grid");
const article = document.querySelector("#m-item");
var feeds = [];

function toURL(val) {
    if (document.getElementById("sources").value != atob(window.location.hash.substring(1))) {
        window.location.hash = btoa(val);
        window.location.reload();
    }
}

function addItem(ln, title, desc) {
    var clone = article.content.cloneNode(true);
    clone.querySelector("a").href = ln;
    clone.querySelector("h2").innerText = title;
    if (desc) {
        clone.querySelector("p").innerHTML = desc;
    }
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
            const map = (c, f) => Array.prototype.slice.call(c, 0, 10).map(f);
            const tag = (item, name) =>
              (item.getElementsByTagName(name)[0] || {}).textContent;
            switch (xml.documentElement.nodeName) {
              case 'rss':
                feeds = feeds.concat(map(xml.documentElement.getElementsByTagName('item'), item => ({
                  link: tag(item, 'link'),
                  title: tag(item, 'title').slice(0, 100),
                  desc: tag(item, 'description').slice(0, 150).replace(/(<([^>]+)>)/gi, ""),
                  date: new Date(tag(item, 'pubDate')),
                })));
                rerender();
                return;
              case 'feed':
                feeds = feeds.concat(map(xml.documentElement.getElementsByTagName('entry'), item => ({
                  link: tag(item, 'link[href]'),
                  title: tag(item, 'title'),
                  desc: tag(item, 'summary'),
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

navigator.serviceWorker.register('sw.js');
