import cases from 'jest-in-case'
import {isPasswordAllowed} from '../auth'

cases(
  'isPasswordAllowed',
  (opts) => {
    const result = isPasswordAllowed(opts.password)
    expect(result).toBe(opts.result)
  },
  {
    'valid password': {
      password: '!aBc123',
      result: true,
    },
    'password too short': {
      password: 'a2c!',
      result: false,
    },
    'password no alphabet characters': {
      password: '123456!',
      result: false,
    },
    'password no numbers': {
      password: 'ABCdef!',
      result: false,
    },
    'password no uppercase letters': {
      password: 'abc123!',
      result: false,
    },
    'password no lowercase letters': {
      password: 'ABC123!',
      result: false,
    },
    'password non-alphanumeric characters': {
      password: 'ABCdef123',
      result: false,
    },
  },
)
