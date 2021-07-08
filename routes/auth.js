const express = require('express');
const router = express.Router({ strict: true });
const User = require('../DB/user-model.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.use(express.static('public'));

/* Cookie and token expiry date 1day */
const maxAge = 1 * 24 * 60 * 60;

const createToken = (id) => {
    return jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: maxAge });
}

router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        let user = await User.findOne({ email })

        if (user) {
            return res.status(400).json({ error: "user already exists" })
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        user = new User({
            username,
            email,
            password: hashedPassword
        });
        user = await user.save();
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(201).json({ user: user._id });
        res.redirect('/');

    } catch (error) {
        console.log(error);
        res.status(400).json({ error: "server error" });
    }
})

router.get('/login', (req, res) => {
    res.render('login', { title: "Login" });
})

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ error: "invalid cridentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ error: "invalid credentials" });
        }
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });

        res.status(200).redirect('/blog/');
        // res.status(200).json({ user: user._id }).redirect('/auth');


    } catch (error) {
        console.log(error);
        res.status(400).json({ error: "server error" });
    }

})

module.exports = router;