// Testing Authentication API Routes

import axios from 'axios'
import {resetDb} from 'utils/db-utils'
import {getData, handleRequestFailure} from 'utils/async'
import * as generate from 'utils/generate'
import startServer from '../start'

let server, client
beforeAll(async () => {
  server = await startServer()
  client = axios.create({
    baseURL: `http://localhost:${server.address().port}/api`,
  })
  client.interceptors.response.use(getData, handleRequestFailure)
})

afterAll(() => {
  server.close()
})

beforeEach(async () => {
  await resetDb()
})

test('auth flow', async () => {
  const username = 'fake_user_name'
  const loginCredentials = generate.loginForm({username})
  // register
  const registerData = await client.post('/auth/register', loginCredentials)
  expect(registerData.user.username).toEqual(username)
  expect(registerData.user.token).toEqual(expect.any(String))

  // login
  const loginData = await client.post('/auth/login', loginCredentials)
  expect(loginData.user.username).toEqual(registerData.user.username)
  expect(loginData.user.token).toEqual(registerData.user.token)
  expect(loginData.user.id).toEqual(registerData.user.id)

  // authenticated request
  const token = loginData.user.token
  const meData = await client.get('/auth/me', {
    headers: {Authorization: `Bearer ${token}`},
  })
  expect(meData.user.username).toEqual(loginData.user.username)
  expect(meData.user.token).toEqual(loginData.user.token)
  expect(meData.user.id).toEqual(loginData.user.id)
})
