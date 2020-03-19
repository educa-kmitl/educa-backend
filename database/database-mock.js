


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
            return { error: "This email already exists" }
        } else {
            this.users.push({ id: this.user_id++, ...userData, stat: 0 })
            console.log(name);
            return { success: "Successully registered" }
        }
    }

}

export default Database
