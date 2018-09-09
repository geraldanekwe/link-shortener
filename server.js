const express = require('express')
const body_parser = require('body-parser')
const crypto = require('crypto')
const Redis = require('ioredis')

const env = require('dotenv').config()
const secret = process.env.secret

const app = express()
const redis = new Redis({
  port: 10267,
  host: 'redis-10267.c74.us-east-1-4.ec2.cloud.redislabs.com',
  family: 4,
  password: process.env.redis_password,
  db: 0
})

app.use(body_parser.json({}))

app.use('/', express.static('public'))

app.post('/api/links/',(req, res) => {
  const { link } = req.body
  const hash = crypto.createHmac('md5', secret)
              .update(link)
              .digest('hex')
              .substring(0,6)

  redis.get(hash, (err, result) => {
    if (!err || !link) {
      redis.set(hash, link)
      res.send({ link: `http://localhost:3000/${hash}` })
    } else {
      res.send({ link: `http://localhost:3000/${hash}` })
    }
  })
})

app.get('/:hash', (req, res) => {
  redis.get(req.params.hash, (err, link) => {
    res.redirect(`http://${link}`)
  })
})

app.listen(3000)
