//load config
const config = require('./config')

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const compression = require('compression');

//setup express
app.use(helmet());
app.use(cors());
app.options('*', cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(compression());

//static images albums
app.use('/albums', express.static(config.imagespath));

//home
app.get('/', async (req, res) => {
	
	try {
    	res.json({test:'ok'});

	} catch (err) {
   			console.log(err);
	}

});

app.listen(config.port, () => {
    console.log("Server running on port " + config.port);
});