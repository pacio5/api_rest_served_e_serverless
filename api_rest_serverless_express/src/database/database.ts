import Mongoose from 'mongoose';
import {dbUser, dbPass} from '../config';

let database: Mongoose.Connection;

export const connect = () => {
  const uri =
    `mongodb://${dbUser}:${dbPass}@cluster0-shard-00-00-92omp.mongodb.net:27017,cluster0-shard-00-01-92omp.mongodb.net:27017,cluster0-shard-00-02-92omp.mongodb.net:27017/authenticate?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin`;

  if (database) {
    return;
  }

  Mongoose.connect(uri, {
    useNewUrlParser: true,
    useFindAndModify: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });

  database = Mongoose.connection;

  database.once('open', async () => {
    console.log('Connected to database');
  });

  database.on('error', () => {
    console.log('Error connecting to database');
  });

};

export const disconnect = () => {
  if (!database) {
    return;
  }

  Mongoose.disconnect();

  console.log('Disconnected')
};
