const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();

let isOnline = false;
let uptime = 0; // in seconds
let downtime = 0; // in seconds

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (HTML, CSS, JS)
app.use(express.static('public'));

// List of questions for NGL
const nglQuestions = [
    "How are you today?",
    "What's your favorite color?",
    "Have you ever traveled abroad?",
    "What's your favorite food?",
    "Do you like sports?",
    "Tell me about your hobbies.",
    "What's your dream vacation destination?",
    "What books do you enjoy reading?",
    "What's your favorite movie?",
    "Do you have any pets?",
    "What's your favorite season?",
    "What do you do for a living?",
    "What's your favorite type of music?",
    "Tell me about a memorable trip you've taken.",
    "What's your favorite way to relax?",
    "Do you enjoy cooking?",
    "What's your opinion on technology?",
    "What's your most cherished possession?",
    "Do you have any siblings?",
    "What's your preferred mode of transportation?",
    "If you could have any superpower, what would it be and why?",
    "What's the most adventurous thing you've ever done?",
    "If you could time travel, where and when would you go?",
    "What's the scariest movie you've ever watched?",
    "Have you ever had a paranormal experience?",
    "If you were in a horror movie, what role would you play?",
    "What's your favorite board game or card game?",
    "If you could dine with any historical figure, who would it be and why?",
    "What's your go-to karaoke song?",
    "If you could visit any fictional world, where would you go?",
    "What's the most unusual food you've ever tried?",
    "If you could switch lives with someone for a day, who would it be?",
    "What's something on your bucket list that you haven't achieved yet?",
    "Do you prefer coffee or tea, and why?",
    "If you could learn any new skill or hobby instantly, what would it be?",
    "What's your favorite childhood memory?",
    "How do you like to spend your weekends?",
    "What's a talent you wish you had?",
    "If you could live in any era of history, which one would you choose and why?",
    "What's the most inspiring book you've ever read?",
    "If you could have dinner with any fictional character, who would it be and why?",
    "What's your favorite thing about yourself?",
    "What's the best piece of advice you've ever received?",
    "What's your favorite quote or motto?",
    "What's something you're passionate about?",
    "If you could eliminate one problem in the world, what would it be?",
    "What's your idea of a perfect day?",
    "What's a hobby or interest you've always wanted to pursue but haven't had the chance to yet?",
    "If you could have a conversation with your future self, what would you ask?",
    "What's a skill or talent you're proud of?",
    "If you could live anywhere in the world, where would it be?",
    "What's something that always makes you laugh?",
    "What's your favorite way to spend a rainy day?",
    "If you could meet any celebrity, who would it be and why?",
    "What's the most valuable lesson you've learned in life so far?",
    "What's your favorite holiday, and how do you typically celebrate it?",
    "If you could change one thing about the world, what would it be?",
    "What's a movie or TV show you could watch over and over again without getting tired of it?",
    "What's a skill or talent you admire in others?",
    "If you could have any animal as a pet, what would it be?",
    "What's your favorite way to stay active?",
    "If you could have any job in the world for a day, what would it be?",
    "What's your favorite childhood toy?",
    "If you could have any fictional creature as a pet, what would it be?",
    "What's the most interesting place you've ever visited?",
    "What's a skill you'd like to master in the next year?",
    "What's your favorite way to spend a lazy Sunday?",
    "If you could have any job for a day, what would it be and why?",
    "What's the most spontaneous thing you've ever done?",
    "If you could meet any historical figure, who would it be and why?",
    "What's your favorite quote from a movie or TV show?",
    "What's your favorite way to unwind after a long day?",
    "If you could only eat one cuisine for the rest of your life, what would it be?",
    "What's a song that always gets you pumped up?",
    "If you could be any fictional character for a day, who would you choose?",
    "What's your biggest pet peeve?",
    "If you could have any animal's abilities, which animal would you choose?",
    "What's your favorite way to exercise?",
    "What's the most beautiful place you've ever seen?",
    "If you could instantly become an expert in any field, what would it be?",
    "What's your favorite thing about the city you live in?",
    "If you could have any talent, artistic or otherwise, what would it be?",
    "What's a skill you've always wanted to learn but haven't had the chance to?",
    "What's your favorite outdoor activity?",
    "If you could live in any fictional universe, which one would you choose?",
    "What's your favorite thing to do with friends or family?",
    "If you could have any exotic animal as a pet, what would it be?",
    "What's the most memorable concert or live event you've attended?",
    "If you could have dinner with any three people, living or dead, who would they be?",
    "What's something you've always wanted to do but haven't had the courage to try?",
    "What's your favorite thing about yourself that you wish more people knew?",
    "If you could witness any event in history, what would it be?",
    "What's the craziest thing you've ever done on a dare?",
    "If you could have any exotic pet, legal or not, what would it be?",
    "What's the most adventurous place you've made love?",
    "If you could have a one-night stand with any celebrity, who would it be and why?",
    "What's your favorite fantasy?",
    "What's the kinkiest thing you've ever done?",
    "If you could try one thing in the bedroom that you haven't tried before, what would it be?",
    "What's your biggest turn-on?",
    "If you could create your own sexual fantasy, what would it entail?",
    "What's the most embarrassing sexual encounter you've had?",
    "What's your favorite part of foreplay?",
    "If you could have sex anywhere in the world, where would it be?",
    "What's your favorite role-play scenario?",
    "If you could have a threesome with any two people, who would they be?",
    "What's your favorite thing about your body?",
    "What's the most unusual place you've had sex?",
    "If you could try any sexual position, what would it be?",
    "What's your biggest sexual fantasy that you've never shared with anyone?",
    "What's the most adventurous thing you'd like to try in bed?",
    "If you could have a romantic evening with anyone, who would it be?",
    "What's the sexiest outfit you own?",
    "If you could be intimate with anyone in history, who would it be?",
    "What's your favorite thing about intimacy?",
    "If you could spend a night with any fictional character, who would it be?",
    "What's your idea of the perfect date night?",
    "What's the most romantic thing you've ever done for someone?",
    "If you could have any celebrity as your partner for a day, who would it be?",
    "What's your favorite thing about being in a relationship?",
    "If you could change one thing about your sexual history, what would it be?",
    "What's your guilty pleasure?",
    "If you could have any job in the world without worrying about money, what would it be?",
    "What's the most spontaneous thing you've ever done?",
    "If you could be any fictional character for a day, who would you choose and why?",
    "What's your favorite way to spend a day off?",
    "If you could meet any historical figure, who would it be and why?",
    "What's the most embarrassing thing that's ever happened to you?",
    "What's your biggest fear?",
    "If you could live in any time period, past or future, when would it be?",
    "What's the best piece of advice you've ever received?",
    "What's the most unusual talent you have?",
    "If you could have any animal as a pet, exotic or not, what would it be?",
    "What's the most memorable dream you've ever had?",
    "If you could have any superpower, what would it be and why?",
    "What's your favorite thing about yourself?",
    "If you could have dinner with any three people, living or dead, who would they be?",
    "What's the most important lesson life has taught you?",
    "What's the most interesting place you've ever visited?",
    "If you could only eat one food for the rest of your life, what would it be?",
    "What's the most valuable possession you own?",
    "If you could travel anywhere in the world, where would you go?",
    "What's the most adventurous thing you've ever done?",
    "If you could change one thing about the world, what would it be?",
    "What's your favorite memory from childhood?",
    "If you could have any skill instantly, what would it be?",
    "What's something you've always wanted to do but haven't had the chance to?",
    "What's your favorite way to relax?",
    "If you could have any job for a day, what would it be and why?",
    "What's the best book you've read recently?",
    "What's your idea of a perfect weekend?",
    "If you could have any talent, what would you choose?",
    "What's your favorite holiday tradition?",
    "If you could live in any fictional universe, which one would it be?",
    "What's your favorite thing about the city or town you live in?",
    "If you could have any animal as a companion, mythical or real, what would it be?",
    "What's the most memorable concert or live performance you've attended?",
    "If you could have a conversation with any fictional character, who would it be?",
    "What's something you've always wanted to learn but haven't had the chance to?",
    "What's your favorite type of weather?",
    "If you could be fluent in any language instantly, which would you choose?",
    "What's your favorite way to spend a rainy day?",
    "If you could be any age for a week, what age would you choose and why?",
    "What's your favorite type of cuisine?",
    "If you could have any job in the world for one week, what would it be?",
    "What's the most interesting documentary you've ever watched?",
    "If you could have any view from your bedroom window, what would it be?",
    "What's your favorite way to exercise?",
    "If you could have any piece of technology from a sci-fi movie, what would it be?",
    "What's the most spontaneous trip you've ever taken?",
    "If you could have any vehicle, real or fictional, what would it be?",
    "What's your favorite type of dessert?",
    "If you could only listen to one genre of music for the rest of your life, what would it be?",
    "What's your favorite memory with your best friend?",
    "If you could be any character from a book or movie, who would you be?",
    "What's your favorite way to start the day?",
    "If you could visit any historical era, which one would you choose?",
    "What's the best piece of advice you've ever received?",
    "If you could have any job in the world, what would it be?",
    "What's your favorite childhood memory involving food?",
    "If you could only eat one cuisine for the rest of your life, what would it be?",
    "What's the most daring thing you've ever done in the kitchen?",
    "If you could have dinner with any fictional character, who would it be and why?",
    "What's your favorite comfort food?",
    "What's the most exotic dish you've ever tried?",
    "If you could cook a meal for any celebrity, who would it be and what would you make?",
    "What's the weirdest food combination you enjoy?",
    "What's your go-to dish when you want to impress someone?",
    "What's the best meal you've ever had while traveling?",
    "If you could have a cooking showdown with any chef, who would you challenge?",
    "What's your favorite cooking technique or method?",
    "What's the most memorable meal you've ever shared with someone?",
    "If you could only eat one type of cuisine for the rest of your life, what would it be?",
    "What's your favorite thing to cook on a lazy Sunday?",
    "What's your signature dish?",
    "If you could have a cooking lesson from any chef, who would you choose?",
    "What's the most unusual ingredient you've ever cooked with?",
    "What's your favorite dish from your culture or heritage?",
    "If you could open your own restaurant, what type of cuisine would you serve?",
    "What's the most challenging dish you've ever attempted to cook?",
    "If you could have a food-related superpower, what would it be?",
    "What's your favorite food memory from your childhood?",
    "If you could only eat one dessert for the rest of your life, what would it be?",
    "What's your favorite kitchen gadget or tool?",
    "What's the most unique restaurant you've ever dined at?",
    "If you could travel to any country just to try their food, where would you go?",
    "What's your favorite dish to cook for a special occasion?",
    "What's the weirdest food you've ever tried?",
];

