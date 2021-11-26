import { createRef, useState } from 'react'
import { UnControlled as CodeMirror } from 'react-codemirror2'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/sql/sql'
import 'codemirror/addon/hint/show-hint.css'
import 'codemirror/addon/hint/show-hint'
import 'codemirror/addon/hint/sql-hint'
import './App.css'

const tables = ['quick_table1', 'quick_table2', 'quick_table3', 'validation_table', 'quick_table4', 'quick_table5', 'quick_table6']
const columns = {
  'quick_table1': ['case', 'concat', 'cw_case', 'dateadd', 'nvl_area', 'replace'],
  'quick_table2': ['substr', 'agerange', 'area', 'city', 'city(pinyin)', 'claimway'],
  'quick_table3': ['date', 'isfirstclaim', 'losstype', 'poltype', 'province', 'province(pinyin)'],
  'validation_table': ['sex', 'status', 'abs', 'length', 'claimamount', 'claimno', 'claimpercentage'],
  'quick_table4': ['customerage', 'paidamount', 'polno', 'zipcode'],
  'quick_table5': ['case', 'concat', 'cw_case', 'dateadd', 'nvl_area', 'replace', 'substr', 'agerange', 'area', 'city', 'city(pinyin)', 'claimway', 'date', 'isfirstclaim', 'losstype', 'poltype', 'province', 'province(pinyin)', 'sex', 'status', 'abs', 'length', 'claimamount', 'claimno', 'claimpercentage', 'customerage', 'paidamount', 'polno', 'zipcode'],
  'quick_table6': ['case', 'concat', 'cw_case', 'dateadd', 'nvl_area', 'replace', 'substr', 'agerange', 'area', 'city', 'city(pinyin)', 'claimway', 'date', 'isfirstclaim', 'losstype', 'poltype', 'province', 'province(pinyin)', 'sex', 'status', 'abs', 'length', 'claimamount', 'claimno', 'claimpercentage', 'customerage', 'paidamount', 'polno', 'zipcode']
}

function App() {
  const codeMirror = createRef()
  const [sql] = useState('')

  // SQL 提示的业务逻辑
  const changeSQL = (editor, data, value) => {
    const { origin, text = [] } = data
    const isRemove = origin === '+delete'
    const character = text[0]
    if (isRemove) {
      editor.setOption('hintOptions', {
        completeSingle: false
      })
      editor.focus()
    } else if (character === ' ') {
      const { ch } = editor.getCursor()
      const sqlStatement = value.substr(0, ch).trim().toUpperCase()
      const comma = sqlStatement.substr(-1)
      const select = sqlStatement.substr(-6)
      const from = sqlStatement.substr(-4)
      if (comma === ',' || select === 'SELECT') {
        const sqlStatement = value.substr(ch).trim()
        const fromIndex = sqlStatement.toUpperCase().indexOf('FROM')
        const tableName = sqlStatement.substr(fromIndex).trim().split(' ').pop()
        const list = columns[tableName]
        if (list) {
          editor.setOption('hintOptions', {
            completeSingle: false,
            hint: (cmInstance, hintOptions) => {
              let cursor = cmInstance.getCursor()
              let token = cmInstance.getTokenAt(cursor)
              return {
                list,
                from: { ch: token.start, line: cursor.line },
                to: { ch: token.end, line: cursor.line }
              }
            }
          })
          editor.showHint()
        }
      } else if (from === 'FROM') {
        editor.setOption('hintOptions', {
          completeSingle: false,
          hint: (cmInstance, hintOptions) => {
            let cursor = cmInstance.getCursor()
            const token = cmInstance.getTokenAt(cursor)
            const { string = '' } = token
            return {
              list: tables.filter(tableName => tableName.includes(string.trim())),
              from: { ch: token.start + 1, line: cursor.line },
              to: { ch: token.end, line: cursor.line }
            }
          }
        })
        editor.showHint()
      } else {
        editor.setOption('hintOptions', {
          completeSingle: false
        })
        editor.showHint()
      }
    } else if ('aAbBcCdDfFgGhHiIjJlLnNoOsStTuUvVwW'.includes(character)) {
      editor.showHint()
    }
  }

  return (
    <CodeMirror ref={codeMirror}
                value={sql}
                options={{
                  mode: 'text/x-sql', // text/x-hive
                  lineNumbers: true,
                  tabSize: '2',
                  hintOptions: {
                    completeSingle: false
                  }
                }
                }
                lineWiseCopyCut
                onChange={changeSQL}
    />
  )
}

export default App
