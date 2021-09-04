const upload = require("../middleware/upload");
const express = require("express");
const router = express.Router();
const cors = require("cors");
const User = require('./../models/User')
const mongoose = require("mongoose")
const Grid = require("gridfs-stream")


let gfs;

const conn = mongoose.connection;
conn.once("open", function () {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection("images");
});


router.post("/api/profile/photo", upload.single("avatar"), cors(), async (req, res) => {
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

router.get("/file/:filename", cors(), async (req, res) => {
    console.log("HELLLO")
    try {
        const file = await gfs.files.findOne({ filename: req.params.filename });
        const readStream = gfs.createReadStream(file.filename);
        readStream.pipe(res);
    } catch (error) {
        res.send("not found");
    }
});

router.options("/file/:filename", cors())
router.delete("/file/:filename", cors(), async (req, res) => {
    console.log("HELLLO11111")
    try {
        await gfs.files.deleteOne({ filename: req.params.filename });
        res.send("success");
    } catch (error) {
        console.log(error);
        res.send("An error occured.");
    }
});

module.exports = router;
