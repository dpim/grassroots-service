const gcConfig = require('./../config').gcConfig;
const request = require('request');
const redis = require("redis");

module.exports = {
    fetchCachedInfo: (redisClient) => (trimmedAddress, cb, args, res) => {
        redisClient.get(trimmedAddress,
            (err, reply) => {
            if (reply == null) {
                var options = {
                    url: gcConfig.baseUrl 
                        + '?key=' + gcConfig.apiKey 
                        + '&includeOffices=false' 
                        + '&address=' + trimmedAddress,
                    headers: {
                        'User-Agent': 'request',
                    }
                };
                request(options, (error, res, body) => {
                    if (error) {
                        res.status(500).send("Internal error");
                        return;
                    }
                    let cachedResponse = parseInput(body);
                    redisClient.set(trimmedAddress, body, 'EX', 60 * 60 * 24 * 30, redis.print);
                    args['location'] = cachedResponse;
                    cb(args, res)
                });
            } else {
                let cachedResponse = parseInput(reply);
                args['location'] = cachedResponse;
                cb(args, res)
            }
        });
    }
}

function parseInput(gcResponse) {
    if (gcResponse) {
        var stateKey;
        var districtKey;
        if (gcResponse != null && gcResponse.divisions != null) {
            const keys = Object.keys(gcResponse.divisions);
            for (key of keys) {
                //determining which key is state and district 
                const testStr = "/state:"
                const index = key.indexOf("/state:")
                const diff = key.length - index - testStr.length
                if (key.includes("/state:") && diff <= 3) {
                    stateKey = key
                } else if (key.includes("/cd:")) {
                    districtKey = key
                }
            }
            return {
                'district': (gcResponse.divisions[districtKey]) ? gcResponse.divisions[districtKey].name : null,
                'state': (gcResponse.divisions[stateKey]) ? gcResponse.divisions[stateKey].name : null
            }
        } else {
            return {
                'district': null,
                'state': null
            }
        }
    } else {
        return {
            'district': null,
            'state': null
        }
    }
}