var _ = require('lodash');
var FS = require('fs');
var EJS = require('ejs');

module.exports = CodeTemplate = function(opts) {
  this.language = opts.language;
  this.accessor = '.';
  this.objSuffix = '()';
  this.statementSuffix = ';';
  this.enumPrefix = this.objPrefix = this.enumAccesor = this.declaration = this.variablePrefix = '';
  this.rewriteVariable = this.rewriteAction = this.rewriteService = function(s) {return s};
  this.getValue = JSON.stringify;
  this.indent = '';
  if (opts.language === 'javascript' || opts.language === 'node') {
    this.declaration = 'var ';
    this.objPrefix = 'new ';
    this.ext = 'js';
  }
  if (opts.language === 'node') {
    this.enumPrefix = 'Kaltura.enums.';
    this.objPrefix = 'new Kaltura.objects.';
  } else if (opts.language === 'php') {
    this.objPrefix = 'new ';
    this.accessor = '->';
    this.enumAccessor = '::';
    this.ext = 'php';
    this.variablePrefix = '$';
    this.indent = '  ';
  } else if (opts.language === 'ruby') {
    this.ext = 'rb';
    this.enumAccessor = '::';
    this.objSuffix = '.new()';
    this.statementSuffix = '';
    this.rewriteVariable = function(v) {
      return v.replace(/([a-z])([A-Z])/g, function(whole, lower, upper) {
        return lower + '_' + upper.toLowerCase();
      })
    }
    this.rewriteAction = function(a) {
      if (a.indexOf('Action') !== -1) a = a.substring(0, a.length - 6);
      return this.rewriteVariable(a);
    }
    this.rewriteService = function(s) {
      return this.rewriteVariable(s) + '_service';
    }
  }
}

CodeTemplate.prototype.reload = function() {
  this.template = FS.readFileSync(__dirname + '/' + this.language + '.ejs.' + this.ext, 'utf8')
}

CodeTemplate.prototype.render = function(params) {
  params.answers = params.answers || {};
  params.answers.partnerId = params.answers.partnerId || 'YOUR_PARTNER_ID';
  params.answers.secret = params.answers.secret || 'YOUR_KALTURA_SECRET';
  params.answers.userId = params.answers.userId || 'YOUR_USER_ID';
  return EJS.render(this.template, _.extend({helper: this}, params)).trim();
}

CodeTemplate.prototype.getFieldSetter = function(field, parents, answers) {
  var self = this;
  var answerName = '';
  parents.forEach(function(p) {
    if (!answerName) answerName += p
    else answerName += '[' + p + ']'
  });
  var parentObjType = answers[answerName + '[objectType]'];
  if (field.objectType && parentObjType !== field.objectType) return;
  answerName += '[' + field.name + ']';

  var setter = this.variablePrefix;
  setter += (parents.length ? parents.map(self.rewriteVariable).join(self.accessor) + self.accessor : self.declaration);
  setter += self.rewriteVariable(field.name) + ' = ';

  if (field.type.indexOf('Kaltura') === 0) {
    fieldObjType = answers[answerName + '[objectType]'];
    if (parents.length && fieldObjType === undefined) return;
    setter += self.objPrefix + (fieldObjType || field.type) + self.objSuffix;
    subsetters = field.fields.map(function(f) {
      return self.getFieldSetter(f, parents.concat([field.name]), answers);
    }).filter(function(s) {return s});
    return setter + self.statementSuffix + '\n' + self.indent + subsetters.join('\n' + self.indent)
  } else {
    answer = answers[answerName];
    if (answer === undefined) return;
    if (!field.enum) {
      setter += self.getValue(answer);
    } else {
      for (var valName in field.enum.values) {
        if (field.enum.values[valName] === answer) {
          setter += self.enumPrefix + field.enum.name + (self.enumAccessor || self.accessor) + valName;
          break;
        }
      }
    }
  }
  return setter + self.statementSuffix;
}

