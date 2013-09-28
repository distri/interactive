(function() {
  var ErrorReporter, bindUpdates, createEditor, exec, findInteractiveElements, readShebang, runners;

  createEditor = function(code, shebang, section) {
    var annotationElement, contentElement, editorElement, exampleSection, runtimeElement;
    exampleSection = $("<li>", {
      "class": "example"
    });
    annotationElement = $("<div>", {
      "class": "annotation"
    });
    editorElement = $("<textarea>", {
      "class": "annotation",
      text: code
    });
    contentElement = $("<div>", {
      "class": "content"
    });
    runtimeElement = $("<div>", {
      "class": "output"
    });
    contentElement.append(runtimeElement);
    annotationElement.append(editorElement);
    exampleSection.append(annotationElement);
    exampleSection.append(contentElement);
    section.after(exampleSection);
    return bindUpdates(shebang, editorElement, runtimeElement);
  };

  bindUpdates = function(shebang, editorElement, runtimeElement) {
    return editorElement.on("keyup", function() {
      var e, report, source;
      report = ErrorReporter(editorElement);
      source = editorElement.val();
      try {
        runners[shebang]({
          editorElement: editorElement,
          source: source,
          runtimeElement: runtimeElement
        });
        return report.clear();
      } catch (_error) {
        e = _error;
        return report(e);
      }
    });
  };

  readShebang = function(source) {
    var match;
    if (match = source.match(/^\#\! (.*)\n/)) {
      return match[1];
    }
  };

  ErrorReporter = function(editor) {
    var reporter;
    reporter = function(error) {
      var errorParagraph;
      if (editor.next().is("p.error")) {
        return editor.next().text(error);
      } else {
        errorParagraph = $("<p>", {
          "class": "error",
          text: error.toString()
        });
        return editor.after(errorParagraph);
      }
    };
    reporter.clear = function() {
      if (editor.next().is("p.error")) {
        return editor.next().remove();
      }
    };
    return reporter;
  };

  findInteractiveElements = function() {
    return $("blockquote > pre > code").each(function() {
      var blockQuoteElement, code, codeElement, sectionElement, shebang;
      codeElement = $(this);
      code = codeElement.text();
      if (shebang = readShebang(code)) {
        if (!runners[shebang]) {
          return;
        }
        code = code.split("\n").slice(1).join("\n");
        blockQuoteElement = codeElement.parent().parent();
        sectionElement = blockQuoteElement.parent().parent();
        blockQuoteElement.remove();
        return createEditor(code, shebang, sectionElement);
      }
    });
  };

  runners = {};

  (typeof window !== "undefined" && window !== null ? window : global).Interactive = {
    register: function(name, runner) {
      runners[name] = runner;
      findInteractiveElements();
      return $('#container').on('keyup', 'textarea', function() {
        $(this).height(0);
        return $(this).height(this.scrollHeight);
      }).find('textarea').keyup();
    }
  };

  exec = function(_arg) {
    var code, editorElement, runtimeElement, source;
    source = _arg.source, code = _arg.code, editorElement = _arg.editorElement, runtimeElement = _arg.runtimeElement;
    runtimeElement.remove();
    editorElement.replaceWith($("<pre>", {
      text: source
    }));
    return setTimeout(function() {
      return Function(code)();
    }, 0);
  };

  Interactive.register("setup", function(params) {
    params.code = CoffeeScript.compile(params.source);
    return exec(params);
  });

  Interactive.register("setup-js", function(params) {
    params.code = params.source;
    return exec(params);
  });

  findInteractiveElements();

}).call(this);
