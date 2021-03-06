var contentPattern = '&&<>&&'

function contentFor(contentName) {
  return contentPattern + contentName + contentPattern
}

function parseScripts(locals) {
  var str = locals.body
  locals.script = ''
  
  var regex = /\<script(.|\n)*?\>(.|\n)*?\<\/script\>/g
  if (regex.test(str)) {
    locals.body = str.replace(regex, '');
    locals.script = str.match(regex).join('\n');
  }
}

function parseStyles(locals) {
  var str = locals.body
  locals.style = ''
  
  var regex = /\<link(.|\n)*?\>/g;
  if (regex.test(str)) {
    locals.body = str.replace(regex, '');
    locals.style = str.match(regex).join('\n');
  }
}

module.exports = exports = function(req, res, next) {
  var render = res.render;
  
  res.render = function(view, options, fn) {
    
    var options = options || {};
    
    // support callback function as second arg
    if ('function' == typeof options) {
      fn = options, options = {};
    }
    
    var app = req.app
    var defaultLayout = app.get('layout')
    var specifiedLayout = options.layout
    
    if (specifiedLayout === false || ((specifiedLayout || defaultLayout) === false) ) {
      render.call(res, view, options, fn)
      return
    }

    var layout = specifiedLayout || defaultLayout
    if (layout === true || layout === undefined)
      layout = 'layout'
    
    options.contentFor = contentFor
    
    var self = this;
    render.call(res, view, options, function(err, str){ 
      
      if (err) {
        if (fn)
          return fn(err)
        else
          throw err
      }
      
      var locals = { body: str }
      for (var l in options) {
        if (options.hasOwnProperty(l)
          && l != 'layout'
          && l != 'contentFor')
          locals[l] = options[l];
      }
      parseStyles(locals);
      parseScripts(locals);
      
      render.call(self, layout, locals, fn);
    });
  };
  
  next();
};