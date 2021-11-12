// IMPORTS
const express = require('express');
const bcrypt = require('bcrypt');
const { addUser, getUsers } = require('../db/Users');
const app = express();
const PORT = 8080; 
const passport = require('passport');
const initializePassport = require('../config/passport-config');
const flash = require('express-flash');
const session = require('express-session');
const uniqueId = require('uuid').v4;

if(process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}

// MIDDLEWARE
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(flash());
app.use( session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false }) );
app.use(passport.initialize());
app.use(passport.session());

initializePassport( passport,
	(email) => getUsers().find((user) => user.email === email),
	(id) => getUsers().find((user) => user.id === id)
);


// ROUTES
app.post('/register', async(req, res) => {
	const user = getUsers().find((user) => user.email === req.body.email);
	
	if(user) {
		res.status(400).send('User already exists');
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
		res.status(200).send('User created');
	})
	.catch(() => {
		res.status(500).send('User registration failed!');
	});

});

app.post('/login', passport.authenticate('local'), (req, res) => {
	res.status(200).send('User logged in');
});

app.delete('/logout', (req, res) => {
	req.logOut();  
	res.status(200).send('User logged out');
});

app.listen(PORT, () => {
	console.log(`>>> Listening to PORT: ${PORT}`);
});