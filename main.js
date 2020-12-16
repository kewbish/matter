const FEEDS = [
    'https://kewbi.sh/blog/index.xml',
];

const main = document.querySelector(".grid");
const article = document.querySelector("#m-item");
var feed_dates = {}

function addItem(ln, title, desc) {
    var clone = article.content.cloneNode(true);
    clone.querySelector("a").href = ln;
    clone.querySelector("h2").innerText = title;
    clone.querySelector("p").innerText = `${desc}`;
    main.appendChild(clone);
}

function parseFeed(feed) {
    fetch(feed, { method: "GET" })
        .then(text => text.text())
        .then(texml => {
            const rss = new DOMParser().parseFromString(texml, 'text/xml');
            const items = rss.querySelectorAll("item");
            console.log(items);
        });
        
}

addItem("https://kewbi.sh", "A main page", "A description for said main page");

parseFeed('https://kewbi.sh/blog/index.xml');

