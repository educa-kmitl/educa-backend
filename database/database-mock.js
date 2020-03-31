


class Database {
    constructor() {
        this.rooms = [
            {
                "id": 0,
                "teacher_id": 0,
                "name": "Trigonometric",
                "password": "",
                "subject": "Math",
                "video_source": [{
                    "topic": "Trigonometric with Hand",
                    "link": "https://www.youtube.com/embed/tA1TqPGCPNk",
                }],
                "private": false
            },
            {
                "id": 1,
                "teacher_id": 0,
                "name": "English songs",
                "password": "",
                "subject": "English",
                "video_source": [{
                    "topic": "บทที่1 จุ๋ยส์ จุ๋ยส์",
                    "link": "https://www.youtube.com/embed/LmfoStWxQbg",
                }, {
                    "topic": "Love Yellow - TangBadVoice",
                    "link": "https://www.youtube.com/embed/rjlqpMdkJpM",
                }], 
                "private": false
            },
            {
                "id": 2,
                "teacher_id": 0,
                "name": "Educa Secret",
                "password": "secret",
                "subject": "English",
                "video_source": [{
                    "topic": "Short meme",
                    "link": "https://www.youtube.com/embed/iH_yb94ZACA",
                }, {
                    "topic": "DOTA Meme",
                    "link": "https://www.youtube.com/embed/jHWc4qKkmoc",
                }],
                "private": true
            },
            {
                "id": 3,
                "teacher_id": 0,
                "name": "UI/UX Design",
                "password": "",
                "subject": "Computer",
                "video_source": [{
                    "topic": "Trends 2020",
                    "link": "https://www.youtube.com/embed/6DdUkxajANs",
                }, {
                    "topic": "What is the UX design process?",
                    "link": "https://www.youtube.com/embed/Um3BhY0oS2c",
                }, {
                    "topic": "UX vs UI Design",
                    "link": "https://www.youtube.com/embed/hQ1rpJKyj68",
                }, {
                    "topic": "Common Design Patterns",
                    "link": "https://www.youtube.com/embed/aB6us_txi54",
                }, {
                    "topic": "Negetive space",
                    "link": "https://www.youtube.com/embed/A0Ev_4zto4Y",
                }],
                "private": false
            },
            {
                "id": 4,
                "teacher_id": 0,
                "name": "The World",
                "password": "",
                "subject": "Science",
                "video_source": [{
                    "topic": "Deep sea",
                    "link": "https://www.youtube.com/embed/PaErPyEnDvk",
                }], 
                "private": false
            },
        ]

        this.users = [
            {
                "id": 0,
                "email": "educa@edu.bot",
                "name": "Educa",
                "password": "educabot",
                "profile_icon": 0,
                "role": 1
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

        const user = this.users.find(u => u.email == userData.email)

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

    getRoomByTeacherID(teacher_id) {
        return this.rooms.filter(room => room.teacher_id == teacher_id)
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