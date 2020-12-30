const RSSES = (atob(window.location.hash.substring(1)) || "https://kewbi.sh/blog/index.xml").split(",");
toURL(RSSES);

document.getElementById("sources").value = RSSES;
document.getElementById("pat").value = localStorage.getItem("pat");
document.getElementById("repo").value = localStorage.getItem("repo");
document.getElementById("isnum").value = localStorage.getItem("isnum");

const main = document.querySelector(".grid");
const article = document.querySelector("#m-item");
var feeds = [];

function toURL(val) {
    if (document.getElementById("sources").value != atob(window.location.hash.substring(1))) {
        window.location.hash = btoa(val);
        window.location.reload();
    }
}

function setLoc(val, name) {
    if (document.getElementById(name)) {
        localStorage.setItem(name, val);
    }
}

function saveNew(val) {
    pat = localStorage.getItem("pat");
    repo = localStorage.getItem("repo");
    isnum = localStorage.getItem("isnum");
    if (pat == null || repo == null || isnum == null) {
        console.error("Fill out all of [pat, repo, issue number].");
        return;
    }
    fetch(`https://api.github.com/repos/${repo}/issues/${isnum}/comments`, { method: "POST", headers: {"Authorization": `Bearer ${pat}`}, body: JSON.stringify({"body": val}) })
    .catch(err => {
        console.error("Matter - ", err);
    });
}

function getBm() {
    pat = localStorage.getItem("pat");
    repo = localStorage.getItem("repo");
    isnum = localStorage.getItem("isnum");
    fetch(`https://api.github.com/repos/${repo}/issues/${isnum}/comments`, { method: "GET", headers: {"Authorization": `Bearer ${pat}`}})
    .then(res => res.json())
    .then(jsn => {
        var links = [];
        jsn.forEach(itm => links.push({link: itm.body, title: itm.body.replace("https://", "").split(",")[0], desc: itm.body.split(",")[1], date: new Date(), id: itm.id}));
        feeds = feeds.concat(links);
        rerender();
    })
    .catch(err => {
        console.error("Matter - ", err);
    });
}

function addItem(ln, title, desc, id) {
    var clone = article.content.cloneNode(true);
    clone.querySelector("a").href = ln;
    clone.querySelector("h2").innerText = title;
    if (desc) {
        clone.querySelector("p").innerHTML = id == null ? desc : desc + " <a onclick='delItm(id)'>delete</a>";
    }
    main.appendChild(clone);
}

function rerender() {
    main.innerHTML = "";
    feeds = feeds.slice().sort((a, b) => b.date - a.date);
    feeds.forEach(item => {
        addItem(item.link, item.title, item.desc, item.id);
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
                  desc: tag(item, 'description').slice(0, 150),
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

getBm();
RSSES.forEach(rss => {
    parseFeed(rss);
});

navigator.serviceWorker.register('sw.js');
