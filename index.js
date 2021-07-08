const express = require("express");
const connectDB = require("./DB/connection.js");
const cookieParser = require("cookie-parser");
const blogRouter = require("./routes/blog.js");
const authRouter = require("./routes/auth.js");
const reminderRouter = require('./routes/reminder-app.js');
const nodemailer = require('nodemailer');
connectDB();

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

/*Register view engine*/
app.set('view engine', 'ejs');

/* Handle Favicon */
app.get('/favicon.ico', (req, res) => {
  res.sendStatus(204);
});

const port = process.env.PORT || 3000; // connect to 3000 or any other port thats available
app.listen(port, () => {
  console.log(`listening at ${port}`);
});

/*Make public files accessable to the root*/
app.use(express.static('public'));

/* Page Routes. Remove authRoute*/
app.get("/", (req, res) => {
  res.render('index', { title: 'Portfolio' });
});

/* Remove authRoute */
app.use('/blog/', blogRouter);
app.use('/auth', authRouter);
app.use(reminderRouter);

/* Email handler */
app.post('/email', (req, res) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
      user: 'hewettcharles.work@gmail.com',
      pass: process.env.EMAIL_PWRD
    }
  });

  let output = `<ul>
        <li>Name: ${req.body.name}</li>
        <li>Email: ${req.body.email}</li>
        </ul>
        <h3>Message</h3>
        <p>${req.body.message}</p>`

  transporter.sendMail({
    from: req.body.email, // sender address
    to: "hewettcharles.work@gmail.com", // list of receivers
    subject: `Portfolio website message from ${req.body.name}`, // Subject line
    html: output
  }).then(info => {
    console.log({ info });
    res.send('Message sent');
  }).catch(console.error);
});

/* 404 handler */
app.use((req, res,) => {
  res.status(404).render('404');
});