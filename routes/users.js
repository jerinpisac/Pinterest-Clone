const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');

mongoose.connect(process.env.MONGO_URI);

const userSchema = mongoose.Schema({
    fullname: String,
    username: {
        type: String,
        unique: true
    },
    email: {
        type: String,
        unique: true
    },
    password: String,
    boards: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Board'
    }],
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }],
    pins: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }],
    datecreated: {
        type: Date,
        default: Date.now()
    }
});

userSchema.plugin(plm);

module.exports = mongoose.model("User", userSchema);