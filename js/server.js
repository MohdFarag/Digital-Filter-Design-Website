BASE_URL = "http://127.0.0.1:9000"

async function sendToServer(url = '', data = {}) {
    
    var response = await fetch(url, {
        method: 'POST',
        mode: "cors",
        body: JSON.stringify(data),
    });

    return response.json()
}