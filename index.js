const env = require('dotenv').config()

const mustacheExpress = require('mustache-express');

const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const path = require('path');
const urls = require('./db/urls');

const app = express();

app.use(morgan('tiny'));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

// Register '.mustache' extension with The Mustache Express
app.engine('mst', mustacheExpress());

app.set('view engine', 'mst');
app.set('views', __dirname + '/views');

app.get('/', function (req, res) {
    res.render('index.html', {});
});

/**
 *
 */
app.get('/:name', async (req, res) => {
    const puny = await urls.find(req.params.name);
    if (puny) {
        await urls.increaseViews(puny)
        res.redirect(puny.url);
    } else {
        res.redirect(`/404.html?name=${req.params.name}`);
    }
});

/**
 *
 */
app.get('/:name/stats', async (req, res) => {
    let url = await urls.find(req.params.name);
    url.sys_url = "http://" + process.env.DOMAIN_NAME + "/" + url.name
    if (url) {
        res.render('stats', {
            ...env.parsed, url
        });
    } else {
        res.redirect(`/404.html?name=${req.params.name}`);
    }
});

/**
 *
 */
app.post('/api/puny', async (req, res) => {
    let obj = {...req.body};
    console.log("Finding ->", obj);
    try {
        let sys_url = "http://" + process.env.DOMAIN_NAME + "/" + obj.name
        let exists = await urls.findOneByUrl(obj.url);
        if (exists) {
            res.status(200);
            return res.json({
                isJoi: true,
                error: `URL already exists, visit here ${sys_url}`,
                url: exists
            });
        }
        let url = await urls.create(obj);
        url.sys_url = sys_url
        res.json(url);
    } catch (error) {
        res.status(500);
        res.json(error);
    }
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Using env: ${JSON.stringify(env)}`);
    console.log(`listening on port ${port}`);
});