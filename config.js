require('dotenv').config();

module.exports = {
  port: process.env.PORT || 8888,
  url: process.env.URL || 'http://localhost:8888',
  imagesPath: process.env.IMAGESPATH || 'albums',
  imagesURI: process.env.IMAGESURI || '/photos',
  pageLimit: 10,
  albumsName: ['Travel', 'Personal', 'Food', 'Nature', 'Other']
}