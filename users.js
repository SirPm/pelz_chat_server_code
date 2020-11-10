const users = [];

const addUser = ({ id, nick }) => {
    // Remove whitespaces and convert to lowercase
    nick = nick.trim().toLowerCase();

    // look for users with the same name in the same room and put in the variable
    const existingUser = users.find( user => user.nick === nick );

    // if something exists in the existingUsers variable return that string
    if (existingUser) {
        return { error: `The nick ${nick} has been taken!` };
    }

    // create a user object to push to the users array, using ES6 syntax since the key and value are the same
    const user = { id, nick };

    users.push(user);
    return { user };
}

const removeUser = (id) => {
    const index = users.findIndex( user => user.id === id );
    if ( index !== -1 ) {
        return users.splice( index, 1 )[0];
    }
}

const getUser = (id) => users.find( user => user.id === id );

const getUsersInChat = () => users;

module.exports = { addUser, removeUser, getUser, getUsersInChat };