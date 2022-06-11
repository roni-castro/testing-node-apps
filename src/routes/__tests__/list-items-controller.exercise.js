// Testing Controllers

import {
  buildUser,
  buildBook,
  buildListItem,
  buildReq,
  buildRes,
} from 'utils/generate'

import * as booksDB from '../../db/books'
import * as listItemsDB from '../../db/list-items'

import * as listItemsController from '../list-items-controller'

jest.mock('../../db/books')
jest.mock('../../db/list-items')

beforeEach(() => {
  jest.resetAllMocks()
})

test('getListItem returns the req.listItem', async () => {
  const user = buildUser()
  const book = buildBook()
  const listItem = buildListItem({ownerId: user.id, bookId: book.id})

  booksDB.readById.mockResolvedValueOnce(book)

  const req = buildReq({listItem})
  const res = buildRes()
  await listItemsController.getListItem(req, res)

  expect(res.json).toHaveBeenNthCalledWith(1, {listItem: {...listItem, book}})
  expect(booksDB.readById).toHaveBeenNthCalledWith(1, book.id)
})

test('getListItems returns the list of listItems', async () => {
  const user = buildUser()
  const books = [buildBook(), buildBook()]
  const listItems = [
    buildListItem({ownerId: user.id, bookId: books[0].id}),
    buildListItem({ownerId: user.id, bookId: books[1].id}),
  ]

  booksDB.readManyById.mockResolvedValueOnce(books)
  listItemsDB.query.mockResolvedValueOnce(listItems)

  const req = buildReq()
  const res = buildRes()
  await listItemsController.getListItems(req, res)

  expect(res.json).toHaveBeenNthCalledWith(1, {
    listItems: [
      {...listItems[0], book: books[0]},
      {...listItems[1], book: books[1]},
    ],
  })
  expect(booksDB.readManyById).toHaveBeenNthCalledWith(1, [
    books[0].id,
    books[1].id,
  ])
})

describe('#createListItem', () => {
  test('createListItem creates a list of items', async () => {
    const user = buildUser()
    const book = buildBook()

    const listItem = buildListItem({ownerId: user.id, bookId: book.id})
    booksDB.readById.mockResolvedValueOnce(book)
    listItemsDB.create.mockResolvedValueOnce(listItem)
    listItemsDB.query.mockResolvedValue([])

    const req = buildReq({user, body: {bookId: book.id}})
    const res = buildRes()
    await listItemsController.createListItem(req, res)

    expect(res.json).toHaveBeenNthCalledWith(1, {listItem: {...listItem, book}})
    expect(booksDB.readById).toHaveBeenNthCalledWith(1, book.id)
    expect(listItemsDB.create).toHaveBeenNthCalledWith(1, {
      ownerId: user.id,
      bookId: book.id,
    })
    expect(listItemsDB.query).toHaveBeenNthCalledWith(1, {
      ownerId: user.id,
      bookId: book.id,
    })
  })

  test('createListItem fails with error 400 if bookdId is not passed', async () => {
    const user = buildUser()
    const req = buildReq({user, body: {bookId: null}})
    const res = buildRes()
    await listItemsController.createListItem(req, res)

    expect(res.json.mock.calls[0][0]).toMatchInlineSnapshot(`
      Object {
        "message": "No bookId provided",
      }
    `)
    expect(res.json).toHaveBeenCalledTimes(1)
    expect(res.status).toHaveBeenNthCalledWith(1, 400)
  })

  test('createListItem returns a 400 error if the user already has a list item for the given book', async () => {
    const user = buildUser({id: 'FAKE_USER_ID'})
    const book = buildBook({id: 'FAKE_BOOK_ID'})
    const req = buildReq({user, body: {bookId: book.id}})
    const res = buildRes()
    const listItem = buildListItem({ownerId: user.id, bookId: book.id})
    listItemsDB.query.mockResolvedValue([listItem])

    await listItemsController.createListItem(req, res)

    expect(res.json.mock.calls[0][0]).toMatchInlineSnapshot(`
      Object {
        "message": "User FAKE_USER_ID already has a list item for the book with the ID FAKE_BOOK_ID",
      }
    `)
    expect(res.json).toHaveBeenCalledTimes(1)
    expect(res.status).toHaveBeenNthCalledWith(1, 400)

    expect(listItemsDB.query).toHaveBeenNthCalledWith(1, {
      ownerId: user.id,
      bookId: book.id,
    })
  })
})
