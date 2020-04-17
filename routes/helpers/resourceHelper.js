const db = require("../../db")

const insertResource = async (resource, room_id) => {
    const {topic, video_url, file_url} = resource
    const query = {
      name: 'insert-resource',
      text: 'INSERT INTO resources (topic, video_url, file_url, room_id) VALUES ($1, $2, $3, $4)',
      values: [topic, video_url, file_url || null, room_id],
    }
    await db.query(query)
}


module.exports = {
    insertResource
}