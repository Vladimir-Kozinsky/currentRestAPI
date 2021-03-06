const { Router } = require('express')
const User = require('./../models/User')
const bcrypt = require('bcryptjs')
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken')
const config = require('config')
const router = Router()
const cors = require("cors")
const express = require("express")

router.use(cors({
    origin: 'http://localhost:3000'
}
))

//  /api/register
router.post('/register',

    // validation of email and password
    body('email', 'Wrong email').isEmail(),
    body('password', 'Minimum password length is 6 sympols').isLength({ min: 6 }),
    async (req, res) => {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty) {
                return res.status(400).json({
                    errors: errors.array(),
                    message: 'Wrong data during registration'
                })
            }
            const { email, password, confPassword, fullName, status, lookingForAJob,
                lookingForAJobDescription, github, vk, facebook, instagram, twitter, website,
                youtube, mainLink, small, large } = req.body

            // passwords match check 
            if (password != confPassword) {
                return res.status(400).json({ message: " Passwords mismatch " })
            }

            // checking if a user exists
            const candidate = await User.findOne({ "email": email })
            if (candidate) {
                return res.status(400).json({ message: " User with that name alreagy exists " })
            }
            // hash password
            const hashedPassword = await bcrypt.hash(password, 12)

            // function - if value '', value ='none
            const isValue = (value) => {
                if (!value) {
                    return value = "none"
                } else {
                    return value
                }
            }

            const user = new User({
                email: email,
                password: hashedPassword,
                rememberMe: false,
                profileInfo: {
                    userId: 'none',
                    fullName: isValue(fullName),
                    status: isValue(status),
                    lookingForAJob: true,
                    lookingForAJobDescription: isValue(lookingForAJobDescription),
                    contacts: {
                        github: isValue(github),
                        vk: isValue(vk),
                        facebook: isValue(facebook),
                        instagram: isValue(instagram),
                        twitter: isValue(twitter),
                        website: isValue(website),
                        youtube: isValue(youtube),
                        mainLink: isValue(mainLink)
                    },
                    photos: {
                        small: isValue(small),
                        large: isValue(large)
                    }
                },
                isAuth: false
            })
            await user.save()
            // add userId to profileInfo
            await User.findByIdAndUpdate(user._id, { $set: { 'profileInfo.userId': user._id } }, function (err, doc) { });
            res.status(201).json({
                resultCode: 0,
                messages: ['User created successfully '],
                data: { ...user.profileInfo }
            })
        } catch (error) {
            res.status(500).json({ message: 'Something wrong, try again' })
        }
    })

//  /api/login
router.post('/login',
    [
        body('email', 'Write correct email').isEmail(),
        body('password', 'Enter the password').exists()
    ],
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
router.get('/users', async (req, res) => {
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
                    small: item.profileInfo.photos.small,
                    large: item.profileInfo.photos.large
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
        const { userId } = req.body
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

router.get('/auth/me', async (req, res) => {
    try {
        console.log('auth me ' + req.query)
        const { userId } = req.query
        const user = await User.findById(userId)
        if (!user) {
            return res.json({
                resultCode: 1,
                messages: [],
                data: {
                    id: null,
                    email: null,
                    login: null,
                    token: null
                }
            }
            )
        }
        const token = jwt.sign(
            { userId: user.id },
            config.get('jwtSecret'),
            { expiresIn: '1h' }
        )
        console.log('not logged ' + user.isAuth)
        if (user.isAuth === true) {
            return res.json({
                resultCode: 0,
                messages: [],
                data: {
                    id: user.id,
                    email: user.email,
                    login: user.login,
                    token
                }
            }
            )
        } else {
            return res.json({
                resultCode: 1,
                messages: [],
                data: {
                    id: null,
                    email: null,
                    login: null,
                    token: null
                }
            }
            )
        }
    } catch (error) {
        res.status(500).json(error)
    }
})

router.get('/profile', async (req, res) => {
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
            aboutMe: "?? ?????????? ??????????",
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
                small: user.profileInfo.photos.small,
                large: user.profileInfo.photos.large
            },
            lookingForAJob: true,
            lookingForAJobDescription: '?????? ????????????, ???????? ?????? ?????? ?? ??????',
            fullName: "samurai dmitry",
            userId: 2
        })
    } catch (error) {
        res.status(500).json(error)
    }
})

router.get('/profile/status', async (req, res) => {
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

router.get('/profile/photo', async (req, res) => {
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