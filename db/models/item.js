const mongoose = require('mongoose');

let ItemSchema = new mongoose.Schema({
    itemName:{
        required:true,
        type: String,
        trim: true,
        unique:true
    },
    cost:{
        required:true,
        type:Number
    },
    alchValue:{
        required:true,
        type:Number,
    },
    alchProfit:{
        required:true,
        type:Number
    },
    lastUpdated:{
        required:true,
        type:String
    },
    exchangeLimit:{
        required:true,
        type:Number
    }
});

var Item = mongoose.model('Item',ItemSchema);

module.exports={Item};