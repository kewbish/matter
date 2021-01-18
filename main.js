const urlstring = atob(window.location.hash.substring(1)).split(",");
const RSSES = JSON.parse(localStorage.getItem('rsses')) || urlstring.indexOf("") == -1 ? urlstring : ["https://kewbi.sh/blog/index.xml"];

document.getElementById("er").style.display = "none";
document.getElementById("sources").value = RSSES;
document.getElementById("pat").value = localStorage.getItem("pat");
document.getElementById("repo").value = localStorage.getItem("repo");
document.getElementById("isnum").value = localStorage.getItem("isnum");

toURL(RSSES);

const main = document.querySelector(".grid");
const article = document.querySelector("#m-item");

var feeds = JSON.parse(localStorage.getItem("feeds")) || [];
var pat = "";
var repo = "";
var isnum = 0;

rerender();
drop("https://api.github.com/user/repos", "repo", "full_name");
drop(`https://api.github.com/repos/${localStorage.getItem('repo')}/issues`, "isnum", "number");

function toURL(val) {
    if (document.getElementById("sources").value != RSSES.join(",")) {
        window.location.hash = btoa(val);
        window.location.reload();
    }
}

function upLoc() {
    pat = localStorage.getItem("pat");
    repo = localStorage.getItem("repo");
    isnum = localStorage.getItem("isnum");
}

function setLoc(val, name) {
    if (document.getElementById(name)) {
        localStorage.setItem(name, val);
    }
}

function showEr(er) {
    show = document.getElementById("er");
    show.style.display = "block";
    show.firstElementChild.innerHTML = er;
}

function drop(url, id, prop) {
    upLoc();
    var dropObj = document.getElementById(id);
    fetch(url, { headers: {"Authorization": `Bearer ${pat}`}})
    .then(res => res.json())
    .then(jsn => {
        jsn.forEach(j => {
            option = document.createElement('option');
            option.text = j[prop];
            option.value = j[prop];
            dropObj.add(option);
        });
    });
}

function saveNew(val) {
    upLoc();
    if (pat == null || repo == null || isnum == null) {
        showEr("Fill out all of [pat, repo, issue number].");
        return;
    }
    fetch(`https://api.github.com/repos/${repo}/issues/${isnum}/comments`, { method: "POST", headers: {"Authorization": `Bearer ${pat}`}, body: JSON.stringify({"body": val}) })
    .then(res => res.json())
    .then(jsn => {
        feeds = feeds.concat({link: val.split(",")[0], title: val.replace("https://", "").split(",")[0], desc: val.split(",")[1], date: new Date(), id: jsn.id});
        rerender();
    })
    .catch(err => {
        showEr(err);
    });
}

function getBm() {
    upLoc();
    fetch(`https://api.github.com/repos/${repo}/issues/${isnum}/comments`, { method: "GET", headers: {"Authorization": `Bearer ${pat}`}})
    .then(res => res.json())
    .then(jsn => {
        var links = [];
        jsn.forEach(itm => links.push({link: itm.body.split(",")[0], title: itm.body.replace("https://", "").split(",")[0], desc: itm.body.split(",")[1], date: new Date(), id: itm.id}));
        feeds = feeds.concat(links);
        rerender();
    })
    .catch(err => {
        showEr(err);
    });
}

function delItem(id) {
    upLoc();
    fetch(`https://api.github.com/repos/${repo}/issues/comments/${id}`, { method: "DELETE", headers: {"Authorization": `Bearer ${pat}`}})
    .then(() => {
        feeds = feeds.filter(f => f.id != id);
        rerender();
    })
    .catch(err => {
        showEr(err);
    });
}

function addItem(ln, title, desc, id) {
    var clone = article.content.cloneNode(true);
    clone.querySelector("a").href = ln;
    clone.querySelector("h2").innerText =  title ? (title.length > 50 ? `${title.slice(0, 50)}...` : title) : "";
    var descTrun = desc ? (desc.length > 50 ? `${desc.slice(0, 50)}...` : desc) : "";
    const linkId = " <a onclick='delItem(" + id + ")'>[delete]</a>";
    clone.querySelector("p").innerHTML = desc != undefined ? (id != undefined ? (descTrun + linkId) : descTrun) : (id != undefined ? linkId : "");
    main.appendChild(clone);
}

function rerender() {
    main.innerHTML = "";
    feeds = feeds.slice().sort((a, b) => b.date - a.date);
    feeds.forEach(item => {
        addItem(item.link, item.title, item.desc, item.id);
    });
    localStorage.setItem('feeds', JSON.stringify(feeds));
}

function parseFeed(feed) {
    // switch back when done
    fetch(`https://cors-anywhere.herokuapp.com/${feed}`, { method: "GET", headers: { "Origin": "https://kewbi.sh/" } })
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
              title: tag(item, 'title'),
              desc: tag(item, 'description'),
              date: new Date(tag(item, 'pubDate')),
            })));
            rerender();
            return;
          case 'feed':
            feeds = feeds.concat(map(xml.documentElement.getElementsByTagName('entry'), item => ({
              link: map(item.getElementsByTagName('link'), link => {
                  const rel = link.getAttribute('rel');
                  if (!rel || rel === 'alternate') {
                    return link.getAttribute('href');
              }})[0],
              title: tag(item, 'title'),
              desc: tag(item, 'summary'),
              date: new Date(tag(item, 'updated')),
            })));
            rerender();
            return;
    }})
    .catch(err => {
        showEr(err);
    });
}

feeds = [];
getBm();
RSSES.forEach(rss => {
    parseFeed(rss);
});

