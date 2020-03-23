


class Database {
    constructor() {
        this.rooms = [
            {
                "id": 0,
                "host_id": 0,
                "name": "HelloMath",
                "password": "1234",
                "subject": "Math",
                "video_source": [{
                    "topic": "math1",
                    "link": "https://www.youtube.com/watch?v=idSsF4ElmWo"
                }, {
                    "topic": "math2",
                    "link": "https://www.youtube.com/watch?v=idSsF4ElmWo"
                }],
                "private": true,
                "url": "math0",
                "users_online": [{
                    "socket_id": "0",
                    "name": "guest"
                }]
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
                "email": "gmail@gmail",
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

        this.followers = [{
            "id": 0,
            "user_id": 1,
            "follower_id": 2
        }]

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
            const newUser = { id: this.user_id++, ...userData, stat: 0 }
            this.users.push(newUser)
            return { user: newUser }
        }
    }

    findUser(user_id) {
        const user = this.users.find(u => u.id == user_id)
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

    findRoom(room_id) {
        const room = this.rooms.find(r => r.id == room_id)
        return room
    }

    roomLists() {
        return this.rooms
    }

    updateFollower({ user_id, follower_id }) {
        this.followers.push({ id: this.follower_id++, user_id, follower_id })
    }

    getFollowersTable() {
        return this.followers
    }

    getFollowers(user_id) {
        const user_followers = this.followers.filter(row => row.user_id == user_id).map(row => ({ id: row.follower_id }))
        return user_followers
    }

    getFollowings(user_id) {
        const user_followings = this.followers.filter(row => row.follower_id == user_id).map(row => ({ id: row.user_id }))
        return user_followings
    }

}

module.exports = Database
