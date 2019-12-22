module.exports = {
    dbConfig: {
        connectionLimit: 200,
        host: '',
        user: '',
        password: '',
        database: '',
        waitForConnections: true,
        charset: 'utf8mb4'
    },
    mgConfig: {
        mg_api_key: '',
        mg_domain: ''
    },
    rdConfig: {
        name: '',
        pass: ''
    },
    gcConfig: {
        apiKey: '',
        baseUrl: 'https://www.googleapis.com/civicinfo/v2/representatives'
    }, 
    exConfig: {
        secret: ''
    }
}
