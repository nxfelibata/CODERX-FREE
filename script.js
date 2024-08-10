document.getElementById('smmForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const serviceId = document.getElementById('service').value;
    const link = document.getElementById('link').value;

    fetch('/order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ serviceId, link })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            document.getElementById('result').innerText = `Error: ${data.error}`;
        } else {
            document.getElementById('result').innerText = 'Order placed successfully!';
        }
    })
    .catch(error => {
        document.getElementById('result').innerText = `Request failed: ${error.message}`;
    });
});
