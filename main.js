// change this line when rehosting ⇓
const CORSURL = 'https://matter-cors.herokuapp.com';

const urlstring = atob(window.location.hash.substring(1)).split(",");
const urlloc = JSON.parse(localStorage.getItem("sources"));
// looks at the current url, if it doesn't exist, then fall back to localStorage. If not, then set to default RSS.
var RSSES = (urlstring && urlstring.indexOf("") == -1) ? urlstring : (urlloc.indexOf("") == -1 ? urlloc : ["https://kewbi.sh/blog/index.xml"]);

document.getElementById("er").style.display = "none";
document.getElementById("sources").value = RSSES;
document.getElementById("pat").value = localStorage.getItem("pat");
document.getElementById("advanced").open = localStorage.getItem("advopen") || false;

toURL(RSSES);

const main = document.querySelector(".grid");
const article = document.querySelector("#m-item");

// get past feeds while reloading
var feeds = JSON.parse(localStorage.getItem("feeds")) || [];
var pat, repo, isnum = null;

rerender();

if (localStorage.getItem("pat") != null) {
    drop("https://api.github.com/user/repos", "repo", "full_name");
    if (localStorage.getItem("repo") != null) {
        drop(`https://api.github.com/repos/${localStorage.getItem('repo')}/issues`, 'isnum', 'number');
    }
}
document.getElementById("repo").value = localStorage.getItem("repo");
document.getElementById("isnum").value = localStorage.getItem("isnum");

function toURL(val) {
    setLoc('sources', JSON.stringify(val));
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

function setLoc(name, val) {
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
        if (jsn) {
            jsn.forEach(j => {
                option = document.createElement('option');
                option.text = j[prop];
                option.value = j[prop];
                dropObj.add(option);
            });
            dropObj.value = localStorage.getItem(id);
        }
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
        if (jsn) {
            feeds = feeds.concat({link: val.split(",")[0], title: val.replace("https://", "").split(",")[0], desc: val.split(",")[1], date: new Date(), id: jsn.id});
            rerender();
        }
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
        if (jsn) {
            var links = [];
            jsn.forEach(itm => links.push({link: itm.body.split(",")[0], title: itm.body.replace("https://", "").split(",")[0], desc: itm.body.split(",")[1], date: new Date(), id: itm.id}));
            feeds = feeds.concat(links);
            rerender();
        }
    })
    .catch(err => {
        showEr(err);
    });
}

function delBms() {
    feeds = feeds.filter(f => f.id == null || f.id == "FINDKA");
    rerender();
};

function delBm(id) {
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

function rateFindka(ln) {
    fetch(`${CORSURL}/${ln}`)
    .catch(err => {
        showEr(err);
    });
}

function addItem(ln, title, desc, id) {
    var clone = article.content.cloneNode(true);
    clone.querySelector("a").href = ln;
    title = title ? title.replace( /(<([^>]+)>)/g, '') : title;
    clone.querySelector("h2").innerText =  title ? (title.length > 50 ? `${title.slice(0, 50)}...` : title) : "";
    if (desc && id == "FINDKA") {
        desc[3] = desc[3] ? desc[3].replace( /(<([^>]+)>)/g, '') : desc[3];
        var descTrun = desc[3] ? (desc[3].length > 50 ? `${desc[3].slice(0, 50)}...<br>` : desc[3] + "<br>") : "";
        clone.querySelector("p").innerHTML = `${descTrun}<a onclick="rateFindka('${desc[0]}')">[not interested]</a> <a onclick="rateFindka('${desc[1]}')">[like]</a> <a onclick="rateFindka('${desc[2]}')">[favourite]</a>`;
    } else {
        desc = desc ? desc.replace( /(<([^>]+)>)/g, '') : desc;
        var descTrun = desc ? (desc.length > 50 ? `${desc.slice(0, 50)}...` : desc) : "";
        const linkId = " <a onclick='delBm(" + id + ")'>[delete]</a>";
        // if description does exist => if id, then bookmark, add delete. If not, add the truncated description.
        // if description does not exist => if id, then bookmark, add delete. Otherwise, set to empty.
        clone.querySelector("p").innerHTML = desc != undefined ? (id != undefined ? (descTrun + linkId) : descTrun) : (id != undefined ? linkId : "");
    }
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
    var fhost = new URL(feed).host;
    if (fhost != "essays.findka.com") {
        feeds = feeds.filter(f => new URL(f.link).host == fhost);
    } else {
        feeds = feeds.filter(f => f.id != "FINDKA");
    }
    fetch(`${CORSURL}/${feed}`, { method: "GET", headers: { "Origin": "https://kewbi.sh/" } })
    .then(text => text.text())
    .then(texml => {
        const xml = new DOMParser().parseFromString(texml, 'text/xml');
        const map = (c, f) => Array.prototype.slice.call(c, 0, 10).map(f); // max value to get from list
        const tag = (item, name) =>
          (item.getElementsByTagName(name)[0] || {}).textContent;
        switch (xml.documentElement.nodeName) {
          // two types of rss feeds - map each to correct output
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
              desc: new URL(feed).host == "essays.findka.com" ?
                [tag(item, 'findka:dislike'), tag(item, 'findka:like'), tag(item, 'findka:favorite'), tag(item, 'summary')] :
                tag(item, 'summary'),
              id: new URL(feed).host == "essays.findka.com" ? "FINDKA" : null,
              date: new Date(tag(item, 'updated')),
            })));
            rerender();
            return;
    }})
    .catch(err => {
        showEr(err);
    });
}

if (pat && repo && isnum) {
    getBm();
}
RSSES.forEach(rss => {
    parseFeed(rss);
});

