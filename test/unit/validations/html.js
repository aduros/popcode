import test from 'tape';
import html from '../../../src/validations/html';
import validationTest from '../../helpers/validationTest';
import testValidatorAcceptance from '../../helpers/testValidatorAcceptance';

function htmlWithBody(body) {
  return `<!doctype html>
<html>
<body>
  ${body}
</body>
</html>
`;
}
htmlWithBody.offset = 3;

function htmlWithHead(head) {
  return `<!DOCTYPE html>
<html>
  <head>
    ${head}
  </head>
</html>`;
}
htmlWithHead.offset = 3;

test('empty body', validationTest(
  htmlWithBody(''),
  html,
));

test('banned attribute', validationTest(
  htmlWithBody('<p align="center"></p>'),
  html,
  {reason: 'banned-attributes.align', row: htmlWithBody.offset},
));

test('void tags without explicit close', validationTest(
  htmlWithBody('<img src="test.jpg">'),
  html,
));

test('missing doctype', validationTest(
  '<p>T</p>',
  html,
  {reason: 'doctype', row: 0},
));

test('unclosed <html> tag', validationTest(
  `<!DOCTYPE html>
<html>
  <head><title>Titlte</title></head>
  <body></body>`,
  html,
  {reason: 'unclosed-tag', row: 1, payload: {tag: 'html'}},
));

test('missing internal closing tag', validationTest(
  htmlWithBody('<div>'),
  html,
  {
    reason: 'mismatched-close-tag',
    row: htmlWithBody.offset + 1,
    payload: {open: 'div', close: 'body'},
  },
));

test('missing internal closing tag', validationTest(
  htmlWithBody('<p>'),
  html,
  {
    reason: 'mismatched-close-tag',
    row: htmlWithBody.offset + 1,
    payload: {open: 'p', close: 'body'},
  },
));

test('unfinished closing tag', validationTest(
  htmlWithBody('<div></div'),
  html,
  {
    reason: 'unterminated-close-tag',
    row: htmlWithBody.offset,
    payload: {tag: 'div'},
  },
));

test('mismatched closing tag', validationTest(
  htmlWithBody('<div></div></span>'),
  html,
  {
    reason: 'mismatched-close-tag',
    row: htmlWithBody.offset,
    payload: {open: 'body', close: 'span'},
  },
));

test('space inside HTML angle bracket', validationTest(
  htmlWithBody('< p>Content</p>'),
  html,
  {
    reason: 'space-before-tag-name',
    row: htmlWithBody.offset,
    payload: {tag: 'p'},
  },
));

test('lowercase attributes', validationTest(
  htmlWithBody('<div id="first">Content</div>'),
  html,
));

test('lowercase data attributes', validationTest(
  htmlWithBody('<div data-id="1">Content</div>'),
  html,
));

test('uppercase attributes', validationTest(
  htmlWithBody('<div ID="first">Content</div>'),
  html,
  {reason: 'lower-case-attribute-name', row: htmlWithBody.offset},
));

test('uppercase attributes', validationTest(
  htmlWithBody('<div data-ID="first">Content</div>'),
  html,
  {reason: 'lower-case-attribute-name', row: htmlWithBody.offset},
));

test('li not inside ul', validationTest(
  htmlWithBody('<li>Orphaned List Item</li>'),
  html,
  {
    reason: 'invalid-tag-parent',
    row: htmlWithBody.offset,
    payload: {tag: 'li', parent: '<ul>, <ol> and <menu> tags'},
  },
));

test('li inside div', validationTest(
  htmlWithBody('<div><li>List within span</li></div>'),
  html,
  {
    reason: 'invalid-tag-parent',
    row: htmlWithBody.offset,
    payload: {tag: 'li', parent: '<ul>, <ol> and <menu> tags'},
  },
));

test('li within ul', validationTest(
  htmlWithBody('<ul><li>List item</li></ul>'),
  html,
));

test('li within ol', validationTest(
  htmlWithBody('<ol><li>List item</li></ol>'),
  html,
));

test('div inside span', validationTest(
  htmlWithBody('<span><div>Block inside inline</div></span>'),
  html,
  {
    reason: 'invalid-tag-location',
    row: htmlWithBody.offset,
    payload: {tag: 'div', parent: 'span'},
  },
));

test('extra tag at end of doc', validationTest(
  `<!DOCTYPE html>
<html>
<head><title>Page Title</title></head>
<body></body>
</html>
</div>`,
  html,
  {reason: 'unexpected-close-tag', row: 5, payload: {tag: 'div'}},
));

test('malformed DOCTYPE that doesn’t parse', validationTest(
  '<!DOCT\n',
  html,
  {reason: 'doctype', row: 0},
));

test('missing title', validationTest(
  htmlWithHead(''),
  html,
  {reason: 'missing-title', row: htmlWithHead.offset - 1},
));

test('generates specific error when missing', validationTest(
  htmlWithHead('<title></title>'),
  html,
  {reason: 'empty-title-element', row: htmlWithHead.offset},
));

test('title with text', validationTest(
  htmlWithHead('<title>test</title>'),
  html,
));

test('acceptance', testValidatorAcceptance(html, 'html'));
