/** @babel */
/** @jsx etch.dom */

const assert = require('assert')
const etch = require('etch')
const SelectListView = require('../src/select-list-view')

describe('SelectListView', () => {
  it('items rendering', async () => {
    const items = [{name: 'Grace', age: 20}, {name: 'John', age: 42}]
    const selectListView = new SelectListView({
      items,
      viewForItem: (item) => <div><span>{item.name}</span> <span>{item.age}</span></div>
    })
    document.body.appendChild(selectListView.element)
    assert.equal(selectListView.refs.items.innerText, 'Grace 20\nJohn 42')

    items.push({name: 'Peter', age: '50'})
    await selectListView.update({items})
    assert.equal(selectListView.refs.items.innerText, 'Grace 20\nJohn 42\nPeter 50')

    await etch.destroy(selectListView)
  })

  it('keyboard navigation and selection', async () => {
    const selectionConfirmEvents = []
    const selectionChangeEvents = []
    const items = [{name: 'Grace'}, {name: 'John'}, {name: 'Peter'}]
    const selectListView = new SelectListView({
      items,
      viewForItem: (item) => <div style={{height: '10px'}}>{item.name}</div>,
      didChangeSelection: (item) => { selectionChangeEvents.push(item) },
      didConfirmSelection: (item) => { selectionConfirmEvents.push(item) }
    })

    selectListView.element.style.overflowY = 'auto'
    selectListView.element.style.height = "20px"
    document.body.appendChild(selectListView.element)

    assert.equal(selectListView.getSelectedItem(), items[0])
    assert.equal(selectListView.element.querySelector('.selected').textContent, items[0].name)
    assert.equal(selectListView.element.scrollTop, 0)

    await selectListView.selectNext()
    assert.equal(selectListView.getSelectedItem(), items[1])
    assert.equal(selectListView.element.querySelector('.selected').textContent, items[1].name)
    assert.equal(selectListView.element.scrollTop, 30)
    await selectListView.selectNext()
    assert.equal(selectListView.getSelectedItem(), items[2])
    assert.equal(selectListView.element.querySelector('.selected').textContent, items[2].name)
    assert.notEqual(selectListView.element.scrollTop, 40)
    await selectListView.selectNext()
    assert.equal(selectListView.getSelectedItem(), items[0])
    assert.equal(selectListView.element.querySelector('.selected').textContent, items[0].name)
    assert.equal(selectListView.element.scrollTop, 20)

    await selectListView.selectPrevious()
    assert.equal(selectListView.getSelectedItem(), items[2])
    assert.equal(selectListView.element.querySelector('.selected').textContent, items[2].name)
    assert.equal(selectListView.element.scrollTop, 40)
    await selectListView.selectPrevious()
    assert.equal(selectListView.getSelectedItem(), items[1])
    assert.equal(selectListView.element.querySelector('.selected').textContent, items[1].name)
    assert.equal(selectListView.element.scrollTop, 35)
    await selectListView.selectPrevious()
    assert.equal(selectListView.getSelectedItem(), items[0])
    assert.equal(selectListView.element.querySelector('.selected').textContent, items[0].name)
    assert.equal(selectListView.element.scrollTop, 20)

    await selectListView.selectLast()
    assert.equal(selectListView.getSelectedItem(), items[2])
    assert.equal(selectListView.element.querySelector('.selected').textContent, items[2].name)
    assert.equal(selectListView.element.scrollTop, 40)
    await selectListView.selectFirst()
    assert.equal(selectListView.getSelectedItem(), items[0])
    assert.equal(selectListView.element.querySelector('.selected').textContent, items[0].name)
    assert.equal(selectListView.element.scrollTop, 20)

    assert.deepEqual(selectionConfirmEvents, [])
    assert(selectListView.element.parentElement)
    await selectListView.confirmSelection()
    assert.deepEqual(selectionConfirmEvents, [items[0]])
    assert(!selectListView.element.parentElement)

    assert.deepEqual(selectionChangeEvents, [items[0], items[1], items[2], items[0], items[2], items[1], items[0], items[2], items[0]])
  })

  it('default filtering', async () => {
    const items = [{name: 'Grace'}, {name: 'Johnathan'}, {name: 'Joanna'}]
    const selectListView = new SelectListView({
      items,
      filterKeyForItem: (item) => item.name,
      viewForItem: (item) => <div>{item.name}</div>
    })
    document.body.appendChild(selectListView.element)
    await selectListView.selectNext()
    assert.equal(selectListView.refs.items.innerText, 'Grace\nJohnathan\nJoanna')
    assert.equal(selectListView.getSelectedItem(), items[1])

    selectListView.refs.queryEditor.setText('Jon')
    await etch.getScheduler().getNextUpdatePromise()
    assert.equal(selectListView.refs.items.innerText, 'Joanna\nJohnathan')
    assert.equal(selectListView.getSelectedItem(), items[2])
  })

  it('custom filtering', async () => {
    const items = [{name: 'Elizabeth'}, {name: 'Johnathan'}, {name: 'Joanna'}]
    const selectListView = new SelectListView({
      items,
      filter: (items, query) => {
        if (query === '') {
          return items
        } else {
          const index = Number(selectListView.getQuery())
          return [items[index]]
        }
      },
      viewForItem: (item) => <div>{item.name}</div>
    })
    document.body.appendChild(selectListView.element)
    await selectListView.selectLast()
    assert.equal(selectListView.refs.items.innerText, 'Elizabeth\nJohnathan\nJoanna')
    assert.equal(selectListView.getSelectedItem(), items[2])

    selectListView.refs.queryEditor.setText('1')
    await etch.getScheduler().getNextUpdatePromise()
    assert.equal(selectListView.refs.items.innerText, 'Johnathan')
    assert.equal(selectListView.getSelectedItem(), items[1])
  })

  it('empty message', async () => {
    const selectListView = new SelectListView({
      emptyMessage: 'empty message',
      items: [],
      viewForItem: (i) => i.toString()
    })
    assert.equal(selectListView.refs.emptyMessage.textContent, 'empty message')
    await selectListView.update({items: [1, 2, 3]})
    assert(!selectListView.refs.emptyMessage)
  })

  it('error message')
  it('info message')

  it('query changes')
  it('focus')
  it('destroy')
})
