const Client = require('../model/clientModel');

const sendMail = require('./emailHandler')

const multer = require('multer');
const uuid = require('uuid');

const imageId = uuid.v4();

const multerStorage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'public/img/clients');
    },
    filename: (req, file, callback) => {
        const ext = file.mimetype.split('/')[1];
        callback(null, `client-${imageId}-${Date.now()}.${ext}`);
    },
});

const multerFilter = (req, file, callback) => {
    if(file.mimetype.startsWith('image')){
        callback(null, true);
    }else{
        callback(new Error('File type is not supported'), false);
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
});

exports.uploadClientPhoto = upload.single('test');

exports.update = async (req, res) => {
    try{
        if(req.file) { 
            const fileName = req.file.filename;
            req.body.image = fileName;
        }
        const client = await Client.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
         });
        res.status(200).json({
            status: 'success',
            data: {
                client,
            },
        });
    }catch(err){
        res.status(404).json({
            status: 'fail',
            message: err.message,
        });
    }
};


exports.getAllClients = async (req, res) => {
    const queryObj = {...req.query};
    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(/\b(gte|gt|lte|lt|regex|options)\b/g, (match) => `$${match}`);
    const query = JSON.parse(queryString);
    console.log(query)
    let clients = await Client.find(query);

    try{
        res.status(200).json({
            status: "success",
            data: {
                clients: clients,
            },
        });
    }catch(err){
        res.status(500).json({
            status: 'fail',
            message: err.message,
        });
    }
}

exports.getClient = async (req, res) => {
    try{
        const clientId = req.params.id;
        const client = await Client.findById(clientId);
        res.status(200).json({
            status: "success",
            data: {
                client: client,
            },
        });
    }catch(err){
        res.status(500).json({
            status: 'fail',
            message: err.message,
        });
    };
};

exports.createClient = async (req, res) => {
    try{
        const newClient = await Client.create(req.body);
        res.status(200).json({
            status: "success",
            data: {
                client: newClient,
            },
        });
    }catch(err){
        res.status(500).json({
            status: 'fail',
            message: err.message,
        });
    };
};
exports.createByUser = async (req, res) => {
    try{
        const newClient = await Client.create({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            registration_date: req.body.registration_date,
            author: req.auth.id,
        });
        await sendMail({
            email: req.auth.email,
            subject: "Register Succesfull",
            messages: `Thank you ${newClient.name} for creating an account`,
          });
          await sendMail({
            email: newClient.email,
            subject: `You have been registered by ${req.auth.name}`,
            messages: `Thank you for being a part of this team`, 
          })

        res.status(200).json(newClient);
    }catch(err){
        res.status(500).json({
            status: 'fail',
            message: err.message,
        });
    }
}

exports.deleteClient = async (req, res) => {
    try{
        const clientId = req.params.id;
        const deletedClient = await Client.findByIdAndDelete(clientId);
        res.status(200).json({
            status: 'success',
            data: {
                deletedClient,
            },
        });
    }catch(err){
        res.status(500).json({
            status: 'fail',
            message: err.message,
        });
    };
};

exports.updateClient = async (req, res) => {
    try{
        const clientId = req.params.id;
        const client = await Client.findByIdAndUpdate(clientId, req.body, {
            new: true,
            runValidators: true,
        });
        res.status(200).json({
            status: "success",
            data: {
                updatedClient: client,
            },
        });
    }catch(err){
        res.status(500).json({
            status: 'fail',
            message: err.message,
        });
    }
}