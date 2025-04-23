const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    postImage: String,
    postTitle: String,
    postDescription: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    pins: {
        type: Number,
        default: 0
    },
    board: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Board'
    },
    dateCreated: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model("Post", postSchema);