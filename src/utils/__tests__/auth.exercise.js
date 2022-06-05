import cases from 'jest-in-case'
import {isPasswordAllowed} from '../auth'

function casify(testCaseObj) {
  return Object.entries(testCaseObj).map(([name, password]) => ({
    name: `${password} - ${name}`,
    password,
  }))
}

cases(
  'isPasswordAllowed: valid password',
  (opts) => {
    expect(isPasswordAllowed(opts.password)).toBe(true)
  },
  casify({
    'valid password': '!aBc123',
  }),
)

cases(
  'isPasswordAllowed: invalid passwords',
  (opts) => {
    expect(isPasswordAllowed(opts.password)).toBe(false)
  },
  casify({
    'too short': 'a2C!',
    'no alphabet characters': '123456!',
    'no numbers': 'ABCdef!',
    'no uppercase letters': 'abc123!',
    'no lowercase letters': 'ABC123!',
    'non-alphanumeric characters': 'ABCdef123',
  }),
)
