const { Schema, model, Types } = require('mongoose')

const schema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    rememberMe: { type: Boolean },
    profileInfo: {
        fullName: { type: String },
        status: { type: String },
        lookingForAJob: { type: Boolean },
        lookingForAJobDescription: { type: String },
        contacts: {
            github: { type: String },
            vk: { type: String },
            facebook: { type: String },
            instagram: { type: String },
            twitter: { type: String },
            website: { type: String },
            youtube: { type: String },
            mainLink: { type: String }
        },
        photos: {
            small: { type: String },
            large: { type: String }
        }
    },
    isAuth: { type: Boolean },
    images: {type: Buffer}
})

module.exports = model('User', schema)