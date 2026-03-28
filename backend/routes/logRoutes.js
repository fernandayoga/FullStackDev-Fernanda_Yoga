import express from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { authenticate, authorizeAdmin } from '../middlewares/auth.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

router.get('/', authenticate, authorizeAdmin, (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().slice(0, 10)
    const logFile = path.join(__dirname, `../logs/${date}.log`)

    if (!fs.existsSync(logFile)) {
      return res.status(200).json({ data: [] })
    }

    const content = fs.readFileSync(logFile, 'utf-8')
    const lines = content.split('\n').filter(line => line.trim() !== '').reverse()
    return res.status(200).json({ data: lines })
  } catch (err) {
    return res.status(500).json({ message: 'Gagal membaca log', error: err.message })
  }
})

export default router