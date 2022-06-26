// Testing CRUD API Routes

import axios from 'axios'
import {resetDb, insertTestUser} from 'utils/db-utils'
import {getData, handleRequestFailure, resolve} from 'utils/async'
import * as generate from 'utils/generate'
import * as booksDB from '../db/books'
import startServer from '../start'

let baseURL, server

beforeAll(async () => {
  server = await startServer()
  baseURL = `http://localhost:${server.address().port}/api`
})

afterAll(() => server.close())

beforeEach(() => {
  jest.clearAllMocks()
  resetDb()
})

async function setup() {
  // 💰 this bit isn't as important as the rest of what you'll be learning today
  // so I'm going to give it to you, but don't just skip over it. Try to figure
  // out what's going on here.
  const testUser = await insertTestUser()
  const authAPI = axios.create({baseURL})
  authAPI.defaults.headers.common.authorization = `Bearer ${testUser.token}`
  authAPI.interceptors.response.use(getData, handleRequestFailure)
  return {testUser, authAPI}
}

test('listItem CRUD', async () => {
  const {testUser, authAPI} = await setup()

  const book = generate.buildBook()
  await booksDB.insert(book)

  const createdData = await authAPI.post('/list-items', {bookId: book.id})

  expect(createdData.listItem).toMatchObject({
    ownerId: testUser.id,
    bookId: book.id,
  })

  // CREATE
  const listItemId = createdData.listItem.id
  const listItemIdUrl = `list-items/${listItemId}`

  // READ
  const readData = await authAPI.get(listItemIdUrl)
  expect(readData.listItem).toEqual(createdData.listItem)

  // UPDATE
  const updates = {notes: generate.notes()}
  const updateData = await authAPI.put(listItemIdUrl, updates)
  expect(updateData.listItem).toEqual({
    ...readData.listItem,
    ...updateData.listItem,
  })

  // DELETE
  const deleteData = await authAPI.delete(listItemIdUrl)
  expect(deleteData).toEqual({success: true})

  const error = await authAPI.get(listItemIdUrl).catch(resolve)
  error.data.message = error.data.message.replace(
    listItemId,
    'mocked_list_item_uuid',
  )
  expect(error.status).toBe(404)
  expect(error.data).toMatchInlineSnapshot(`
    Object {
      "message": "No list item was found with the id of mocked_list_item_uuid",
    }
  `)
})

/* eslint no-unused-vars:0 */
