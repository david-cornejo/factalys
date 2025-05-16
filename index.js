const express = require('express');
const cors = require('cors');
const fs = require('fs');
const https = require('https');
const routerApi = require('./routes');
const bodyParser = require('body-parser');
const sequelize = require('./config/config');
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();
const port = process.env.PORT || 3001;

//Descomentar para usar http y entorno local, comentar el bloque de código de https

//inicio seccion http

app.use(express.json());
app.use(
  cors({
    origin: process.env.ORIGIN,
    credentials: true,
  })
);

require('./utils/auth');

app.listen(port || 3000, '0.0.0.0', () => {
  console.log('Escuchando al puerto ' + port);
});

routerApi(app);

app.use(errorHandler);

//fin seccion http

//Sección de código para https y entorno de producción, comentar el bloque de código de http

//inicio de sección https
/*
const corsOptions = {
  origin: process.env.ORIGIN,
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));


app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));

const httpsOptions = {
  key: fs.readFileSync('./certs/privkey.pem'),
  cert: fs.readFileSync('./certs/fullchain.pem')
};
app.use(express.json());


require('./utils/auth');
routerApi(app);
app.use(logErrors);
app.use(errorHandler);

https.createServer(httpsOptions, app).listen(port, '0.0.0.0', (err) =>{
  if(err){
    console.error('Error al iniciar el servidor https: ', err);
  }else{
    console.log(`Servidor HTTPS corriendo en el puerto ${port}`);
  }
} );
*/
//fin de sección https