// Function to get a random question from the list
const getRandomQuestion = () => {
    return nglQuestions[Math.floor(Math.random() * nglQuestions.length)];
};

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
    const apiKey = 'eeb0129622de208a24337b0d286e7a5d';  // Replace with your actual API key

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

// Endpoint to handle the API request for NGL
app.post('/ngl', async (req, res) => {
    const { username, gameSlug } = req.body; // Removed question from request body

    const question = getRandomQuestion(); // Get a random question from the list
    const url = 'https://ngl.link/api/submit';
    const data = `username=${username}&question=${question}&deviceId=fe8e0d10-40d1-47a4-bd5e-90fa382adafc&gameSlug=${gameSlug}&referrer=`;

    try {
        const response = await axios.post(url, data, {
            headers: {
                'Accept': '*/*',
                'Accept-Encoding': 'gzip, deflate, br, zstd',
                'Accept-Language': 'en-US,en;q=0.9',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Origin': 'https://ngl.link',
                'Referer': `https://ngl.link/${username}`,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
            }
        });

        res.json({
            question,
            response: response.data,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// tikok username checker
app.post('/ttuser', async (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    const url = `https://www.tiktok.com/@${username}`;

    try {
        const response = await axios.head(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
                'Accept': '*/*',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'en-US,en;q=0.9',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Origin': 'https://www.tiktok.com',
                'Referer': `https://www.tiktok.com`,
            }
        });

        let availability;
        if (response.status === 200) {
            availability = 'taken';
        } else if (response.status === 404) {
            availability = 'available';
        } else {
            availability = 'unknown';
        }

        res.json({
            username,
            availability,
            status: response.status,
        });
    } catch (error) {
        if (error.response && error.response.status === 404) {
            res.json({
                username,
                availability: 'available',
                status: 404,
            });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});


// tiktok comment scrape
app.post('/ttcomment', async (req, res) => {
    const { link } = req.body;

    if (!link) {
        return res.status(400).json({ error: 'Video URL is required' });
    }

    let videoid;

    if (link.includes("vm.tiktok.com") || link.includes("vt.tiktok.com")) {
        try {
            const redirectResponse = await axios.head(link, { maxRedirects: 10 });
            videoid = redirectResponse.request.res.responseUrl.split("/")[5].split("?", 1)[0];
        } catch (error) {
            return res.status(500).json({ error: 'Failed to retrieve video ID from short link' });
        }
    } else {
        videoid = link.split("/")[5].split("?", 1)[0];
    }

    let t = 0;
    let comm_num = 0;
    let comments = [];

    try {
        while (true) {
            const headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36',
                'Referer': `https://www.tiktok.com/@x/video/${videoid}`,
            };

            const response = await axios.get(
                `https://www.tiktok.com/api/comment/list/?aid=1988&aweme_id=${videoid}&count=9999999&cursor=${t}`,
                { headers }
            );

            const data = response.data;

            if (!data.comments || data.comments.length === 0) {
                break;
            }

            data.comments.forEach(comment => {
                comments.push(comment.text);
                comm_num += 1;
            });

            t += 50;
        }

        res.json({
            videoid,
            totalComments: comm_num,
            comments,
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// tiktok room id
app.post('/ttroomid', async (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    const url = `https://www.tiktok.com/@${username}/live`;

    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'en-US,en;q=0.9',
                'Connection': 'keep-alive',
            }
        });

        // Use regex to extract the JSON data from the HTML
        const scriptRegex = /<script id="SIGI_STATE" type="application\/json">([^<]*)<\/script>/;
        const match = response.data.match(scriptRegex);

        if (match && match[1]) {
            const jsonData = match[1].trim();
            const data = JSON.parse(jsonData);
            const roomId = data?.LiveRoom?.liveRoomUserInfo?.user?.roomId;

            if (roomId) {
                res.json({ roomId });
            } else {
                res.status(404).json({ error: 'roomId not found in the response' });
            }
        } else {
            res.status(404).json({ error: 'Script content not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// email bomb
app.post('/emailbomb', async (req, res) => {
    const { email, times = 10 } = req.body;

    const url = "https://www.geoguessr.com/api/v3/accounts/signup";

    const headers = {
        "accept": "*/*",
        "accept-language": "en-US,en;q=0.9",
        "content-type": "application/json",
        "cookie": "_cfuvid=W5Wr5xeJ3HYm4PlAROfftd6Jks.BGDnUTseC9ZjJwiY-1723413771365-0.0.1.1-604800000; devicetoken=41E404CA46; session=eyJTZXNzaW9uSWQiOiJidzVoYmhxMGl4MHJ6Z3UyeWNycHh5MnhtZ3c1Y3YzMSIsIkV4cGlyZXMiOiIyMDI0LTA4LTExVDIyOjIyOjU3LjY5MTg3MzhaIn0==",
        "dnt": "1",
        "origin": "https://www.geoguessr.com",
        "priority": "u=1, i",
        "referer": "https://www.geoguessr.com/signup",
        "sec-ch-ua": '"Not/A)Brand";v="8", "Chromium";v="126", "Avast Secure Browser";v="126"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Avast/126.0.0.0",
        "x-client": "web"
    };

    const data = {
        email: email,
        target: "/",
        password: "Ihateniggers!123"
    };

    let successCount = 0;
    let ratelimitedCount = 0;

    for (let i = 0; i < times; i++) {
        try {
            const response = await axios.post(url, data, { headers });

            if (response.status === 400) {
                successCount++;
            } else if (response.status === 429) {
                ratelimitedCount++;
            }
        } catch (error) {
            // Handle errors as needed
        }
    }

    res.json({ successCount, ratelimitedCount, message: 'Done.' });
});


// Define the /cardgen endpoint
app.post('/cardgen', async (req, res) => {
    const { username } = req.body; // Extract username from the request body
    try {
      // Define the URL and headers
      const url = 'https://backend.lambdatest.com/api/dev-tools/credit-card-generator?type=Visa&no-of-cards=1';
      const headers = {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive',
        'Content-Type': 'application/json',
        'Host': 'backend.lambdatest.com',
        'Origin': 'https://www.lambdatest.com',
        'Referer': 'https://www.lambdatest.com/free-online-tools/credit-card-number-generator',
        'sec-ch-ua': '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-site',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'
      };
  
      // Send the GET request
      const response = await axios.get(url, { headers });
  
      // Check if the request was successful
      if (response.status === 200) {
        // Parse the JSON response
        const data = response.data;
  
        // Format the data and include the username
        const formattedData = data.map(card => ({
          type: card.type,
          name: username,
          number: card.number,  // Use the username as the card number for demonstration
          cvv: card.cvv,
          expiry: card.expiry
        }));
  
        // Send the formatted data as a JSON response
        res.json(formattedData);
      } else {
        res.status(response.status).send(`Request failed with status code ${response.status}`);
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred while processing the request');
    }
});
  
// mindcraft username checker
app.post('/mcusername', async (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    const url = `https://api.mojang.com/users/profiles/minecraft/${username}`;

    try {
        const response = await axios.get(url);
        const r_data = response.data;

        if (r_data && r_data.name && r_data.id) {
            return res.json({ username: r_data.name, uuid: r_data.id, paid: true });
        } else {
            return res.json({ username, paid: false });
        }
    } catch (error) {
        return res.json({ username, paid: false });
    }
});




//------- Username Titkok
// TikTok User Handling
const filePathTikTok = path.join(__dirname, 'ttuser.txt');
let tikTokUsers = [];

function loadTikTokUsers() {
    try {
        const data = fs.readFileSync(filePathTikTok, 'utf8');
        tikTokUsers = data.split('\n').filter(Boolean);
    } catch (err) {
        console.error('Error reading ttuser.txt file:', err);
    }
}

app.get('/getttuser', (req, res) => {
    if (tikTokUsers.length === 0) {
        return res.status(500).json({ error: 'No TikTok users found in the list.' });
    }
    
    const randomUser = tikTokUsers[Math.floor(Math.random() * tikTokUsers.length)];
    res.json({ user: randomUser });
});

// Instagram User Handling
const filePathInsta = path.join(__dirname, 'instauser.txt');
let instaUsers = [];

function loadInstaUsers() {
    try {
        const data = fs.readFileSync(filePathInsta, 'utf8');
        instaUsers = data.split('\n').filter(Boolean);
    } catch (err) {
        console.error('Error reading instauser.txt file:', err);
    }
}

app.get('/getiguser', (req, res) => {
    if (instaUsers.length === 0) {
        return res.status(500).json({ error: 'No Instagram users found in the list.' });
    }
    
    const randomUser = instaUsers[Math.floor(Math.random() * instaUsers.length)];
    res.json({ user: randomUser });
});

// Load users and start server
loadTikTokUsers();
loadInstaUsers();;


// Function to check the server status
const checkServerStatus = async () => {
    const apiKey = 'eeb0129622de208a24337b0d286e7a5d'; // Replace with your actual API key
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
