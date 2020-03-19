


class Database {
    constructor() {
        this.rooms = []
        this.users = []
        this.user_id = 0
    }


    roomList() {
        return this.rooms
    }


    usersList() {
        return this.users
    }

    addUser(userData) {

        const { email, password, name } = userData

        const user = this.users.find(u => u.email == email)

        if (user) {
            return { error: "Email already exists" }
        } else {
            this.users.push({ id: this.user_id++, ...userData, stat: 0 })
            return { success: "Successully registered" }
        }
    }

    findUser(email){
        const user = this.users.find(u => u.email == email)
        return user
    }

}

module.exports = Database
