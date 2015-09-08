'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactTinymce = require('react-tinymce');

var _reactTinymce2 = _interopRequireDefault(_reactTinymce);

var _Mention = require('./Mention');

var _Mention2 = _interopRequireDefault(_Mention);

var plugins = ['autolink', 'autoresize', 'code', 'image', 'link', 'media', 'mention', 'tabfocus'];

var initialContent = '';

_react2['default'].render(_react2['default'].createElement(
  'div',
  null,
  _react2['default'].createElement(_reactTinymce2['default'], {
    content: initialContent,
    config: {
      extended_valid_elements: 'blockquote[dir|style|cite|class|dir<ltr?rtl],iframe[src|frameborder|style|scrolling|class|width|height|name|align],pre',
      menubar: false,
      plugins: plugins.join(','),
      skin: 'kindling',
      statusbar: false,
      theme: 'kindling',
      toolbar: 'bold italic underline strikethrough | bullist numlist blockquote | link unlink | image media | removeformat code'
    }
  }),
  _react2['default'].createElement(_Mention2['default'], {
    dataSource: axios.get('/examples/shared/api/complex.json'),
    delimiter: '@',
    showDebugger: true,
    customRTEMention: function (props) {
      var tinymceId = props.tinymceId;
      var displayLabel = props.displayLabel;

      return _react2['default'].createElement(
        'span',
        null,
        _react2['default'].createElement(
          'a',
          { href: '#', id: tinymceId, className: 'tinymce-mention' },
          '@',
          displayLabel
        ),
        ' '
      );
    },
    transformFn: function (dataSource) {
      var complexDataSource = dataSource.data.map(function (result) {
        var fullName = result.fullName;

        return {
          searchKey: fullName,
          displayLabel: fullName
        };
      });

      return complexDataSource;
    },
    onAdd: function (_ref) {
      var mentions = _ref.mentions;
      var changed = _ref.changed;
      return console.log('Added', mentions, changed);
    },
    onRemove: function (_ref2) {
      var mentions = _ref2.mentions;
      var changed = _ref2.changed;
      return console.log('Removed', mentions, changed);
    }
  })
), document.getElementById('mentions'));