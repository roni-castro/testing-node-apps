// Testing Middleware

import {UnauthorizedError} from 'express-jwt'
import {buildNext, buildReq, buildRes} from 'utils/generate'
import errorMiddleware from '../error-middleware'

test('UnauthorizedError is returned with error code 401 and error message', () => {
  const error = new UnauthorizedError('some_error_code', {
    message: 'Some message',
  })
  const req = buildReq()
  const res = buildRes()
  const next = buildNext()

  errorMiddleware(error, req, res)

  expect(res.status).toHaveBeenCalledWith(401)
  expect(res.status).toHaveBeenCalledTimes(1)
  expect(res.json).toHaveBeenCalledWith({
    code: error.code,
    message: error.message,
  })
  expect(res.json).toHaveBeenCalledTimes(1)
  expect(next).not.toHaveBeenCalled()
})

test('calls next if headersSent is true', () => {
  const error = new Error('Some message')
  const res = buildRes({headersSent: true})
  const req = buildReq()
  const next = buildNext()

  errorMiddleware(error, req, res, next)

  expect(next).toHaveBeenCalledWith(error)
  expect(next).toHaveBeenCalledTimes(1)
  expect(res.json).not.toHaveBeenCalled()
  expect(res.status).not.toHaveBeenCalled()
})

test('error 500 is return with stack trace and message', () => {
  const error = new Error('some message')
  const res = buildRes()
  const req = buildReq()
  const next = buildNext()

  errorMiddleware(error, req, res)

  expect(res.status).toHaveBeenCalledWith(500)
  expect(res.status).toHaveBeenCalledTimes(1)
  expect(res.json).toHaveBeenCalledWith({
    message: error.message,
    stack: error.stack,
  })
  expect(res.json).toHaveBeenCalledTimes(1)
  expect(next).not.toHaveBeenCalled()
})
