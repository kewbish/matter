const FEEDS = [
    'https://kewbi.sh/blog/index.xml',
];
const CORS = url => `https://cors-anywhere.herokuapp.com/${encodeURIComponent(url)}`

const main = document.querySelector(".grid");
const article = document.querySelector("#m-item");

function addItem(ln, title, desc, date) {
    var clone = article.content.cloneNode(true);
    clone.querySelector("a").href = ln;
    clone.querySelector("h2").innerText = title;
    clone.querySelector("p").innerText = `${desc} - published ${date.toDateString()}`;
    main.appendChild(clone);
}

addItem("https://kewbi.sh", "A main page", "A description for said main page", new Date("14 Dec 2020"));
addItem("https://kewbi.sh/blog/posts/201206/", "Morse Code Context", "I wrote a thing about dots and dashes, enjoy!", new Date("06 Dec 2020"));

