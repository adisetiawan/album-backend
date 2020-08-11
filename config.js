require('dotenv').config();

module.exports = {
  port: process.env.PORT || 8888,
  imagespath: process.env.IMAGESPATH || 'albums',
  pageLimit: 10,
}