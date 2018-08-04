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
export default Ast

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

export let exampleAst = Ast.AstBegin(
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
