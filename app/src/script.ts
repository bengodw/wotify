// Because this is a literal single page application
// we detect a callback from Spotify by checking for the hash fragment
import { redirectToAuthCodeFlow, getAccessToken } from "./authCodeWithPkce";
import domtoimage from 'dom-to-image';

const clientId = "72faa4220b0b419aa73bb90e5c43c987";
const params = new URLSearchParams(window.location.search);
const code = params.get("code");

if (!code) {
    redirectToAuthCodeFlow(clientId);
} else {
    const accessToken = await getAccessToken(clientId, code);
    const songs = await fetchSongs(accessToken);
    const profile = await fetchProfile(accessToken);
    populateUI(profile, songs);
}

async function fetchProfile(code: string): Promise<UserProfile> {
    const result = await fetch("https://api.spotify.com/v1/me", {
        method: "GET", headers: { Authorization: `Bearer ${code}` }
    });

    return await result.json();
}

async function fetchSongs(code: string): Promise<any> {
    const result = await fetch("https://api.spotify.com/v1/me/top/artists?limit=50", {
        method: "GET", headers: { Authorization: `Bearer ${code}` }
    });

    return await result.json();
}

function populateUI(profile: UserProfile, songs: any) {
    document.getElementById("listHeading")!.innerText = (profile.display_name + "'s top 50 artists!").toLowerCase();
    var i = 0;
    for (const item of songs.items) {
        const div = document.createElement("div")
        div.style.backgroundImage = `url(${item.images[0].url})`
        div.innerText = item.name
        if (i < 8) {
            document.getElementById("songsList1")?.appendChild(div)
        } else if (i < 18) {
            document.getElementById("songsList2")?.appendChild(div)
        } else {
            document.getElementById("songsList3")?.appendChild(div)
        }
        i += 1;
    }
}

document.getElementById('download-button')!.addEventListener('click', () => {
    domtoimage.toJpeg(document.getElementById('songs')!, { quality: 0.95 })
    .then(function (dataUrl) {
        var link = document.createElement('a');
        link.download = 'my-image-name.jpeg';
        link.href = dataUrl;
        link.click();
    });
});
