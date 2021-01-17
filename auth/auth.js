const urlP = new URLSearchParams(window.location.search);
const authC = urlP.get('code');

fetch(`https://matter-cors.herokuapp.com/auth?code=${authC}`)
.then(tex => tex.text())
.then(res => {
    localStorage.setItem("pat", res["access_token"]);
    window.location.href = "../";
});
