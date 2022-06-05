import {isPasswordAllowed} from '../auth'

describe('valid password', () => {
  ;[{name: 'password is valid', password: '!aBc123'}].forEach(
    ({name, password}) => {
      test(name, () => {
        expect(isPasswordAllowed(password)).toBe(true)
      })
    },
  )
})

describe('invalid password', () => {
  ;[
    {name: 'too short', password: 'a2c!'},
    {name: 'alphabet characters', password: '123456!'},
    {name: 'no numbers', password: 'ABCdef!'},
    {name: 'no uppercase letters', password: 'abc123!'},
    {name: 'no lowercase letters', password: 'ABC123!'},
    {name: 'non-alphanumeric characters', password: 'ABCdef123'},
  ].forEach(({name, password}) => {
    test(name, () => {
      expect(isPasswordAllowed(password)).toBe(false)
    })
  })
})



//
// valid:
// - !aBc123
//
// invalid:
// - a2c! // too short
// - 123456! // no alphabet characters
// - ABCdef! // no numbers
// - abc123! // no uppercase letters
// - ABC123! // no lowercase letters
// - ABCdef123 // no non-alphanumeric characters
