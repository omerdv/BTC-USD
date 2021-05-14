const axios = require('axios');
const Airtable = require('airtable');
const {getRate} = require('./exchange');
const { AirTableAPIKey , _ } = require('./config');

var base = new Airtable({apiKey: AirTableAPIKey}).base('appn4YQ68nISRcBqz');
var resultsBackup = []; // items backup list, used in the case of an AirTable downtime


/**
 * writeRecords tries to write a list of item objects to the BTC Table
 * @param {List} res a list of item to write
 * @return {Promise} which will be resolved\rejected in case of successful\unsuccessful HTTP call using the airtable client
 */
function writeRecords(res){
    return new Promise((resolve, reject) => {
        base('BTC Table').create(res, function(err, records) {
            if (err) {
                console.error(err);
                resultsBackup.push(...res);
                reject(false);
            }
            records.forEach(function (record) {
            console.log(`Written new record - record ID: ${record.getId()}`);
            resolve(true);
            });
        });
    })
    
}


/**
 * getCurrentRate gets the current BTC\USD rate and writes it + previous backup items to the BTC table if necessary
 */
async function getCurrentRate(){
    let res = await getRate();
    if(typeof res != "undefined"){
        let writeResult = await writeRecords([{ "fields" : res}]);
        while(writeResult && (resultsBackup.length > 0)){ // if the AirTable service is up and we have backup items to write
            let records = resultsBackup.slice(0,10); // write up to 10 backup items from backup list
            // console.log(resultsBackup.length);
            writeResult = await writeRecords(records);
            if(writeResult){
                resultsBackup.splice(0,10); // remove successfully written items
                // console.log(resultsBackup.length);
            }
        }
    }
}


/**
 * startStreamingRates is a wrapper function that simply makes sure getCurrentRate is called every minute
 */
function startStreamingRates(){
    getCurrentRate();
    setInterval(getCurrentRate, 60*1000); // get BTC to USD rate every minute
}


startStreamingRates();