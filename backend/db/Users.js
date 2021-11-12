// This file is used to replicate the database but is not used in the application
const users = [];

const addUser = (user) => {
    users.push(user);
}

const getUsers = () => {
    return users;
}

const getUserById = (id) => {
    return users.find(user => user.id === id);
}

const deleteUser = (id) => {
    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex !== -1) {
        users.splice(userIndex, 1);
    }
}

const updateUser = (id, user) => {
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex !== -1) {
        users[userIndex] = user;
    }
}

module.exports = { addUser, getUsers, deleteUser, updateUser, getUserById };