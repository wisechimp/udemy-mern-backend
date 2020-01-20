const multer = require('multer')
const uuid = require('uuid/v1')


const MIME_TYPE_MAP = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpeg',
    'image/png': 'png',
}

const fileUpload = multer({
    limits: 500000,
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads/images')
        },
        filename: (req, file, cb) => {
            const ext = MIME_TYPE_MAP[file.mimetype]
            cb(null, uuid() + '.' + ext)
        }
    }),
    fileFilter: (req, file, cb) => {
        // !! means that if this is undefined or null false gets returned
        // otherwise true
        const isValid = !!MIME_TYPE_MAP[file.mimetype]
        let error = isValid ? null : new Error('Invalid mime type.')
        cb(error, isValid)
    }
})

module.exports = fileUpload