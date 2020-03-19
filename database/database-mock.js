


class Database {
    constructor() {
        this.rooms = [
            {
                "id": 0,
                "host_id": 0,
                "name": "HelloMath",
                "subject": "Math",
                "video_source": "https://www.youtube.com/watch?v=idSsF4ElmWo",
                "available": true,
                "url": "math0"
            }
        ]
        this.users = [
            {
                "id": 0,
                "email": "yahoo",
                "name": "jack",
                "password": "1234",
                "stat": 0
            },
            {
                "id": 1,
                "email": "gmail",
                "name": "Kane",
                "password": "abcd",
                "stat": 0
            },
            {
                "id": 2,
                "email": "hotmail",
                "name": "Rose",
                "password": "1234",
                "stat": 0
            }
        ]

        this.user_id = this.users.length - 1
        this.room_id = this.rooms.length - 1
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

    findUser(email) {
        const user = this.users.find(u => u.email == email)
        return user
    }


    addRoom(roomData) {
        const room = { ...roomData, id: this.room_id++ }
        this.rooms.push(room)
        return room
    }

    roomLists() {
        return this.rooms
    }

}

module.exports = Database
