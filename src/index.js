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
      {ast.children.map(
        (child, i) => (<div key={i}>
          {this.renderAst(child, ast.childClasses[i], i)}
        </div>)
      )}
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
    const [receiverClass, messageClass, argsClass] = ast.childClasses
    const receiver = ast.receiver ? this.renderAst(ast.receiver, [receiverClass], 0) : null
    const message  = <span className={messageClass}>{ast.message}</span>
    const args     = <span className={argsClass}>
      {ast.args.map((arg, i) => this.renderAst(arg, [], i))}
    </span>
    return <span className={this.className(ast, classes)} key={key}>
      {receiver}{receiver ? "." : null}{message}({args})
    </span>
  }
  renderAstClass(ast, classes, key) {
    const [constantClass, superclassClass, bodyClass] = ast.childClasses
    const constant   = this.renderAst(ast.constant,   [constantClass],   0)
    const superclass = this.renderAst(ast.superclass, [superclassClass], 1)
    const body       = this.renderAst(ast.body,       [bodyClass],       2)
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
    const [constantClass, bodyClass] = ast.childClasses
    const constant   = this.renderAst(ast.constant,   [constantClass],   0)
    const body       = this.renderAst(ast.body,       [bodyClass],       2)
    return <div className={this.className(ast, classes)} key={key}>
      <Line><Keyword kw="module" />{constant}</Line>
        {body}
      <Line><Keyword kw="end" /></Line>
    </div>
  }
  renderAstConstant(ast, classes, key) {
    const [nsClass, nameClass] = ast.childClasses
    const ns   = ast.namespace ? this.renderAst(ast.namespace, [nsClass], 0) : null
    const name = this.renderAst(ast.name, [nameClass], 1)
    return <span className={this.className(ast, classes)} key={key}>
      {ns}{ns?"::":""}{name}
    </span>
  }
  renderAstDef(ast, classes, key) {
    if(ast.receiver)
      throw new Error("FIXME: Haven't implemented method definition receivers")

    const [_receiverClass, messageClass, paramsClass, bodyClass] = ast.childClasses
    const message = this.renderAst(ast.message, [messageClass], 1)
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
        <span className={messageClass}>{message}</span>
        {params.length ? '(' : ''}
        <span className={paramsClass}>{params}</span>
        {params.length ? ')' : ''}
      </Line>
        {this.renderAst(ast.body, [bodyClass], 0)}
      <Line><Keyword kw="end" /></Line>
    </span>
  }

  renderAstAssign(ast, classes, key) {
    const [lhsClass, rhsClass] = ast.childClasses
    return <span className={this.className(ast, classes)} key={key}>
      <Line>
        {this.renderAst(ast.lhs, [lhsClass], 0)}
        {" = "}
        {this.renderAst(ast.rhs, [rhsClass], 2)}
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
    const [conditionClass, whenClausesClass] = ast.childClasses
    return <span className={this.className(ast, classes)} key={key}>
      <Line>
        <Keyword kw="case" />
        {this.renderAst(ast.condition, [conditionClass], 0)}
      </Line>
      <span className={whenClausesClass}>
        {ast.whenClauses.map((clause, i) => this.renderAst(clause, [], i))}
      </span>
      <Line>
        <Keyword kw="end" />
      </Line>
    </span>
  }
  renderAstCaseWhen(ast, classes, key) {
    const [conditionClass, bodyClass] = ast.childClasses
    return <span className={this.className(ast, classes)} key={key}>
      <Line>
        <Keyword kw="when" />
        {this.renderAst(ast.condition, [conditionClass], 0)}
      </Line>
      {this.renderAst(ast.body, [bodyClass], 0)}
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
  constructor(...children) {
    this.children = children
  }
  get type()         { return 'generic' }
  get childClasses() { return new Array(this.children.length).fill("") }
  get isRoot()       { return false }
  get isLiteral()    { return false }
  get isAst()        { return true }
}
class AstBegin extends Ast {
  get type() { return 'begin' }
}
class AstLiteral extends Ast {
  get isLiteral() { return true }
  get value() { return this.children[0] }
}
class AstString extends AstLiteral {
  get type() { return 'string' }
}
class AstSymbol extends AstLiteral {
  get type() { return 'string' }
}
class AstCall extends Ast {
  get type()         { return 'call' }
  get childClasses() { return ['receiver', 'message', 'args'] }
  get receiver()     { return this.children[0] }
  get message()      { return this.children[1] }
  get args()         { return this.children[2] }
}
class AstClass extends Ast {
  get type()         { return 'class' }
  get childClasses() { return ['constant', 'superclass', 'body'] }
  get constant()     { return this.children[0] }
  get superclass()   { return this.children[1] }
  get body()         { return this.children[2] }
}
class AstModule extends Ast {
  get type()         { return 'class' }
  get childClasses() { return ['constant', 'body'] }
  get constant()     { return this.children[0] }
  get body()         { return this.children[1] }
}
class AstConstant extends Ast {
  get childClasses() { return ['namespace', 'name'] }
  get namespace()    { return this.children[0] }
  get name()         { return this.children[1] }
}
class AstDef extends Ast {
  get childClasses() { return ['receiver', 'message', 'params', 'body'] }
  get receiver()     { return this.children[0] }
  get message()      { return this.children[1] }
  get params()       { return this.children[2] }
  get body()         { return this.children[3] }
}
class AstAssign extends Ast {
  get childClasses() { return ['lhs', 'rhs'] }
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
  get childClasses() { return ['condition', 'whenClauses'] }
  get condition()    { return this.children[0] }
  get whenClauses()  { return this.children[1] }
}
class AstCaseWhen extends Ast {
  get childClasses() { return ['condition', 'body'] }
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
