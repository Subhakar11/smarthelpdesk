const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')
require('dotenv').config()

// Routes
const authRoutes = require('./routes/auth')
const kbRoutes = require('./routes/kb')
const ticketRoutes = require('./routes/tickets')
const agentRoutes = require('./routes/agent')
const configRoutes = require('./routes/config')
const auditRoutes = require('./routes/audit')

const { connectDB } = require('./config/db')
const { errorHandler } = require('./middleware/errorHandler')

const app = express()
const PORT = process.env.PORT || 5000

// Connect DB
connectDB()

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL, // React frontend URL in Render
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/kb', kbRoutes)
app.use('/api/tickets', ticketRoutes)
app.use('/api/agent', agentRoutes)
app.use('/api/config', configRoutes)
app.use('/api/audit', auditRoutes)

// Health check
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Serve React frontend in production
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../client/dist')
  app.use(express.static(frontendPath))

  // SPA fallback
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'))
  })
}

// Error handler
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})
