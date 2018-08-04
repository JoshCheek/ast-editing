import React, { Component } from 'react'
import Ast from './Ast.js'
import './syntax_ruby.css'

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
    return <span className="eagerCursor">
    </span>
  }
}

class RenderRuby extends Component {
  className(ast, classes) {
    return [...classes, 'Ast', ast.type.slice(3)].join(" ")
  }

  render() {
    return <div className="Ruby">
      <h2>Ruby syntax</h2>
      {this.renderAst(this.props.ast, [], 0)}
    </div>
  }

  renderAst(ast, classes, key) {
    if(!ast) return null
    if(typeof ast === 'string')
      return <span className={classes.join(" ")}>
        {ast}
      </span>
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

  renderAstString(ast, classes, key) {
    return <span className={this.className(ast, classes)} key={key}>
      "{ast.value}"
    </span>
  }

  renderAstSymbol(ast, classes, key) {
    return <span className={this.className(ast, classes)} key={key}>
      :{ast.value}
    </span>
  }

  renderAstCall(ast, classes, key) {
    const receiver = ast.receiver ? this.renderAst(ast.receiver, ['receiver'], 0) : null
    const message  = <span className="messageClass">{ast.message}</span>
    const args     = <span className="args">
      {ast.args.map((arg, i) => this.renderAst(arg, [], i))}
    </span>
    return <span className={this.className(ast, classes)} key={key}>
      {receiver}{receiver ? "." : null}{message}({args})
    </span>
  }

  renderAstClass(ast, classes, key) {
    const constant   = this.renderAst(ast.constant,   ['constant'],   0)
    const superclass = this.renderAst(ast.superclass, ['superclass'], 1)
    const body       = this.renderAst(ast.body,       ['body'],       2)
    return <span className={this.className(ast, classes)} key={key}>
      <Chunk>
        <Kw>class</Kw>{constant}{superclass?" < ":""}{superclass}
      </Chunk>
        {body}
      <Chunk>
        <Kw>end</Kw>
      </Chunk>
    </span>
  }

  renderAstModule(ast, classes, key) {
    return <span className={this.className(ast, classes)} key={key}>
      <Chunk>
        <Kw>module</Kw>
        {this.renderAst(ast.constant, ['constant'], 1)}
      </Chunk>
      {this.renderAst(ast.body, ['body'], 1)}
      <Chunk><Kw>end</Kw></Chunk>
    </span>
  }

  renderAstConstant(ast, classes, key) {
    const ns   = ast.namespace ? this.renderAst(ast.namespace, ['namespace'], 0) : null
    const name = this.renderAst(ast.name, ['name'], 1)
    return <span className={this.className(ast, classes)} key={key}>
      {ns}{ns?"::":""}{name}
    </span>
  }

  renderAstDef(ast, classes, key) {
    let params = []
    ast.params.forEach((param, i) => {
      params.push(this.renderAst(param, [], i))
      params.push(", ")
    })
    if(params[params.length-1] === ", ")
      params.pop()

    return <span className={this.className(ast, classes)} key={key}>
      <Chunk>
        <Kw>def</Kw>
        <span className="message">{this.renderAst(ast.message, [], 0)}</span>
        {params.length ? '(' : ''}
        <span className="params">{params}</span>
        {params.length ? ')' : ''}
      </Chunk>
      {this.renderAst(ast.body, ['body'], 0)}
      <Chunk>
        <Kw>end</Kw>
      </Chunk>
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

  renderAstInstanceVar(ast, classes, key) {
    return <span className={this.className(ast, classes)} key={key}>
      @{ast.name}
    </span>
  }

  renderAstLocalVar(ast, classes, key) {
    return <span className={this.className(ast, classes)} key={key}>
      {ast.name}
    </span>
  }

  renderAstCase(ast, classes, key) {
    return <span className={this.className(ast, classes)} key={key}>
      <Chunk>
        <Kw>case</Kw>
        {this.renderAst(ast.condition, ['condition'], 0)}
      </Chunk>
      <span className="whenClauses">
        {ast.whenClauses.map((clause, i) => this.renderAst(clause, [], i))}
      </span>
      <Chunk>
        <Kw>end</Kw>
      </Chunk>
    </span>
  }

  renderAstCaseWhen(ast, classes, key) {
    return <span className={this.className(ast, classes)} key={key}>
      <Chunk>
        <Kw>when</Kw>
        {this.renderAst(ast.condition, ['condition'], 0)}
      </Chunk>
      {this.renderAst(ast.body, ['body'], 0)}
    </span>
  }

  renderAstImport(ast, classes, key) {
    return this.renderAst(
      new Ast.AstCall(null, 'require', [ast.location]),
      classes,
      key
    )
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

export default RenderRuby
