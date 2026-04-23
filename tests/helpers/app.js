import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import routes from '../../src/routes/index.js'

dotenv.config({ path: '.env.test', quiet: true })
 
const app = express()
 
app.use(cors())
app.use(express.json())


app.use('/api', routes)
 
export default app
 