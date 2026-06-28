import express from 'express'
import cors from 'cors'
import routes from './routes/index.js'
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js'

// Express app assembly. Kept separate from server.js so it can be imported in tests.
const app = express()

app.use(cors())
app.use(express.json())

// All API surfaces live under /api (frontend dev proxy targets this prefix).
app.use('/api', routes)

app.use(notFoundHandler)
app.use(errorHandler)

export default app
