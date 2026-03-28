import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { User } from '../models/index.js'
import dotenv from 'dotenv'

dotenv.config()

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body

    const existingUser = await User.findOne({ where: { email } })
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    })

    return res.status(201).json({
      message: 'User registered successfully',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error', error: err.message })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ where: { email } })
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    )

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error', error: err.message })
  }
}

export const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    })
    return res.status(200).json({ data: user })
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error', error: err.message })
  }
}

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    })
    return res.status(200).json({ data: users })
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error', error: err.message })
  }
}