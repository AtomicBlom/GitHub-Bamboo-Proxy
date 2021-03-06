require('dotenv').load();

import express from 'express'
import bodyParser from 'body-parser';
import proxy from '../routes/bamboo-proxy.js'

var app = express();
app.use(bodyParser.json());
app.use('/bamboo/', proxy);

const server = app.listen(process.env.SERVER_PORT, process.env.SERVER_HOST, () => {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Server listening at http://%s:%s', host, port);
});