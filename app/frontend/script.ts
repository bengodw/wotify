import domtoimage from 'dom-to-image';

var params = getHashParams();
var access_token = params.access_token,
    error = params.error;

var showNames = false;
var timePeriod = 0;
var profileResponse: UserProfile;
var songsResponseList: any[] = [];

if (error) {
    alert('There was an error during the authentication');
} else {
    if (access_token) {
        document.getElementById("main")!.style.display = "flex";
        document.getElementById("main-login")!.style.display = "none";
        for (var i of [0, 1, 2]) songsResponseList.push(await fetchSongs(access_token, i))
        profileResponse = await fetchProfile(access_token);
        populateUI();
    } else {
        console.log(params)
        document.getElementById("main-login")!.style.display = "flex";
        document.getElementById("main")!.style.display = "none";
    }
}


function getHashParams() {
    var hashParams: { [id: string] : string; } = {}
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while (e = r.exec(q)) {
        hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
}

async function fetchProfile(code: string): Promise<UserProfile> {
    const result = await fetch("https://api.spotify.com/v1/me", {
        method: "GET", headers: { Authorization: `Bearer ${code}` }
    });

    return await result.json();
}

async function fetchSongs(code: string, timePeriod: Number): Promise<any> {
    var timePeriodString = ""
    switch (timePeriod) {
        case 0:
            timePeriodString = "short_term";
            break;
        case 1:
            timePeriodString = "medium_term";
            break;
        case 2:
            timePeriodString = "long_term";
            break;
    }
    const result = await fetch(`https://api.spotify.com/v1/me/top/artists?limit=50&time_range=${timePeriodString}`, {
        method: "GET", headers: { Authorization: `Bearer ${code}` }
    });

    return await result.json();
}

function populateUI() {
    document.getElementById('songs-wrapper')?.remove()
    const songs = songsResponseList[timePeriod]
    const songsElement = document.getElementById("songs-template")!.cloneNode(true) as HTMLElement;
    songsElement.setAttribute("id", "songs-wrapper");
    document.getElementById("main")!.prepend(songsElement);
    songsElement.style.display = "flex";
    document.getElementById("listHeading")!.innerText = (profileResponse.display_name + "'s Top 50 Artists");
    var timePeriodString
    switch (timePeriod) {
        case 0:
            timePeriodString = "month";
            break;
        case 1:
            timePeriodString = "6 months";
            break;
        case 2:
            timePeriodString = "year";
            break;
    }
    document.getElementById("listSubHeading")!.innerText = (`over the past ${timePeriodString}`);
    var i = 0;
    for (const item of songs.items) {
        const div = document.createElement("div")
        div.style.backgroundImage = `url(${item.images[0].url})`
        if (showNames) div.innerText = item.name;
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
    domtoimage.toJpeg(document.getElementById('songs')!, { quality: 1 })
    .then(function (dataUrl) {
        var link = document.createElement('a');
        link.download = 'Topster.jpeg';
        link.href = dataUrl;
        link.click();
    });
});

document.getElementById('togglenames')!.addEventListener('click', () => {
    showNames = !showNames
    populateUI()
});

document.getElementById('timeperiod1')!.addEventListener('click', () => {
    timePeriod = 0
    populateUI()
});

document.getElementById('timeperiod2')!.addEventListener('click', () => {
    timePeriod = 1
    populateUI()
});

document.getElementById('timeperiod3')!.addEventListener('click', () => {
    timePeriod = 2
    populateUI()
});
