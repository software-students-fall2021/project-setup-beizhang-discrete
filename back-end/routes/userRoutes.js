const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../schemae/User').User;
const jwt = require('jsonwebtoken');

//token lives for 3 days
const maxAge = 3*24*60*60;
const createToken = _id => {
    return jwt.sign({ _id }, process.env.JWT_SECRET_KEY, {
        expiresIn: maxAge
    });
}

/* ---------------------- authentication route handlers --------------------- */
router.post("/login", async (req, res) => {
    const [username, password] = [req.body.username, req.body.password];
    const user = await User.findOne({ username : username });
    if(user) {
        const auth = await bcrypt.compare(password, user.password);
        if(auth) {
            const token = createToken(user._id);
            res.cookie("Bearer", token, { httpOnly: true, maxAge: maxAge*1000 });
            res.json({
                auth: true,
                user: user,
                token: token
            });
        }
        else {
            res.json({
                auth: false,
                message: "Incorrect password."
            });
        }
    }
    else {
        res.json({
            auth: false,
            message: "User not found. Check your username, or register a new account"
        });
    }
});
router.post("/register", async (req, res) => {
    const [username, password] = [req.body.username, req.body.password];
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const newUser = await User.create({
            username: username,
            password: hashedPassword,
            avatar: "https://t4.ftcdn.net/jpg/03/32/59/65/360_F_332596535_lAdLhf6KzbW6PWXBWeIFTovTii1drkbT.jpg",
            status: "Online",
            friends: [],
            friendRequests: [],
            joined_since: new Date(),
            games_played: 0,
            games_won: 0,
        });
        const token = createToken(newUser._id);
        res.cookie("Bearer", token, { httpOnly: true, maxAge: maxAge*1000 });
        res.json({
            auth: true,
            user: newUser,
            token: token
        });
        // res.json({ user: newUser._id });
    } catch(err) {
        console.log(err.toString());
        res.json({
            auth: false,
            message: err.toString()
        });
    }
});
router.get("/logout", (req, res) => {
    res.cookie('Bearer', '', { maxAge: 1 });
    res.send('logged out');
});
router.post("/userSearch", async (req, res) => {
    const searched = req.body.searched;
    console.log(searched);
    const users = await User.find({ username: { $regex: '.*' + searched + '.*', $options : 'i'}});
    if(users) {
        res.send(users);
    }
    else {
        res.send(null);
    }
});
router.get("/user", (req, res) => {
    const token = req.cookies.Bearer;
    if(token) {
        jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, decoded) => {
            if(err) {
                res.send(null);
            } else {
                console.log(decoded._id);
                const user = await User.findOne({ _id : decoded._id });
                if(user) {
                    res.send(user);
                }
                else {
                    res.send(null);
                }
            }
        });
    }
    else {
        res.send(null);
    }
});

module.exports = router;