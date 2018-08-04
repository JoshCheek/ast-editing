import React from 'react'
import ReactDOM from 'react-dom'
import RenderRuby from './RenderRuby.js'
import RenderEcma from './RenderEcma.js'
import './index.css'
import registerServiceWorker from './registerServiceWorker'
import Ast, {exampleAst} from './Ast.js'

function setCursor(state) {
  let {ast, position} = state
  if(!position.length)
    return {ast: Ast.AstSelected(ast), position: position}
  const [index, ...rest] = position
  ast = ast.dup()
  const result = setCursor({ast: ast[index], position: rest})
  ast[index] = result.ast
  return {ast, position: [index, ...result.position]}
}


let state = setCursor({
  ast: exampleAst,
  position: [1, 2, 1, 1, 2, 2, 2]
})

const onKeyPress = function(event) {
  console.log(event)
  if(event.key === 'Enter') {
    // *shrug* couldn't think of a good way to do it nondestructively, so, fuckit!
    state.position.pop()
    state = setCursor(state)
    renderUpdate()
  }
}

renderUpdate()
function renderUpdate() {
  ReactDOM.render(
    <div onKeyPress={onKeyPress} tabIndex="0">
      <RenderRuby ast={state.ast}/>
      <RenderEcma ast={state.ast}/>
    </div>,
    document.getElementById('root')
  )
}

registerServiceWorker();
