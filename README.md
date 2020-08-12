# Album Backend

It's simple REST API for [gallery app](https://github.com/alex-solovev/investax-album)

## Installation

* run `npm install`
* rename `env.example` to `.env`
* change neccessary config in `.env` file

## Run Demo

`npm run dev`

## First-time use

to iniate new database and scan all files in the album folder run GET API `/db/setup` it will create flat file database called `db` in root

## TODO

* Jest Testing
* validation using `express-validator`