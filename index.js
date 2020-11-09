const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');

const PORT = process.env.PORT || 5000;

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const { addUser, getUser, removeUser, getUsersInChat } = require('./users');

io.on( 'connection', (socket) => {
    socket.on('signin', ( { nick }, callback ) => {
        const { error, user } = addUser({ id: socket.id, nick });
        console.log('New user', user.nick )

        if (error) {
            return callback(error);
        }

        // send custom message when user joins to the user
        socket.emit( 'sendMsgFromServer', { user: 'admin-pelz', msg: `${user.nick} welcome to the PelzChat :D` });

        // send custom message when new user joins to others
        socket.broadcast.emit( 'sendMsgFromServer', { user: 'admin-pelz', msg: `${user.nick} has joined the party B-)`} );

        // send all the users that has joined the chat to the frontend
        io.emit( 'usersData', { users: getUsersInChat() } );

        callback();
    });

    // receive message from frontend
    socket.on( 'sendMsgFromClient', ( message, callback ) => {
        const user = getUser(socket.id);

        // send message to all connected users
        io.emit( 'sendMsgFromServer', { user: user.nick, msg: message } );
        // send user data to front end
        io.emit( 'usersData', { users: getUsersInChat() } );

        console.log(`${user.nick} just sent a message`);
        callback();
    });

    socket.on( 'typing', ({ typing }) => {
        const user = getUser(socket.id);

        if (typing === true) {
            socket.broadcast.emit('sendTypingMsg',  `${user.nick} is typing` );
        } else {
            socket.broadcast.emit('sendTypingMsg', '' );
        }
    })

    socket.on( 'disconnect', () => {
        console.log('User just left :(');
        const user = removeUser(socket.id);

        if(user) {
            io.emit( 'sendMsgFromServer', { user: 'admin-pelz', msg: `${user.nick} just left :-(` } );
        }
    });

});

const router = require('./router');

app.use(router);
app.use(cors());

server.listen( PORT, () => console.log(`Server has started at port ${PORT}`) );