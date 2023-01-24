const dayjs = require('dayjs')
const debug = require('debug')('updateReadMeTodoCounter')
const fs = require('fs')
const util = require('util')

const FILE_ENCODING = 'utf-8'
const todoRowMatcher = /(?<row>\|\s+<date>\d{2}\/\d{2}\/\d{2}\s+\|\s+<todoCounter>\d+\s+\|)/gi
const skippedRowMatcher = /(?<row>\|\s+<date>\d{2}\/\d{2}\/\d{2}\s+\|\s+<skippedCounter>\d+\s+\|)/gi
const COUNT_TYPE = {
  TODO: {
    type: 'todo',
    tableHeader: 'todoCounter'
  },
  SKIP: {
    type: 'skipped',
    tableHeader: 'skippedTestsCounter'
  }
}

/**
 * Utility funciton to extract todo table from existing
 * README in current directory
 * @param {File} readMe
 * @param {String} countType
 * @returns number length
 */
function extractTableFromReadme(readMe, countType) {
  debug('Extracting todo rows')
  let foundRows, rowMatcher

  if( countType == COUNT_TYPE.TODO.type) {
    rowMatcher = todoRowMatcher
  } else if (countType == COUNT_TYPE.SKIP.type) {
    rowMatcher = skippedRowMatcher
  } else {
    throw new Error(`${countType} is not one of ${util.inspect(COUNT_TYPE)}`)
  }

  const file = fs.readFileSync(readMe, FILE_ENCODING, function(err) {
    if (err) { throw err }
  })
  const matchedRows = file.match(rowMatcher) || []

  debug(`Found ${matchedRows.length} matches`)
  foundRows = matchedRows.length

  return foundRows
}

/**
 * Utiliy function to check if latest todo count in readme
 * table does not match the found todo count
 * @param {String} table todo table
 * @param {Number} count found todo count
 * @param {String} tableHeader
 * @returns {Boolean}
 */
function checkCounterDifference(table, count, countType) {
  let lastCountRegex
  const lastRow = table[table.length - 1]
  if(countType == COUNT_TYPE.TODO.type) {
    lastCountRegex = /<todoCounter>(?<count>\d+)/
  } else if(countType == COUNT_TYPE.SKIP.type) {
    lastCountRegex = /<skippedCounter>(?<count>\d+)/
  }
  const latestCount = lastRow.match(lastCountRegex)?.groups?.count
  debug(
    `Latest table todo count: ${latestCount}\nFound todo count: ${count}`,
  )

  return latestCount != count
}

/**
 * Utility function to create new todo table
 * @param {Array<string>} arr
 * @param {Number} count
 * * @param {String} tableHeader
 * @returns {Array<string>}
 */
function createNewCounterTable(arr, count, tableHeader) {
  const d = new Date()
  const date = dayjs(d).format('MM/DD/YY')
  const newRow = `|<date>${date}|<${tableHeader}>${count}|`

  arr.push(newRow)
  debug('Added new todo row')

  if (arr.length > 10) {
    arr.shift()
    debug('Removed first(old) todo row')
  }

  return arr
}

/**
 * Utilty function to create new Readme
 * @param {File} data
 * @param {String} oldTable
 * @param {Number} count
 * @returns
 */
function createNewReadMe(data, oldTable, count,headerString) {
  const tableHeader = `| Date | ${headerString} Count |\n| :---:| :---:|\n`
  const startTableTagIndex = data.indexOf(tableHeader)
  const extractedCounterTable = data.substring(0, startTableTagIndex)
  const tableWithoutHeader = createNewCounterTable(oldTable, count, tableHeader)
    .toString()
    .replace(/\|,/g, '|\n')
  const newCounterTable = tableHeader.concat(tableWithoutHeader, '\n')

  return extractedCounterTable.concat(newCounterTable)
}

/**
 * 
 * @param {File} readMe Readme file
 * @param {String} data data from fs.readFile
 * @param {String} oldTable outdated table
 * @param {Number} foundCount found todo/skipped count
 * @param {String} countType todo/skipped 
 */
function maybeUpdateReadmeTable(readMe, data, oldTable, foundCount, header) {
  const isCountDifferent = checkCounterDifference(oldTable, foundCount)

  if (isCountDifferent) {
    debug('Updating todo table')

    const newReadMe = createNewReadMe(data, oldTable, foundCount, header)

    fs.writeFile(readMe, newReadMe, encoding, function (err, data) {
      if (err) throw err
      debug('ReadMe file updated!')
    })
  } else {
    console.log('No change in todo count')
  }
}

;(module.exports = {
  extractTableFromReadme, 
  checkCounterDifference, 
  createNewReadMe, 
  maybeUpdateReadmeTable, 
  COUNT_TYPE, 
  FILE_ENCODING
})