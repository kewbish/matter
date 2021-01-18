const urlP = new URLSearchParams(window.location.search);
const authC = urlP.get('code');

fetch(`https://matter-cors.herokuapp.com/https://matter-cors.herokuapp.com/auth?code=${authC}`, { headers: { 'Origin': 'https://kewbi.sh/matter' } })
.then(tex => tex.text())
.then(res => {
    const token = new URLSearchParams(res).get("access_token");
    localStorage.setItem("pat", token);
    window.location.href = "../";
});
