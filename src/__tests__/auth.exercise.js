// Testing Authentication API Routes

import axios from 'axios'
import {resetDb} from 'utils/db-utils'
import {getData, handleRequestFailure} from 'utils/async'
import * as generate from 'utils/generate'
import * as usersDB from '../db/users'
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
  const userCredentials = generate.loginForm()
  // register
  const registerData = await client.post('/auth/register', userCredentials)
  expect(registerData.user).toEqual({
    token: expect.any(String),
    id: expect.any(String),
    username: userCredentials.username,
  })
  expect(registerData.user.token).toEqual(expect.any(String))

  // login
  const loginData = await client.post('/auth/login', userCredentials)
  expect(loginData.user).toEqual(registerData.user)

  // authenticated request
  const token = loginData.user.token
  const meData = await client.get('/auth/me', {
    headers: {Authorization: `Bearer ${token}`},
  })
  expect(meData.user).toEqual(loginData.user)
})

describe('#/auth/register', () => {
  test('auth fails when registering existing username', async () => {
    const user = generate.buildUser()
    const userCredentials = generate.loginForm({
      username: user.username,
    })
    usersDB.insert(user)

    await expect(
      client.post('/auth/register', userCredentials),
    ).rejects.toMatchInlineSnapshot(
      `[Error: 400: {"message":"username taken"}]`,
    )
  })

  test('fails with error 400 when a unsername is not passed', async () => {
    const userCredentials = generate.loginForm({username: null})
    await expect(
      client.post('/auth/register', userCredentials),
    ).rejects.toMatchInlineSnapshot(
      `[Error: 400: {"message":"username can't be blank"}]`,
    )
  })

  test('fails with error 400 when password is not passed', async () => {
    const userCredentials = generate.loginForm({password: null})
    await expect(
      client.post('/auth/register', userCredentials),
    ).rejects.toMatchInlineSnapshot(
      `[Error: 400: {"message":"password can't be blank"}]`,
    )
  })

  test('fails with error 400 when password is not strong enough', async () => {
    const userCredentials = generate.loginForm({password: '123'})
    await expect(
      client.post('/auth/register', userCredentials),
    ).rejects.toMatchInlineSnapshot(
      `[Error: 400: {"message":"password is not strong enough"}]`,
    )
  })
})
