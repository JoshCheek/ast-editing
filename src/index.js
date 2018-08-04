import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import RenderRuby from './RenderRuby.js';
import './index.css';
import registerServiceWorker from './registerServiceWorker';
import {Ast, exampleAst} from './Ast.js'


const ast = exampleAst
const position = []

renderUpdate()
function renderUpdate() {
  ReactDOM.render(
    <div>
      <RenderRuby ast={ast}/>
    </div>,
    document.getElementById('root')
  )
}

registerServiceWorker();
