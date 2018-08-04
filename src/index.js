import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './ruby_syntax.css';
import registerServiceWorker from './registerServiceWorker';

class Keyword extends Component {
  render() {
    return <span className="keyword">{this.props.kw}</span>
  }
}
class Line extends Component {
  render() {
    return <span className="line">{this.props.children}</span>
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
    const handlerName = 'render'+ast.constructor.name
    if(handlerName in this)
      return this[handlerName](ast, classes, key)
    throw new Error(`No AST handler "${handlerName}" for ${this.constructor.name} syntax!`)
  }

  renderAstBegin(ast, classes, key) {
    return <div className={this.className(ast, classes)} key={key}>
      {ast.children.map((child, i) => this.renderAst(child, [], i))}
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
      <Line>
        <Keyword kw="class" />{constant}{superclass ? [" < ", superclass] : ""}
      </Line>
        {body}
      <Line>
        <Keyword kw="end" />
      </Line>
    </div>
  }
  renderAstModule(ast, classes, key) {
    const constant = this.renderAst(ast.constant, ['constant'], 0)
    const body     = this.renderAst(ast.body,     ['body'],     2)
    return <div className={this.className(ast, classes)} key={key}>
      <Line><Keyword kw="module" />{constant}</Line>
        {body}
      <Line><Keyword kw="end" /></Line>
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
      <Line>
        <Keyword kw="def" />
        <span className="message">{message}</span>
        {params.length ? '(' : ''}
        <span className="params">{params}</span>
        {params.length ? ')' : ''}
      </Line>
        {this.renderAst(ast.body, ['body'], 0)}
      <Line><Keyword kw="end" /></Line>
    </span>
  }

  renderAstAssign(ast, classes, key) {
    return <span className={this.className(ast, classes)} key={key}>
      <Line>
        {this.renderAst(ast.lhs, ['lhs'], 0)}
        {" = "}
        {this.renderAst(ast.rhs, ['rhs'], 2)}
      </Line>
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
      <Line>
        <Keyword kw="case" />
        {this.renderAst(ast.condition, ['condition'], 0)}
      </Line>
      <span className="whenClauses">
        {ast.whenClauses.map((clause, i) => this.renderAst(clause, [], i))}
      </span>
      <Line>
        <Keyword kw="end" />
      </Line>
    </span>
  }
  renderAstCaseWhen(ast, classes, key) {
    return <span className={this.className(ast, classes)} key={key}>
      <Line>
        <Keyword kw="when" />
        {this.renderAst(ast.condition, ['condition'], 0)}
      </Line>
      {this.renderAst(ast.body, ['body'], 0)}
    </span>
  }

  className(ast, classes) {
    return [...classes, 'Ast', ast.constructor.name.slice(3)].join(" ")
  }
  keyword(kw) {
    return <span class="keyword">{kw}</span>
  }
}

class Ast {
  constructor(...children) { this.children = children }
}
class AstBegin extends Ast {
}
class AstLiteral extends Ast {
  get value() { return this.children[0] }
}
class AstString extends AstLiteral {
}
class AstSymbol extends AstLiteral {
}
class AstCall extends Ast {
  get receiver()     { return this.children[0] }
  get message()      { return this.children[1] }
  get args()         { return this.children[2] }
}
class AstClass extends Ast {
  get constant()     { return this.children[0] }
  get superclass()   { return this.children[1] }
  get body()         { return this.children[2] }
}
class AstModule extends Ast {
  get constant()     { return this.children[0] }
  get body()         { return this.children[1] }
}
class AstConstant extends Ast {
  get namespace()    { return this.children[0] }
  get name()         { return this.children[1] }
}
class AstDef extends Ast {
  get receiver()     { return this.children[0] }
  get message()      { return this.children[1] }
  get params()       { return this.children[2] }
  get body()         { return this.children[3] }
}
class AstAssign extends Ast {
  get lhs()          { return this.children[0] }
  get rhs()          { return this.children[1] }
}
class AstInstanceVar extends Ast {
  get name()         { return this.children[0] }
}
class AstLocalVar extends Ast {
  get name()         { return this.children[0] }
}

class AstCase extends Ast {
  // should technically have an ELSE clause, too, but it's not part of my example
  get condition()    { return this.children[0] }
  get whenClauses()  { return this.children[1] }
}
class AstCaseWhen extends Ast {
  get condition()    { return this.children[0] }
  get body()         { return this.children[1] }
}


const ast = new AstBegin(
  new AstCall(
    null,
    "require",
    [new AstString("seeing_is_believing/event_stream/events")]
  ),
  new AstClass(
    new AstConstant(null, "SeeingIsBelieving"),
    null,
    new AstModule(
      new AstConstant(null, "EventStream"),
      new AstModule(
        new AstConstant(null, 'Handlers'),
        new AstClass(
          new AstConstant(null, 'RecordExitEvents'),
          null,
          new AstBegin(
            new AstCall(null, 'attr_reader', [new AstSymbol('exitstatus')]),
            new AstCall(null, 'attr_reader', [new AstSymbol('timeout_seconds')]),
            new AstDef(
              null,
              'initialize',
              ["next_observer"],
              new AstAssign(
                new AstInstanceVar("next_observer"),
                new AstLocalVar("next_observer"),
              ),
            ),
            new AstDef(
              null,
              "call",
              ["event"],
              new AstBegin(
                new AstCase(
                  new AstLocalVar('event'),
                  [ new AstCaseWhen(
                      new AstConstant(new AstConstant(null, 'Events'), 'ExitStatus'),
                      new AstAssign(
                        new AstInstanceVar('exitstatus'),
                        new AstCall(new AstLocalVar('event'), 'value', []),
                      )
                    ),
                    new AstCaseWhen(
                      new AstConstant(new AstConstant(null, 'Events'), 'Timeout'),
                      new AstAssign(
                        new AstInstanceVar('timeout_seconds'),
                        new AstCall(new AstLocalVar('event'), 'seconds', [])
                      ),
                    ),
                  ]
                ),
                new AstCall(
                  new AstInstanceVar('next_observer'),
                  'call',
                  [new AstLocalVar('event')]
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
