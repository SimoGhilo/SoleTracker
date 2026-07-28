//Dependencies and imports
import express from 'express';
import session from 'express-session';
import 'dotenv/config';
import bcrypt from 'bcrypt';
import {
  validateEmail,
  validatePassword,
  validateBusinessName
} from "./validators";
import {db} from './db.ts';
import cors from "cors";



const app = express();

app.use(
  cors({
    origin: "http://localhost:5173", // Your Vite frontend
    credentials: true,               // Allow cookies
  })
);


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



app.post("/api/register", async (req, res) => {
  const { business_name, email, password } = req.body;

  if(!validateBusinessName(business_name)) return res.status(400).json({
      success: 0,
      message: "Business Name Invalid."
    });

  if(!validateEmail(email)) return res.status(400).json({
      success: 0,
      message: "Email Invalid."
    });

  if(!validatePassword(password)) return res.status(400).json({
      success: 0,
      message: "Password Invalid."
    });


  try {
    const passwordHash = await bcrypt.hash(password, 10);

    // insert user into database
    await db.execute(
      `
      INSERT INTO users
      (business_name, email, password_hash)
      VALUES (?, ?, ?)
      `,
      [business_name, email, passwordHash]
    );
    

    res.status(201).json({
      success: 1,
      message: "Account created"
    });

  } catch (err) {
    console.log(err)
    res.status(500).json({
      success: 0,
      message: "Registration failed",
    });
  }
});

app.listen(5000, () => console.log('Server running on port 5000'));