const express = require('express');
const database = require('./database/database')
const controller = require('./controller/clientController');
const auth = require('./controller/authHandler');
const jwt = require('express-jwt');
const cookieParser = require('cookie-parser');

const app = express();
app.use(express.urlencoded({extended:true}));
app.use(express.json());

database.connectToDataBase();

app.post('/api/v1/signup', auth.signup);
app.post('/api/v1/login', auth.login);

app.use(
    jwt
      .expressjwt({
        algorithms: ['HS256'],
        secret: process.env.JWT_SECRET,
        getToken: (req) => {
          if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            return req.headers.authorization.split(' ')[1];
          }
          if (req.cookies.jwt) {
            return req.cookies.jwt;
          }
          return null;
        },
      })
      .unless({
        path: ['/api/v1/signup', '/api/v1/login', '/movies/:id', '/login'],
      })
  );

app.post('/forgotPassword', auth.forgotPassword);
app.patch('/resetPassword/:token')

app.get('/clients', controller.getAllClients);
app.get('/clients/:id', controller.getClient);

app.post('/clients', controller.createClient);
app.post('/myClients', controller.createByUser);

app.delete('/clients/:id', controller.deleteClient);
app.patch('/clients/:id', controller.uploadClientPhoto, controller.update);


app.listen(process.env.PORT, (err)=>{
    if(err) return err.message;
    console.log("Succesfully started server");
});
