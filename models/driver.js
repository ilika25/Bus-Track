const mongoose= require('mongoose');
const driverSchema= new mongoose.Schema({
    drivername:{
        type: String,
        required: true
    },
    phone:{
        type: Number,
        required: true,
        unique: true
    },
    busNumber:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    }
})
module.exports= mongoose.model('Driver',driverSchema);