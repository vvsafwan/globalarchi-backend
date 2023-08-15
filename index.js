const dotenv = require('dotenv');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();
const http = require('http').createServer(app);
const userroute = require('./routes/userroute');
const proroute = require('./routes/proroute');
const adminroute = require('./routes/adminroute');
const bodyparser = require('body-parser');
const initializeSocket = require('./socket/socket');

dotenv.config();

app.use(cors({
    credentials:true,
    origin:['https://globalarchi.netlify.app']
}));

app.use(cookieParser());
app.use(bodyparser.json({ limit: '10mb' }));
app.use(bodyparser.urlencoded({ limit: '10mb', extended: true }))
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use((req, res, next) => {
    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    next();
});

app.use('/',userroute);
app.use('/pro',proroute);
app.use('/admin',adminroute);

app.use('/file', express.static('File'));

mongoose.connect(process.env.MONGO,{
    useNewUrlParser: true
}).then(()=>{
    console.log('Database connected successfully');
})

const server = http.listen(process.env.PORT,()=>{
    console.log("Server started listening to port");
});

initializeSocket(server)