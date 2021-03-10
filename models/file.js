let mongoose = require("mongoose");

const fileSchema = mongoose.Schema({
    fileName: {
        type: String,
        required: true,
    },
    filePath: {
        type: String,
        required: true,
    },
    fileSize: {
        type: Number,
        required: true,
    },
    fileMimetype: {
        type: String,
        required: true,
    },
    fileMd5: {
        type: String,
        required: true,
    },
    hits: {
        type: Number,
        required: true,
    },
    ext: {
        type: String,
        required: true,
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("File", fileSchema);