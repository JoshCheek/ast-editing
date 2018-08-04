import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './ruby_syntax.css';
import registerServiceWorker from './registerServiceWorker';

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

class Ruby extends Component {
  render() {
    return <div className="Ruby">
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
    return <div className={this.className(ast, classes)} key={key}>
      {ast.map((child, i) => this.renderAst(child, [], i))}
    </div>
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
    return <div className={this.className(ast, classes)} key={key}>
      <Chunk>
        <Kw>class</Kw>{constant}{superclass ? [" < ", superclass] : ""}
      </Chunk>
        {body}
      <Chunk>
        <Kw>end</Kw>
      </Chunk>
    </div>
  }
  renderAstModule(ast, classes, key) {
    const constant = this.renderAst(ast.constant, ['constant'], 0)
    const body     = this.renderAst(ast.body,     ['body'],     2)
    return <div className={this.className(ast, classes)} key={key}>
      <Chunk><Kw>module</Kw>{constant}</Chunk>
        {body}
        <Chunk><Kw>end</Kw></Chunk>
    </div>
  }
  renderAstConstant(ast, classes, key) {
    const ns   = ast.namespace ? this.renderAst(ast.namespace, ['namespace'], 0) : null
    const name = this.renderAst(ast.name, ['name'], 1)
    return <span className={this.className(ast, classes)} key={key}>
      {ns}{ns?"::":""}{name}
    </span>
  }
  renderAstDef(ast, classes, key) {
    if(ast.receiver)
      throw new Error("FIXME: Haven't implemented method definition receivers")

    const message = this.renderAst(ast.message, ['message'], 1)
    let   params  = []
    ast.params.forEach((param, i) => {
      params.push(this.renderAst(param, [], i))
      params.push(", ")
    })
    if(params[params.length-1] === ", ")
      params.pop()

    return <span className={this.className(ast, classes)} key={key}>
      <Chunk>
        <Kw>def</Kw>
        <span className="message">{message}</span>
        {params.length ? '(' : ''}
        <span className="params">{params}</span>
        {params.length ? ')' : ''}
      </Chunk>
        {this.renderAst(ast.body, ['body'], 0)}
        <Chunk><Kw>end</Kw></Chunk>
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

  className(ast, classes) {
    return [...classes, 'Ast', ast.type.slice(3)].join(" ")
  }
  keyword(kw) {
    return <span class="keyword">{kw}</span>
  }
}

const AST_SIGNATURES = {
  AstBegin:       [],
  AstString:      ['value'],
  AstSymbol:      ['value'],
  AstCall:        ['receiver', 'message', 'args'],
  AstClass:       ['constant', 'superclass', 'body'],
  AstModule:      ['constant', 'body'],
  AstConstant:    ['namespace', 'name'],
  AstDef:         ['receiver', 'message', 'params', 'body'],
  AstAssign:      ['lhs', 'rhs'],
  AstInstanceVar: ['name'],
  AstLocalVar:    ['name'],
  AstCase:        ['condition', 'whenClauses'], // should technically have an ELSE clause, too, but it's not part of my example
  AstCaseWhen:    ['condition', 'body'],
}

const Ast = {}

for (let className in AST_SIGNATURES) {
  let childNames = AST_SIGNATURES[className]
  Ast[className] = function() {
    const ast = new Array(...arguments)
    ast.type = className
    childNames.forEach((childName, i) => {
      Object.defineProperty(
        ast,
        childName,
        {get: function() { return this[i] }}
      )
    })
    return ast
  }
}


const ast = Ast.AstBegin(
  Ast.AstCall(
    null,
    "require",
    [new Ast.AstString("seeing_is_believing/event_stream/events")]
  ),
  Ast.AstClass(
    Ast.AstConstant(null, "SeeingIsBelieving"),
    null,
    Ast.AstModule(
      Ast.AstConstant(null, "EventStream"),
      Ast.AstModule(
        Ast.AstConstant(null, 'Handlers'),
        Ast.AstClass(
          Ast.AstConstant(null, 'RecordExitEvents'),
          null,
          Ast.AstBegin(
            Ast.AstCall(null, 'attr_reader', [Ast.AstSymbol('exitstatus')]),
            Ast.AstCall(null, 'attr_reader', [Ast.AstSymbol('timeout_seconds')]),
            Ast.AstDef(
              null,
              'initialize',
              ["next_observer"],
              Ast.AstAssign(
                Ast.AstInstanceVar("next_observer"),
                Ast.AstLocalVar("next_observer"),
              ),
            ),
            Ast.AstDef(
              null,
              "call",
              ["event"],
              Ast.AstBegin(
                Ast.AstCase(
                  Ast.AstLocalVar('event'),
                  [ Ast.AstCaseWhen(
                      Ast.AstConstant(Ast.AstConstant(null, 'Events'), 'ExitStatus'),
                      Ast.AstAssign(
                        Ast.AstInstanceVar('exitstatus'),
                        Ast.AstCall(Ast.AstLocalVar('event'), 'value', []),
                      )
                    ),
                    Ast.AstCaseWhen(
                      Ast.AstConstant(Ast.AstConstant(null, 'Events'), 'Timeout'),
                      Ast.AstAssign(
                        Ast.AstInstanceVar('timeout_seconds'),
                        Ast.AstCall(Ast.AstLocalVar('event'), 'seconds', [])
                      ),
                    ),
                  ]
                ),
                Ast.AstCall(
                  Ast.AstInstanceVar('next_observer'),
                  'call',
                  [Ast.AstLocalVar('event')]
                )
              )
            ),
          ),
        ),
      ),
    ),
  ),
)
const position = []

renderUpdate()
function renderUpdate() {
  ReactDOM.render(
    <div>
      <Ruby ast={ast}/>
    </div>,
    document.getElementById('root')
  )
}

registerServiceWorker();
