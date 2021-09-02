const upload = require("../middleware/upload");
const express = require("express");
const router = express.Router();
const cors = require("cors");
const User = require('./../models/User')


router.post("/profile/photo", upload.single("avatar"), cors(), async (req, res) => {
    if (req.file === undefined) return res.send("you must select a file.");
    const imgUrl = `http://localhost:5000/file/${req.file.filename}`;
    const { userId } = req.query
    await User.findByIdAndUpdate(userId, { 
        "profileInfo.photos.small": imgUrl,
        "profileInfo.photos.large": imgUrl 
        }
    )
    console.log(req.file)

    return res.send(
        {
            resultCode: 0,
            messages: ['Something wrong'],
            data: {
                photos: {
                    small: imgUrl,
                    large: imgUrl
                }
            }
        }
    );
});

module.exports = router;
