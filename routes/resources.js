const Router = require('express-promise-router')
const db = require('../db')
const { insertResource } = require('./helpers/resourceHelper')

const router = new Router()

router.get('/resources', async (req, res) => {
  const { room_id } = req.headers
  if (!room_id) return res.status(400).json({ error: 'Please provide room_id' })

  const { rows: resources } = await db.query('SELECT resource_id, topic, video_url, file_url FROM resources WHERE room_id=$1', [room_id])
  res.json({ resources })
})

router.post('/resources', async (req, res) => {
  const { resources, room_id } = req.body
  if (!resources) return res.status(400).json({ error: 'Please provide resources data' })
  if (!room_id) return res.status(400).json({ error: 'Please provide room_id' })

  for (let resource of resources) {
    insertResource(resource, room_id)
  }

  res.json({ success: 'All resources has been inserted' })
})

router.patch('/resources', async (req, res) => {
  const { resources } = req.body
  if (!resources) return res.status(400).json({ error: 'Please provide resources data' })
  for (let resource of resources) {
    const { resource_id, topic, video_url, file_url } = resource
    const { rows: resourcesData } = await db.query('SELECT topic, video_url, file_url FROM resources WHERE resource_id=$1', [resource_id])
    if (resourcesData.length == 0) return res.status(404).json({ error: 'Resource not found' })

    const { topic: default_topic, video_url: default_video_url, file_url: default_file_url } = resourcesData[0]
    const query = {
      name: 'update resource',
      text: 'UPDATE resources SET topic=$1, video_url=$2, file_url=$3 WHERE resource_id=$4',
      values: [topic || default_topic, video_url || default_video_url, file_url || default_file_url, resource_id],
    }

    await db.query(query)
  }

  res.json({ success: 'All resources are updated' })
})


router.delete('/resources', async (req, res)=>{
  const {resources} = req.body
  if(!resources) return res.status(400).json({error:'Please provide resource_id'})

  for (let resource of resources){
    await db.query('DELETE FROM resources WHERE resource_id=$1', [resource.resource_id])
  }
   
  res.json({success: 'Successfully deleted'})

})

module.exports = router
