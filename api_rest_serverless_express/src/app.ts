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
import {port, secretKey} from "./config";

// Definizione del campo decoded all'interno della Request di Express
declare global {
  namespace Express {
    interface Request {
      decoded?: any,
      input_files?: any
    }
  }
}

const app = express();

// Apro la connessione con il database
connect();

/**
 * @api {post} / 
 * @apiName ServerTest
 * @method GET 
 * 
 * @apiSuccess {String} App online!
 * @apiSuccessExample Success-Response
 * HTTP/1.1 200 OK
 * {
 *    message: 'App online!'
 * }
 * 
 */
app.get('/', (req, res) => {res.send('App online!'); });

// Rende disponibile l'input dell'utente sotto la proprietà req.body
// Parser application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// application/json parser
app.use(bodyParser.json());

/**
 * @api {post} /signup Signup
 * @apiName Signup
 * @apiGroup User
 * @method POST 
 * 
 * @apiParam {String} email       Email dell'utente
 * @apiParam {String} password    Password dell'utente
 * 
 * @apiSuccess {String} Success
 * @apiSuccessExample Success-Response
 * HTTP/1.1 200 OK
 * {
 *    message: 'Utente creato correttamente'
 * }
 * 
 * @apiError {String} Utente già esistente
 * @apiErrorExample Error-Response
 * HTTP/1.1 403
 * {
 *    message: 'Utente già esistente'
 * }
 * 
 * @apiError {String} Errore + tipo errore
 * @apiErrorExample Error-Response
 * HTTP/1.1 400
 * {
 *    message: 'Errore' + tipo errore
 * }
 * 
 */
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

/**
 * @api {post} /login Login
 * @apiName Login
 * @apiGroup User
 * @method POST 
 * 
 * @apiParam {String} email       Email dell'utente
 * @apiParam {String} password    Password dell'utente
 * 
 * @apiSuccess {String} Success
 * @apiSuccessExample Success-Response
 * HTTP/1.1 200 OK
 * {
 *    message: 'Accesso eseguito'
 * }
 * 
 * @apiError {String} Dati mancanti
 * @apiErrorExample Error-Response
 * HTTP/1.1 400
 * {
 *    message: 'Dati mancanti'
 * }
 * 
 * @apiError {String} Credenziali errate
 * @apiErrorExample Error-Response
 * HTTP/1.1 400
 * {
 *    message: 'Credenziali errate'
 * }
 * 
 */
app.post('/login', (req, res) => {
  if (!req.body) res.status(400).json({ message: "Dati mancanti" });
  UserModel.findOne({ _id: req.body.email }, (err, userFind) => {
    if (!userFind) res.status(401).json({ message: "Credenziali errate" });
    if (!bcrypt.compareSync(req.body.password, userFind.password)) res.status(401).json({ message: "Credenziali errate" });

    const token = jwt.sign({ id: userFind._id }, secretKey, { expiresIn: '1h' });
    res.json({ status: 200, message: 'Accesso eseguito', token });
  });
});

// Middleware per verificare se un utente è autenticato. 
// Tutte le funzioni dichiarate successivamente a questo middleware, necessitano l'autenticazione
app.use(authMiddleware);

/**
 * @api {post} /profile Profilo Utente
 * @apiName Profile
 * @apiGroup User
 * @method GET 
 * 
 * @apiSuccess {String} user (Dati del profilo utente)
 * @apiSuccessExample Success-Response
 * HTTP/1.1 200 OK
 * {
 *    user 
 * }
 * 
 * @apiError {String} Utente non trovato
 * @apiErrorExample Error-Response
 * HTTP/1.1 400
 * {
 *    message: 'Utente non trovato'
 * }
 * 
 * Non necessita di parametri perché recupera l'id dell'utente dal token usato per l'autenticazione.
 * Il token può essere passato come body, query o headers.
 * 
 * Restituisce il profilo dell'utente se esiste
 */
