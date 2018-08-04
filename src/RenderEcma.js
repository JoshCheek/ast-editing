import React, { Component } from 'react'
import './syntax_ecma.css'

class Kw extends Component {
  render() {
    return <span className="keyword">{this.props.children}</span>
  }
}
class Chunk extends Component {
  render() {
    return <span className="displayBlock">{this.props.children}</span>
  }
}

class RenderEcma extends Component {
  className(ast, classes) {
    return [...classes, 'Ast', ast.type.slice(3)].join(" ")
  }
  render(args) {
    // return <p>pending</p>
    return <div className="Ecma">
      {this.renderAst(this.props.ast, [], 0)}
    </div>
  }
  renderAst(ast, classes, key) {
    if(!ast) return null
    if(typeof ast === 'string') return ast
    const handlerName = 'render'+ast.type
    if(handlerName in this)
      return this[handlerName](ast, classes, key)
    throw new Error(`No AST handler "${handlerName}" for ${ast.type} syntax!`)
  }
  renderAstBegin(ast, classes, key) {
    return <span className={this.className(ast, classes)} key={key}>
      {ast.map((child, i) => this.renderAst(child, [], i))}
    </span>
  }
  renderAstImport(ast, classes, key) {
    return <span className={this.className(ast, classes)} key={key}>
      <Kw>import</Kw>
      {this.renderAst(ast.name, ['name'], 0)}
      <Kw>from</Kw>
      {this.renderAst(ast.location, ['location'], 1)}
    </span>
  }
  renderAstConstant(ast, classes, key) {
    return "constant"
  }
  renderAstString(ast, classes, key) {
    return "string"
  }
  renderAstClass(ast, classes, key) {
    return "class"
  }
}

export default RenderEcma
