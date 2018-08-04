import React, { Component } from 'react';
// import './ecma_syntax.css';

class RenderEcma extends Component {
  render(args) {
    return <p>pending</p>
    // return <div className="Ecma">
    //   {this.renderAst(this.props.ast, [], 0)}
    // </div>
  }
  renderAst(ast, classes, key) {
    if(!ast) return null
    if(typeof ast === 'string') return ast
    const handlerName = 'render'+ast.type
    if(handlerName in this)
      return this[handlerName](ast, classes, key)
    throw new Error(`No AST handler "${handlerName}" for ${ast.type} syntax!`)
  }
}

export default RenderEcma
