// Testing Controllers

import * as generate from 'utils/generate'

import * as booksDB from '../../db/books'
import * as listItemsDB from '../../db/list-items'

import * as listItemsController from '../list-items-controller'

// 🐨 use jest.mock to mock '../../db/books' because we don't actually want to make
// database calls in this test file.

// 🐨 ensure that all mock functions have their call history cleared using
// jest.resetAllMocks here as in the example.

test('getListItem returns the req.listItem', async () => {
  // 🐨 create a user
  const user = generate.buildUser()
  //
  // 🐨 create a book
  const book = generate.buildBook()
  //
  // 🐨 create a listItem that has the user as the owner and the book
  const listItem = generate.buildListItem({ownerId: user.id, bookId: book.id})
  //
  // 🐨 mock booksDB.readById to resolve to the book
  // 💰 use mockResolvedValueOnce
  //
  // 🐨 make a request object that has properties for the user and listItem
  // 💰 checkout the implementation of getListItem in ../list-items-controller
  // to see how the request object is used and what properties it needs.
  // 💰 and you can use buildReq from utils/generate
  //
  // 🐨 make a response object
  // 💰 just use buildRes from utils/generate
  //
  // 🐨 make a call to getListItem with the req and res (`await` the result)
  booksDB.insert(book)
  listItemsDB.create(listItem)

  const req = generate.buildReq({listItem})
  const res = generate.buildRes()
  await listItemsController.getListItem(req, res)

  expect(res.json).toHaveBeenCalledWith({listItem: {...listItem, book}})
  //
  // 🐨 assert that booksDB.readById was called correctly
  //
  //🐨 assert that res.json was called correctly
})
