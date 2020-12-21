const express = require('express')
const fs = require('fs').promises
const axios = require('axios')
const cors = require('cors')

const server = express()
const PORT = process.env.PORT || 8000

const rFile = () => {
  return fs.readFile(`${__dirname}/contacts.json`, 'utf8')
    .then((data) => JSON.parse(data))
    .catch(() => axios('https://jsonplaceholder.typicode.com/users').then(({data}) =>{
      wFile(data)
      return data
    }))
}

function wFile(data){
  return fs.writeFile(`${__dirname}/contacts.json`, JSON.stringify(data,1,2))
}

server.use(express.json())
server.use(cors())

server.get('/api/v1/contacts', async (req, res) => {
  const contacts = await rFile()
  res.json(contacts)
})

server.get('/api/v1/contacts/:id', async (req, res) => {
  const contacts = await rFile()
  const user = contacts.find((el) => el.id === Number(req.params.id))
  res.json(user)
})

server.post('/api/v1/contacts', async (req, res) => {
  const contacts = await rFile()
  const newUser = {
    ...req.body,
    id: contacts.length === 0 ? 1 : contacts[contacts.length - 1].id + 1
  }
  const togetherNew = [...contacts, newUser]
  wFile(togetherNew)
  res.json(newUser)
})

server.patch('/api/v1/contacts/:id', async (req, res) => {
  const contacts = await rFile()
  const updated = contacts.map((el) => el.id === +req.params.id ? {...el, ...req.body} : el)
  wFile(updated)
  res.json({status: 'Updated Successfully'})
})

server.delete('/api/v1/contacts/:id', async (req, res) => {
  const contacts = await rFile()
  const updated = contacts.filter((el) => el.id !== +req.params.id)
  wFile(updated)
  res.json({status: `User ${req.params.id} deleted`})
})

server.delete('/api/v1/contacts', (req, res) => {
  wFile([])
  res.json({status: `All deleted`})
})

server.listen(PORT, () => {
  console.log('Server is running')
})