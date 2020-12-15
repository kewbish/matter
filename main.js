const FEEDS = [
    'https://kewbi.sh/blog/index.xml',
];
const CORS = url => `https://cors-anywhere.herokuapp.com/${encodeURIComponent(url)}`

// test to see if template works nicely
const main = document.querySelector(".m-matter");
const article = document.querySelector("#m-item");
var clone = article.content.cloneNode(true);
clone.querySelector("a").href = "http://kewbi.sh";
clone.querySelector("h2").innerText = "Main page title";
clone.querySelector("p").innerText = "This is a main page.";
main.appendChild(clone);

