import express from 'express';
import session from 'express-session';
import 'dotenv/config';
import bcrypt from 'bcrypt';

const app = express();
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET!, // used to sign the session ID cookie
    resave: false,                        // don't re-save session if nothing changed
    saveUninitialized: false,             // don't create a session until something is stored in it
    cookie: {
      httpOnly: true,   // JS on the frontend can't read this cookie — blocks XSS token theft
      secure: false,     // set true once you're on HTTPS in production
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  }),
);

app.post("/api/login", async (req, res) => {

  const { email, password } = req.body;

 //Lookup database

//   if (!user) {
//     return res.status(401).json({
//       message: "Invalid credentials"
//     });
//   }


//   const passwordMatch = await bcrypt.compare(
//     password,
//     // user.password_hash
//   );


// 

  // create session
//   req.session.userId = user.id;


  res.json({
    message: "Logged in"
  });
});


app.post("/api/register", async (req, res) => {
  const { business_name, email, password } = req.body;

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    // insert user into database
    

    res.json({
      message: "Account created",
    //   userId: user.id,
    });

  } catch (err) {
    res.status(500).json({
      message: "Registration failed",
    });
  }
});

app.listen(5000, () => console.log('Server running on port 5000'));