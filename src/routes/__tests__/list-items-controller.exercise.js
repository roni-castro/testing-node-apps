// Testing Controllers

import * as generate from 'utils/generate'

import * as booksDB from '../../db/books'
import * as listItemsDB from '../../db/list-items'

import * as listItemsController from '../list-items-controller'

jest.mock('../../db/books')

beforeEach(() => {
  jest.resetAllMocks()
})

test('getListItem returns the req.listItem', async () => {
  const user = generate.buildUser()
  const book = generate.buildBook()
  const listItem = generate.buildListItem({ownerId: user.id, bookId: book.id})

  booksDB.readById.mockResolvedValueOnce(book)
  booksDB.insert(book)
  listItemsDB.create(listItem)

  const req = generate.buildReq({listItem})
  const res = generate.buildRes()
  await listItemsController.getListItem(req, res)

  expect(res.json).toHaveBeenNthCalledWith(1, {listItem: {...listItem, book}})
  expect(booksDB.readById).toHaveBeenNthCalledWith(1, book.id)
})
