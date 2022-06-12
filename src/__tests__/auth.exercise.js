// Testing Authentication API Routes

import axios from 'axios'
import {resetDb} from 'utils/db-utils'
import * as generate from 'utils/generate'
import startServer from '../start'

// 🐨 you'll need to start/stop the server using beforeAll and afterAll

let server
beforeAll(async () => {
  server = await startServer({port: 8000})
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
  const {data: registerData} = await axios.post(
    'http://localhost:8000/api/auth/register',
    loginCredentials,
  )
  expect(registerData.user.username).toEqual(username)
  expect(registerData.user.token).toEqual(expect.any(String))

  // login
  const {data: loginData} = await axios.post(
    'http://localhost:8000/api/auth/login',
    loginCredentials,
  )
  expect(loginData.user.username).toEqual(registerData.user.username)
  expect(loginData.user.token).toEqual(registerData.user.token)
  expect(loginData.user.id).toEqual(registerData.user.id)

  // authenticated request
  const token = loginData.user.token
  const {data: meData} = await axios.get('http://localhost:8000/api/auth/me', {
    headers: {Authorization: `Bearer ${token}`},
  })
  expect(meData.user.username).toEqual(loginData.user.username)
  expect(meData.user.token).toEqual(loginData.user.token)
  expect(meData.user.id).toEqual(loginData.user.id)
})
