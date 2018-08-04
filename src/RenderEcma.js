import React, { Component } from 'react'
import Ast from './Ast.js'
import './syntax_ecma.css'
// https://www.ecma-international.org/ecma-262/9.0/index.html#sec-method-definitions

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
class EagerCursor extends Component {
  render() {
    return <span className="EagerCursor">
    </span>
  }
}

class RenderEcma extends Component {
  className(ast, classes) {
    return [...classes, 'Ast', ast.type.slice(3)].join(" ")
  }

  render(args) {
    return <div className="Ecma">
      <h2>ECMA(ish) syntax</h2>
      {this.renderAst(this.props.ast, [], 0)}
    </div>
  }

  renderAst(ast, classes, key) {
    if(!ast) return null
    if(typeof ast === 'string')
      return <span className={classes.join(" ")} key={key}>
        {ast}
      </span>
    const handlerName = 'render'+ast.type
    if(handlerName in this)
      return this[handlerName](ast, classes, key)
    throw new Error(`No AST handler "${handlerName}" for ${ast.type} syntax! (ast=${ast})`)
  }

  renderAstBegin(ast, classes, key) {
    return <span className={this.className(ast, classes)} key={key}>
      {ast.map((child, i) => this.renderAst(child, [], i))}
    </span>
  }

  renderAstConstant(ast, classes, key) {
    const ns   = ast.namespace ? this.renderAst(ast.namespace, ['namespace'], 0) : null
    const name = this.renderAst(ast.name, ['name'], 1)
    return <span className={this.className(ast, classes)} key={key}>
      {ns}{ns?".":""}{name}
    </span>
  }

  renderAstString(ast, classes, key) {
    return <span className={this.className(ast, classes)} key={key}>
      "{ast.value}"
    </span>
  }

  renderAstSymbol(ast, classes, key) {
    const symbol = Ast.AstCall(
      Ast.AstConstant(null, 'Symbol'),
      'for',
      Ast.AstArgs(Ast.AstString(ast.value))
    )
    return this.renderAst(symbol, classes, key)
  }

  renderAstClass(ast, classes, key) {
    const constant   = this.renderAst(ast.constant,   ['constant'],   0)
    const superclass = this.renderAst(ast.superclass, ['superclass'], 1)
    const body       = this.renderAst(ast.body,       ['body'],       2)
    return <span className={this.className(ast, classes)} key={key}>
      <Chunk>
        <Kw>class</Kw>
        {constant}
        {superclass && <Kw>extends</Kw>}
        {superclass}
        {" {"}
      </Chunk>
        {body}
      <Chunk>
        {"}"}
      </Chunk>
    </span>
  }

  renderAstModule(ast, classes, key) {
    return this.renderAstClass(ast, classes, key)
  }

  renderAstCall(ast, classes, key) {
    const receiver = ast.receiver ? this.renderAst(ast.receiver, ['receiver'], 0) : null
    const message  = this.renderAst(ast.message, [], 1)
    const args     = this.renderAst(ast.args, [], 2)
    return <span className={this.className(ast, classes)} key={key}>
      {receiver}{receiver ? "." : null}{message}({args})
    </span>
  }

  renderAstArgs(ast, classes, key) {
    const args = []
    ast.forEach((param, i) => {
      args.push(this.renderAst(param, [], i))
      args.push(", ")
    })
    if(args[args.length-1] === ", ")
      args.pop()
    return <span className={this.className(ast, ['args', ...classes])} key={key}>
      {args}
    </span>
  }

  renderAstDef(ast, classes, key) {
    const message = this.renderAst(ast.message, [], 0)
    const params  = this.renderAst(ast.params, [], 1)
    return <span className={this.className(ast, classes)} key={key}>
      <Chunk>
        {message}({params})
        {" {"}
      </Chunk>
      { this.renderAst(ast.body, ['body'], 0) }
      <Chunk>
        {"}"}
      </Chunk>
    </span>
  }

  renderAstParams(ast, classes, key) {
    const params = []
    ast.forEach((param, i) => {
      params.push(this.renderAst(param, [], i))
      params.push(", ")
    })
    if(params[params.length-1] === ", ")
      params.pop()
    return <span className={this.className(ast, ['params', ...classes])} key={key}>
      {params}
    </span>
  }

  renderAstAssign(ast, classes, key) {
    return <span className={this.className(ast, classes)} key={key}>
      <Chunk>
        {this.renderAst(ast.lhs, ['lhs'], 0)}
        {" = "}
        {this.renderAst(ast.rhs, ['rhs'], 2)}
      </Chunk>
    </span>
  }

  renderAstCase(ast, classes, key) {
    return <span className={this.className(ast, classes)} key={key}>
      <Chunk>
        <Kw>switch</Kw>(
          {this.renderAst(ast.condition, ['condition'], 0)}
        ) {" {"}
      </Chunk>
      <span className="whenClauses body">
        {ast.whenClauses.map((clause, i) => this.renderAst(clause, [], i))}
      </span>
      <Chunk>
        {"}"}
      </Chunk>
    </span>
  }
  renderAstCaseWhen(ast, classes, key) {
    return <span className={this.className(ast, classes)} key={key}>
      <Chunk>
        <Kw>case</Kw>
        {this.renderAst(ast.condition, ['condition'], 0)}
        :
      </Chunk>
      <span className="body">
        {this.renderAst(ast.body, [], 0)}
        <Kw>break</Kw>
      </span>
    </span>
  }

  renderAstInstanceVar(ast, classes, key) {
    const receiver = this.renderAst(Ast.AstCrntInstance(), [], 0)
    const name     = <span className="propertyAccess">{ast.name}</span>
    return <span className={this.className(ast, classes)} key={key}>
      {receiver}.{name}
    </span>
  }

  renderAstLocalVar(ast, classes, key) {
    return <span className={this.className(ast, classes)} key={key}>
      {ast.name}
    </span>
  }

  renderAstCrntInstance(ast, classes, key) {
    classes = classes.concat(['this'])
    return <span className={this.className(ast, classes)} key={key}>
      <Kw>this</Kw>
    </span>
  }

  renderAstReturn(ast, classes, key) {
    return <span className={this.className(ast, classes)} key={key}>
      <Kw>return</Kw>
      {this.renderAst(ast.value, ['returnValue'], 0)}
    </span>
  }

  renderAstSelected(ast, classes, key) {
    if(ast.ast)
      return this.renderAst(ast.ast, ['selected', ...classes], key)
    return <span className={this.className(ast, ['selected', ...classes])} key={key}>
      <EagerCursor />
    </span>
  }
}

export default RenderEcma
