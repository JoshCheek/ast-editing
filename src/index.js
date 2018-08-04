import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
// import App from './App';
import registerServiceWorker from './registerServiceWorker';

class Ruby extends Component {
  render() {
    return this.renderAst(this.props.ast, [], 0)
  }

  renderAst(ast, classes, key) {
    if(!ast) return null
    if(typeof ast === 'string') return ast
    return <div className={ast.className(classes)} key={key}>
      {ast.children.map(
        (child, i) => this.renderAst(child, ast.childClasses[i], i)
      )}
    </div>
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
  className(classes) {
    return [...classes, this.constructor.name.slice(3)].join(" ")
  }
}
class AstBegin extends Ast {
  get type() { return 'begin' }
}
class AstLiteral extends Ast {
  get isLiteral() { return true }
}
class AstString extends AstLiteral {
  get type() { return 'string' }
}
class AstSymbol extends AstLiteral {
  get type() { return 'string' }
}
class AstCall extends Ast {
  get type()         { return 'call' }
  get childClasses() { return ['receiver', 'name', 'args'] }
}
class AstClass extends Ast {
  get type()         { return 'class' }
  get childClasses() { return ['name', 'superclass', 'body'] }
}
class AstModule extends Ast {
  get type()         { return 'class' }
  get childClasses() { return ['name', 'body'] }
}
class AstConstant extends Ast {
  get childClasses() { return ['namespace', 'name'] }
}


const ast = new AstBegin(
  new AstCall(
    null,
    "require",
    new AstString("seeing_is_believing/event_stream/events")
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
            new AstCall(null, 'attr_reader', new AstSymbol('exitstatus')),
            new AstCall(null, 'attr_reader', new AstSymbol('timeout_seconds')),
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
