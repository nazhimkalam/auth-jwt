const express = require('express');
const bcrypt = require('bcrypt');
const { addUser, getUsers } = require('../db/Users');
const app = express();
const PORT = 8080; 
const http = require('http-status-codes');
const jwt = require("jsonwebtoken");
const cors = require('cors');

const passport = require('passport');
const initializePassport = require('../config/passport-config');
const flash = require('express-flash');
const session = require('express-session');
const uniqueId = require('uuid').v4;
const { generateAccessToken, generateRefreshToken } = require('../utils/helperFunction');
const { authenticateToken } = require('../middlewares/authenticateToken');
let refreshTokens = [];

if(process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(flash());
app.use( session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false }) );
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());


initializePassport( passport,
	(email) => getUsers().find((user) => user.email === email),
	(id) => getUsers().find((user) => user.id === id)
);

app.post("/token", (req, res) => {
	const refreshToken = req.body.token;

	if (refreshToken == null) 
		return res.status(http.StatusCodes.UNAUTHORIZED).json({ message: "refresh token is missing" });

	if (!refreshTokens.includes(refreshToken)) 
		return res.status(http.StatusCodes.FORBIDDEN).json({ message: "Invalid refresh token." });

	jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
		if (err) 
			return res.status(http.StatusCodes.FORBIDDEN).json({ message: "Invalid refresh token." });

		const accessToken = generateAccessToken({ email: user.email });
		res.status(http.StatusCodes.OK).json({ accessToken: accessToken });
	});
});

app.post('/register', async(req, res) => {
	const user = getUsers().find((user) => user.email === req.body.email);
	
	if(user) {
		res.status(http.StatusCodes.NOT_ACCEPTABLE).json({ message: 'User already exists'});
		return;
	}
	
	await bcrypt.hash(req.body.password, 10).then((hashedPassword) => {
		addUser(
			{
				id: uniqueId(),
				name: req.body.name,
				email: req.body.email,
				password: hashedPassword,
			}
		)
	}).then(() => {	
		res.status(http.StatusCodes.OK).json({ message: 'User created'});
	})
	.catch(() => {
		res.status(http.StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'User registration failed!' });
	});

});

app.post('/login', passport.authenticate('local'), (req, res) => {
	const email = req.body.email;
	const user = getUsers().find((user) => user.email === email);
  
	const accessToken = generateAccessToken({ email: user.email });
	const refreshToken = generateRefreshToken({ email: user.email });
	refreshTokens.push(refreshToken);
	res.status(http.StatusCodes.OK).json({ name: user.name, email: user.email, accessToken: accessToken, refreshToken: refreshToken, expiresAt: 10000 });
});

app.put("/change-password", authenticateToken, (req, res) => {
	const email = req.body.email;
	const password = req.body.password;
	const user = getUsers().find((user) => user.email === email);
	
	if(!user) {
		res.status(http.StatusCodes.NOT_FOUND).json({ message: 'User not found' });
		return;
	}
	
	bcrypt.hash(password, 10).then((hashedPassword) => {
		user.password = hashedPassword;
		res.status(http.StatusCodes.OK).json({ message: 'Password change successful' });
	}).catch(() => {
		res.status(http.StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Password change failed!' });
	});
});

app.delete('/logout', (req, res) => {
	req.logOut();  
	refreshTokens = refreshTokens.filter((token) => token !== req.body.token);
	res.status(http.StatusCodes.OK).json({ message: 'User logged out' });
});

app.get('/users', authenticateToken, (req, res) => {
	res.json(getUsers().map((user) => ({ name: user.name, email: user.email })));
});

app.listen(PORT, () => {
	console.log(`>>> Listening to PORT: ${PORT}`);
});