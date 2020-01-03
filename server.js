require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const MOVIES = require('./movies-data-small.json');

const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());

function validateBearerToken(req, res, next) {
    const apiToken = process.env.API_TOKEN;
    const authToken = req.get('Authorization');

    if (!authToken 
        || authToken.split(' ')[1] !== apiToken 
        || authToken.split(' ')[0] !== 'Bearer'){
        return res.status(401).json({ error: 'Unauthorized request'});
    }

    next();
};

app.use(validateBearerToken);

function handleGetMovie(req, res) {
    let response = MOVIES;

    if (req.query.genre){
        response = response.filter(movie => 
            movie.genre.toLowerCase().includes(req.query.genre.toLowerCase())
        )
    }

    if(req.query.country){
        response = response.filter(movie => 
            movie.country.toLowerCase().includes(req.query.country.toLowerCase())
        )
    }

    if(req.query.avg_vote){
        response = response.filter(movie => {
                if(parseFloat(movie.avg_vote) >= parseFloat(req.query.avg_vote)){
                    return true;
                } else {
                    return false;
                }
            }
        )
    }

    if(response.length <= 0){
        return res.status(400).json({ error: "We couldn't find any movie that satisfies your request"});
    }

    res.json(response);    
};

app.get('/movie', handleGetMovie);

const PORT = 8000;

app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
})