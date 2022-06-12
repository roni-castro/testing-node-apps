// Testing Controllers

import {
  buildUser,
  buildBook,
  buildListItem,
  buildReq,
  buildRes,
  buildNext,
  notes,
} from 'utils/generate'

import * as booksDB from '../../db/books'
import * as listItemsDB from '../../db/list-items'

import * as listItemsController from '../list-items-controller'

jest.mock('../../db/books')
jest.mock('../../db/list-items')

beforeEach(() => {
  jest.clearAllMocks()
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

  const req = buildReq({user})
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
  expect(listItemsDB.query).toHaveBeenNthCalledWith(1, {ownerId: user.id})
})

describe('#createListItem', () => {
  test('createListItem creates and returns a list item', async () => {
    const user = buildUser()
    const book = buildBook()
    const createdListItem = buildListItem({ownerId: user.id, bookId: book.id})
    booksDB.readById.mockResolvedValueOnce(book)
    listItemsDB.create.mockResolvedValueOnce(createdListItem)
    listItemsDB.query.mockResolvedValueOnce([])

    const req = buildReq({user, body: {bookId: book.id}})
    const res = buildRes()

    await listItemsController.createListItem(req, res)

    expect(res.json).toHaveBeenNthCalledWith(1, {
      listItem: {...createdListItem, book},
    })
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
    const existingListItem = buildListItem({ownerId: user.id, bookId: book.id})
    listItemsDB.query.mockResolvedValueOnce([existingListItem])

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

describe('#setListItem', () => {
  test('setListItem sets a list item to the request', async () => {
    const user = buildUser()

    const listItem = buildListItem({ownerId: user.id})
    listItemsDB.readById.mockResolvedValueOnce(listItem)

    const req = buildReq({user, params: {id: listItem.id}})
    const res = buildRes()
    const next = buildNext()
    await listItemsController.setListItem(req, res, next)

    expect(req.listItem).toBe(listItem)
    expect(next).toHaveBeenCalledTimes(1)
    expect(res.json).not.toHaveBeenCalled()
  })

  test('setListItem fails with error 404 if list item is not found', async () => {
    const user = buildUser()

    const listItem = buildListItem({
      id: 'FAKE_LIST_ID',
      ownerId: user.id,
    })
    listItemsDB.readById.mockResolvedValueOnce(null)

    const req = buildReq({user, params: {id: listItem.id}})
    const res = buildRes()
    const next = buildNext()
    await listItemsController.setListItem(req, res, next)

    expect(req.listItem).toBeFalsy()
    expect(res.json.mock.calls[0][0]).toMatchInlineSnapshot(`
      Object {
        "message": "No list item was found with the id of FAKE_LIST_ID",
      }
    `)
    expect(res.json).toHaveBeenCalledTimes(1)
    expect(res.status).toHaveBeenNthCalledWith(1, 404)
  })

  test('setListItem fails with error 403 if user is not the owner of the existing list item', async () => {
    const user = buildUser({id: 'FAKE_USER_ID'})

    const listItem = buildListItem({
      id: 'FAKE_LIST_ITEM_ID',
      ownerId: 'DIFFERENT_USER_ID',
    })
    listItemsDB.readById.mockResolvedValueOnce(listItem)

    const req = buildReq({user, params: {id: listItem.id}})
    const res = buildRes()
    const next = buildNext()
    await listItemsController.setListItem(req, res, next)

    expect(req.listItem).toBeFalsy()
    expect(res.json.mock.calls[0][0]).toMatchInlineSnapshot(`
      Object {
        "message": "User with id FAKE_USER_ID is not authorized to access the list item FAKE_LIST_ITEM_ID",
      }
    `)
    expect(res.json).toHaveBeenCalledTimes(1)
    expect(res.status).toHaveBeenNthCalledWith(1, 403)
  })
})

test('updateListItem updates an existing list item', async () => {
  const user = buildUser()
  const book = buildBook()
  const listItem = buildListItem({ownerId: user.id, bookId: book.id})
  const updates = {notes: notes()}

  const mergedListItemAndUpdates = {...listItem, ...updates}

  booksDB.readById.mockResolvedValueOnce(book)
  listItemsDB.update.mockResolvedValueOnce(mergedListItemAndUpdates)

  const req = buildReq({user, body: updates, listItem})
  const res = buildRes()

  await listItemsController.updateListItem(req, res)

  expect(res.json).toHaveBeenNthCalledWith(1, {
    listItem: {...mergedListItemAndUpdates, book},
  })
  expect(booksDB.readById).toHaveBeenNthCalledWith(1, book.id)
  expect(listItemsDB.update).toHaveBeenNthCalledWith(1, listItem.id, updates)
})

test('deleteListItem deletes an existing list item', async () => {
  const user = buildUser()
  const listItem = buildListItem({ownerId: user.id})

  const req = buildReq({user, listItem})
  const res = buildRes()

  await listItemsController.deleteListItem(req, res)

  expect(res.json).toHaveBeenNthCalledWith(1, {success: true})
  expect(listItemsDB.remove).toHaveBeenNthCalledWith(1, listItem.id)
})
