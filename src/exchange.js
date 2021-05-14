const axios = require('axios');
const { _ , CoinAPIKey } = require('./config');
const url = 'https://rest.coinapi.io/v1/exchangerate/BTC/USD';

/**
 * getRate performs a GET request for the BTC/USD CoinAPI endpoint.
 * 
 * @return {Object} in case of a succesful get request, else returns undefined
 */
async function getRate(){
    try{
        let response = await axios.get(url, {headers: {'X-CoinAPI-Key': CoinAPIKey}});
        let res = {"Time" : response.data.time, "Rates" : response.data.rate};
        return res;
    }
    catch(err){
        console.log(err);
    }
            
}

module.exports = {getRate};

