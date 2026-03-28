import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const logDir = path.join(__dirname, '../logs')

// Buat folder logs kalau belum ada
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir)
}

export const logger = (req, res, next) => {
  const now = new Date().toISOString()
  const log = `[${now}] ${req.method} ${req.url} - User: ${req.user?.email || 'unauthenticated'}\n`

  // Log ke console
  console.log(log.trim())

  // Log ke file
  const logFile = path.join(logDir, `${new Date().toISOString().slice(0, 10)}.log`)
  fs.appendFileSync(logFile, log)

  next()
}