import fastify from 'fastify'
import { knex } from './database'

const app = fastify()

app.get('/', async () => {
  const transaction = await knex('transactions').select('*')

  return transaction;
})

app.listen({ port: 3333 }).then(() => {
  console.log('Server started at http://localhost:3333')
})
