// change this line when rehosting ⇓
const CORSURL = "https://matter-cors.fly.dev";

let urlstring = "";
let urlloc = {};
let RSSES = [];

const setup = () => {
  urlstring = atob(window.location.hash.substring(1)).split(",");
  urlloc = JSON.parse(localStorage.getItem("sources"));
  // looks at the current url, if it doesn't exist, then fall back to localStorage. If not, then set to default RSS.
  RSSES =
    urlstring && urlstring.indexOf("") == -1
      ? urlstring
      : urlloc && urlloc.indexOf("") == -1
      ? urlloc
      : ["https://kewbi.sh/blog/index.xml"];

  document.getElementById("er").style.display = "none";
  document.getElementById("sources").value = RSSES;
  document.getElementById("pat").value = localStorage.getItem("pat");
  document.getElementById("repo").value = localStorage.getItem("repo");
  document.getElementById("isnum").value = localStorage.getItem("isnum");
  document.getElementById("advanced").open =
    JSON.parse(localStorage.getItem("advopen")) || false;

  toURL(RSSES);
};

setup();

const main = document.querySelector(".grid");
const article = document.querySelector("#m-item");

// get past feeds while reloading
let feeds = [];
try {
  feeds = JSON.parse(localStorage.getItem("feeds")) || [];
} catch {
  feeds = [];
}
var pat,
  repo,
  isnum = null;

rerender();

function toURL(val) {
  setLoc("sources", JSON.stringify(val));
  if (document.getElementById("sources").value != RSSES.join(",")) {
    window.location.hash = btoa(val);
    window.location.reload();
  }
}

