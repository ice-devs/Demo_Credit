import cors from 'cors';
import express from 'express';

import {IndexRouter} from './controllers/v0/index.router';

import bodyParser from 'body-parser';
import {config} from './config/config';

import * as MODELS from './controllers/v0/index.model';


(async () => {
  console.debug("Initialize database connection...");
  
  console.log(await MODELS.createTables())
  
  const app = express();
  const port = process.env.PORT || 8081;

  app.use(bodyParser.json());

  // We set the CORS origin to * 
  app.use(cors({
    allowedHeaders: [
      'Origin', 'X-Requested-With',
      'Content-Type', 'Accept',
      'X-Access-Token', 'Authorization',
    ],
    methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
    preflightContinue: true,
    origin: '*',
  }));

  app.use('/api/v0/', IndexRouter);

  // Root URI call
  app.get( '/', async ( req, res ) => {
    res.send( '/api/v0/' );
  } );


  // Start the Server
  app.listen( port, () => {
    console.log( `server running ${config.dev.url}:${port}` );
    console.log( `press CTRL+C to stop server` );
  } );
})();
