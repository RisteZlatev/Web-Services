const mongoose = require('mongoose');
const validator = require('validator');

const clientSchema = new mongoose.Schema({
    name : {
        type: String,
        required: [true, "The Client has to have a name"],
        trim: true,
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: [true, "Email address is required"],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    },
    phone: {
        type: String,
        unique: [true, "Phone number is already in use"],
        trim: true,
        //validator?
    },
    address: {
        type: String,
        trim: true,
    },
    company: {
        type: String,
        trim: true,
    },
    registration_date: {
        type: Date,
        max: new Date("2020-01-01"),
        required: [true, "Client has to be registered"],
    },
    image: {
        type: String,
        default: 'default.jpg',
    },
});

const Client = mongoose.model('Client', clientSchema);

module.exports = Client;