
import express from "express";
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { connect, disconnect } from "./database/database";
import { UserModel } from './database/users/users.model';
import Jimp from 'jimp';
import fs from 'fs';
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware } from "./middleware/authentication";
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


app.get('/', (req, res) => {res.send('App online!'); });


app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())


app.post('/signup', (req, res) => {
  if (!req.body) res.status(400).json({ message: "Dati mancanti" })

  let user = { _id: req.body.email, password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(5)) };

  (async () => {
    try {
      const newUser = await UserModel.findOneOrCreate(user);
      if (Object.is(newUser, null)) {
        res.status(403).json("Utente già esistente");
      } else {
        res.status(200).json("Utente creato correttamente");
      }
    } catch (err) {
      res.status(200).json(`Errore ${err}`);
    }
  })();

});

app.post('/login', (req, res) => {
  if (!req.body) res.status(400).json({ message: "Dati mancanti" });
  UserModel.findOne({ _id: req.body.email }, (err, userFind) => {
    if (!userFind) res.status(401).json({ message: "Credenziali errate" });
    if (!bcrypt.compareSync(req.body.password, userFind.password)) res.status(401).json({ message: "Credenziali errate" });

    const token = jwt.sign({ id: userFind._id }, secretKey, { expiresIn: '1h' });
    res.json({ status: 200, message: 'Accesso eseguito', token });
  });
});

// Auth middleware with external declaration
app.use(authMiddleware);

app.get('/profile', (req, res) => {

  UserModel.findOne({ _id: req.decoded.id }, (err, user) => {
    if (!user) res.status(400).json({message: "Utente non trovato" });
    res.status(200).json({ status: 200, user });
  });
});

app.delete('/profile', (req, res) => {
  UserModel.remove({ _id: req.decoded.id }, (err) => {
    if (err) res.status(400).json({ message: "Errore nell\'eliminazione" });
    res.status(200).json({ message: "Utente eliminato"  });
  })
})

app.get('/charts', async (req, res) => {
  
  try {
    const id: string = uuidv4();
    let image = await Jimp.read('https://chart.googleapis.com/chart?cht=p3&chs=250x100&chd=t:60,40&chl=Hello|World');

    await image.writeAsync('/tmp/' + id + '.png');


    const fileContent = fs.readFileSync('/tmp/' + id + '.png');

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
      // Delete temp file
      fs.unlinkSync('/tmp/' + id + '.png');
      return res.status(200).json(`Grafico salvato correttamente. ${data.Location}`);
    });

  } catch (err) { res.status(400).json(`Errore: ${err}`); }

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
      res.status(400).json(`Errore: ${err}`);     
    } 
    else  {  
      return res.status(200).json(data.Contents);
    }// successful response
  });
});

module.exports.handler = serverless(app);