// Testing Middleware

import {UnauthorizedError} from 'express-jwt'
import {buildNext, buildReq, buildRes} from 'utils/generate'
import errorMiddleware from '../error-middleware'

test('UnauthorizedError is returned with error code and message', () => {
  const error = new UnauthorizedError('some_error_code', {
    message: 'Some message',
  })
  const req = buildReq()
  const res = buildRes()

  errorMiddleware(error, req, res)

  expect(res.status).toHaveBeenCalledWith(401)
  expect(res.json).toHaveBeenCalledWith({
    code: error.code,
    message: error.message,
  })
})

test('when headersSent is true it return the error and no new response', () => {
  const error = new UnauthorizedError('some_error_code', {
    message: 'Some message',
  })
  const res = buildRes({headersSent: true})
  const req = buildReq()
  const next = buildNext()

  errorMiddleware(error, req, res, next)

  expect(next).toHaveBeenCalledWith(error)
})

test('error 500 is return with stack trace and message', () => {
  const error = new Error('some message')
  const res = buildRes()
  const req = buildReq()

  errorMiddleware(error, req, res)

  expect(res.status).toHaveBeenCalledWith(500)
  expect(res.json).toHaveBeenCalledWith({
    message: error.message,
    stack: error.stack,
  })
})