app.get('/profile', (req, res) => {

  UserModel.findOne({ _id: req.decoded.id }, (err, user) => {
    if (!user) res.status(400).json({message: "Utente non trovato" });
    res.status(200).json({ status: 200, user });
  });
});

/**
 * @api {post} /profile Elimina Profilo Utente
 * @apiName Profile
 * @apiGroup User
 * @method DELETE 
 * 
 * @apiSuccess {String} Esito
 * @apiSuccessExample Success-Response
 * HTTP/1.1 200 OK
 * {
 *    message: "Utente eliminato" 
 * }
 * 
 * @apiError {String} Errore nell'eliminazione
 * @apiErrorExample Error-Response
 * HTTP/1.1 400
 * {
 *    message: 'Errore nell'eliminazione'
 * }
 * 
 * Non necessita di parametri perché recupera l'id dell'utente dal token usato per l'autenticazione.
 * Il token può essere passato come body, query o headers.
 * 
 * Elimina il profilo dell'utente se esiste
 */
app.delete('/profile', async (req, res) => {
  try {
    const result = await UserModel.deleteOne({ _id: req.decoded.id });
    if (result.n > 0)
      return res.status(200).json({ message: "Utente eliminato" });
    else
      return res.status(400).json({ message: "Errore nell'eliminazione" });
  } catch (err) {
    return res.status(400).json({ message: `Errore: ${err}` });
  }
})

app.get('/charts/save/:chart', async (req, res) => {
  
  try {
    // Generazione nome casuale per il file 
    const id: string = uuidv4();

    const graph : string = req.params.chart;

    // Recupero il grafico dall'API di Google Chart
    let image = await Jimp.read(`https://chart.googleapis.com/chart?${graph}`);

    // Scrivo tempoaneamente l'immagine nella cartella locale
    await image.writeAsync('/tmp/' + id + '.png');

    const fileContent = fs.readFileSync('/tmp/' + id + '.png');

    // Definisco i parametri per l'upload su S3
    const params = {
      Bucket: 'charts-app', // Nome del bucket
      Key: req.decoded.id + '/'+ uuidv4() + '.png', // Non del file salvato su S3
      Body: fileContent, // Contenuto del file
      ACL:'public-read' // Regole di scritture del file
    };
    
    const s3 = new AWS.S3();
    // Upload del file nel bucket
    s3.upload(params, function (err, data) {
      if (err) { throw err; }
      // Elimino il file salvato nella cartella temporanea
      fs.unlinkSync('/tmp/' + id + '.png');
      return res.status(200).json(`Grafico salvato correttamente. ${data.Location}`);
    });
  } catch (err) { res.status(400).json(`Errore: ${err}`); }
});

/**
 * @api {post} /chart/list Elenco dei grafici
 * @apiName ChartList
 * @apiGroup Chart
 * @method GET 
 * 
 * @apiSuccess {String} Esito
 * @apiSuccessExample Success-Response
 * HTTP/1.1 200 OK
 * {
 *    message: {lista dei grafici (JSON)}
 * }
 * 
 * @apiError {String} Errore
 * @apiErrorExample Error-Response
 * HTTP/1.1 400
 * {
 *    message: 'Errore ' + tipo di errore
 * }
 * 
 * Non necessita di parametri perché recupera l'id dell'utente dal token usato per l'autenticazione.
 * Il token può essere passato come body, query o headers.
 * 
 * Elenco dei grafici salvati dall'utente
 */
app.get('chart/list', (req, res) =>{
  // Definisco i parametri per S3
  const params = {
    Bucket: 'charts-app', // Nome del bucket
    Prefix: req.decoded.id + '/', // Cartella da cui leggere i file
  };

  const s3 = new AWS.S3();
  // Recupero gli elementi dalla cartella
  s3.listObjectsV2(params, function(err, data) {
    if (err)
      res.status(400).json(`Errore: ${err}`);     
    else 
      return res.status(200).json(data.Contents);
  });
});

// Esporto l'handler utilizzato per rendere serverless l'app
module.exports.handler = serverless(app);