function drops() {
  if (localStorage.getItem("pat") != null) {
    drop("https://api.github.com/user/repos", "repo", "full_name");
    if (localStorage.getItem("repo") != null) {
      drop(
        `https://api.github.com/repos/${localStorage.getItem("repo")}/issues`,
        "isnum",
        "number"
      );
    }
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
  drops();
}

function showEr(er) {
  show = document.getElementById("er");
  show.style.display = "block";
  show.firstElementChild.innerHTML = er;
}

function drop(url, id, prop) {
  upLoc();
  var dropObj = document.getElementById(id);
  fetch(url, { headers: { Authorization: `Bearer ${pat}` } })
    .then((res) => res.json())
    .then((jsn) => {
      if (jsn) {
        dropObj.textContent = "";
        jsn.forEach((j) => {
          option = document.createElement("option");
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
  if (!val) {
    showEr("Please enter a valid URL.");
    return;
  }
  try {
    const _ = new URL(val);
  } catch {
    showEr("Please enter a valid URL.");
    return;
  }
  fetch(`https://api.github.com/repos/${repo}/issues/${isnum}/comments`, {
    method: "POST",
    headers: { Authorization: `Bearer ${pat}` },
    body: JSON.stringify({ body: val }),
  })
    .then((res) => res.json())
    .then((jsn) => {
      if (jsn) {
        feeds = feeds.concat({
          link: val.split(",")[0],
          title: val.replace("https://", "").split(",")[0],
          desc: val.split(",")[1],
          date: new Date(),
          id: jsn.id,
        });
        rerender();
      }
    })
    .catch((err) => {
      showEr(err);
    });
}

function getBm() {
  fetch(`https://api.github.com/repos/${repo}/issues/${isnum}/comments`, {
    method: "GET",
    headers: { Authorization: `Bearer ${pat}` },
  })
    .then((res) => res.json())
    .then((jsn) => {
      if (jsn) {
        var links = [];
        jsn.forEach((itm) =>
          links.push({
            link: itm.body.split(",")[0],
            title: itm.body.replace("https://", "").split(",")[0],
            desc: itm.body.split(",")[1],
            date: new Date(),
            id: itm.id,
          })
        );
        feeds = feeds.concat(links);
        rerender();
      }
    })
    .catch((err) => {
      showEr(err);
    });
}

function delBms() {
  feeds = feeds.filter((f) => f.id == null);
  rerender();
}

function delBm(id) {
  upLoc();
  fetch(`https://api.github.com/repos/${repo}/issues/comments/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${pat}` },
  })
    .then(() => {
      feeds = feeds.filter((f) => f.id != id);
      rerender();
    })
    .catch((err) => {
      showEr(err);
    });
}

function addItem(ln, title, desc, id) {
  var clone = article.content.cloneNode(true);
  clone.querySelector("a").href = ln;
  title = title ? title.replace(/(<([^>]+)>)/g, "") : title;
  clone.querySelector("h2").innerText = title
    ? title.length > 50
      ? `${title.slice(0, 50)}...`
      : title
    : "";
  desc = desc ? desc.replace(/(<([^>]+)>)/g, "") : desc;
  var descTrun = desc
    ? desc.length > 50
      ? `${desc.slice(0, 50)}...`
      : desc
    : "";
  const linkId = " <a onclick='delBm(" + id + ")'>[delete]</a>";
  clone.querySelector("p").innerHTML =
    desc != undefined
      ? id != undefined
        ? descTrun + linkId
        : descTrun
      : id != undefined
      ? linkId
      : "";
  // if description does exist => if id, then bookmark, add delete. If not, add the truncated description.
  // if description does not exist => if id, then bookmark, add delete. Otherwise, set to empty.
  main.appendChild(clone);
}

function rerender() {
  main.innerHTML = "";
  feeds = [...new Set(feeds.map(JSON.stringify))].map(JSON.parse);
  feeds = feeds
    .slice()
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
    .slice(0, 50);
  feeds.forEach((item) => {
    addItem(item.link, item.title, item.desc, item.id);
  });
  localStorage.setItem("feeds", JSON.stringify(feeds));
}

function parseFeed(feed) {
  var fhost = new URL(feed).host;
  feeds = feeds.filter((f) => new URL(f.link).host == fhost);
  fetch(`${CORSURL}/${feed}`, {
    method: "GET",
    headers: { Origin: "https://kewbi.sh/" },
  })
    .then((text) => text.text())
    .then((texml) => {
      const xml = new DOMParser().parseFromString(texml, "text/xml");
      const map = (c, f) => Array.prototype.slice.call(c, 0, 10).map(f); // ⇐ max value to get from list, change this
      const tag = (item, name) =>
        (item.getElementsByTagName(name)[0] || {}).textContent;
      switch (xml.documentElement.nodeName) {
        // two types of rss feeds - map each to correct output
        case "rss":
          feeds = feeds.concat(
            map(xml.documentElement.getElementsByTagName("item"), (item) => ({
              link: tag(item, "link"),
              title: tag(item, "title"),
              desc: tag(item, "description"),
              date: new Date(tag(item, "pubDate")),
            }))
          );
          rerender();
          return;
        case "feed":
          feeds = feeds.concat(
            map(xml.documentElement.getElementsByTagName("entry"), (item) => ({
              link: map(item.getElementsByTagName("link"), (link) => {
                const rel = link.getAttribute("rel");
                if (!rel || rel === "alternate") {
                  return link.getAttribute("href");
                }
              })[0],
              title: tag(item, "title"),
              desc: tag(item, "summary"),
              date: new Date(tag(item, "updated")),
            }))
          );
          rerender();
          return;
      }
    })
    .catch((err) => {
      showEr(err);
    });
}

const validatePortal = () => {
  const username = document.getElementById("portal-user").value;
  const password = document.getElementById("portal-password").value;
  document.getElementById("portal-btn").disabled = !username || !password;
};

const loadPortal = () => {
  const createPortal = async () => {
    const bigObject = {
      sources: localStorage.getItem("sources"),
      isnum: localStorage.getItem("isnum"),
      pat: localStorage.getItem("pat"),
      repo: localStorage.getItem("repo"),
    };
    const b64JSON = btoa(JSON.stringify(bigObject));
    const body = { user: username, password, contents: b64JSON };
    fetch("https://matter-portal.kewbish.workers.dev/create", {
      ...HEADERS,
      method: "POST",
      body: JSON.stringify(body),
    })
      .then((res) => res.json())
      .then((jsn) => {
        if (jsn.error) {
          showEr(jsn.error);
        } else {
          document.getElementById("er").style.display = "none";
          document.getElementById("portal-user").value = "";
          document.getElementById("portal-password").value = "";
        }
      })
      .catch((err) => showEr(err.toString()));
  };

  const username = document.getElementById("portal-user").value;
  const password = document.getElementById("portal-password").value;
  if (!username || !password) {
    validatePortal();
    return;
  }
  if (document.location.protocol === "http:") {
    showEr("Please use HTTPS to ensure authentication is secure.");
    return;
  }
  const HEADERS = {
    headers: { Authorization: `Basic ${btoa(username + ":" + password)}` },
  };
  fetch("https://matter-portal.kewbish.workers.dev/portal", HEADERS)
    .then((res) => res.json())
    .then((jsn) => {
      if (jsn.error) {
        createPortal();
      } else {
        const values = JSON.parse(atob(jsn.data));
        setLoc("sources", values.sources);
        setLoc("isnum", values.isnum);
        setLoc("pat", values.pat);
        setLoc("repo", values.repo);
        upLoc();
        setup();
        getBm();
        RSSES.forEach((rss) => {
          parseFeed(rss);
        });
        rerender();
        document.getElementById("er").style.display = "none";
        document.getElementById("portal-user").value = "";
        document.getElementById("portal-password").value = "";
      }
    })
    .catch((err) => showEr(err.toString()));
};

upLoc();
if (pat) {
  document.getElementById("login-btn").style.display = "none";
}
if (pat && repo && isnum) {
  getBm();
}
RSSES.forEach((rss) => {
  parseFeed(rss);
});
