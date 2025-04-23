const mongoose = require('mongoose');

const boardSchema = mongoose.Schema({
    boardName: String,
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    dateCreated: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model('Board', boardSchema);