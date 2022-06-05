// Testing Middleware

import {UnauthorizedError} from 'express-jwt'
import errorMiddleware from '../error-middleware'

function buildMiddlewareParams(overrides) {
  const error = new Error('Some message')
  const res = {json: jest.fn(() => res), status: jest.fn(() => res)}
  const req = jest.fn()
  const next = jest.fn()

  return {error, req, res, next, ...overrides}
}

test('UnauthorizedError is returned with error code and message', () => {
  const unauthrizedError = new UnauthorizedError('some_error_code', {
    message: 'Some message',
  })
  const {error, req, res} = buildMiddlewareParams({error: unauthrizedError})

  errorMiddleware(error, req, res)

  expect(res.status).toHaveBeenCalledWith(401)
  expect(res.json).toHaveBeenCalledWith({
    code: error.code,
    message: error.message,
  })
})

test('when headerSent is true it return the error and no new response', () => {
  const unauthrizedError = new UnauthorizedError('some_error_code', {
    message: 'Some message',
  })
  const headerSentRes = {headersSent: true}
  const {error, req, res, next} = buildMiddlewareParams({
    error: unauthrizedError,
    res: headerSentRes,
  })

  errorMiddleware(error, req, res, next)

  expect(next).toHaveBeenCalledWith(error)
})

test('error 500 is return with stack trace and message', () => {
  const {error, req, res} = buildMiddlewareParams()

  errorMiddleware(error, req, res)

  expect(res.status).toHaveBeenCalledWith(500)
  expect(res.json).toHaveBeenCalledWith({
    message: error.message,
    stack: error.stack,
  })
})
