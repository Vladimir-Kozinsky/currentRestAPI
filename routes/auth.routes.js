const { Router } = require('express')
const User = require('./../models/User')
const bcrypt = require('bcryptjs')
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken')
const config = require('config')
const router = Router()
const cors = require("cors");


//  /api/register
router.post('/register', 
    body('email', 'Wrong email').isEmail(),
    body('password', 'Minimum password length is 6 sympols').isLength({ min: 6 }),
    async (req, res) => {
        res.header('Access-Control-Allow-Origin: *')
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty) {
                return res.status(400).json({
                    errors: errors.array(),
                    message: 'Wrong data during registration'
                })
            }
            const { email, password, rememberMe, login } = req.body
            const candidate = await User.findOne({ "email": email })
            if (candidate) {
                return res.status(400).json({ message: " User with that name alreagy exists " })
            }
            const isAuth = false
            const hashedPassword = await bcrypt.hash(password, 12)
            console.log(req.body)
            const user = new User({ ...req.body })
            await user.save()
            res.status(201).json({ message: 'User created successfully ' })
        } catch (error) {
            res.status(500).json({ message: 'Something wrong, try again' })
        }
    })

//  /api/login
router.post('/login',
    [
        body('email', 'Write correct email').isEmail(),
        body('password', 'Enter the password').exists()
    ], cors(),
    async (req, res) => {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty) {
                return res.status(400).json({
                    errors: errors.array(),
                    message: 'Wrong data during login'
                })
            }
            const { email, password, rememberMe } = req.body
            console.log(email)
            const user = await User.findOne({ "email": email })
            if (!user) {
                return res.status(400).json({ message: "User didn't found" })
            }
            //const isMatch = await bcrypt.compare(password, user.password)
            if (password != user.password) {
                return res.status(400).json({ message: 'Incorrect password, try again' })
            }
            await User.findByIdAndUpdate(user._id, { isAuth: true })
            const token = jwt.sign(
                { userId: user.id },
                config.get('jwtSecret'),
                { expiresIn: '1h' }
            )
            res.json({
                resultCode: 0,
                messages: [],
                data: {
                    id: user.id,
                    email: user.email,
                    login: user.login,
                    token
                }
            })
        } catch (error) {
            res.status(500).json({ message: 'Something wrong, try again' })
        }
    })

//  /api/users
router.get('/users', cors(), async (req, res) => {
    try {
        const usersArr = await User.find()
        let count = 0
        count = usersArr.map(item => { return count += 1 })
        const totalUsers = count.length
        const items = usersArr.map(item => {
            return {
                id: item._id,
                name: item.profileInfo.fullName,
                status: item.profileInfo.status,
                photos: {
                    small: "item.photos.small",
                    large: "item.photos.large",
                },
                followed: true
            }
        })
        res.status(200).json({
            items,
            totalCount: totalUsers,
            error: ""
        })
    } catch (e) {
        res.status(500).json(e)
    }
})

//  /api/logout
router.post('/logout', async (req, res) => {
    try {
        // console.log(req.body)
        const { userId } = req.params
        await User.findByIdAndUpdate(userId, { isAuth: false })
        res.json({
            resultCode: 0,
            messages: [],
            data: {
                id: null,
                email: null,
                login: null,
                token: null
            },
        })
    } catch (error) {
        res.status(500).json(error)
    }
})

router.get('/auth/me', cors(), async (req, res) => {
    try {
        // console.log(req.query)
        const { userId } = req.query
        const user = await User.findById(userId)
        const token = jwt.sign(
            { userId: user.id },
            config.get('jwtSecret'),
            { expiresIn: '1h' }
        )
        res.json({
            resultCode: 0,
            messages: [],
            data: {
                id: user.id,
                email: user.email,
                login: user.login,
                token
            }
        })
    } catch (error) {
        res.status(500).json(error)
    }
})

router.get('/profile', cors(), async (req, res) => {
    try {
        //console.log(req.params)
        const { userId } = req.query
        const user = await User.findById(userId)
        const token = jwt.sign(
            { userId: user.id },
            config.get('jwtSecret'),
            { expiresIn: '1h' }
        )
        res.json({
            status: " this my status",
            aboutMe: "я круто чувак",
            contacts: {
                skype: "skyp",
                vk: "vk.com",
                facebook: "facebook",
                icq: "icq",
                email: "email",
                googlePlus: "gogep",
                twitter: "twitter",
                instagram: "instagra",
                whatsApp: "watsap"
            },
            photos: {
                small: "url small photo",
                large: "url large photo"
            },
            lookingForAJob: true,
            lookingForAJobDescription: 'Ищу работу, знаю это это и это',
            fullName: "samurai dmitry",
            userId: 2
        })
    } catch (error) {
        res.status(500).json(error)
    }
})

router.get('/profile/status', cors(), async (req, res) => {
    try {
        const { userId } = req.query
        console.log("status" + userId)
        const user = await User.findById(userId)
        const token = jwt.sign(
            { userId: user.id },
            config.get('jwtSecret'),
            { expiresIn: '1h' }
        )
        res.json(" this my status")
    } catch (error) {
        res.status(500).json(error)
    }
})

router.get('/profile/photo', cors(), async (req, res) => {
    try {

        const { userId } = req.query
        // console.log("photo" + userId)
        const user = await User.findById(userId)
        const token = jwt.sign(
            { userId: user.id },
            config.get('jwtSecret'),
            { expiresIn: '1h' }
        )
        res.json({
            photos: {
                small: " this my status",
                large: "url large photo"
            }

        })
    } catch (error) {
        res.status(500).json(error)
    }
})



module.exports = router