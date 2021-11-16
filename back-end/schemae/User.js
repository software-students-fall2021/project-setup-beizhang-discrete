const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

const FriendSchema = new Schema({
    username: String,
    avatar: String,
    status: String
});

const UserSchema = new Schema({
    username: {
        type: String,
        required: [true, 'Please enter a username'],
        unique: [true, 'Sorry, that username is taken'],
        minLength: [3, 'Username must be at least 3 characters long']
    },
    password: {
        type: String,
        required: [true, 'Please enter a password.'],
        minLength: [6, 'Password must be at least 6 characters long']
    },
    avatar: String,
    status: String,
    friends: [FriendSchema],
    friendRequests: [FriendSchema],
    joined_since: Date,
    games_played: Number,
    games_won: Number,
});

module.exports = { User : mongoose.model('User', UserSchema) }