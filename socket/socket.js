const socketIO = require('socket.io')

function initializeSocket(server){
    const io = socketIO(server, {
        pingTimeout: 60000,
        cors:{
            origin: "https://globalarchi.netlify.app"
        }
    });

    io.on('connection',(socket)=>{
        socket.on('setup',(id)=>{
            socket.join(id)
            socket.emit('connected')
            console.log('A user connected');;
        });

        socket.on('join',(room)=>{
            socket.join(room);
        })

        socket.on('chatMessage',(message)=>{
            console.log(message,"message");
            socket.in(message.to).emit("message recieved",message)
        });

        socket.on('disconnect',()=>{
            console.log('A user disconnected');
        })
    })
}

module.exports = initializeSocket