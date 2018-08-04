const ASTS = {
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
}

for (let k in ASTS) {
  console.log(k, ASTS[k])
}
