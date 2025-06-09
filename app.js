const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const requestIp = require('request-ip');

const setupSwagger = require('./documentation');

require('dotenv').config();

const routes = require('./routes');
const addressRoutes = require('./routes/address');
const cityRoutes = require('./routes/data_city');
const NegativeKeywordBySiRoutes = require('./routes/negative_keyword_by_si');
const assetsRoutes = require('./routes/asset');
const employeeRoutes = require('./routes/employee');
const userRoute = require('./routes/user');
const calendarEventRoutes = require('./routes/calendar_event');
const companyRoutes = require('./routes/company');
const dataCompanyRoutes = require('./routes/data_company');
const keywordRequestRoutes = require('./routes/keyword_request');
const aiRoutes = require('./routes/ai');
const documentRoutes = require('./routes/document');
const moment = require("moment");
const { Server } = require("socket.io");
const cors = require('cors');
const http = require("http");
const users = [];

app.use(requestIp.mw());

app.use((req, res, next) => {
    if (req.method !== 'OPTIONS')
        console.log(`[${moment().format('MM/DD/YYYY HH:mm:ss')}] from Ip ${req.clientIp} to ${req.method} ${req.url}`);
    next();
});

app.use(bodyParser.json());

const corsOptions = {
    origin: true,
    methods: "GET, PUT, POST, OPTIONS, DELETE",
    allowedHeaders: ['Content-Type', 'X-Access-Token', 'X-Requested-With'],
    credentials: true,
    maxAge: 3600
};

app.use(cors(corsOptions));

// app.all('/api/v1/*', [require('./middlewares/ValidateRequest')]);

const routeMappings = [
    { path: '/api/login', handler: routes },
    // { path: '/api', handler: routes },
    { path: '/api/v1/address', handler: addressRoutes },
    { path: '/api/v1/data_city', handler: cityRoutes },
    { path: '/api/v1/negative_keyword_by_si', handler: NegativeKeywordBySiRoutes },
    { path: '/api/v1/asset', handler: assetsRoutes },
    { path: '/api/v1/employee', handler: employeeRoutes },
    { path: '/api/v1/user', handler: userRoute },
    { path: '/api/v1/calendar_event', handler: calendarEventRoutes },
    { path: '/api/v1/company', handler: companyRoutes },
    { path: '/api/v1/data_company', handler: dataCompanyRoutes },
    { path: '/api/keyword_request', handler: keywordRequestRoutes },
    { path: '/api/document', handler: documentRoutes },
    { path: '/api/ai', handler: aiRoutes }
];

routeMappings.forEach(({ path, handler }) => {
    if (!handler || (typeof handler !== 'function' && typeof handler !== 'object')) {
        console.error(`❌ Handler inválido para la ruta "${path}"`);
        console.error('Tipo:', typeof handler);
        console.error('Valor:', handler);
    } else {
        app.use(path, handler);
    }
});


setupSwagger(app);

function setupSocketIO(server) {
    let io = new Server(server, { cors: { origin: '*' } }),
        IO = require('./classes/IO'),
        ioHandler = new IO(io);

    io.use((socket, next) => {
        const {sessionId} = socket.handshake.auth;
        if(sessionId) {
            const session = ioHandler.findSession(sessionId)
            if(session) {
                socket.sessionId = sessionId;
                return next();
            }
        }

        socket.sessionId = socket.id;
        next();
    });

    io.on('connection', socket => {
        ioHandler.saveSession(socket.id)
        ioHandler.emitToUser(socket.id, 'session', {
            sessionId: socket.id
        });

        users.push(socket.id);
        console.log('users connected ' + users.length);

        socket.on('disconnect', () => {
            users.splice(users.indexOf(socket.id), 1);
            console.log('users connected ' + users.length);
        });
    });

    app.set('io', io);
    return ioHandler;
}

const httpServer = http.createServer(app);
ioHandler = setupSocketIO(httpServer);

httpServer.listen(process.env.SERVER_PORT, () => {
    console.log(`HTTP Server running on http://localhost:${process.env.SERVER_PORT}/`);
});

const {manageKeywordRequest} = require('./classes/KeywordRequest');
const {generateExcel} = require('./classes/AI');
const {sendEmail} = require("./classes/Email");
    // manageKeywordRequest().then();

    // generateExcel().then();

module.exports = app;


// sendEmail({
//     email_template: 'welcome',
//     data: {
//         fullName: 'lioan hernandez'
//     },
//     to: 'lioanhernandez@yahoo.com',
//     subject: 'Test'
// }).then();