
import express from "express";
import Mongoose from "mongoose";
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import { connect, disconnect } from "./database/database";
import { UserModel } from './database/users/users.model';

import Jimp from 'jimp';
import fs from 'fs';
import AWS from 'aws-sdk';

import { v4 as uuidv4 } from 'uuid';

import serverless from 'serverless-http';

// Extend Express request 
declare global {
  namespace Express {
    interface Request {
      decoded?: any,
      input_files?: any
    }
  }
}

const app = express();
connect();

const port = 3000;
const secretKey = 'secretkey'


app.get('/', (req, res) => {res.send('App is up'); });


app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())


app.post('/signup', (req, res) => {
  if (!req.body) res.status(400).json({ message: "empty body" })

  let user = { _id: req.body.email, password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(5)) };

  (async () => {
    try {
      const newUser = await UserModel.findOneOrCreate(user);
      if (Object.is(newUser, null)) {
        console.log("User exists");
        res.send("user exists");
      } else {
        console.log(`Created user ${user._id}`);
        res.send(`Created user ${user._id}`);
      }
    } catch (err) {
      console.log(err);
      res.send(`error ${err}`);

    }
  })();

});

app.post('/login', (req, res) => {
  if (!req.body) res.status(400).json({ message: "empty body" })
  UserModel.findOne({ _id: req.body.email }, (err, userFind) => {
    if (!userFind) res.status(401).json({ message: "incorrect email or password" });
    if (!bcrypt.compareSync(req.body.password, userFind.password)) res.status(401).json({ message: "incorrect email or password" });

    const token = jwt.sign({ id: userFind._id }, secretKey, { expiresIn: '1h' });
    res.json({ status: 200, message: 'user logged', token });
  });
});

// Auth middleware with external declaration
import { authMiddleware } from "./middleware/authentication";
app.use(authMiddleware);

app.get('/secret', (req, res) => {
  // Test route for authenticate users
  res.status(200).json({ message: 'secret route' });
});

app.get('/profile', (req, res) => {

  UserModel.findOne({ _id: req.decoded.id }, (err, user) => {
    if (!user) res.status(401).json({ status: 401, message: "no such user found" });
    res.status(200).json({ status: 200, user });
  });
});

app.delete('/profile', (req, res) => {
  // delete user profile
  if (!req.body) res.status(400).json({ message: 'empty body' });
  UserModel.remove({ _id: req.body.email }, (err) => {
    if (err) res.status(400).json({ message: 'error' });
    res.status(200).json({ message: 'user deleted' });
  })
})

app.get('/charts', async (req, res) => {
  
  try {
    const id: string = uuidv4();
    let image = await Jimp.read('https://chart.googleapis.com/chart?cht=p3&chs=250x100&chd=t:60,40&chl=Hello|World');

    await image.writeAsync(id + '.png');


    const fileContent = fs.readFileSync(id + '.png');
    // Setting up S3 upload parameters
    const params = {
      Bucket: 'charts-app', // Bucket name
      Key: req.decoded.id + '/'+ uuidv4() + '.png', // File name you want to save as in S3
      Body: fileContent 
    };

    const s3 = new AWS.S3();
    // Uploading files to the bucket
    s3.upload(params, function (err, data) {
      if (err) {
        throw err;
      }
      console.log(`File uploaded successfully. ${data.Location}`);
      // Delete file
      fs.unlinkSync(id + '.png');
      return res.send("Ok Elia");
    });
  } catch (err) { throw err; }

});

app.get('/list', (req, res) =>{

   // Setting up S3 list parameters
   const params = {
    Bucket: 'charts-app', // Bucket name
    Prefix: req.decoded.id + '/', // File name you want to save as in S3
  };

  const s3 = new AWS.S3();
  s3.listObjectsV2(params, function(err, data) {
    if (err) {
      console.log(err, err.stack);
      throw err;
     } // an error occurred
    else  {   console.log(data);   
      return res.send(data.Contents);
    }// successful response
  });
});

// app.listen(port, () => { console.log(`Server started on http://localhost:${port}`); });

module.exports.handler = serverless(app);