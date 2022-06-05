// Testing Middleware

import {UnauthorizedError} from 'express-jwt'
import errorMiddleware from '../error-middleware'

test('UnauthorizedError is returned with error code and message', () => {
  const error = new UnauthorizedError('some_error_code', {
    message: 'Some message',
  })
  const res = {json: jest.fn(() => res), status: jest.fn(() => res)}

  errorMiddleware(error, {}, res)

  expect(res.status).toHaveBeenCalledWith(401)
  expect(res.json).toHaveBeenCalledWith({
    code: error.code,
    message: error.message,
  })
})

test('when headerSent is true it return the error', () => {
  const error = new UnauthorizedError('some_error_code', {
    message: 'Some message',
  })
  const res = {headersSent: true}
  const next = jest.fn()

  errorMiddleware(error, {}, res, next)

  expect(next).toHaveBeenCalledWith(error)
})

test('error 500 is return with stack trace and message', () => {
  const error = new Error({
    message: 'Some message',
  })
  const res = {json: jest.fn(() => res), status: jest.fn(() => res)}

  errorMiddleware(error, {}, res)

  expect(res.status).toHaveBeenCalledWith(500)
  expect(res.json).toHaveBeenCalledWith({
    message: error.message,
    stack: error.stack,
  })
})
