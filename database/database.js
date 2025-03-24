const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({path: `${__dirname}/../config.env`});


const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
console.log(DB);

exports.connectToDataBase = async()=>{
    try{
        await mongoose.connect('mongodb+srv://ristezlatev6:AKsknZscFaEl4gXD@cluster0.hppyg.mongodb.net/clients?retryWrites=true&w=majority&appName=Cluster0')
        console.log("Succesfully connected to database");
    }catch(err){
        console.log(err.message);
    };

};