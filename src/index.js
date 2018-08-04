import React from 'react'
import ReactDOM from 'react-dom'
import RenderRuby from './RenderRuby.js'
import RenderEcma from './RenderEcma.js'
import './index.css'
import registerServiceWorker from './registerServiceWorker'
import Ast, {exampleAst} from './Ast.js'

const commands = {
  in:   'in',
  out:  'out',
  down: 'down',
  up:   'up',
  noop: 'noop',
}

function boundPosition(ast, position) {
  if(!position.length)
    return []
  if(!ast || ast.constructor !== Array)
    return []
  let [crnt, ...rest] = position
  if(crnt < 0)
    return [ast.length-1]
  if(ast.length <= crnt)
    return [0]
  position = boundPosition(ast[crnt], rest)
  position.unshift(crnt)
  return position
}

function applyCommand({ast, selectedAst, position}, command) {
  position = [...position]
  switch (command) {
    case commands.in:
      position.push(0)
      break;
    case commands.out:
      position.pop()
      break;
    case commands.up:
      if(position.length) {
        const index = position.length-1
        position[index] = position[index]-1
      }
      break
    case commands.down:
      if(position.length) {
        const index = position.length-1
        position[index] = position[index]+1
      }
      break
    case commands.noop:
      // noop
      break
    default:
      // noop
  }
  position    = boundPosition(ast, position)
  selectedAst = selectPosition(ast, position)
  return {ast, selectedAst, position}
}

function selectPosition(ast, position) {
  if(!position.length)
    return Ast.AstSelected(ast)
  const [index, ...rest] = position
  ast = ast.dup()
  ast[index] = selectPosition(ast[index], rest)
  return ast
}


let state = {ast: exampleAst, position: [1, 2, 1, 1, 2, 2, 0]}
state.selectedAst = state.ast
state = applyCommand(state, commands.noop)
window.state = state

const onKeyPress = function(event) {
  switch (event.key) {
    case 'h':
      state = applyCommand(state, commands.out)
      break;
    case 'l':
      state = applyCommand(state, commands.in)
      break;
    case 'j':
      state = applyCommand(state, commands.down)
      break;
    case 'k':
      state = applyCommand(state, commands.up)
      break;
    default:
      // noop
  }
  window.state = state
  renderUpdate()
}
document.addEventListener('keypress', onKeyPress)

renderUpdate()
function renderUpdate() {
  ReactDOM.render(
    <div>
      <RenderRuby ast={state.selectedAst}/>
      <RenderEcma ast={state.selectedAst}/>
    </div>,
    document.getElementById('root')
  )
}

registerServiceWorker();
