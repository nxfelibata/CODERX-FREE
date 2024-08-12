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

    // Update the URL to point to the PythonAnywhere server
    const url = `https://teginif471.pythonanywhere.com/ttuser`;

    try {
        const response = await axios.post(url, { username }, {
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const { status } = response;
        let availability;
        if (status === 200) {
            availability = 'taken';
        } else if (status === 404) {
            availability = 'available';
        } else {
            availability = 'unknown';
        }

        res.json({
            username,
            availability,
            status,
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
