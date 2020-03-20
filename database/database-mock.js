


class Database {
    constructor() {
        this.rooms = [
            {
                "id": 0,
                "host_id": 0,
                "name": "HelloMath",
                "subject": "Math",
                "video_source": [{
                    "topic": "math1",
                    "link": "https://www.youtube.com/watch?v=idSsF4ElmWo"
                },{
                    "topic": "math2",
                    "link": "https://www.youtube.com/watch?v=idSsF4ElmWo"
                }],
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

        this.followers = []

        this.user_id = this.users.length
        this.room_id = this.rooms.length
        this.follower_id = this.followers.length
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

    findUser(id) {
        const user = this.users.find(u => u.id == id)
        return user
    }

    findUserEmail(email) {
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

    updateFollower({ user_id, follower_id }) {
        this.followers.push({ id: this.follower_id++, user_id, follower_id })
    }

    getFollowers() {
        return this.followers
    }

}

module.exports = Database
