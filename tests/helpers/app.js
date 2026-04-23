require('dotenv').config({ path: '.env.test', quiet: true })
 
const express = require('express')
const cors = require('cors')
 
const app = express()
 
app.use(cors())
app.use(express.json())


app.use('/api', require('../../src/routes'))
 
module.exports = app
 