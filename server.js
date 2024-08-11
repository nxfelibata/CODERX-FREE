const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();

let isOnline = false;
let uptime = 0; // in seconds
let downtime = 0; // in seconds

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (HTML, CSS, JS)
app.use(express.static('public'));

// Function to read and update the order count in data.json
const updateOrderCount = () => {
    const data = fs.readFileSync('data.json', 'utf8');
    const jsonData = JSON.parse(data);
    jsonData.orderCount += 1;
    fs.writeFileSync('data.json', JSON.stringify(jsonData, null, 2), 'utf8');
    return jsonData.orderCount;
};

// Endpoint to handle the API request for placing an order
app.post('/order', async (req, res) => {
    const { serviceId, link } = req.body;
    const apiKey = '0461cc517f5975e0ac3e2ce0343d847e';  // Replace with your actual API key

    const url = `https://prince.services/api/v2?key=${apiKey}&action=add&service=${serviceId}&link=${link}&quantity=100`;

    try {
        const response = await axios.get(url);
        
        // Update order count
        const orderCount = updateOrderCount();
        
        res.json({
            ...response.data,
            orderCount,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Function to check the server status
const checkServerStatus = async () => {
    const apiKey = '0461cc517f5975e0ac3e2ce0343d847e'; // Replace with your actual API key
    const serviceId = '5150'; // Replace with the actual service ID for Instagram views
    const instagramLink = 'https://www.instagram.com/reel/C8oMOKPtmS6/?igsh=dHdrOGxucjhreHFi'; // Replace with your actual Instagram video link
    const url = `https://prince.services/api/v2?key=${apiKey}&action=add&service=${serviceId}&link=${instagramLink}&quantity=100`;

    try {
        const response = await axios.get(url);

        if (response.status === 200) {
            isOnline = true;
            uptime += 1; // Add one hour to uptime
        }
    } catch (error) {
        isOnline = false;
        downtime += 1; // Add one hour to downtime
    }
};

// Initial check on server start
checkServerStatus();

// Set interval to check the server status every hour
setInterval(checkServerStatus, 3600000); // 3600000 ms = 1 hour

// Endpoint to get the status for the frontend
app.get('/status', (req, res) => {
    res.json({
        online: isOnline,
        uptime,
        downtime,
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
