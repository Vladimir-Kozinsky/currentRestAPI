const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const config = require('config')


const storage = new GridFsStorage({
    url: config.get('mongoUri'),
    options: { useNewUrlParser: true, useUnifiedTopology: true },
    file: (req, file) => {
        console.log(req.query.userId)
        const match = ["image/png", "image/jpeg", "image/jpg"];

        if (match.indexOf(file.mimetype) === -1) {
            const filename = `${Date.now()}-any-name-${file.originalname}`;
            return filename;
        }
        return {
            bucketName: "images",
            // filename: 'profileAvatar.jpeg'
            filename: `${Date.now()}-any-name-${file.originalname}`,
        };
    },
});

module.exports = multer({ storage });
