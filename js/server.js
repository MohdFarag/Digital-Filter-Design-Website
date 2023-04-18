BASE_URL = "https://digitalfilterdesign.vercel.app/server"

async function sendToServer(url = '', data = {}) {
    
    var response = await fetch(url, {
        method: 'POST',
        mode: "cors",
        body: JSON.stringify(data),
    });

    return response.json()
}
