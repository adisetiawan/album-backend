//load config
const config = require('./config')

const path = require('path');
const fs = require('fs').promises;

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const compression = require('compression');
const formidable = require('formidable');

//setup express
app.use(helmet());
app.use(cors());
app.options('*', cors());
//app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(compression());

//static images albums
app.use(config.imagesURI, express.static(config.imagesPath));

//setup db
const { AsyncNedb } = require('nedb-async');
const db = new AsyncNedb({ filename: 'db', autoload: true });


//GET health
app.get('/health', async (req, res) => {
	
	try {
    	res.json({message: "OK"});
	} catch (err) {
   			console.log(err);
	}

});

//POST photos/list
app.post('/photos/list', async (req, res) => {
	
	try {
    	
    	const limit = req.body.limit || 100;
    	const skip = req.body.skip || 0;
    	//count record
    	const total = await db.asyncCount({});
    	let photos = await db.asyncFind({}, [['limit', limit], ['skip', skip]]);

    	let jsonResp = {
    		message: 'OK',
    		skip: skip,
    		limit: limit
    	};

    	photos = photos.map(photo => {
    		return {
    			id: photo._id,
    			album: photo.album,
    			name: photo.name,
    			path: path.join('/', config.imagesPath, photo.folder, photo.name),
    			raw: config.url + config.imagesURI + '/' + photo.folder + '/' + photo.name
    		}
    	});

    	if(total > 0) {
    		jsonResp.count = total;
    		jsonResp.documents = photos;
    	} else {
    		jsonResp.count = total;
    	}

    	res.json(jsonResp);

	} catch (err) {
   			console.log(err);
	}

});


//PUT photos
app.put('/photos', async (req, res) => {
	
	try {
    	
    	let jsonResp = {
    		message: 'OK',
    	};

    	const form = formidable({ multiples: true });
		form.parse(req, async (err, fields, files) => {
		    
		    if (err) {
		      next(err);
		      return;
		    }

		    //upload
		    if(files.documents.length > 0 && fields.album) {
		    	let result = [];

		    	files.documents.forEach( async (fileInfo) => {
		    		
		    		//move temp file to correct album folder
		    		let newPath = path.join(__dirname, config.imagesPath, fields.album.toLowerCase()) + '/' + fileInfo.name;
		    		let oldFile = await fs.readFile(fileInfo.path);
		    		let newFile = await fs.writeFile(newPath, oldFile);

		    		//check if file with the same filename exist
		    		const stats = await fs.stat(newPath);
		    		if(!stats.isFile()) {
		    			//insert into db
		    			let record = await db.asyncInsert({
		    				album: fields.album, 
		    				folder: fields.album.toLowerCase(), 
		    				name: fileInfo.name 
		    			});
		    			//console.log(newPath + ': file not exist');
		    			result.push(record);
		    		}

		    	});

		    	//console.log(result);

		    	//insert into database
		    	jsonResp.data = result.map(item => {
		    		return {
		    			id: item._id,
		    			album: item.album,
		    			name: item.name,
		    			path: path.join('/', config.imagesPath, item.folder, item.name),
    					raw: config.url + config.imagesURI + '/' + item.folder + '/' + item.name
		    		}
		    	});

		    	res.json(jsonResp);

		    } else {
		    	res.json({ error : true });
		    }
		    
		});

	} catch (err) {
   			console.log(err);
	}

});

//DEL photo
app.delete('/photos/:album/:filename', async (req, res) => {
	
	try {
    	await db.asyncRemove({folder: req.params.album, name: req.params.filename});
    	await fs.unlink(path.join(__dirname, config.imagesPath, req.params.album.toLowerCase()) + '/' + req.params.filename);

    	res.json({"message": "OK"});

	} catch (err) {
   		console.log(err);
	}

});

//DEL photos
app.delete('/photos', async (req, res) => {
	
	try {
    	console.log(req.body);

    	res.json({"message": "OK"});

	} catch (err) {
   		console.log(err);
	}

});


//initiate database from albums folder
app.get('/db/setup', async (req, res) => {
	
	try {
    	
    	//truncate db
    	await db.asyncRemove({});

    	let content = [];
    	let record = [];

    	config.albumsName.forEach( async (folder) => {
    		//console.log(folder.toLowerCase());
    		
    		//read files inside each folder and insert into database
    		content = await fs.readdir(path.join(__dirname, config.imagesPath, folder.toLowerCase()));

    		//create record dataset for each albums
    		record = content.map((filename) => { 
    			return { album: folder, folder: folder.toLowerCase(), name: filename } 
    		});

    		await db.asyncInsert(record);
    		console.log(content);
    	});

    	//console.log(files);
    	res.json({"message": "OK"});

	} catch (err) {
   		console.log(err);
	}

});



app.listen(config.port, () => {
    console.log("Server running on port " + config.port);
});