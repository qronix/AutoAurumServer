require('./config/config');
const express = require('express');
const bodyParser = require('body-parser');
const _= require('lodash');
const axios = require('axios');
const jsonTables = require('html-table-to-json');
const port = process.env.PORT;
const {Item} = require('./db/models/item');
const {mongoose} = require('./db/mongoose');
var app = express();
app.use(express.static(__dirname+'./../public'));
app.use(bodyParser.json());

app.get('/grabprices',async (req,res)=>{
    let response = await axios.get('http://alchmate.com/rs3Alch.php');
    let responseData = JSON.stringify(response.data);
    let natureRuneLineRegex = RegExp(/(placeholder=\\")(\d*)\\/);
    let natureRuneLine = natureRuneLineRegex.exec(responseData);
    let currentNatureRunePrice = natureRuneLine[2];
    let tableTagRegex = RegExp(/<table.*>/);
    let tableData = response.data.split(tableTagRegex);
    let tableStart = '<table>'+tableData[1];
    let table  = tableStart.split('</table>')[0]+'</table>';

    let jsonTable = new jsonTables(table);
    jsonTable.results[0].splice(0,1); //drop table header
    let cleanData = jsonTable.results[0].filter((val)=>parseInt(val["6"])>0);
    for(let item in cleanData[0]){
        delete cleanData[0][item]["8"]; //remove timestamp
        delete cleanData[0][item]["7"]; //remove member only flag
    }
    const keyMap = {
        "1":"itemName",
        "2":"cost",
        "3":"alchValue",
        "4":"alchProfit",
        "5":"lastUpdated",
        "6":"geLimit"
    };

    let itemData = cleanData;
    
    let testItem = new Item({"itemName":"ass","cost":4,"alchValue":5,"alchProfit":6,"lastUpdated":"ass","exchangeLimit":4});
    testItem.save();

    for(let item in itemData){
        let newItem = {};
        newItem['itemName']=itemData[item]["1"];
        newItem['cost']=parseInt(itemData[item]["2"]);
        newItem['alchValue']=parseInt(itemData[item]["3"]);
        newItem['alchProfit']=parseInt(itemData[item]["4"]);
        newItem['lastUpdated']=itemData[item]["5"];
        newItem['exchangeLimit']=parseInt(itemData[item]["6"]);
        
        try{
            let dbItem = new Item(_.pick(newItem,["itemName","cost","alchValue","alchProfit","lastUpdated","exchangeLimit"]));
            console.log(`Creating new item: ${JSON.stringify(dbItem)}`);
            dbItem.save()
            .then((doc)=>{
                console.log(`Got doc: ${doc}`)
            })
            .catch((err)=>{
                console.log(`Got err: ${err}`);
            });
        }catch(exc){
            console.log(exc);
        }
    }
});

//regex match current nature rune price
//(placeholder=\\")(\d*)\\"

app.listen(port,()=>{
    console.log(`Server started on port ${port}`);
});

module.exports = {app};