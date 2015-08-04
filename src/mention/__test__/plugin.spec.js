import React from 'react';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { initializePlugin } from 'mention/plugin';
import mentionReducer from 'mention/reducers/mentionReducer';
import dataSourceStatic from 'mention/reducers/__test__/fixtures/dataSourceStatic';
import initializeEditor from './fixtures/initializeEditor';
import { query, resetQuery, select, setEditor } from 'mention/actions/mentionActions';
import { removeMention } from 'mention/utils/tinyMCEUtils';

describe('TinyMCE Plugin', () => {

  var store;

  const miscKeyCodes = {
    'backspace': 8
  }

  const getKeyCode = (character) => character.charCodeAt(0);
  const getEditor = () => store.getState().editor;
  const getPlugin = () => window.mentionPlugin;
  const getState = () => store.getState();

  beforeEach((done) => {
    const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);

    store = createStoreWithMiddleware(mentionReducer, {
      dataSource: dataSourceStatic,
      highlightIndex: 0,
      mentions: [],
      query: ''
    });

    initializeEditor();
    initializePlugin(store, dataSourceStatic, '@');

    setTimeout(() => {
      getPlugin().store = store;
      store.dispatch(setEditor(window.tinymce.activeEditor));
      done();
    }, 0);
  });

  afterEach(() => {
    store.dispatch(resetQuery());
    window.tinymce.remove();
    React.unmountComponentAtNode(document.getElementById('root'));
  })

  it('should add keyboard event listeners', () => {
    expect(getEditor().hasEventListeners('keypress')).toBe(true);
    expect(getEditor().hasEventListeners('keyup')).toBe(true);
  });

  it('should start tracking input if delimiter pressed', () => {
    const editor = getEditor();

    editor.fire('keypress', {
      keyCode: getKeyCode('@')
    });

    expect(editor.hasEventListeners('keydown')).toBe(true);

    ['c', 'h', 'r', 'i', 's'].forEach((key) => {
      editor.fire('keydown', {
        keyCode: getKeyCode(key)
      });
    })

    expect(getState().query).toBe('chris');
  });

  it('should stop tracking input if prev char is space', () => {
    const editor = getEditor();

    // Start listening for input
    editor.fire('keypress', {
      keyCode: getKeyCode('@')
    });

    ['c', 'h', 'r', 'i', 's'].forEach((key) => {
      editor.fire('keydown', {
        keyCode: getKeyCode(key)
      });
    })

    expect(getState().query).toBe('chris');

    // Add space, unbind listeners
    editor.fire('keydown', {
      keyCode: getKeyCode(' ')
    });

    expect(getState().query).toBe('');

    // Test further input
    ['c', 'h', 'r', 'i', 's'].forEach((key) => {
      editor.fire('keydown', {
        keyCode: getKeyCode(key)
      });
    })

    expect(getState().query).toBe('');
  });

  it('should match closest @mention when backspace is pressed', () => {
    const initial = 'hello, how are you @chris ';
    const editor = getEditor();

    editor.setContent(initial);
    store.dispatch(query('chris'));
    store.dispatch(select())
    expect(getState().mentions).toEqual(['chris_pappas']);

    editor.fire('keyup', {
      keyCode: miscKeyCodes.backspace
    });

    // Ensure we're inside of the matched Mention
    // with a cursor position like `@chri|s`
    editor.fire('keyup', {
      keyCode: miscKeyCodes.backspace
    });

    expect(getState().mentions).toEqual([]);
    expect(editor.getContent({ format: 'text' }))
      .toEqual(initial.replace('@chris', '@').trim())
  });

});
