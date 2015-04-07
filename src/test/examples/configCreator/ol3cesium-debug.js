// Ol3-Cesium. See https://github.com/openlayers/ol3-cesium/
// License: https://github.com/openlayers/ol3-cesium/blob/master/LICENSE
// Version: v1.2-17-gd6c588d

var CLOSURE_NO_DEPS = true;
// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Bootstrap for the Google JS Library (Closure).
 *
 * In uncompiled mode base.js will write out Closure's deps file, unless the
 * global <code>CLOSURE_NO_DEPS</code> is set to true.  This allows projects to
 * include their own deps file(s) from different locations.
 *
 *
 * @provideGoog
 */


/**
 * @define {boolean} Overridden to true by the compiler when --closure_pass
 *     or --mark_as_compiled is specified.
 */
var COMPILED = false;


/**
 * Base namespace for the Closure library.  Checks to see goog is already
 * defined in the current scope before assigning to prevent clobbering if
 * base.js is loaded more than once.
 *
 * @const
 */
var goog = goog || {};


/**
 * Reference to the global context.  In most cases this will be 'window'.
 */
goog.global = this;


/**
 * A hook for overriding the define values in uncompiled mode.
 *
 * In uncompiled mode, {@code CLOSURE_UNCOMPILED_DEFINES} may be defined before
 * loading base.js.  If a key is defined in {@code CLOSURE_UNCOMPILED_DEFINES},
 * {@code goog.define} will use the value instead of the default value.  This
 * allows flags to be overwritten without compilation (this is normally
 * accomplished with the compiler's "define" flag).
 *
 * Example:
 * <pre>
 *   var CLOSURE_UNCOMPILED_DEFINES = {'goog.DEBUG': false};
 * </pre>
 *
 * @type {Object.<string, (string|number|boolean)>|undefined}
 */
goog.global.CLOSURE_UNCOMPILED_DEFINES;


/**
 * A hook for overriding the define values in uncompiled or compiled mode,
 * like CLOSURE_UNCOMPILED_DEFINES but effective in compiled code.  In
 * uncompiled code CLOSURE_UNCOMPILED_DEFINES takes precedence.
 *
 * Also unlike CLOSURE_UNCOMPILED_DEFINES the values must be number, boolean or
 * string literals or the compiler will emit an error.
 *
 * While any @define value may be set, only those set with goog.define will be
 * effective for uncompiled code.
 *
 * Example:
 * <pre>
 *   var CLOSURE_DEFINES = {'goog.DEBUG': false};
 * </pre>
 *
 * @type {Object.<string, (string|number|boolean)>|undefined}
 */
goog.global.CLOSURE_DEFINES;


/**
 * Returns true if the specified value is not undefined.
 * WARNING: Do not use this to test if an object has a property. Use the in
 * operator instead.
 *
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is defined.
 */
goog.isDef = function(val) {
  // void 0 always evaluates to undefined and hence we do not need to depend on
  // the definition of the global variable named 'undefined'.
  return val !== void 0;
};


/**
 * Builds an object structure for the provided namespace path, ensuring that
 * names that already exist are not overwritten. For example:
 * "a.b.c" -> a = {};a.b={};a.b.c={};
 * Used by goog.provide and goog.exportSymbol.
 * @param {string} name name of the object that this file defines.
 * @param {*=} opt_object the object to expose at the end of the path.
 * @param {Object=} opt_objectToExportTo The object to add the path to; default
 *     is |goog.global|.
 * @private
 */
goog.exportPath_ = function(name, opt_object, opt_objectToExportTo) {
  var parts = name.split('.');
  var cur = opt_objectToExportTo || goog.global;

  // Internet Explorer exhibits strange behavior when throwing errors from
  // methods externed in this manner.  See the testExportSymbolExceptions in
  // base_test.html for an example.
  if (!(parts[0] in cur) && cur.execScript) {
    cur.execScript('var ' + parts[0]);
  }

  // Certain browsers cannot parse code in the form for((a in b); c;);
  // This pattern is produced by the JSCompiler when it collapses the
  // statement above into the conditional loop below. To prevent this from
  // happening, use a for-loop and reserve the init logic as below.

  // Parentheses added to eliminate strict JS warning in Firefox.
  for (var part; parts.length && (part = parts.shift());) {
    if (!parts.length && goog.isDef(opt_object)) {
      // last part and we have an object; use it
      cur[part] = opt_object;
    } else if (cur[part]) {
      cur = cur[part];
    } else {
      cur = cur[part] = {};
    }
  }
};


/**
 * Defines a named value. In uncompiled mode, the value is retreived from
 * CLOSURE_DEFINES or CLOSURE_UNCOMPILED_DEFINES if the object is defined and
 * has the property specified, and otherwise used the defined defaultValue.
 * When compiled, the default can be overridden using compiler command-line
 * options.
 *
 * @param {string} name The distinguished name to provide.
 * @param {string|number|boolean} defaultValue
 */
goog.define = function(name, defaultValue) {
  var value = defaultValue;
  if (!COMPILED) {
    if (goog.global.CLOSURE_UNCOMPILED_DEFINES &&
        Object.prototype.hasOwnProperty.call(
            goog.global.CLOSURE_UNCOMPILED_DEFINES, name)) {
      value = goog.global.CLOSURE_UNCOMPILED_DEFINES[name];
    } else if (goog.global.CLOSURE_DEFINES &&
        Object.prototype.hasOwnProperty.call(
            goog.global.CLOSURE_DEFINES, name)) {
      value = goog.global.CLOSURE_DEFINES[name];
    }
  }
  goog.exportPath_(name, value);
};


/**
 * @define {boolean} DEBUG is provided as a convenience so that debugging code
 * that should not be included in a production js_binary can be easily stripped
 * by specifying --define goog.DEBUG=false to the JSCompiler. For example, most
 * toString() methods should be declared inside an "if (goog.DEBUG)" conditional
 * because they are generally used for debugging purposes and it is difficult
 * for the JSCompiler to statically determine whether they are used.
 */
goog.DEBUG = true;


/**
 * @define {string} LOCALE defines the locale being used for compilation. It is
 * used to select locale specific data to be compiled in js binary. BUILD rule
 * can specify this value by "--define goog.LOCALE=<locale_name>" as JSCompiler
 * option.
 *
 * Take into account that the locale code format is important. You should use
 * the canonical Unicode format with hyphen as a delimiter. Language must be
 * lowercase, Language Script - Capitalized, Region - UPPERCASE.
 * There are few examples: pt-BR, en, en-US, sr-Latin-BO, zh-Hans-CN.
 *
 * See more info about locale codes here:
 * http://www.unicode.org/reports/tr35/#Unicode_Language_and_Locale_Identifiers
 *
 * For language codes you should use values defined by ISO 693-1. See it here
 * http://www.w3.org/WAI/ER/IG/ert/iso639.htm. There is only one exception from
 * this rule: the Hebrew language. For legacy reasons the old code (iw) should
 * be used instead of the new code (he), see http://wiki/Main/IIISynonyms.
 */
goog.define('goog.LOCALE', 'en');  // default to en


/**
 * @define {boolean} Whether this code is running on trusted sites.
 *
 * On untrusted sites, several native functions can be defined or overridden by
 * external libraries like Prototype, Datejs, and JQuery and setting this flag
 * to false forces closure to use its own implementations when possible.
 *
 * If your JavaScript can be loaded by a third party site and you are wary about
 * relying on non-standard implementations, specify
 * "--define goog.TRUSTED_SITE=false" to the JSCompiler.
 */
goog.define('goog.TRUSTED_SITE', true);


/**
 * @define {boolean} Whether a project is expected to be running in strict mode.
 *
 * This define can be used to trigger alternate implementations compatible with
 * running in EcmaScript Strict mode or warn about unavailable functionality.
 * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions_and_function_scope/Strict_mode
 */
goog.define('goog.STRICT_MODE_COMPATIBLE', false);


/**
 * Creates object stubs for a namespace.  The presence of one or more
 * goog.provide() calls indicate that the file defines the given
 * objects/namespaces.  Provided objects must not be null or undefined.
 * Build tools also scan for provide/require statements
 * to discern dependencies, build dependency files (see deps.js), etc.
 * @see goog.require
 * @param {string} name Namespace provided by this file in the form
 *     "goog.package.part".
 */
goog.provide = function(name) {
  if (!COMPILED) {
    // Ensure that the same namespace isn't provided twice. This is intended
    // to teach new developers that 'goog.provide' is effectively a variable
    // declaration. And when JSCompiler transforms goog.provide into a real
    // variable declaration, the compiled JS should work the same as the raw
    // JS--even when the raw JS uses goog.provide incorrectly.
    if (goog.isProvided_(name)) {
      throw Error('Namespace "' + name + '" already declared.');
    }
    delete goog.implicitNamespaces_[name];

    var namespace = name;
    while ((namespace = namespace.substring(0, namespace.lastIndexOf('.')))) {
      if (goog.getObjectByName(namespace)) {
        break;
      }
      goog.implicitNamespaces_[namespace] = true;
    }
  }

  goog.exportPath_(name);
};


/**
 * Marks that the current file should only be used for testing, and never for
 * live code in production.
 *
 * In the case of unit tests, the message may optionally be an exact namespace
 * for the test (e.g. 'goog.stringTest'). The linter will then ignore the extra
 * provide (if not explicitly defined in the code).
 *
 * @param {string=} opt_message Optional message to add to the error that's
 *     raised when used in production code.
 */
goog.setTestOnly = function(opt_message) {
  if (COMPILED && !goog.DEBUG) {
    opt_message = opt_message || '';
    throw Error('Importing test-only code into non-debug environment' +
                (opt_message ? ': ' + opt_message : '.'));
  }
};


/**
 * Forward declares a symbol. This is an indication to the compiler that the
 * symbol may be used in the source yet is not required and may not be provided
 * in compilation.
 *
 * The most common usage of forward declaration is code that takes a type as a
 * function parameter but does not need to require it. By forward declaring
 * instead of requiring, no hard dependency is made, and (if not required
 * elsewhere) the namespace may never be required and thus, not be pulled
 * into the JavaScript binary. If it is required elsewhere, it will be type
 * checked as normal.
 *
 *
 * @param {string} name The namespace to forward declare in the form of
 *     "goog.package.part".
 */
goog.forwardDeclare = function(name) {};


if (!COMPILED) {

  /**
   * Check if the given name has been goog.provided. This will return false for
   * names that are available only as implicit namespaces.
   * @param {string} name name of the object to look for.
   * @return {boolean} Whether the name has been provided.
   * @private
   */
  goog.isProvided_ = function(name) {
    return !goog.implicitNamespaces_[name] &&
        goog.isDefAndNotNull(goog.getObjectByName(name));
  };

  /**
   * Namespaces implicitly defined by goog.provide. For example,
   * goog.provide('goog.events.Event') implicitly declares that 'goog' and
   * 'goog.events' must be namespaces.
   *
   * @type {Object}
   * @private
   */
  goog.implicitNamespaces_ = {};
}


/**
 * Returns an object based on its fully qualified external name.  The object
 * is not found if null or undefined.  If you are using a compilation pass that
 * renames property names beware that using this function will not find renamed
 * properties.
 *
 * @param {string} name The fully qualified name.
 * @param {Object=} opt_obj The object within which to look; default is
 *     |goog.global|.
 * @return {?} The value (object or primitive) or, if not found, null.
 */
goog.getObjectByName = function(name, opt_obj) {
  var parts = name.split('.');
  var cur = opt_obj || goog.global;
  for (var part; part = parts.shift(); ) {
    if (goog.isDefAndNotNull(cur[part])) {
      cur = cur[part];
    } else {
      return null;
    }
  }
  return cur;
};


/**
 * Globalizes a whole namespace, such as goog or goog.lang.
 *
 * @param {Object} obj The namespace to globalize.
 * @param {Object=} opt_global The object to add the properties to.
 * @deprecated Properties may be explicitly exported to the global scope, but
 *     this should no longer be done in bulk.
 */
goog.globalize = function(obj, opt_global) {
  var global = opt_global || goog.global;
  for (var x in obj) {
    global[x] = obj[x];
  }
};


/**
 * Adds a dependency from a file to the files it requires.
 * @param {string} relPath The path to the js file.
 * @param {Array} provides An array of strings with the names of the objects
 *                         this file provides.
 * @param {Array} requires An array of strings with the names of the objects
 *                         this file requires.
 */
goog.addDependency = function(relPath, provides, requires) {
  if (goog.DEPENDENCIES_ENABLED) {
    var provide, require;
    var path = relPath.replace(/\\/g, '/');
    var deps = goog.dependencies_;
    for (var i = 0; provide = provides[i]; i++) {
      deps.nameToPath[provide] = path;
      if (!(path in deps.pathToNames)) {
        deps.pathToNames[path] = {};
      }
      deps.pathToNames[path][provide] = true;
    }
    for (var j = 0; require = requires[j]; j++) {
      if (!(path in deps.requires)) {
        deps.requires[path] = {};
      }
      deps.requires[path][require] = true;
    }
  }
};




// NOTE(nnaze): The debug DOM loader was included in base.js as an original way
// to do "debug-mode" development.  The dependency system can sometimes be
// confusing, as can the debug DOM loader's asynchronous nature.
//
// With the DOM loader, a call to goog.require() is not blocking -- the script
// will not load until some point after the current script.  If a namespace is
// needed at runtime, it needs to be defined in a previous script, or loaded via
// require() with its registered dependencies.
// User-defined namespaces may need their own deps file.  See http://go/js_deps,
// http://go/genjsdeps, or, externally, DepsWriter.
// https://developers.google.com/closure/library/docs/depswriter
//
// Because of legacy clients, the DOM loader can't be easily removed from
// base.js.  Work is being done to make it disableable or replaceable for
// different environments (DOM-less JavaScript interpreters like Rhino or V8,
// for example). See bootstrap/ for more information.


/**
 * @define {boolean} Whether to enable the debug loader.
 *
 * If enabled, a call to goog.require() will attempt to load the namespace by
 * appending a script tag to the DOM (if the namespace has been registered).
 *
 * If disabled, goog.require() will simply assert that the namespace has been
 * provided (and depend on the fact that some outside tool correctly ordered
 * the script).
 */
goog.define('goog.ENABLE_DEBUG_LOADER', true);


/**
 * Implements a system for the dynamic resolution of dependencies that works in
 * parallel with the BUILD system. Note that all calls to goog.require will be
 * stripped by the JSCompiler when the --closure_pass option is used.
 * @see goog.provide
 * @param {string} name Namespace to include (as was given in goog.provide()) in
 *     the form "goog.package.part".
 */
goog.require = function(name) {

  // If the object already exists we do not need do do anything.
  // TODO(arv): If we start to support require based on file name this has to
  //            change.
  // TODO(arv): If we allow goog.foo.* this has to change.
  // TODO(arv): If we implement dynamic load after page load we should probably
  //            not remove this code for the compiled output.
  if (!COMPILED) {
    if (goog.isProvided_(name)) {
      return;
    }

    if (goog.ENABLE_DEBUG_LOADER) {
      var path = goog.getPathFromDeps_(name);
      if (path) {
        goog.included_[path] = true;
        goog.writeScripts_();
        return;
      }
    }

    var errorMessage = 'goog.require could not find: ' + name;
    if (goog.global.console) {
      goog.global.console['error'](errorMessage);
    }


      throw Error(errorMessage);

  }
};


/**
 * Path for included scripts.
 * @type {string}
 */
goog.basePath = '';


/**
 * A hook for overriding the base path.
 * @type {string|undefined}
 */
goog.global.CLOSURE_BASE_PATH;


/**
 * Whether to write out Closure's deps file. By default, the deps are written.
 * @type {boolean|undefined}
 */
goog.global.CLOSURE_NO_DEPS;


/**
 * A function to import a single script. This is meant to be overridden when
 * Closure is being run in non-HTML contexts, such as web workers. It's defined
 * in the global scope so that it can be set before base.js is loaded, which
 * allows deps.js to be imported properly.
 *
 * The function is passed the script source, which is a relative URI. It should
 * return true if the script was imported, false otherwise.
 * @type {(function(string): boolean)|undefined}
 */
goog.global.CLOSURE_IMPORT_SCRIPT;


/**
 * Null function used for default values of callbacks, etc.
 * @return {void} Nothing.
 */
goog.nullFunction = function() {};


/**
 * The identity function. Returns its first argument.
 *
 * @param {*=} opt_returnValue The single value that will be returned.
 * @param {...*} var_args Optional trailing arguments. These are ignored.
 * @return {?} The first argument. We can't know the type -- just pass it along
 *      without type.
 * @deprecated Use goog.functions.identity instead.
 */
goog.identityFunction = function(opt_returnValue, var_args) {
  return opt_returnValue;
};


/**
 * When defining a class Foo with an abstract method bar(), you can do:
 * Foo.prototype.bar = goog.abstractMethod
 *
 * Now if a subclass of Foo fails to override bar(), an error will be thrown
 * when bar() is invoked.
 *
 * Note: This does not take the name of the function to override as an argument
 * because that would make it more difficult to obfuscate our JavaScript code.
 *
 * @type {!Function}
 * @throws {Error} when invoked to indicate the method should be overridden.
 */
goog.abstractMethod = function() {
  throw Error('unimplemented abstract method');
};


/**
 * Adds a {@code getInstance} static method that always returns the same
 * instance object.
 * @param {!Function} ctor The constructor for the class to add the static
 *     method to.
 */
goog.addSingletonGetter = function(ctor) {
  ctor.getInstance = function() {
    if (ctor.instance_) {
      return ctor.instance_;
    }
    if (goog.DEBUG) {
      // NOTE: JSCompiler can't optimize away Array#push.
      goog.instantiatedSingletons_[goog.instantiatedSingletons_.length] = ctor;
    }
    return ctor.instance_ = new ctor;
  };
};


/**
 * All singleton classes that have been instantiated, for testing. Don't read
 * it directly, use the {@code goog.testing.singleton} module. The compiler
 * removes this variable if unused.
 * @type {!Array.<!Function>}
 * @private
 */
goog.instantiatedSingletons_ = [];


/**
 * True if goog.dependencies_ is available.
 * @const {boolean}
 */
goog.DEPENDENCIES_ENABLED = !COMPILED && goog.ENABLE_DEBUG_LOADER;


if (goog.DEPENDENCIES_ENABLED) {
  /**
   * Object used to keep track of urls that have already been added. This record
   * allows the prevention of circular dependencies.
   * @type {Object}
   * @private
   */
  goog.included_ = {};


  /**
   * This object is used to keep track of dependencies and other data that is
   * used for loading scripts.
   * @private
   * @type {Object}
   */
  goog.dependencies_ = {
    pathToNames: {}, // 1 to many
    nameToPath: {}, // 1 to 1
    requires: {}, // 1 to many
    // Used when resolving dependencies to prevent us from visiting file twice.
    visited: {},
    written: {} // Used to keep track of script files we have written.
  };


  /**
   * Tries to detect whether is in the context of an HTML document.
   * @return {boolean} True if it looks like HTML document.
   * @private
   */
  goog.inHtmlDocument_ = function() {
    var doc = goog.global.document;
    return typeof doc != 'undefined' &&
           'write' in doc;  // XULDocument misses write.
  };


  /**
   * Tries to detect the base path of base.js script that bootstraps Closure.
   * @private
   */
  goog.findBasePath_ = function() {
    if (goog.global.CLOSURE_BASE_PATH) {
      goog.basePath = goog.global.CLOSURE_BASE_PATH;
      return;
    } else if (!goog.inHtmlDocument_()) {
      return;
    }
    var doc = goog.global.document;
    var scripts = doc.getElementsByTagName('script');
    // Search backwards since the current script is in almost all cases the one
    // that has base.js.
    for (var i = scripts.length - 1; i >= 0; --i) {
      var src = scripts[i].src;
      var qmark = src.lastIndexOf('?');
      var l = qmark == -1 ? src.length : qmark;
      if (src.substr(l - 7, 7) == 'base.js') {
        goog.basePath = src.substr(0, l - 7);
        return;
      }
    }
  };


  /**
   * Imports a script if, and only if, that script hasn't already been imported.
   * (Must be called at execution time)
   * @param {string} src Script source.
   * @private
   */
  goog.importScript_ = function(src) {
    var importScript = goog.global.CLOSURE_IMPORT_SCRIPT ||
        goog.writeScriptTag_;
    if (!goog.dependencies_.written[src] && importScript(src)) {
      goog.dependencies_.written[src] = true;
    }
  };


  /**
   * The default implementation of the import function. Writes a script tag to
   * import the script.
   *
   * @param {string} src The script source.
   * @return {boolean} True if the script was imported, false otherwise.
   * @private
   */
  goog.writeScriptTag_ = function(src) {
    if (goog.inHtmlDocument_()) {
      var doc = goog.global.document;

      // If the user tries to require a new symbol after document load,
      // something has gone terribly wrong. Doing a document.write would
      // wipe out the page.
      if (doc.readyState == 'complete') {
        // Certain test frameworks load base.js multiple times, which tries
        // to write deps.js each time. If that happens, just fail silently.
        // These frameworks wipe the page between each load of base.js, so this
        // is OK.
        var isDeps = /\bdeps.js$/.test(src);
        if (isDeps) {
          return false;
        } else {
          throw Error('Cannot write "' + src + '" after document load');
        }
      }

      doc.write(
          '<script type="text/javascript" src="' + src + '"></' + 'script>');
      return true;
    } else {
      return false;
    }
  };


  /**
   * Resolves dependencies based on the dependencies added using addDependency
   * and calls importScript_ in the correct order.
   * @private
   */
  goog.writeScripts_ = function() {
    // The scripts we need to write this time.
    var scripts = [];
    var seenScript = {};
    var deps = goog.dependencies_;

    function visitNode(path) {
      if (path in deps.written) {
        return;
      }

      // We have already visited this one. We can get here if we have cyclic
      // dependencies.
      if (path in deps.visited) {
        if (!(path in seenScript)) {
          seenScript[path] = true;
          scripts.push(path);
        }
        return;
      }

      deps.visited[path] = true;

      if (path in deps.requires) {
        for (var requireName in deps.requires[path]) {
          // If the required name is defined, we assume that it was already
          // bootstrapped by other means.
          if (!goog.isProvided_(requireName)) {
            if (requireName in deps.nameToPath) {
              visitNode(deps.nameToPath[requireName]);
            } else {
              throw Error('Undefined nameToPath for ' + requireName);
            }
          }
        }
      }

      if (!(path in seenScript)) {
        seenScript[path] = true;
        scripts.push(path);
      }
    }

    for (var path in goog.included_) {
      if (!deps.written[path]) {
        visitNode(path);
      }
    }

    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i]) {
        goog.importScript_(goog.basePath + scripts[i]);
      } else {
        throw Error('Undefined script input');
      }
    }
  };


  /**
   * Looks at the dependency rules and tries to determine the script file that
   * fulfills a particular rule.
   * @param {string} rule In the form goog.namespace.Class or project.script.
   * @return {?string} Url corresponding to the rule, or null.
   * @private
   */
  goog.getPathFromDeps_ = function(rule) {
    if (rule in goog.dependencies_.nameToPath) {
      return goog.dependencies_.nameToPath[rule];
    } else {
      return null;
    }
  };

  goog.findBasePath_();

  // Allow projects to manage the deps files themselves.
  if (!goog.global.CLOSURE_NO_DEPS) {
    goog.importScript_(goog.basePath + 'deps.js');
  }
}



//==============================================================================
// Language Enhancements
//==============================================================================


/**
 * This is a "fixed" version of the typeof operator.  It differs from the typeof
 * operator in such a way that null returns 'null' and arrays return 'array'.
 * @param {*} value The value to get the type of.
 * @return {string} The name of the type.
 */
goog.typeOf = function(value) {
  var s = typeof value;
  if (s == 'object') {
    if (value) {
      // Check these first, so we can avoid calling Object.prototype.toString if
      // possible.
      //
      // IE improperly marshals tyepof across execution contexts, but a
      // cross-context object will still return false for "instanceof Object".
      if (value instanceof Array) {
        return 'array';
      } else if (value instanceof Object) {
        return s;
      }

      // HACK: In order to use an Object prototype method on the arbitrary
      //   value, the compiler requires the value be cast to type Object,
      //   even though the ECMA spec explicitly allows it.
      var className = Object.prototype.toString.call(
          /** @type {Object} */ (value));
      // In Firefox 3.6, attempting to access iframe window objects' length
      // property throws an NS_ERROR_FAILURE, so we need to special-case it
      // here.
      if (className == '[object Window]') {
        return 'object';
      }

      // We cannot always use constructor == Array or instanceof Array because
      // different frames have different Array objects. In IE6, if the iframe
      // where the array was created is destroyed, the array loses its
      // prototype. Then dereferencing val.splice here throws an exception, so
      // we can't use goog.isFunction. Calling typeof directly returns 'unknown'
      // so that will work. In this case, this function will return false and
      // most array functions will still work because the array is still
      // array-like (supports length and []) even though it has lost its
      // prototype.
      // Mark Miller noticed that Object.prototype.toString
      // allows access to the unforgeable [[Class]] property.
      //  15.2.4.2 Object.prototype.toString ( )
      //  When the toString method is called, the following steps are taken:
      //      1. Get the [[Class]] property of this object.
      //      2. Compute a string value by concatenating the three strings
      //         "[object ", Result(1), and "]".
      //      3. Return Result(2).
      // and this behavior survives the destruction of the execution context.
      if ((className == '[object Array]' ||
           // In IE all non value types are wrapped as objects across window
           // boundaries (not iframe though) so we have to do object detection
           // for this edge case.
           typeof value.length == 'number' &&
           typeof value.splice != 'undefined' &&
           typeof value.propertyIsEnumerable != 'undefined' &&
           !value.propertyIsEnumerable('splice')

          )) {
        return 'array';
      }
      // HACK: There is still an array case that fails.
      //     function ArrayImpostor() {}
      //     ArrayImpostor.prototype = [];
      //     var impostor = new ArrayImpostor;
      // this can be fixed by getting rid of the fast path
      // (value instanceof Array) and solely relying on
      // (value && Object.prototype.toString.vall(value) === '[object Array]')
      // but that would require many more function calls and is not warranted
      // unless closure code is receiving objects from untrusted sources.

      // IE in cross-window calls does not correctly marshal the function type
      // (it appears just as an object) so we cannot use just typeof val ==
      // 'function'. However, if the object has a call property, it is a
      // function.
      if ((className == '[object Function]' ||
          typeof value.call != 'undefined' &&
          typeof value.propertyIsEnumerable != 'undefined' &&
          !value.propertyIsEnumerable('call'))) {
        return 'function';
      }

    } else {
      return 'null';
    }

  } else if (s == 'function' && typeof value.call == 'undefined') {
    // In Safari typeof nodeList returns 'function', and on Firefox typeof
    // behaves similarly for HTML{Applet,Embed,Object}, Elements and RegExps. We
    // would like to return object for those and we can detect an invalid
    // function by making sure that the function object has a call method.
    return 'object';
  }
  return s;
};


/**
 * Returns true if the specified value is null.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is null.
 */
goog.isNull = function(val) {
  return val === null;
};


/**
 * Returns true if the specified value is defined and not null.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is defined and not null.
 */
goog.isDefAndNotNull = function(val) {
  // Note that undefined == null.
  return val != null;
};


/**
 * Returns true if the specified value is an array.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is an array.
 */
goog.isArray = function(val) {
  return goog.typeOf(val) == 'array';
};


/**
 * Returns true if the object looks like an array. To qualify as array like
 * the value needs to be either a NodeList or an object with a Number length
 * property.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is an array.
 */
goog.isArrayLike = function(val) {
  var type = goog.typeOf(val);
  return type == 'array' || type == 'object' && typeof val.length == 'number';
};


/**
 * Returns true if the object looks like a Date. To qualify as Date-like the
 * value needs to be an object and have a getFullYear() function.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is a like a Date.
 */
goog.isDateLike = function(val) {
  return goog.isObject(val) && typeof val.getFullYear == 'function';
};


/**
 * Returns true if the specified value is a string.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is a string.
 */
goog.isString = function(val) {
  return typeof val == 'string';
};


/**
 * Returns true if the specified value is a boolean.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is boolean.
 */
goog.isBoolean = function(val) {
  return typeof val == 'boolean';
};


/**
 * Returns true if the specified value is a number.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is a number.
 */
goog.isNumber = function(val) {
  return typeof val == 'number';
};


/**
 * Returns true if the specified value is a function.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is a function.
 */
goog.isFunction = function(val) {
  return goog.typeOf(val) == 'function';
};


/**
 * Returns true if the specified value is an object.  This includes arrays and
 * functions.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is an object.
 */
goog.isObject = function(val) {
  var type = typeof val;
  return type == 'object' && val != null || type == 'function';
  // return Object(val) === val also works, but is slower, especially if val is
  // not an object.
};


/**
 * Gets a unique ID for an object. This mutates the object so that further calls
 * with the same object as a parameter returns the same value. The unique ID is
 * guaranteed to be unique across the current session amongst objects that are
 * passed into {@code getUid}. There is no guarantee that the ID is unique or
 * consistent across sessions. It is unsafe to generate unique ID for function
 * prototypes.
 *
 * @param {Object} obj The object to get the unique ID for.
 * @return {number} The unique ID for the object.
 */
goog.getUid = function(obj) {
  // TODO(arv): Make the type stricter, do not accept null.

  // In Opera window.hasOwnProperty exists but always returns false so we avoid
  // using it. As a consequence the unique ID generated for BaseClass.prototype
  // and SubClass.prototype will be the same.
  return obj[goog.UID_PROPERTY_] ||
      (obj[goog.UID_PROPERTY_] = ++goog.uidCounter_);
};


/**
 * Whether the given object is alreay assigned a unique ID.
 *
 * This does not modify the object.
 *
 * @param {Object} obj The object to check.
 * @return {boolean} Whether there an assigned unique id for the object.
 */
goog.hasUid = function(obj) {
  return !!obj[goog.UID_PROPERTY_];
};


/**
 * Removes the unique ID from an object. This is useful if the object was
 * previously mutated using {@code goog.getUid} in which case the mutation is
 * undone.
 * @param {Object} obj The object to remove the unique ID field from.
 */
goog.removeUid = function(obj) {
  // TODO(arv): Make the type stricter, do not accept null.

  // In IE, DOM nodes are not instances of Object and throw an exception if we
  // try to delete.  Instead we try to use removeAttribute.
  if ('removeAttribute' in obj) {
    obj.removeAttribute(goog.UID_PROPERTY_);
  }
  /** @preserveTry */
  try {
    delete obj[goog.UID_PROPERTY_];
  } catch (ex) {
  }
};


/**
 * Name for unique ID property. Initialized in a way to help avoid collisions
 * with other closure JavaScript on the same page.
 * @type {string}
 * @private
 */
goog.UID_PROPERTY_ = 'closure_uid_' + ((Math.random() * 1e9) >>> 0);


/**
 * Counter for UID.
 * @type {number}
 * @private
 */
goog.uidCounter_ = 0;


/**
 * Adds a hash code field to an object. The hash code is unique for the
 * given object.
 * @param {Object} obj The object to get the hash code for.
 * @return {number} The hash code for the object.
 * @deprecated Use goog.getUid instead.
 */
goog.getHashCode = goog.getUid;


/**
 * Removes the hash code field from an object.
 * @param {Object} obj The object to remove the field from.
 * @deprecated Use goog.removeUid instead.
 */
goog.removeHashCode = goog.removeUid;


/**
 * Clones a value. The input may be an Object, Array, or basic type. Objects and
 * arrays will be cloned recursively.
 *
 * WARNINGS:
 * <code>goog.cloneObject</code> does not detect reference loops. Objects that
 * refer to themselves will cause infinite recursion.
 *
 * <code>goog.cloneObject</code> is unaware of unique identifiers, and copies
 * UIDs created by <code>getUid</code> into cloned results.
 *
 * @param {*} obj The value to clone.
 * @return {*} A clone of the input value.
 * @deprecated goog.cloneObject is unsafe. Prefer the goog.object methods.
 */
goog.cloneObject = function(obj) {
  var type = goog.typeOf(obj);
  if (type == 'object' || type == 'array') {
    if (obj.clone) {
      return obj.clone();
    }
    var clone = type == 'array' ? [] : {};
    for (var key in obj) {
      clone[key] = goog.cloneObject(obj[key]);
    }
    return clone;
  }

  return obj;
};


/**
 * A native implementation of goog.bind.
 * @param {Function} fn A function to partially apply.
 * @param {Object|undefined} selfObj Specifies the object which this should
 *     point to when the function is run.
 * @param {...*} var_args Additional arguments that are partially applied to the
 *     function.
 * @return {!Function} A partially-applied form of the function bind() was
 *     invoked as a method of.
 * @private
 * @suppress {deprecated} The compiler thinks that Function.prototype.bind is
 *     deprecated because some people have declared a pure-JS version.
 *     Only the pure-JS version is truly deprecated.
 */
goog.bindNative_ = function(fn, selfObj, var_args) {
  return /** @type {!Function} */ (fn.call.apply(fn.bind, arguments));
};


/**
 * A pure-JS implementation of goog.bind.
 * @param {Function} fn A function to partially apply.
 * @param {Object|undefined} selfObj Specifies the object which this should
 *     point to when the function is run.
 * @param {...*} var_args Additional arguments that are partially applied to the
 *     function.
 * @return {!Function} A partially-applied form of the function bind() was
 *     invoked as a method of.
 * @private
 */
goog.bindJs_ = function(fn, selfObj, var_args) {
  if (!fn) {
    throw new Error();
  }

  if (arguments.length > 2) {
    var boundArgs = Array.prototype.slice.call(arguments, 2);
    return function() {
      // Prepend the bound arguments to the current arguments.
      var newArgs = Array.prototype.slice.call(arguments);
      Array.prototype.unshift.apply(newArgs, boundArgs);
      return fn.apply(selfObj, newArgs);
    };

  } else {
    return function() {
      return fn.apply(selfObj, arguments);
    };
  }
};


/**
 * Partially applies this function to a particular 'this object' and zero or
 * more arguments. The result is a new function with some arguments of the first
 * function pre-filled and the value of this 'pre-specified'.
 *
 * Remaining arguments specified at call-time are appended to the pre-specified
 * ones.
 *
 * Also see: {@link #partial}.
 *
 * Usage:
 * <pre>var barMethBound = bind(myFunction, myObj, 'arg1', 'arg2');
 * barMethBound('arg3', 'arg4');</pre>
 *
 * @param {?function(this:T, ...)} fn A function to partially apply.
 * @param {T} selfObj Specifies the object which this should point to when the
 *     function is run.
 * @param {...*} var_args Additional arguments that are partially applied to the
 *     function.
 * @return {!Function} A partially-applied form of the function bind() was
 *     invoked as a method of.
 * @template T
 * @suppress {deprecated} See above.
 */
goog.bind = function(fn, selfObj, var_args) {
  // TODO(nicksantos): narrow the type signature.
  if (Function.prototype.bind &&
      // NOTE(nicksantos): Somebody pulled base.js into the default Chrome
      // extension environment. This means that for Chrome extensions, they get
      // the implementation of Function.prototype.bind that calls goog.bind
      // instead of the native one. Even worse, we don't want to introduce a
      // circular dependency between goog.bind and Function.prototype.bind, so
      // we have to hack this to make sure it works correctly.
      Function.prototype.bind.toString().indexOf('native code') != -1) {
    goog.bind = goog.bindNative_;
  } else {
    goog.bind = goog.bindJs_;
  }
  return goog.bind.apply(null, arguments);
};


/**
 * Like bind(), except that a 'this object' is not required. Useful when the
 * target function is already bound.
 *
 * Usage:
 * var g = partial(f, arg1, arg2);
 * g(arg3, arg4);
 *
 * @param {Function} fn A function to partially apply.
 * @param {...*} var_args Additional arguments that are partially applied to fn.
 * @return {!Function} A partially-applied form of the function bind() was
 *     invoked as a method of.
 */
goog.partial = function(fn, var_args) {
  var args = Array.prototype.slice.call(arguments, 1);
  return function() {
    // Clone the array (with slice()) and append additional arguments
    // to the existing arguments.
    var newArgs = args.slice();
    newArgs.push.apply(newArgs, arguments);
    return fn.apply(this, newArgs);
  };
};


/**
 * Copies all the members of a source object to a target object. This method
 * does not work on all browsers for all objects that contain keys such as
 * toString or hasOwnProperty. Use goog.object.extend for this purpose.
 * @param {Object} target Target.
 * @param {Object} source Source.
 */
goog.mixin = function(target, source) {
  for (var x in source) {
    target[x] = source[x];
  }

  // For IE7 or lower, the for-in-loop does not contain any properties that are
  // not enumerable on the prototype object (for example, isPrototypeOf from
  // Object.prototype) but also it will not include 'replace' on objects that
  // extend String and change 'replace' (not that it is common for anyone to
  // extend anything except Object).
};


/**
 * @return {number} An integer value representing the number of milliseconds
 *     between midnight, January 1, 1970 and the current time.
 */
goog.now = (goog.TRUSTED_SITE && Date.now) || (function() {
  // Unary plus operator converts its operand to a number which in the case of
  // a date is done by calling getTime().
  return +new Date();
});


/**
 * Evals JavaScript in the global scope.  In IE this uses execScript, other
 * browsers use goog.global.eval. If goog.global.eval does not evaluate in the
 * global scope (for example, in Safari), appends a script tag instead.
 * Throws an exception if neither execScript or eval is defined.
 * @param {string} script JavaScript string.
 */
goog.globalEval = function(script) {
  if (goog.global.execScript) {
    goog.global.execScript(script, 'JavaScript');
  } else if (goog.global.eval) {
    // Test to see if eval works
    if (goog.evalWorksForGlobals_ == null) {
      goog.global.eval('var _et_ = 1;');
      if (typeof goog.global['_et_'] != 'undefined') {
        delete goog.global['_et_'];
        goog.evalWorksForGlobals_ = true;
      } else {
        goog.evalWorksForGlobals_ = false;
      }
    }

    if (goog.evalWorksForGlobals_) {
      goog.global.eval(script);
    } else {
      var doc = goog.global.document;
      var scriptElt = doc.createElement('script');
      scriptElt.type = 'text/javascript';
      scriptElt.defer = false;
      // Note(user): can't use .innerHTML since "t('<test>')" will fail and
      // .text doesn't work in Safari 2.  Therefore we append a text node.
      scriptElt.appendChild(doc.createTextNode(script));
      doc.body.appendChild(scriptElt);
      doc.body.removeChild(scriptElt);
    }
  } else {
    throw Error('goog.globalEval not available');
  }
};


/**
 * Indicates whether or not we can call 'eval' directly to eval code in the
 * global scope. Set to a Boolean by the first call to goog.globalEval (which
 * empirically tests whether eval works for globals). @see goog.globalEval
 * @type {?boolean}
 * @private
 */
goog.evalWorksForGlobals_ = null;


/**
 * Optional map of CSS class names to obfuscated names used with
 * goog.getCssName().
 * @type {Object|undefined}
 * @private
 * @see goog.setCssNameMapping
 */
goog.cssNameMapping_;


/**
 * Optional obfuscation style for CSS class names. Should be set to either
 * 'BY_WHOLE' or 'BY_PART' if defined.
 * @type {string|undefined}
 * @private
 * @see goog.setCssNameMapping
 */
goog.cssNameMappingStyle_;


/**
 * Handles strings that are intended to be used as CSS class names.
 *
 * This function works in tandem with @see goog.setCssNameMapping.
 *
 * Without any mapping set, the arguments are simple joined with a hyphen and
 * passed through unaltered.
 *
 * When there is a mapping, there are two possible styles in which these
 * mappings are used. In the BY_PART style, each part (i.e. in between hyphens)
 * of the passed in css name is rewritten according to the map. In the BY_WHOLE
 * style, the full css name is looked up in the map directly. If a rewrite is
 * not specified by the map, the compiler will output a warning.
 *
 * When the mapping is passed to the compiler, it will replace calls to
 * goog.getCssName with the strings from the mapping, e.g.
 *     var x = goog.getCssName('foo');
 *     var y = goog.getCssName(this.baseClass, 'active');
 *  becomes:
 *     var x= 'foo';
 *     var y = this.baseClass + '-active';
 *
 * If one argument is passed it will be processed, if two are passed only the
 * modifier will be processed, as it is assumed the first argument was generated
 * as a result of calling goog.getCssName.
 *
 * @param {string} className The class name.
 * @param {string=} opt_modifier A modifier to be appended to the class name.
 * @return {string} The class name or the concatenation of the class name and
 *     the modifier.
 */
goog.getCssName = function(className, opt_modifier) {
  var getMapping = function(cssName) {
    return goog.cssNameMapping_[cssName] || cssName;
  };

  var renameByParts = function(cssName) {
    // Remap all the parts individually.
    var parts = cssName.split('-');
    var mapped = [];
    for (var i = 0; i < parts.length; i++) {
      mapped.push(getMapping(parts[i]));
    }
    return mapped.join('-');
  };

  var rename;
  if (goog.cssNameMapping_) {
    rename = goog.cssNameMappingStyle_ == 'BY_WHOLE' ?
        getMapping : renameByParts;
  } else {
    rename = function(a) {
      return a;
    };
  }

  if (opt_modifier) {
    return className + '-' + rename(opt_modifier);
  } else {
    return rename(className);
  }
};


/**
 * Sets the map to check when returning a value from goog.getCssName(). Example:
 * <pre>
 * goog.setCssNameMapping({
 *   "goog": "a",
 *   "disabled": "b",
 * });
 *
 * var x = goog.getCssName('goog');
 * // The following evaluates to: "a a-b".
 * goog.getCssName('goog') + ' ' + goog.getCssName(x, 'disabled')
 * </pre>
 * When declared as a map of string literals to string literals, the JSCompiler
 * will replace all calls to goog.getCssName() using the supplied map if the
 * --closure_pass flag is set.
 *
 * @param {!Object} mapping A map of strings to strings where keys are possible
 *     arguments to goog.getCssName() and values are the corresponding values
 *     that should be returned.
 * @param {string=} opt_style The style of css name mapping. There are two valid
 *     options: 'BY_PART', and 'BY_WHOLE'.
 * @see goog.getCssName for a description.
 */
goog.setCssNameMapping = function(mapping, opt_style) {
  goog.cssNameMapping_ = mapping;
  goog.cssNameMappingStyle_ = opt_style;
};


/**
 * To use CSS renaming in compiled mode, one of the input files should have a
 * call to goog.setCssNameMapping() with an object literal that the JSCompiler
 * can extract and use to replace all calls to goog.getCssName(). In uncompiled
 * mode, JavaScript code should be loaded before this base.js file that declares
 * a global variable, CLOSURE_CSS_NAME_MAPPING, which is used below. This is
 * to ensure that the mapping is loaded before any calls to goog.getCssName()
 * are made in uncompiled mode.
 *
 * A hook for overriding the CSS name mapping.
 * @type {Object|undefined}
 */
goog.global.CLOSURE_CSS_NAME_MAPPING;


if (!COMPILED && goog.global.CLOSURE_CSS_NAME_MAPPING) {
  // This does not call goog.setCssNameMapping() because the JSCompiler
  // requires that goog.setCssNameMapping() be called with an object literal.
  goog.cssNameMapping_ = goog.global.CLOSURE_CSS_NAME_MAPPING;
}


/**
 * Gets a localized message.
 *
 * This function is a compiler primitive. If you give the compiler a localized
 * message bundle, it will replace the string at compile-time with a localized
 * version, and expand goog.getMsg call to a concatenated string.
 *
 * Messages must be initialized in the form:
 * <code>
 * var MSG_NAME = goog.getMsg('Hello {$placeholder}', {'placeholder': 'world'});
 * </code>
 *
 * @param {string} str Translatable string, places holders in the form {$foo}.
 * @param {Object=} opt_values Map of place holder name to value.
 * @return {string} message with placeholders filled.
 */
goog.getMsg = function(str, opt_values) {
  if (opt_values) {
    str = str.replace(/\{\$([^}]+)}/g, function(match, key) {
      return key in opt_values ? opt_values[key] : match;
    });
  }
  return str;
};


/**
 * Gets a localized message. If the message does not have a translation, gives a
 * fallback message.
 *
 * This is useful when introducing a new message that has not yet been
 * translated into all languages.
 *
 * This function is a compiler primitive. Must be used in the form:
 * <code>var x = goog.getMsgWithFallback(MSG_A, MSG_B);</code>
 * where MSG_A and MSG_B were initialized with goog.getMsg.
 *
 * @param {string} a The preferred message.
 * @param {string} b The fallback message.
 * @return {string} The best translated message.
 */
goog.getMsgWithFallback = function(a, b) {
  return a;
};


/**
 * Exposes an unobfuscated global namespace path for the given object.
 * Note that fields of the exported object *will* be obfuscated, unless they are
 * exported in turn via this function or goog.exportProperty.
 *
 * Also handy for making public items that are defined in anonymous closures.
 *
 * ex. goog.exportSymbol('public.path.Foo', Foo);
 *
 * ex. goog.exportSymbol('public.path.Foo.staticFunction', Foo.staticFunction);
 *     public.path.Foo.staticFunction();
 *
 * ex. goog.exportSymbol('public.path.Foo.prototype.myMethod',
 *                       Foo.prototype.myMethod);
 *     new public.path.Foo().myMethod();
 *
 * @param {string} publicPath Unobfuscated name to export.
 * @param {*} object Object the name should point to.
 * @param {Object=} opt_objectToExportTo The object to add the path to; default
 *     is goog.global.
 */
goog.exportSymbol = function(publicPath, object, opt_objectToExportTo) {
  goog.exportPath_(publicPath, object, opt_objectToExportTo);
};


/**
 * Exports a property unobfuscated into the object's namespace.
 * ex. goog.exportProperty(Foo, 'staticFunction', Foo.staticFunction);
 * ex. goog.exportProperty(Foo.prototype, 'myMethod', Foo.prototype.myMethod);
 * @param {Object} object Object whose static property is being exported.
 * @param {string} publicName Unobfuscated name to export.
 * @param {*} symbol Object the name should point to.
 */
goog.exportProperty = function(object, publicName, symbol) {
  object[publicName] = symbol;
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * Usage:
 * <pre>
 * function ParentClass(a, b) { }
 * ParentClass.prototype.foo = function(a) { };
 *
 * function ChildClass(a, b, c) {
 *   ChildClass.base(this, 'constructor', a, b);
 * }
 * goog.inherits(ChildClass, ParentClass);
 *
 * var child = new ChildClass('a', 'b', 'see');
 * child.foo(); // This works.
 * </pre>
 *
 * @param {Function} childCtor Child class.
 * @param {Function} parentCtor Parent class.
 */
goog.inherits = function(childCtor, parentCtor) {
  /** @constructor */
  function tempCtor() {};
  tempCtor.prototype = parentCtor.prototype;
  childCtor.superClass_ = parentCtor.prototype;
  childCtor.prototype = new tempCtor();
  /** @override */
  childCtor.prototype.constructor = childCtor;

  /**
   * Calls superclass constructor/method.
   *
   * This function is only available if you use goog.inherits to
   * express inheritance relationships between classes.
   *
   * NOTE: This is a replacement for goog.base and for superClass_
   * property defined in childCtor.
   *
   * @param {!Object} me Should always be "this".
   * @param {string} methodName The method name to call. Calling
   *     superclass constructor can be done with the special string
   *     'constructor'.
   * @param {...*} var_args The arguments to pass to superclass
   *     method/constructor.
   * @return {*} The return value of the superclass method/constructor.
   */
  childCtor.base = function(me, methodName, var_args) {
    var args = Array.prototype.slice.call(arguments, 2);
    return parentCtor.prototype[methodName].apply(me, args);
  };
};


/**
 * Call up to the superclass.
 *
 * If this is called from a constructor, then this calls the superclass
 * constructor with arguments 1-N.
 *
 * If this is called from a prototype method, then you must pass the name of the
 * method as the second argument to this function. If you do not, you will get a
 * runtime error. This calls the superclass' method with arguments 2-N.
 *
 * This function only works if you use goog.inherits to express inheritance
 * relationships between your classes.
 *
 * This function is a compiler primitive. At compile-time, the compiler will do
 * macro expansion to remove a lot of the extra overhead that this function
 * introduces. The compiler will also enforce a lot of the assumptions that this
 * function makes, and treat it as a compiler error if you break them.
 *
 * @param {!Object} me Should always be "this".
 * @param {*=} opt_methodName The method name if calling a super method.
 * @param {...*} var_args The rest of the arguments.
 * @return {*} The return value of the superclass method.
 * @suppress {es5Strict} This method can not be used in strict mode, but
 *     all Closure Library consumers must depend on this file.
 */
goog.base = function(me, opt_methodName, var_args) {
  var caller = arguments.callee.caller;

  if (goog.STRICT_MODE_COMPATIBLE || (goog.DEBUG && !caller)) {
    throw Error('arguments.caller not defined.  goog.base() cannot be used ' +
                'with strict mode code. See ' +
                'http://www.ecma-international.org/ecma-262/5.1/#sec-C');
  }

  if (caller.superClass_) {
    // This is a constructor. Call the superclass constructor.
    return caller.superClass_.constructor.apply(
        me, Array.prototype.slice.call(arguments, 1));
  }

  var args = Array.prototype.slice.call(arguments, 2);
  var foundCaller = false;
  for (var ctor = me.constructor;
       ctor; ctor = ctor.superClass_ && ctor.superClass_.constructor) {
    if (ctor.prototype[opt_methodName] === caller) {
      foundCaller = true;
    } else if (foundCaller) {
      return ctor.prototype[opt_methodName].apply(me, args);
    }
  }

  // If we did not find the caller in the prototype chain, then one of two
  // things happened:
  // 1) The caller is an instance method.
  // 2) This method was not called by the right caller.
  if (me[opt_methodName] === caller) {
    return me.constructor.prototype[opt_methodName].apply(me, args);
  } else {
    throw Error(
        'goog.base called from a method of one name ' +
        'to a method of a different name');
  }
};


/**
 * Allow for aliasing within scope functions.  This function exists for
 * uncompiled code - in compiled code the calls will be inlined and the aliases
 * applied.  In uncompiled code the function is simply run since the aliases as
 * written are valid JavaScript.
 * @param {function()} fn Function to call.  This function can contain aliases
 *     to namespaces (e.g. "var dom = goog.dom") or classes
 *     (e.g. "var Timer = goog.Timer").
 */
goog.scope = function(fn) {
  fn.call(goog.global);
};


/*
 * To support uncompiled, strict mode bundles that use eval to divide source
 * like so:
 *    eval('someSource;//# sourceUrl sourcefile.js');
 * We need to export the globally defined symbols "goog" and "COMPILED".
 * Exporting "goog" breaks the compiler optimizations, so we required that
 * be defined externally.
 * NOTE: We don't use goog.exportSymbol here because we don't want to trigger
 * extern generation when that compiler option is enabled.
 */
if (!COMPILED) {
  goog.global['COMPILED'] = COMPILED;
}



// Copyright 2009 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Provides a base class for custom Error objects such that the
 * stack is correctly maintained.
 *
 * You should never need to throw goog.debug.Error(msg) directly, Error(msg) is
 * sufficient.
 *
 */

goog.provide('goog.debug.Error');



/**
 * Base class for custom error objects.
 * @param {*=} opt_msg The message associated with the error.
 * @constructor
 * @extends {Error}
 */
goog.debug.Error = function(opt_msg) {

  // Attempt to ensure there is a stack trace.
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, goog.debug.Error);
  } else {
    var stack = new Error().stack;
    if (stack) {
      this.stack = stack;
    }
  }

  if (opt_msg) {
    this.message = String(opt_msg);
  }
};
goog.inherits(goog.debug.Error, Error);


/** @override */
goog.debug.Error.prototype.name = 'CustomError';

// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Definition of goog.dom.NodeType.
 */

goog.provide('goog.dom.NodeType');


/**
 * Constants for the nodeType attribute in the Node interface.
 *
 * These constants match those specified in the Node interface. These are
 * usually present on the Node object in recent browsers, but not in older
 * browsers (specifically, early IEs) and thus are given here.
 *
 * In some browsers (early IEs), these are not defined on the Node object,
 * so they are provided here.
 *
 * See http://www.w3.org/TR/DOM-Level-2-Core/core.html#ID-1950641247
 * @enum {number}
 */
goog.dom.NodeType = {
  ELEMENT: 1,
  ATTRIBUTE: 2,
  TEXT: 3,
  CDATA_SECTION: 4,
  ENTITY_REFERENCE: 5,
  ENTITY: 6,
  PROCESSING_INSTRUCTION: 7,
  COMMENT: 8,
  DOCUMENT: 9,
  DOCUMENT_TYPE: 10,
  DOCUMENT_FRAGMENT: 11,
  NOTATION: 12
};

// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Utilities for string manipulation.
 */


/**
 * Namespace for string utilities
 */
goog.provide('goog.string');
goog.provide('goog.string.Unicode');


/**
 * @define {boolean} Enables HTML escaping of lowercase letter "e" which helps
 * with detection of double-escaping as this letter is frequently used.
 */
goog.define('goog.string.DETECT_DOUBLE_ESCAPING', false);


/**
 * Common Unicode string characters.
 * @enum {string}
 */
goog.string.Unicode = {
  NBSP: '\xa0'
};


/**
 * Fast prefix-checker.
 * @param {string} str The string to check.
 * @param {string} prefix A string to look for at the start of {@code str}.
 * @return {boolean} True if {@code str} begins with {@code prefix}.
 */
goog.string.startsWith = function(str, prefix) {
  return str.lastIndexOf(prefix, 0) == 0;
};


/**
 * Fast suffix-checker.
 * @param {string} str The string to check.
 * @param {string} suffix A string to look for at the end of {@code str}.
 * @return {boolean} True if {@code str} ends with {@code suffix}.
 */
goog.string.endsWith = function(str, suffix) {
  var l = str.length - suffix.length;
  return l >= 0 && str.indexOf(suffix, l) == l;
};


/**
 * Case-insensitive prefix-checker.
 * @param {string} str The string to check.
 * @param {string} prefix  A string to look for at the end of {@code str}.
 * @return {boolean} True if {@code str} begins with {@code prefix} (ignoring
 *     case).
 */
goog.string.caseInsensitiveStartsWith = function(str, prefix) {
  return goog.string.caseInsensitiveCompare(
      prefix, str.substr(0, prefix.length)) == 0;
};


/**
 * Case-insensitive suffix-checker.
 * @param {string} str The string to check.
 * @param {string} suffix A string to look for at the end of {@code str}.
 * @return {boolean} True if {@code str} ends with {@code suffix} (ignoring
 *     case).
 */
goog.string.caseInsensitiveEndsWith = function(str, suffix) {
  return goog.string.caseInsensitiveCompare(
      suffix, str.substr(str.length - suffix.length, suffix.length)) == 0;
};


/**
 * Case-insensitive equality checker.
 * @param {string} str1 First string to check.
 * @param {string} str2 Second string to check.
 * @return {boolean} True if {@code str1} and {@code str2} are the same string,
 *     ignoring case.
 */
goog.string.caseInsensitiveEquals = function(str1, str2) {
  return str1.toLowerCase() == str2.toLowerCase();
};


/**
 * Does simple python-style string substitution.
 * subs("foo%s hot%s", "bar", "dog") becomes "foobar hotdog".
 * @param {string} str The string containing the pattern.
 * @param {...*} var_args The items to substitute into the pattern.
 * @return {string} A copy of {@code str} in which each occurrence of
 *     {@code %s} has been replaced an argument from {@code var_args}.
 */
goog.string.subs = function(str, var_args) {
  var splitParts = str.split('%s');
  var returnString = '';

  var subsArguments = Array.prototype.slice.call(arguments, 1);
  while (subsArguments.length &&
         // Replace up to the last split part. We are inserting in the
         // positions between split parts.
         splitParts.length > 1) {
    returnString += splitParts.shift() + subsArguments.shift();
  }

  return returnString + splitParts.join('%s'); // Join unused '%s'
};


/**
 * Converts multiple whitespace chars (spaces, non-breaking-spaces, new lines
 * and tabs) to a single space, and strips leading and trailing whitespace.
 * @param {string} str Input string.
 * @return {string} A copy of {@code str} with collapsed whitespace.
 */
goog.string.collapseWhitespace = function(str) {
  // Since IE doesn't include non-breaking-space (0xa0) in their \s character
  // class (as required by section 7.2 of the ECMAScript spec), we explicitly
  // include it in the regexp to enforce consistent cross-browser behavior.
  return str.replace(/[\s\xa0]+/g, ' ').replace(/^\s+|\s+$/g, '');
};


/**
 * Checks if a string is empty or contains only whitespaces.
 * @param {string} str The string to check.
 * @return {boolean} True if {@code str} is empty or whitespace only.
 */
goog.string.isEmpty = function(str) {
  // testing length == 0 first is actually slower in all browsers (about the
  // same in Opera).
  // Since IE doesn't include non-breaking-space (0xa0) in their \s character
  // class (as required by section 7.2 of the ECMAScript spec), we explicitly
  // include it in the regexp to enforce consistent cross-browser behavior.
  return /^[\s\xa0]*$/.test(str);
};


/**
 * Checks if a string is null, undefined, empty or contains only whitespaces.
 * @param {*} str The string to check.
 * @return {boolean} True if{@code str} is null, undefined, empty, or
 *     whitespace only.
 */
goog.string.isEmptySafe = function(str) {
  return goog.string.isEmpty(goog.string.makeSafe(str));
};


/**
 * Checks if a string is all breaking whitespace.
 * @param {string} str The string to check.
 * @return {boolean} Whether the string is all breaking whitespace.
 */
goog.string.isBreakingWhitespace = function(str) {
  return !/[^\t\n\r ]/.test(str);
};


/**
 * Checks if a string contains all letters.
 * @param {string} str string to check.
 * @return {boolean} True if {@code str} consists entirely of letters.
 */
goog.string.isAlpha = function(str) {
  return !/[^a-zA-Z]/.test(str);
};


/**
 * Checks if a string contains only numbers.
 * @param {*} str string to check. If not a string, it will be
 *     casted to one.
 * @return {boolean} True if {@code str} is numeric.
 */
goog.string.isNumeric = function(str) {
  return !/[^0-9]/.test(str);
};


/**
 * Checks if a string contains only numbers or letters.
 * @param {string} str string to check.
 * @return {boolean} True if {@code str} is alphanumeric.
 */
goog.string.isAlphaNumeric = function(str) {
  return !/[^a-zA-Z0-9]/.test(str);
};


/**
 * Checks if a character is a space character.
 * @param {string} ch Character to check.
 * @return {boolean} True if {code ch} is a space.
 */
goog.string.isSpace = function(ch) {
  return ch == ' ';
};


/**
 * Checks if a character is a valid unicode character.
 * @param {string} ch Character to check.
 * @return {boolean} True if {code ch} is a valid unicode character.
 */
goog.string.isUnicodeChar = function(ch) {
  return ch.length == 1 && ch >= ' ' && ch <= '~' ||
         ch >= '\u0080' && ch <= '\uFFFD';
};


/**
 * Takes a string and replaces newlines with a space. Multiple lines are
 * replaced with a single space.
 * @param {string} str The string from which to strip newlines.
 * @return {string} A copy of {@code str} stripped of newlines.
 */
goog.string.stripNewlines = function(str) {
  return str.replace(/(\r\n|\r|\n)+/g, ' ');
};


/**
 * Replaces Windows and Mac new lines with unix style: \r or \r\n with \n.
 * @param {string} str The string to in which to canonicalize newlines.
 * @return {string} {@code str} A copy of {@code} with canonicalized newlines.
 */
goog.string.canonicalizeNewlines = function(str) {
  return str.replace(/(\r\n|\r|\n)/g, '\n');
};


/**
 * Normalizes whitespace in a string, replacing all whitespace chars with
 * a space.
 * @param {string} str The string in which to normalize whitespace.
 * @return {string} A copy of {@code str} with all whitespace normalized.
 */
goog.string.normalizeWhitespace = function(str) {
  return str.replace(/\xa0|\s/g, ' ');
};


/**
 * Normalizes spaces in a string, replacing all consecutive spaces and tabs
 * with a single space. Replaces non-breaking space with a space.
 * @param {string} str The string in which to normalize spaces.
 * @return {string} A copy of {@code str} with all consecutive spaces and tabs
 *    replaced with a single space.
 */
goog.string.normalizeSpaces = function(str) {
  return str.replace(/\xa0|[ \t]+/g, ' ');
};


/**
 * Removes the breaking spaces from the left and right of the string and
 * collapses the sequences of breaking spaces in the middle into single spaces.
 * The original and the result strings render the same way in HTML.
 * @param {string} str A string in which to collapse spaces.
 * @return {string} Copy of the string with normalized breaking spaces.
 */
goog.string.collapseBreakingSpaces = function(str) {
  return str.replace(/[\t\r\n ]+/g, ' ').replace(
      /^[\t\r\n ]+|[\t\r\n ]+$/g, '');
};


/**
 * Trims white spaces to the left and right of a string.
 * @param {string} str The string to trim.
 * @return {string} A trimmed copy of {@code str}.
 */
goog.string.trim = function(str) {
  // Since IE doesn't include non-breaking-space (0xa0) in their \s character
  // class (as required by section 7.2 of the ECMAScript spec), we explicitly
  // include it in the regexp to enforce consistent cross-browser behavior.
  return str.replace(/^[\s\xa0]+|[\s\xa0]+$/g, '');
};


/**
 * Trims whitespaces at the left end of a string.
 * @param {string} str The string to left trim.
 * @return {string} A trimmed copy of {@code str}.
 */
goog.string.trimLeft = function(str) {
  // Since IE doesn't include non-breaking-space (0xa0) in their \s character
  // class (as required by section 7.2 of the ECMAScript spec), we explicitly
  // include it in the regexp to enforce consistent cross-browser behavior.
  return str.replace(/^[\s\xa0]+/, '');
};


/**
 * Trims whitespaces at the right end of a string.
 * @param {string} str The string to right trim.
 * @return {string} A trimmed copy of {@code str}.
 */
goog.string.trimRight = function(str) {
  // Since IE doesn't include non-breaking-space (0xa0) in their \s character
  // class (as required by section 7.2 of the ECMAScript spec), we explicitly
  // include it in the regexp to enforce consistent cross-browser behavior.
  return str.replace(/[\s\xa0]+$/, '');
};


/**
 * A string comparator that ignores case.
 * -1 = str1 less than str2
 *  0 = str1 equals str2
 *  1 = str1 greater than str2
 *
 * @param {string} str1 The string to compare.
 * @param {string} str2 The string to compare {@code str1} to.
 * @return {number} The comparator result, as described above.
 */
goog.string.caseInsensitiveCompare = function(str1, str2) {
  var test1 = String(str1).toLowerCase();
  var test2 = String(str2).toLowerCase();

  if (test1 < test2) {
    return -1;
  } else if (test1 == test2) {
    return 0;
  } else {
    return 1;
  }
};


/**
 * Regular expression used for splitting a string into substrings of fractional
 * numbers, integers, and non-numeric characters.
 * @type {RegExp}
 * @private
 */
goog.string.numerateCompareRegExp_ = /(\.\d+)|(\d+)|(\D+)/g;


/**
 * String comparison function that handles numbers in a way humans might expect.
 * Using this function, the string "File 2.jpg" sorts before "File 10.jpg". The
 * comparison is mostly case-insensitive, though strings that are identical
 * except for case are sorted with the upper-case strings before lower-case.
 *
 * This comparison function is significantly slower (about 500x) than either
 * the default or the case-insensitive compare. It should not be used in
 * time-critical code, but should be fast enough to sort several hundred short
 * strings (like filenames) with a reasonable delay.
 *
 * @param {string} str1 The string to compare in a numerically sensitive way.
 * @param {string} str2 The string to compare {@code str1} to.
 * @return {number} less than 0 if str1 < str2, 0 if str1 == str2, greater than
 *     0 if str1 > str2.
 */
goog.string.numerateCompare = function(str1, str2) {
  if (str1 == str2) {
    return 0;
  }
  if (!str1) {
    return -1;
  }
  if (!str2) {
    return 1;
  }

  // Using match to split the entire string ahead of time turns out to be faster
  // for most inputs than using RegExp.exec or iterating over each character.
  var tokens1 = str1.toLowerCase().match(goog.string.numerateCompareRegExp_);
  var tokens2 = str2.toLowerCase().match(goog.string.numerateCompareRegExp_);

  var count = Math.min(tokens1.length, tokens2.length);

  for (var i = 0; i < count; i++) {
    var a = tokens1[i];
    var b = tokens2[i];

    // Compare pairs of tokens, returning if one token sorts before the other.
    if (a != b) {

      // Only if both tokens are integers is a special comparison required.
      // Decimal numbers are sorted as strings (e.g., '.09' < '.1').
      var num1 = parseInt(a, 10);
      if (!isNaN(num1)) {
        var num2 = parseInt(b, 10);
        if (!isNaN(num2) && num1 - num2) {
          return num1 - num2;
        }
      }
      return a < b ? -1 : 1;
    }
  }

  // If one string is a substring of the other, the shorter string sorts first.
  if (tokens1.length != tokens2.length) {
    return tokens1.length - tokens2.length;
  }

  // The two strings must be equivalent except for case (perfect equality is
  // tested at the head of the function.) Revert to default ASCII-betical string
  // comparison to stablize the sort.
  return str1 < str2 ? -1 : 1;
};


/**
 * URL-encodes a string
 * @param {*} str The string to url-encode.
 * @return {string} An encoded copy of {@code str} that is safe for urls.
 *     Note that '#', ':', and other characters used to delimit portions
 *     of URLs *will* be encoded.
 */
goog.string.urlEncode = function(str) {
  return encodeURIComponent(String(str));
};


/**
 * URL-decodes the string. We need to specially handle '+'s because
 * the javascript library doesn't convert them to spaces.
 * @param {string} str The string to url decode.
 * @return {string} The decoded {@code str}.
 */
goog.string.urlDecode = function(str) {
  return decodeURIComponent(str.replace(/\+/g, ' '));
};


/**
 * Converts \n to <br>s or <br />s.
 * @param {string} str The string in which to convert newlines.
 * @param {boolean=} opt_xml Whether to use XML compatible tags.
 * @return {string} A copy of {@code str} with converted newlines.
 */
goog.string.newLineToBr = function(str, opt_xml) {
  return str.replace(/(\r\n|\r|\n)/g, opt_xml ? '<br />' : '<br>');
};


/**
 * Escapes double quote '"' and single quote '\'' characters in addition to
 * '&', '<', and '>' so that a string can be included in an HTML tag attribute
 * value within double or single quotes.
 *
 * It should be noted that > doesn't need to be escaped for the HTML or XML to
 * be valid, but it has been decided to escape it for consistency with other
 * implementations.
 *
 * With goog.string.DETECT_DOUBLE_ESCAPING, this function escapes also the
 * lowercase letter "e".
 *
 * NOTE(user):
 * HtmlEscape is often called during the generation of large blocks of HTML.
 * Using statics for the regular expressions and strings is an optimization
 * that can more than half the amount of time IE spends in this function for
 * large apps, since strings and regexes both contribute to GC allocations.
 *
 * Testing for the presence of a character before escaping increases the number
 * of function calls, but actually provides a speed increase for the average
 * case -- since the average case often doesn't require the escaping of all 4
 * characters and indexOf() is much cheaper than replace().
 * The worst case does suffer slightly from the additional calls, therefore the
 * opt_isLikelyToContainHtmlChars option has been included for situations
 * where all 4 HTML entities are very likely to be present and need escaping.
 *
 * Some benchmarks (times tended to fluctuate +-0.05ms):
 *                                     FireFox                     IE6
 * (no chars / average (mix of cases) / all 4 chars)
 * no checks                     0.13 / 0.22 / 0.22         0.23 / 0.53 / 0.80
 * indexOf                       0.08 / 0.17 / 0.26         0.22 / 0.54 / 0.84
 * indexOf + re test             0.07 / 0.17 / 0.28         0.19 / 0.50 / 0.85
 *
 * An additional advantage of checking if replace actually needs to be called
 * is a reduction in the number of object allocations, so as the size of the
 * application grows the difference between the various methods would increase.
 *
 * @param {string} str string to be escaped.
 * @param {boolean=} opt_isLikelyToContainHtmlChars Don't perform a check to see
 *     if the character needs replacing - use this option if you expect each of
 *     the characters to appear often. Leave false if you expect few html
 *     characters to occur in your strings, such as if you are escaping HTML.
 * @return {string} An escaped copy of {@code str}.
 */
goog.string.htmlEscape = function(str, opt_isLikelyToContainHtmlChars) {

  if (opt_isLikelyToContainHtmlChars) {
    str = str.replace(goog.string.AMP_RE_, '&amp;')
          .replace(goog.string.LT_RE_, '&lt;')
          .replace(goog.string.GT_RE_, '&gt;')
          .replace(goog.string.QUOT_RE_, '&quot;')
          .replace(goog.string.SINGLE_QUOTE_RE_, '&#39;')
          .replace(goog.string.NULL_RE_, '&#0;');
    if (goog.string.DETECT_DOUBLE_ESCAPING) {
      str = str.replace(goog.string.E_RE_, '&#101;');
    }
    return str;

  } else {
    // quick test helps in the case when there are no chars to replace, in
    // worst case this makes barely a difference to the time taken
    if (!goog.string.ALL_RE_.test(str)) return str;

    // str.indexOf is faster than regex.test in this case
    if (str.indexOf('&') != -1) {
      str = str.replace(goog.string.AMP_RE_, '&amp;');
    }
    if (str.indexOf('<') != -1) {
      str = str.replace(goog.string.LT_RE_, '&lt;');
    }
    if (str.indexOf('>') != -1) {
      str = str.replace(goog.string.GT_RE_, '&gt;');
    }
    if (str.indexOf('"') != -1) {
      str = str.replace(goog.string.QUOT_RE_, '&quot;');
    }
    if (str.indexOf('\'') != -1) {
      str = str.replace(goog.string.SINGLE_QUOTE_RE_, '&#39;');
    }
    if (str.indexOf('\x00') != -1) {
      str = str.replace(goog.string.NULL_RE_, '&#0;');
    }
    if (goog.string.DETECT_DOUBLE_ESCAPING && str.indexOf('e') != -1) {
      str = str.replace(goog.string.E_RE_, '&#101;');
    }
    return str;
  }
};


/**
 * Regular expression that matches an ampersand, for use in escaping.
 * @const {!RegExp}
 * @private
 */
goog.string.AMP_RE_ = /&/g;


/**
 * Regular expression that matches a less than sign, for use in escaping.
 * @const {!RegExp}
 * @private
 */
goog.string.LT_RE_ = /</g;


/**
 * Regular expression that matches a greater than sign, for use in escaping.
 * @const {!RegExp}
 * @private
 */
goog.string.GT_RE_ = />/g;


/**
 * Regular expression that matches a double quote, for use in escaping.
 * @const {!RegExp}
 * @private
 */
goog.string.QUOT_RE_ = /"/g;


/**
 * Regular expression that matches a single quote, for use in escaping.
 * @const {!RegExp}
 * @private
 */
goog.string.SINGLE_QUOTE_RE_ = /'/g;


/**
 * Regular expression that matches null character, for use in escaping.
 * @const {!RegExp}
 * @private
 */
goog.string.NULL_RE_ = /\x00/g;


/**
 * Regular expression that matches a lowercase letter "e", for use in escaping.
 * @const {!RegExp}
 * @private
 */
goog.string.E_RE_ = /e/g;


/**
 * Regular expression that matches any character that needs to be escaped.
 * @const {!RegExp}
 * @private
 */
goog.string.ALL_RE_ = (goog.string.DETECT_DOUBLE_ESCAPING ?
    /[\x00&<>"'e]/ :
    /[\x00&<>"']/);


/**
 * Unescapes an HTML string.
 *
 * @param {string} str The string to unescape.
 * @return {string} An unescaped copy of {@code str}.
 */
goog.string.unescapeEntities = function(str) {
  if (goog.string.contains(str, '&')) {
    // We are careful not to use a DOM if we do not have one. We use the []
    // notation so that the JSCompiler will not complain about these objects and
    // fields in the case where we have no DOM.
    if ('document' in goog.global) {
      return goog.string.unescapeEntitiesUsingDom_(str);
    } else {
      // Fall back on pure XML entities
      return goog.string.unescapePureXmlEntities_(str);
    }
  }
  return str;
};


/**
 * Unescapes a HTML string using the provided document.
 *
 * @param {string} str The string to unescape.
 * @param {!Document} document A document to use in escaping the string.
 * @return {string} An unescaped copy of {@code str}.
 */
goog.string.unescapeEntitiesWithDocument = function(str, document) {
  if (goog.string.contains(str, '&')) {
    return goog.string.unescapeEntitiesUsingDom_(str, document);
  }
  return str;
};


/**
 * Unescapes an HTML string using a DOM to resolve non-XML, non-numeric
 * entities. This function is XSS-safe and whitespace-preserving.
 * @private
 * @param {string} str The string to unescape.
 * @param {Document=} opt_document An optional document to use for creating
 *     elements. If this is not specified then the default window.document
 *     will be used.
 * @return {string} The unescaped {@code str} string.
 */
goog.string.unescapeEntitiesUsingDom_ = function(str, opt_document) {
  var seen = {'&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"'};
  var div;
  if (opt_document) {
    div = opt_document.createElement('div');
  } else {
    div = goog.global.document.createElement('div');
  }
  // Match as many valid entity characters as possible. If the actual entity
  // happens to be shorter, it will still work as innerHTML will return the
  // trailing characters unchanged. Since the entity characters do not include
  // open angle bracket, there is no chance of XSS from the innerHTML use.
  // Since no whitespace is passed to innerHTML, whitespace is preserved.
  return str.replace(goog.string.HTML_ENTITY_PATTERN_, function(s, entity) {
    // Check for cached entity.
    var value = seen[s];
    if (value) {
      return value;
    }
    // Check for numeric entity.
    if (entity.charAt(0) == '#') {
      // Prefix with 0 so that hex entities (e.g. &#x10) parse as hex numbers.
      var n = Number('0' + entity.substr(1));
      if (!isNaN(n)) {
        value = String.fromCharCode(n);
      }
    }
    // Fall back to innerHTML otherwise.
    if (!value) {
      // Append a non-entity character to avoid a bug in Webkit that parses
      // an invalid entity at the end of innerHTML text as the empty string.
      div.innerHTML = s + ' ';
      // Then remove the trailing character from the result.
      value = div.firstChild.nodeValue.slice(0, -1);
    }
    // Cache and return.
    return seen[s] = value;
  });
};


/**
 * Unescapes XML entities.
 * @private
 * @param {string} str The string to unescape.
 * @return {string} An unescaped copy of {@code str}.
 */
goog.string.unescapePureXmlEntities_ = function(str) {
  return str.replace(/&([^;]+);/g, function(s, entity) {
    switch (entity) {
      case 'amp':
        return '&';
      case 'lt':
        return '<';
      case 'gt':
        return '>';
      case 'quot':
        return '"';
      default:
        if (entity.charAt(0) == '#') {
          // Prefix with 0 so that hex entities (e.g. &#x10) parse as hex.
          var n = Number('0' + entity.substr(1));
          if (!isNaN(n)) {
            return String.fromCharCode(n);
          }
        }
        // For invalid entities we just return the entity
        return s;
    }
  });
};


/**
 * Regular expression that matches an HTML entity.
 * See also HTML5: Tokenization / Tokenizing character references.
 * @private
 * @type {!RegExp}
 */
goog.string.HTML_ENTITY_PATTERN_ = /&([^;\s<&]+);?/g;


/**
 * Do escaping of whitespace to preserve spatial formatting. We use character
 * entity #160 to make it safer for xml.
 * @param {string} str The string in which to escape whitespace.
 * @param {boolean=} opt_xml Whether to use XML compatible tags.
 * @return {string} An escaped copy of {@code str}.
 */
goog.string.whitespaceEscape = function(str, opt_xml) {
  // This doesn't use goog.string.preserveSpaces for backwards compatibility.
  return goog.string.newLineToBr(str.replace(/  /g, ' &#160;'), opt_xml);
};


/**
 * Preserve spaces that would be otherwise collapsed in HTML by replacing them
 * with non-breaking space Unicode characters.
 * @param {string} str The string in which to preserve whitespace.
 * @return {string} A copy of {@code str} with preserved whitespace.
 */
goog.string.preserveSpaces = function(str) {
  return str.replace(/(^|[\n ]) /g, '$1' + goog.string.Unicode.NBSP);
};


/**
 * Strip quote characters around a string.  The second argument is a string of
 * characters to treat as quotes.  This can be a single character or a string of
 * multiple character and in that case each of those are treated as possible
 * quote characters. For example:
 *
 * <pre>
 * goog.string.stripQuotes('"abc"', '"`') --> 'abc'
 * goog.string.stripQuotes('`abc`', '"`') --> 'abc'
 * </pre>
 *
 * @param {string} str The string to strip.
 * @param {string} quoteChars The quote characters to strip.
 * @return {string} A copy of {@code str} without the quotes.
 */
goog.string.stripQuotes = function(str, quoteChars) {
  var length = quoteChars.length;
  for (var i = 0; i < length; i++) {
    var quoteChar = length == 1 ? quoteChars : quoteChars.charAt(i);
    if (str.charAt(0) == quoteChar && str.charAt(str.length - 1) == quoteChar) {
      return str.substring(1, str.length - 1);
    }
  }
  return str;
};


/**
 * Truncates a string to a certain length and adds '...' if necessary.  The
 * length also accounts for the ellipsis, so a maximum length of 10 and a string
 * 'Hello World!' produces 'Hello W...'.
 * @param {string} str The string to truncate.
 * @param {number} chars Max number of characters.
 * @param {boolean=} opt_protectEscapedCharacters Whether to protect escaped
 *     characters from being cut off in the middle.
 * @return {string} The truncated {@code str} string.
 */
goog.string.truncate = function(str, chars, opt_protectEscapedCharacters) {
  if (opt_protectEscapedCharacters) {
    str = goog.string.unescapeEntities(str);
  }

  if (str.length > chars) {
    str = str.substring(0, chars - 3) + '...';
  }

  if (opt_protectEscapedCharacters) {
    str = goog.string.htmlEscape(str);
  }

  return str;
};


/**
 * Truncate a string in the middle, adding "..." if necessary,
 * and favoring the beginning of the string.
 * @param {string} str The string to truncate the middle of.
 * @param {number} chars Max number of characters.
 * @param {boolean=} opt_protectEscapedCharacters Whether to protect escaped
 *     characters from being cutoff in the middle.
 * @param {number=} opt_trailingChars Optional number of trailing characters to
 *     leave at the end of the string, instead of truncating as close to the
 *     middle as possible.
 * @return {string} A truncated copy of {@code str}.
 */
goog.string.truncateMiddle = function(str, chars,
    opt_protectEscapedCharacters, opt_trailingChars) {
  if (opt_protectEscapedCharacters) {
    str = goog.string.unescapeEntities(str);
  }

  if (opt_trailingChars && str.length > chars) {
    if (opt_trailingChars > chars) {
      opt_trailingChars = chars;
    }
    var endPoint = str.length - opt_trailingChars;
    var startPoint = chars - opt_trailingChars;
    str = str.substring(0, startPoint) + '...' + str.substring(endPoint);
  } else if (str.length > chars) {
    // Favor the beginning of the string:
    var half = Math.floor(chars / 2);
    var endPos = str.length - half;
    half += chars % 2;
    str = str.substring(0, half) + '...' + str.substring(endPos);
  }

  if (opt_protectEscapedCharacters) {
    str = goog.string.htmlEscape(str);
  }

  return str;
};


/**
 * Special chars that need to be escaped for goog.string.quote.
 * @private
 * @type {Object}
 */
goog.string.specialEscapeChars_ = {
  '\0': '\\0',
  '\b': '\\b',
  '\f': '\\f',
  '\n': '\\n',
  '\r': '\\r',
  '\t': '\\t',
  '\x0B': '\\x0B', // '\v' is not supported in JScript
  '"': '\\"',
  '\\': '\\\\'
};


/**
 * Character mappings used internally for goog.string.escapeChar.
 * @private
 * @type {Object}
 */
goog.string.jsEscapeCache_ = {
  '\'': '\\\''
};


/**
 * Encloses a string in double quotes and escapes characters so that the
 * string is a valid JS string.
 * @param {string} s The string to quote.
 * @return {string} A copy of {@code s} surrounded by double quotes.
 */
goog.string.quote = function(s) {
  s = String(s);
  if (s.quote) {
    return s.quote();
  } else {
    var sb = ['"'];
    for (var i = 0; i < s.length; i++) {
      var ch = s.charAt(i);
      var cc = ch.charCodeAt(0);
      sb[i + 1] = goog.string.specialEscapeChars_[ch] ||
          ((cc > 31 && cc < 127) ? ch : goog.string.escapeChar(ch));
    }
    sb.push('"');
    return sb.join('');
  }
};


/**
 * Takes a string and returns the escaped string for that character.
 * @param {string} str The string to escape.
 * @return {string} An escaped string representing {@code str}.
 */
goog.string.escapeString = function(str) {
  var sb = [];
  for (var i = 0; i < str.length; i++) {
    sb[i] = goog.string.escapeChar(str.charAt(i));
  }
  return sb.join('');
};


/**
 * Takes a character and returns the escaped string for that character. For
 * example escapeChar(String.fromCharCode(15)) -> "\\x0E".
 * @param {string} c The character to escape.
 * @return {string} An escaped string representing {@code c}.
 */
goog.string.escapeChar = function(c) {
  if (c in goog.string.jsEscapeCache_) {
    return goog.string.jsEscapeCache_[c];
  }

  if (c in goog.string.specialEscapeChars_) {
    return goog.string.jsEscapeCache_[c] = goog.string.specialEscapeChars_[c];
  }

  var rv = c;
  var cc = c.charCodeAt(0);
  if (cc > 31 && cc < 127) {
    rv = c;
  } else {
    // tab is 9 but handled above
    if (cc < 256) {
      rv = '\\x';
      if (cc < 16 || cc > 256) {
        rv += '0';
      }
    } else {
      rv = '\\u';
      if (cc < 4096) { // \u1000
        rv += '0';
      }
    }
    rv += cc.toString(16).toUpperCase();
  }

  return goog.string.jsEscapeCache_[c] = rv;
};


/**
 * Takes a string and creates a map (Object) in which the keys are the
 * characters in the string. The value for the key is set to true. You can
 * then use goog.object.map or goog.array.map to change the values.
 * @param {string} s The string to build the map from.
 * @return {!Object} The map of characters used.
 */
// TODO(arv): It seems like we should have a generic goog.array.toMap. But do
//            we want a dependency on goog.array in goog.string?
goog.string.toMap = function(s) {
  var rv = {};
  for (var i = 0; i < s.length; i++) {
    rv[s.charAt(i)] = true;
  }
  return rv;
};


/**
 * Determines whether a string contains a substring.
 * @param {string} str The string to search.
 * @param {string} subString The substring to search for.
 * @return {boolean} Whether {@code str} contains {@code subString}.
 */
goog.string.contains = function(str, subString) {
  return str.indexOf(subString) != -1;
};


/**
 * Determines whether a string contains a substring, ignoring case.
 * @param {string} str The string to search.
 * @param {string} subString The substring to search for.
 * @return {boolean} Whether {@code str} contains {@code subString}.
 */
goog.string.caseInsensitiveContains = function(str, subString) {
  return goog.string.contains(str.toLowerCase(), subString.toLowerCase());
};


/**
 * Returns the non-overlapping occurrences of ss in s.
 * If either s or ss evalutes to false, then returns zero.
 * @param {string} s The string to look in.
 * @param {string} ss The string to look for.
 * @return {number} Number of occurrences of ss in s.
 */
goog.string.countOf = function(s, ss) {
  return s && ss ? s.split(ss).length - 1 : 0;
};


/**
 * Removes a substring of a specified length at a specific
 * index in a string.
 * @param {string} s The base string from which to remove.
 * @param {number} index The index at which to remove the substring.
 * @param {number} stringLength The length of the substring to remove.
 * @return {string} A copy of {@code s} with the substring removed or the full
 *     string if nothing is removed or the input is invalid.
 */
goog.string.removeAt = function(s, index, stringLength) {
  var resultStr = s;
  // If the index is greater or equal to 0 then remove substring
  if (index >= 0 && index < s.length && stringLength > 0) {
    resultStr = s.substr(0, index) +
        s.substr(index + stringLength, s.length - index - stringLength);
  }
  return resultStr;
};


/**
 *  Removes the first occurrence of a substring from a string.
 *  @param {string} s The base string from which to remove.
 *  @param {string} ss The string to remove.
 *  @return {string} A copy of {@code s} with {@code ss} removed or the full
 *      string if nothing is removed.
 */
goog.string.remove = function(s, ss) {
  var re = new RegExp(goog.string.regExpEscape(ss), '');
  return s.replace(re, '');
};


/**
 *  Removes all occurrences of a substring from a string.
 *  @param {string} s The base string from which to remove.
 *  @param {string} ss The string to remove.
 *  @return {string} A copy of {@code s} with {@code ss} removed or the full
 *      string if nothing is removed.
 */
goog.string.removeAll = function(s, ss) {
  var re = new RegExp(goog.string.regExpEscape(ss), 'g');
  return s.replace(re, '');
};


/**
 * Escapes characters in the string that are not safe to use in a RegExp.
 * @param {*} s The string to escape. If not a string, it will be casted
 *     to one.
 * @return {string} A RegExp safe, escaped copy of {@code s}.
 */
goog.string.regExpEscape = function(s) {
  return String(s).replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, '\\$1').
      replace(/\x08/g, '\\x08');
};


/**
 * Repeats a string n times.
 * @param {string} string The string to repeat.
 * @param {number} length The number of times to repeat.
 * @return {string} A string containing {@code length} repetitions of
 *     {@code string}.
 */
goog.string.repeat = function(string, length) {
  return new Array(length + 1).join(string);
};


/**
 * Pads number to given length and optionally rounds it to a given precision.
 * For example:
 * <pre>padNumber(1.25, 2, 3) -> '01.250'
 * padNumber(1.25, 2) -> '01.25'
 * padNumber(1.25, 2, 1) -> '01.3'
 * padNumber(1.25, 0) -> '1.25'</pre>
 *
 * @param {number} num The number to pad.
 * @param {number} length The desired length.
 * @param {number=} opt_precision The desired precision.
 * @return {string} {@code num} as a string with the given options.
 */
goog.string.padNumber = function(num, length, opt_precision) {
  var s = goog.isDef(opt_precision) ? num.toFixed(opt_precision) : String(num);
  var index = s.indexOf('.');
  if (index == -1) {
    index = s.length;
  }
  return goog.string.repeat('0', Math.max(0, length - index)) + s;
};


/**
 * Returns a string representation of the given object, with
 * null and undefined being returned as the empty string.
 *
 * @param {*} obj The object to convert.
 * @return {string} A string representation of the {@code obj}.
 */
goog.string.makeSafe = function(obj) {
  return obj == null ? '' : String(obj);
};


/**
 * Concatenates string expressions. This is useful
 * since some browsers are very inefficient when it comes to using plus to
 * concat strings. Be careful when using null and undefined here since
 * these will not be included in the result. If you need to represent these
 * be sure to cast the argument to a String first.
 * For example:
 * <pre>buildString('a', 'b', 'c', 'd') -> 'abcd'
 * buildString(null, undefined) -> ''
 * </pre>
 * @param {...*} var_args A list of strings to concatenate. If not a string,
 *     it will be casted to one.
 * @return {string} The concatenation of {@code var_args}.
 */
goog.string.buildString = function(var_args) {
  return Array.prototype.join.call(arguments, '');
};


/**
 * Returns a string with at least 64-bits of randomness.
 *
 * Doesn't trust Javascript's random function entirely. Uses a combination of
 * random and current timestamp, and then encodes the string in base-36 to
 * make it shorter.
 *
 * @return {string} A random string, e.g. sn1s7vb4gcic.
 */
goog.string.getRandomString = function() {
  var x = 2147483648;
  return Math.floor(Math.random() * x).toString(36) +
         Math.abs(Math.floor(Math.random() * x) ^ goog.now()).toString(36);
};


/**
 * Compares two version numbers.
 *
 * @param {string|number} version1 Version of first item.
 * @param {string|number} version2 Version of second item.
 *
 * @return {number}  1 if {@code version1} is higher.
 *                   0 if arguments are equal.
 *                  -1 if {@code version2} is higher.
 */
goog.string.compareVersions = function(version1, version2) {
  var order = 0;
  // Trim leading and trailing whitespace and split the versions into
  // subversions.
  var v1Subs = goog.string.trim(String(version1)).split('.');
  var v2Subs = goog.string.trim(String(version2)).split('.');
  var subCount = Math.max(v1Subs.length, v2Subs.length);

  // Iterate over the subversions, as long as they appear to be equivalent.
  for (var subIdx = 0; order == 0 && subIdx < subCount; subIdx++) {
    var v1Sub = v1Subs[subIdx] || '';
    var v2Sub = v2Subs[subIdx] || '';

    // Split the subversions into pairs of numbers and qualifiers (like 'b').
    // Two different RegExp objects are needed because they are both using
    // the 'g' flag.
    var v1CompParser = new RegExp('(\\d*)(\\D*)', 'g');
    var v2CompParser = new RegExp('(\\d*)(\\D*)', 'g');
    do {
      var v1Comp = v1CompParser.exec(v1Sub) || ['', '', ''];
      var v2Comp = v2CompParser.exec(v2Sub) || ['', '', ''];
      // Break if there are no more matches.
      if (v1Comp[0].length == 0 && v2Comp[0].length == 0) {
        break;
      }

      // Parse the numeric part of the subversion. A missing number is
      // equivalent to 0.
      var v1CompNum = v1Comp[1].length == 0 ? 0 : parseInt(v1Comp[1], 10);
      var v2CompNum = v2Comp[1].length == 0 ? 0 : parseInt(v2Comp[1], 10);

      // Compare the subversion components. The number has the highest
      // precedence. Next, if the numbers are equal, a subversion without any
      // qualifier is always higher than a subversion with any qualifier. Next,
      // the qualifiers are compared as strings.
      order = goog.string.compareElements_(v1CompNum, v2CompNum) ||
          goog.string.compareElements_(v1Comp[2].length == 0,
              v2Comp[2].length == 0) ||
          goog.string.compareElements_(v1Comp[2], v2Comp[2]);
      // Stop as soon as an inequality is discovered.
    } while (order == 0);
  }

  return order;
};


/**
 * Compares elements of a version number.
 *
 * @param {string|number|boolean} left An element from a version number.
 * @param {string|number|boolean} right An element from a version number.
 *
 * @return {number}  1 if {@code left} is higher.
 *                   0 if arguments are equal.
 *                  -1 if {@code right} is higher.
 * @private
 */
goog.string.compareElements_ = function(left, right) {
  if (left < right) {
    return -1;
  } else if (left > right) {
    return 1;
  }
  return 0;
};


/**
 * Maximum value of #goog.string.hashCode, exclusive. 2^32.
 * @type {number}
 * @private
 */
goog.string.HASHCODE_MAX_ = 0x100000000;


/**
 * String hash function similar to java.lang.String.hashCode().
 * The hash code for a string is computed as
 * s[0] * 31 ^ (n - 1) + s[1] * 31 ^ (n - 2) + ... + s[n - 1],
 * where s[i] is the ith character of the string and n is the length of
 * the string. We mod the result to make it between 0 (inclusive) and 2^32
 * (exclusive).
 * @param {string} str A string.
 * @return {number} Hash value for {@code str}, between 0 (inclusive) and 2^32
 *  (exclusive). The empty string returns 0.
 */
goog.string.hashCode = function(str) {
  var result = 0;
  for (var i = 0; i < str.length; ++i) {
    result = 31 * result + str.charCodeAt(i);
    // Normalize to 4 byte range, 0 ... 2^32.
    result %= goog.string.HASHCODE_MAX_;
  }
  return result;
};


/**
 * The most recent unique ID. |0 is equivalent to Math.floor in this case.
 * @type {number}
 * @private
 */
goog.string.uniqueStringCounter_ = Math.random() * 0x80000000 | 0;


/**
 * Generates and returns a string which is unique in the current document.
 * This is useful, for example, to create unique IDs for DOM elements.
 * @return {string} A unique id.
 */
goog.string.createUniqueString = function() {
  return 'goog_' + goog.string.uniqueStringCounter_++;
};


/**
 * Converts the supplied string to a number, which may be Infinity or NaN.
 * This function strips whitespace: (toNumber(' 123') === 123)
 * This function accepts scientific notation: (toNumber('1e1') === 10)
 *
 * This is better than Javascript's built-in conversions because, sadly:
 *     (Number(' ') === 0) and (parseFloat('123a') === 123)
 *
 * @param {string} str The string to convert.
 * @return {number} The number the supplied string represents, or NaN.
 */
goog.string.toNumber = function(str) {
  var num = Number(str);
  if (num == 0 && goog.string.isEmpty(str)) {
    return NaN;
  }
  return num;
};


/**
 * Returns whether the given string is lower camel case (e.g. "isFooBar").
 *
 * Note that this assumes the string is entirely letters.
 * @see http://en.wikipedia.org/wiki/CamelCase#Variations_and_synonyms
 *
 * @param {string} str String to test.
 * @return {boolean} Whether the string is lower camel case.
 */
goog.string.isLowerCamelCase = function(str) {
  return /^[a-z]+([A-Z][a-z]*)*$/.test(str);
};


/**
 * Returns whether the given string is upper camel case (e.g. "FooBarBaz").
 *
 * Note that this assumes the string is entirely letters.
 * @see http://en.wikipedia.org/wiki/CamelCase#Variations_and_synonyms
 *
 * @param {string} str String to test.
 * @return {boolean} Whether the string is upper camel case.
 */
goog.string.isUpperCamelCase = function(str) {
  return /^([A-Z][a-z]*)+$/.test(str);
};


/**
 * Converts a string from selector-case to camelCase (e.g. from
 * "multi-part-string" to "multiPartString"), useful for converting
 * CSS selectors and HTML dataset keys to their equivalent JS properties.
 * @param {string} str The string in selector-case form.
 * @return {string} The string in camelCase form.
 */
goog.string.toCamelCase = function(str) {
  return String(str).replace(/\-([a-z])/g, function(all, match) {
    return match.toUpperCase();
  });
};


/**
 * Converts a string from camelCase to selector-case (e.g. from
 * "multiPartString" to "multi-part-string"), useful for converting JS
 * style and dataset properties to equivalent CSS selectors and HTML keys.
 * @param {string} str The string in camelCase form.
 * @return {string} The string in selector-case form.
 */
goog.string.toSelectorCase = function(str) {
  return String(str).replace(/([A-Z])/g, '-$1').toLowerCase();
};


/**
 * Converts a string into TitleCase. First character of the string is always
 * capitalized in addition to the first letter of every subsequent word.
 * Words are delimited by one or more whitespaces by default. Custom delimiters
 * can optionally be specified to replace the default, which doesn't preserve
 * whitespace delimiters and instead must be explicitly included if needed.
 *
 * Default delimiter => " ":
 *    goog.string.toTitleCase('oneTwoThree')    => 'OneTwoThree'
 *    goog.string.toTitleCase('one two three')  => 'One Two Three'
 *    goog.string.toTitleCase('  one   two   ') => '  One   Two   '
 *    goog.string.toTitleCase('one_two_three')  => 'One_two_three'
 *    goog.string.toTitleCase('one-two-three')  => 'One-two-three'
 *
 * Custom delimiter => "_-.":
 *    goog.string.toTitleCase('oneTwoThree', '_-.')       => 'OneTwoThree'
 *    goog.string.toTitleCase('one two three', '_-.')     => 'One two three'
 *    goog.string.toTitleCase('  one   two   ', '_-.')    => '  one   two   '
 *    goog.string.toTitleCase('one_two_three', '_-.')     => 'One_Two_Three'
 *    goog.string.toTitleCase('one-two-three', '_-.')     => 'One-Two-Three'
 *    goog.string.toTitleCase('one...two...three', '_-.') => 'One...Two...Three'
 *    goog.string.toTitleCase('one. two. three', '_-.')   => 'One. two. three'
 *    goog.string.toTitleCase('one-two.three', '_-.')     => 'One-Two.Three'
 *
 * @param {string} str String value in camelCase form.
 * @param {string=} opt_delimiters Custom delimiter character set used to
 *      distinguish words in the string value. Each character represents a
 *      single delimiter. When provided, default whitespace delimiter is
 *      overridden and must be explicitly included if needed.
 * @return {string} String value in TitleCase form.
 */
goog.string.toTitleCase = function(str, opt_delimiters) {
  var delimiters = goog.isString(opt_delimiters) ?
      goog.string.regExpEscape(opt_delimiters) : '\\s';

  // For IE8, we need to prevent using an empty character set. Otherwise,
  // incorrect matching will occur.
  delimiters = delimiters ? '|[' + delimiters + ']+' : '';

  var regexp = new RegExp('(^' + delimiters + ')([a-z])', 'g');
  return str.replace(regexp, function(all, p1, p2) {
    return p1 + p2.toUpperCase();
  });
};


/**
 * Parse a string in decimal or hexidecimal ('0xFFFF') form.
 *
 * To parse a particular radix, please use parseInt(string, radix) directly. See
 * https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/parseInt
 *
 * This is a wrapper for the built-in parseInt function that will only parse
 * numbers as base 10 or base 16.  Some JS implementations assume strings
 * starting with "0" are intended to be octal. ES3 allowed but discouraged
 * this behavior. ES5 forbids it.  This function emulates the ES5 behavior.
 *
 * For more information, see Mozilla JS Reference: http://goo.gl/8RiFj
 *
 * @param {string|number|null|undefined} value The value to be parsed.
 * @return {number} The number, parsed. If the string failed to parse, this
 *     will be NaN.
 */
goog.string.parseInt = function(value) {
  // Force finite numbers to strings.
  if (isFinite(value)) {
    value = String(value);
  }

  if (goog.isString(value)) {
    // If the string starts with '0x' or '-0x', parse as hex.
    return /^\s*-?0x/i.test(value) ?
        parseInt(value, 16) : parseInt(value, 10);
  }

  return NaN;
};


/**
 * Splits a string on a separator a limited number of times.
 *
 * This implementation is more similar to Python or Java, where the limit
 * parameter specifies the maximum number of splits rather than truncating
 * the number of results.
 *
 * See http://docs.python.org/2/library/stdtypes.html#str.split
 * See JavaDoc: http://goo.gl/F2AsY
 * See Mozilla reference: http://goo.gl/dZdZs
 *
 * @param {string} str String to split.
 * @param {string} separator The separator.
 * @param {number} limit The limit to the number of splits. The resulting array
 *     will have a maximum length of limit+1.  Negative numbers are the same
 *     as zero.
 * @return {!Array.<string>} The string, split.
 */

goog.string.splitLimit = function(str, separator, limit) {
  var parts = str.split(separator);
  var returnVal = [];

  // Only continue doing this while we haven't hit the limit and we have
  // parts left.
  while (limit > 0 && parts.length) {
    returnVal.push(parts.shift());
    limit--;
  }

  // If there are remaining parts, append them to the end.
  if (parts.length) {
    returnVal.push(parts.join(separator));
  }

  return returnVal;
};


// Copyright 2008 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Utilities to check the preconditions, postconditions and
 * invariants runtime.
 *
 * Methods in this package should be given special treatment by the compiler
 * for type-inference. For example, <code>goog.asserts.assert(foo)</code>
 * will restrict <code>foo</code> to a truthy value.
 *
 * The compiler has an option to disable asserts. So code like:
 * <code>
 * var x = goog.asserts.assert(foo()); goog.asserts.assert(bar());
 * </code>
 * will be transformed into:
 * <code>
 * var x = foo();
 * </code>
 * The compiler will leave in foo() (because its return value is used),
 * but it will remove bar() because it assumes it does not have side-effects.
 *
 */

goog.provide('goog.asserts');
goog.provide('goog.asserts.AssertionError');

goog.require('goog.debug.Error');
goog.require('goog.dom.NodeType');
goog.require('goog.string');


/**
 * @define {boolean} Whether to strip out asserts or to leave them in.
 */
goog.define('goog.asserts.ENABLE_ASSERTS', goog.DEBUG);



/**
 * Error object for failed assertions.
 * @param {string} messagePattern The pattern that was used to form message.
 * @param {!Array.<*>} messageArgs The items to substitute into the pattern.
 * @constructor
 * @extends {goog.debug.Error}
 * @final
 */
goog.asserts.AssertionError = function(messagePattern, messageArgs) {
  messageArgs.unshift(messagePattern);
  goog.debug.Error.call(this, goog.string.subs.apply(null, messageArgs));
  // Remove the messagePattern afterwards to avoid permenantly modifying the
  // passed in array.
  messageArgs.shift();

  /**
   * The message pattern used to format the error message. Error handlers can
   * use this to uniquely identify the assertion.
   * @type {string}
   */
  this.messagePattern = messagePattern;
};
goog.inherits(goog.asserts.AssertionError, goog.debug.Error);


/** @override */
goog.asserts.AssertionError.prototype.name = 'AssertionError';


/**
 * The default error handler.
 * @param {!goog.asserts.AssertionError} e The exception to be handled.
 */
goog.asserts.DEFAULT_ERROR_HANDLER = function(e) { throw e; };


/**
 * The handler responsible for throwing or logging assertion errors.
 * @private {function(!goog.asserts.AssertionError)}
 */
goog.asserts.errorHandler_ = goog.asserts.DEFAULT_ERROR_HANDLER;


/**
 * Throws an exception with the given message and "Assertion failed" prefixed
 * onto it.
 * @param {string} defaultMessage The message to use if givenMessage is empty.
 * @param {Array.<*>} defaultArgs The substitution arguments for defaultMessage.
 * @param {string|undefined} givenMessage Message supplied by the caller.
 * @param {Array.<*>} givenArgs The substitution arguments for givenMessage.
 * @throws {goog.asserts.AssertionError} When the value is not a number.
 * @private
 */
goog.asserts.doAssertFailure_ =
    function(defaultMessage, defaultArgs, givenMessage, givenArgs) {
  var message = 'Assertion failed';
  if (givenMessage) {
    message += ': ' + givenMessage;
    var args = givenArgs;
  } else if (defaultMessage) {
    message += ': ' + defaultMessage;
    args = defaultArgs;
  }
  // The '' + works around an Opera 10 bug in the unit tests. Without it,
  // a stack trace is added to var message above. With this, a stack trace is
  // not added until this line (it causes the extra garbage to be added after
  // the assertion message instead of in the middle of it).
  var e = new goog.asserts.AssertionError('' + message, args || []);
  goog.asserts.errorHandler_(e);
};


/**
 * Sets a custom error handler that can be used to customize the behavior of
 * assertion failures, for example by turning all assertion failures into log
 * messages.
 * @param {function(goog.asserts.AssertionError)} errorHandler
 */
goog.asserts.setErrorHandler = function(errorHandler) {
  if (goog.asserts.ENABLE_ASSERTS) {
    goog.asserts.errorHandler_ = errorHandler;
  }
};


/**
 * Checks if the condition evaluates to true if goog.asserts.ENABLE_ASSERTS is
 * true.
 * @template T
 * @param {T} condition The condition to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {T} The value of the condition.
 * @throws {goog.asserts.AssertionError} When the condition evaluates to false.
 */
goog.asserts.assert = function(condition, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !condition) {
    goog.asserts.doAssertFailure_('', null, opt_message,
        Array.prototype.slice.call(arguments, 2));
  }
  return condition;
};


/**
 * Fails if goog.asserts.ENABLE_ASSERTS is true. This function is useful in case
 * when we want to add a check in the unreachable area like switch-case
 * statement:
 *
 * <pre>
 *  switch(type) {
 *    case FOO: doSomething(); break;
 *    case BAR: doSomethingElse(); break;
 *    default: goog.assert.fail('Unrecognized type: ' + type);
 *      // We have only 2 types - "default:" section is unreachable code.
 *  }
 * </pre>
 *
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @throws {goog.asserts.AssertionError} Failure.
 */
goog.asserts.fail = function(opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS) {
    goog.asserts.errorHandler_(new goog.asserts.AssertionError(
        'Failure' + (opt_message ? ': ' + opt_message : ''),
        Array.prototype.slice.call(arguments, 1)));
  }
};


/**
 * Checks if the value is a number if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {number} The value, guaranteed to be a number when asserts enabled.
 * @throws {goog.asserts.AssertionError} When the value is not a number.
 */
goog.asserts.assertNumber = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isNumber(value)) {
    goog.asserts.doAssertFailure_('Expected number but got %s: %s.',
        [goog.typeOf(value), value], opt_message,
        Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {number} */ (value);
};


/**
 * Checks if the value is a string if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {string} The value, guaranteed to be a string when asserts enabled.
 * @throws {goog.asserts.AssertionError} When the value is not a string.
 */
goog.asserts.assertString = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isString(value)) {
    goog.asserts.doAssertFailure_('Expected string but got %s: %s.',
        [goog.typeOf(value), value], opt_message,
        Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {string} */ (value);
};


/**
 * Checks if the value is a function if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {!Function} The value, guaranteed to be a function when asserts
 *     enabled.
 * @throws {goog.asserts.AssertionError} When the value is not a function.
 */
goog.asserts.assertFunction = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isFunction(value)) {
    goog.asserts.doAssertFailure_('Expected function but got %s: %s.',
        [goog.typeOf(value), value], opt_message,
        Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {!Function} */ (value);
};


/**
 * Checks if the value is an Object if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {!Object} The value, guaranteed to be a non-null object.
 * @throws {goog.asserts.AssertionError} When the value is not an object.
 */
goog.asserts.assertObject = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isObject(value)) {
    goog.asserts.doAssertFailure_('Expected object but got %s: %s.',
        [goog.typeOf(value), value],
        opt_message, Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {!Object} */ (value);
};


/**
 * Checks if the value is an Array if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {!Array} The value, guaranteed to be a non-null array.
 * @throws {goog.asserts.AssertionError} When the value is not an array.
 */
goog.asserts.assertArray = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isArray(value)) {
    goog.asserts.doAssertFailure_('Expected array but got %s: %s.',
        [goog.typeOf(value), value], opt_message,
        Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {!Array} */ (value);
};


/**
 * Checks if the value is a boolean if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {boolean} The value, guaranteed to be a boolean when asserts are
 *     enabled.
 * @throws {goog.asserts.AssertionError} When the value is not a boolean.
 */
goog.asserts.assertBoolean = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isBoolean(value)) {
    goog.asserts.doAssertFailure_('Expected boolean but got %s: %s.',
        [goog.typeOf(value), value], opt_message,
        Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {boolean} */ (value);
};


/**
 * Checks if the value is a DOM Element if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {!Element} The value, likely to be a DOM Element when asserts are
 *     enabled.
 * @throws {goog.asserts.AssertionError} When the value is not a boolean.
 */
goog.asserts.assertElement = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && (!goog.isObject(value) ||
      value.nodeType != goog.dom.NodeType.ELEMENT)) {
    goog.asserts.doAssertFailure_('Expected Element but got %s: %s.',
        [goog.typeOf(value), value], opt_message,
        Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {!Element} */ (value);
};


/**
 * Checks if the value is an instance of the user-defined type if
 * goog.asserts.ENABLE_ASSERTS is true.
 *
 * The compiler may tighten the type returned by this function.
 *
 * @param {*} value The value to check.
 * @param {function(new: T, ...)} type A user-defined constructor.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @throws {goog.asserts.AssertionError} When the value is not an instance of
 *     type.
 * @return {!T}
 * @template T
 */
goog.asserts.assertInstanceof = function(value, type, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !(value instanceof type)) {
    goog.asserts.doAssertFailure_('instanceof check failed.', null,
        opt_message, Array.prototype.slice.call(arguments, 3));
  }
  return value;
};


/**
 * Checks that no enumerable keys are present in Object.prototype. Such keys
 * would break most code that use {@code for (var ... in ...)} loops.
 */
goog.asserts.assertObjectPrototypeIsIntact = function() {
  for (var key in Object.prototype) {
    goog.asserts.fail(key + ' should not be enumerable in Object.prototype.');
  }
};

// Copyright 2010 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview A global registry for entry points into a program,
 * so that they can be instrumented. Each module should register their
 * entry points with this registry. Designed to be compiled out
 * if no instrumentation is requested.
 *
 * Entry points may be registered before or after a call to
 * goog.debug.entryPointRegistry.monitorAll. If an entry point is registered
 * later, the existing monitor will instrument the new entry point.
 *
 * @author nicksantos@google.com (Nick Santos)
 */

goog.provide('goog.debug.EntryPointMonitor');
goog.provide('goog.debug.entryPointRegistry');

goog.require('goog.asserts');



/**
 * @interface
 */
goog.debug.EntryPointMonitor = function() {};


/**
 * Instruments a function.
 *
 * @param {!Function} fn A function to instrument.
 * @return {!Function} The instrumented function.
 */
goog.debug.EntryPointMonitor.prototype.wrap;


/**
 * Try to remove an instrumentation wrapper created by this monitor.
 * If the function passed to unwrap is not a wrapper created by this
 * monitor, then we will do nothing.
 *
 * Notice that some wrappers may not be unwrappable. For example, if other
 * monitors have applied their own wrappers, then it will be impossible to
 * unwrap them because their wrappers will have captured our wrapper.
 *
 * So it is important that entry points are unwrapped in the reverse
 * order that they were wrapped.
 *
 * @param {!Function} fn A function to unwrap.
 * @return {!Function} The unwrapped function, or {@code fn} if it was not
 *     a wrapped function created by this monitor.
 */
goog.debug.EntryPointMonitor.prototype.unwrap;


/**
 * An array of entry point callbacks.
 * @type {!Array.<function(!Function)>}
 * @private
 */
goog.debug.entryPointRegistry.refList_ = [];


/**
 * Monitors that should wrap all the entry points.
 * @type {!Array.<!goog.debug.EntryPointMonitor>}
 * @private
 */
goog.debug.entryPointRegistry.monitors_ = [];


/**
 * Whether goog.debug.entryPointRegistry.monitorAll has ever been called.
 * Checking this allows the compiler to optimize out the registrations.
 * @type {boolean}
 * @private
 */
goog.debug.entryPointRegistry.monitorsMayExist_ = false;


/**
 * Register an entry point with this module.
 *
 * The entry point will be instrumented when a monitor is passed to
 * goog.debug.entryPointRegistry.monitorAll. If this has already occurred, the
 * entry point is instrumented immediately.
 *
 * @param {function(!Function)} callback A callback function which is called
 *     with a transforming function to instrument the entry point. The callback
 *     is responsible for wrapping the relevant entry point with the
 *     transforming function.
 */
goog.debug.entryPointRegistry.register = function(callback) {
  // Don't use push(), so that this can be compiled out.
  goog.debug.entryPointRegistry.refList_[
      goog.debug.entryPointRegistry.refList_.length] = callback;
  // If no one calls monitorAll, this can be compiled out.
  if (goog.debug.entryPointRegistry.monitorsMayExist_) {
    var monitors = goog.debug.entryPointRegistry.monitors_;
    for (var i = 0; i < monitors.length; i++) {
      callback(goog.bind(monitors[i].wrap, monitors[i]));
    }
  }
};


/**
 * Configures a monitor to wrap all entry points.
 *
 * Entry points that have already been registered are immediately wrapped by
 * the monitor. When an entry point is registered in the future, it will also
 * be wrapped by the monitor when it is registered.
 *
 * @param {!goog.debug.EntryPointMonitor} monitor An entry point monitor.
 */
goog.debug.entryPointRegistry.monitorAll = function(monitor) {
  goog.debug.entryPointRegistry.monitorsMayExist_ = true;
  var transformer = goog.bind(monitor.wrap, monitor);
  for (var i = 0; i < goog.debug.entryPointRegistry.refList_.length; i++) {
    goog.debug.entryPointRegistry.refList_[i](transformer);
  }
  goog.debug.entryPointRegistry.monitors_.push(monitor);
};


/**
 * Try to unmonitor all the entry points that have already been registered. If
 * an entry point is registered in the future, it will not be wrapped by the
 * monitor when it is registered. Note that this may fail if the entry points
 * have additional wrapping.
 *
 * @param {!goog.debug.EntryPointMonitor} monitor The last monitor to wrap
 *     the entry points.
 * @throws {Error} If the monitor is not the most recently configured monitor.
 */
goog.debug.entryPointRegistry.unmonitorAllIfPossible = function(monitor) {
  var monitors = goog.debug.entryPointRegistry.monitors_;
  goog.asserts.assert(monitor == monitors[monitors.length - 1],
      'Only the most recent monitor can be unwrapped.');
  var transformer = goog.bind(monitor.unwrap, monitor);
  for (var i = 0; i < goog.debug.entryPointRegistry.refList_.length; i++) {
    goog.debug.entryPointRegistry.refList_[i](transformer);
  }
  monitors.length--;
};

// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Utilities for manipulating arrays.
 *
 */


goog.provide('goog.array');
goog.provide('goog.array.ArrayLike');

goog.require('goog.asserts');


/**
 * @define {boolean} NATIVE_ARRAY_PROTOTYPES indicates whether the code should
 * rely on Array.prototype functions, if available.
 *
 * The Array.prototype functions can be defined by external libraries like
 * Prototype and setting this flag to false forces closure to use its own
 * goog.array implementation.
 *
 * If your javascript can be loaded by a third party site and you are wary about
 * relying on the prototype functions, specify
 * "--define goog.NATIVE_ARRAY_PROTOTYPES=false" to the JSCompiler.
 *
 * Setting goog.TRUSTED_SITE to false will automatically set
 * NATIVE_ARRAY_PROTOTYPES to false.
 */
goog.define('goog.NATIVE_ARRAY_PROTOTYPES', goog.TRUSTED_SITE);


/**
 * @define {boolean} If true, JSCompiler will use the native implementation of
 * array functions where appropriate (e.g., {@code Array#filter}) and remove the
 * unused pure JS implementation.
 */
goog.define('goog.array.ASSUME_NATIVE_FUNCTIONS', false);


/**
 * @typedef {Array|NodeList|Arguments|{length: number}}
 */
goog.array.ArrayLike;


/**
 * Returns the last element in an array without removing it.
 * Same as goog.array.last.
 * @param {Array.<T>|goog.array.ArrayLike} array The array.
 * @return {T} Last item in array.
 * @template T
 */
goog.array.peek = function(array) {
  return array[array.length - 1];
};


/**
 * Returns the last element in an array without removing it.
 * Same as goog.array.peek.
 * @param {Array.<T>|goog.array.ArrayLike} array The array.
 * @return {T} Last item in array.
 * @template T
 */
goog.array.last = goog.array.peek;


/**
 * Reference to the original {@code Array.prototype}.
 * @private
 */
goog.array.ARRAY_PROTOTYPE_ = Array.prototype;


// NOTE(arv): Since most of the array functions are generic it allows you to
// pass an array-like object. Strings have a length and are considered array-
// like. However, the 'in' operator does not work on strings so we cannot just
// use the array path even if the browser supports indexing into strings. We
// therefore end up splitting the string.


/**
 * Returns the index of the first element of an array with a specified value, or
 * -1 if the element is not present in the array.
 *
 * See {@link http://tinyurl.com/developer-mozilla-org-array-indexof}
 *
 * @param {Array.<T>|goog.array.ArrayLike} arr The array to be searched.
 * @param {T} obj The object for which we are searching.
 * @param {number=} opt_fromIndex The index at which to start the search. If
 *     omitted the search starts at index 0.
 * @return {number} The index of the first matching array element.
 * @template T
 */
goog.array.indexOf = goog.NATIVE_ARRAY_PROTOTYPES &&
                     (goog.array.ASSUME_NATIVE_FUNCTIONS ||
                      goog.array.ARRAY_PROTOTYPE_.indexOf) ?
    function(arr, obj, opt_fromIndex) {
      goog.asserts.assert(arr.length != null);

      return goog.array.ARRAY_PROTOTYPE_.indexOf.call(arr, obj, opt_fromIndex);
    } :
    function(arr, obj, opt_fromIndex) {
      var fromIndex = opt_fromIndex == null ?
          0 : (opt_fromIndex < 0 ?
               Math.max(0, arr.length + opt_fromIndex) : opt_fromIndex);

      if (goog.isString(arr)) {
        // Array.prototype.indexOf uses === so only strings should be found.
        if (!goog.isString(obj) || obj.length != 1) {
          return -1;
        }
        return arr.indexOf(obj, fromIndex);
      }

      for (var i = fromIndex; i < arr.length; i++) {
        if (i in arr && arr[i] === obj)
          return i;
      }
      return -1;
    };


/**
 * Returns the index of the last element of an array with a specified value, or
 * -1 if the element is not present in the array.
 *
 * See {@link http://tinyurl.com/developer-mozilla-org-array-lastindexof}
 *
 * @param {!Array.<T>|!goog.array.ArrayLike} arr The array to be searched.
 * @param {T} obj The object for which we are searching.
 * @param {?number=} opt_fromIndex The index at which to start the search. If
 *     omitted the search starts at the end of the array.
 * @return {number} The index of the last matching array element.
 * @template T
 */
goog.array.lastIndexOf = goog.NATIVE_ARRAY_PROTOTYPES &&
                         (goog.array.ASSUME_NATIVE_FUNCTIONS ||
                          goog.array.ARRAY_PROTOTYPE_.lastIndexOf) ?
    function(arr, obj, opt_fromIndex) {
      goog.asserts.assert(arr.length != null);

      // Firefox treats undefined and null as 0 in the fromIndex argument which
      // leads it to always return -1
      var fromIndex = opt_fromIndex == null ? arr.length - 1 : opt_fromIndex;
      return goog.array.ARRAY_PROTOTYPE_.lastIndexOf.call(arr, obj, fromIndex);
    } :
    function(arr, obj, opt_fromIndex) {
      var fromIndex = opt_fromIndex == null ? arr.length - 1 : opt_fromIndex;

      if (fromIndex < 0) {
        fromIndex = Math.max(0, arr.length + fromIndex);
      }

      if (goog.isString(arr)) {
        // Array.prototype.lastIndexOf uses === so only strings should be found.
        if (!goog.isString(obj) || obj.length != 1) {
          return -1;
        }
        return arr.lastIndexOf(obj, fromIndex);
      }

      for (var i = fromIndex; i >= 0; i--) {
        if (i in arr && arr[i] === obj)
          return i;
      }
      return -1;
    };


/**
 * Calls a function for each element in an array. Skips holes in the array.
 * See {@link http://tinyurl.com/developer-mozilla-org-array-foreach}
 *
 * @param {Array.<T>|goog.array.ArrayLike} arr Array or array like object over
 *     which to iterate.
 * @param {?function(this: S, T, number, ?): ?} f The function to call for every
 *     element. This function takes 3 arguments (the element, the index and the
 *     array). The return value is ignored.
 * @param {S=} opt_obj The object to be used as the value of 'this' within f.
 * @template T,S
 */
goog.array.forEach = goog.NATIVE_ARRAY_PROTOTYPES &&
                     (goog.array.ASSUME_NATIVE_FUNCTIONS ||
                      goog.array.ARRAY_PROTOTYPE_.forEach) ?
    function(arr, f, opt_obj) {
      goog.asserts.assert(arr.length != null);

      goog.array.ARRAY_PROTOTYPE_.forEach.call(arr, f, opt_obj);
    } :
    function(arr, f, opt_obj) {
      var l = arr.length;  // must be fixed during loop... see docs
      var arr2 = goog.isString(arr) ? arr.split('') : arr;
      for (var i = 0; i < l; i++) {
        if (i in arr2) {
          f.call(opt_obj, arr2[i], i, arr);
        }
      }
    };


/**
 * Calls a function for each element in an array, starting from the last
 * element rather than the first.
 *
 * @param {Array.<T>|goog.array.ArrayLike} arr Array or array
 *     like object over which to iterate.
 * @param {?function(this: S, T, number, ?): ?} f The function to call for every
 *     element. This function
 *     takes 3 arguments (the element, the index and the array). The return
 *     value is ignored.
 * @param {S=} opt_obj The object to be used as the value of 'this'
 *     within f.
 * @template T,S
 */
goog.array.forEachRight = function(arr, f, opt_obj) {
  var l = arr.length;  // must be fixed during loop... see docs
  var arr2 = goog.isString(arr) ? arr.split('') : arr;
  for (var i = l - 1; i >= 0; --i) {
    if (i in arr2) {
      f.call(opt_obj, arr2[i], i, arr);
    }
  }
};


/**
 * Calls a function for each element in an array, and if the function returns
 * true adds the element to a new array.
 *
 * See {@link http://tinyurl.com/developer-mozilla-org-array-filter}
 *
 * @param {Array.<T>|goog.array.ArrayLike} arr Array or array
 *     like object over which to iterate.
 * @param {?function(this:S, T, number, ?):boolean} f The function to call for
 *     every element. This function
 *     takes 3 arguments (the element, the index and the array) and must
 *     return a Boolean. If the return value is true the element is added to the
 *     result array. If it is false the element is not included.
 * @param {S=} opt_obj The object to be used as the value of 'this'
 *     within f.
 * @return {!Array.<T>} a new array in which only elements that passed the test
 *     are present.
 * @template T,S
 */
goog.array.filter = goog.NATIVE_ARRAY_PROTOTYPES &&
                    (goog.array.ASSUME_NATIVE_FUNCTIONS ||
                     goog.array.ARRAY_PROTOTYPE_.filter) ?
    function(arr, f, opt_obj) {
      goog.asserts.assert(arr.length != null);

      return goog.array.ARRAY_PROTOTYPE_.filter.call(arr, f, opt_obj);
    } :
    function(arr, f, opt_obj) {
      var l = arr.length;  // must be fixed during loop... see docs
      var res = [];
      var resLength = 0;
      var arr2 = goog.isString(arr) ? arr.split('') : arr;
      for (var i = 0; i < l; i++) {
        if (i in arr2) {
          var val = arr2[i];  // in case f mutates arr2
          if (f.call(opt_obj, val, i, arr)) {
            res[resLength++] = val;
          }
        }
      }
      return res;
    };


/**
 * Calls a function for each element in an array and inserts the result into a
 * new array.
 *
 * See {@link http://tinyurl.com/developer-mozilla-org-array-map}
 *
 * @param {Array.<VALUE>|goog.array.ArrayLike} arr Array or array like object
 *     over which to iterate.
 * @param {function(this:THIS, VALUE, number, ?): RESULT} f The function to call
 *     for every element. This function takes 3 arguments (the element,
 *     the index and the array) and should return something. The result will be
 *     inserted into a new array.
 * @param {THIS=} opt_obj The object to be used as the value of 'this' within f.
 * @return {!Array.<RESULT>} a new array with the results from f.
 * @template THIS, VALUE, RESULT
 */
goog.array.map = goog.NATIVE_ARRAY_PROTOTYPES &&
                 (goog.array.ASSUME_NATIVE_FUNCTIONS ||
                  goog.array.ARRAY_PROTOTYPE_.map) ?
    function(arr, f, opt_obj) {
      goog.asserts.assert(arr.length != null);

      return goog.array.ARRAY_PROTOTYPE_.map.call(arr, f, opt_obj);
    } :
    function(arr, f, opt_obj) {
      var l = arr.length;  // must be fixed during loop... see docs
      var res = new Array(l);
      var arr2 = goog.isString(arr) ? arr.split('') : arr;
      for (var i = 0; i < l; i++) {
        if (i in arr2) {
          res[i] = f.call(opt_obj, arr2[i], i, arr);
        }
      }
      return res;
    };


/**
 * Passes every element of an array into a function and accumulates the result.
 *
 * See {@link http://tinyurl.com/developer-mozilla-org-array-reduce}
 *
 * For example:
 * var a = [1, 2, 3, 4];
 * goog.array.reduce(a, function(r, v, i, arr) {return r + v;}, 0);
 * returns 10
 *
 * @param {Array.<T>|goog.array.ArrayLike} arr Array or array
 *     like object over which to iterate.
 * @param {?function(this:S, R, T, number, ?) : R} f The function to call for
 *     every element. This function
 *     takes 4 arguments (the function's previous result or the initial value,
 *     the value of the current array element, the current array index, and the
 *     array itself)
 *     function(previousValue, currentValue, index, array).
 * @param {?} val The initial value to pass into the function on the first call.
 * @param {S=} opt_obj  The object to be used as the value of 'this'
 *     within f.
 * @return {R} Result of evaluating f repeatedly across the values of the array.
 * @template T,S,R
 */
goog.array.reduce = goog.NATIVE_ARRAY_PROTOTYPES &&
                    (goog.array.ASSUME_NATIVE_FUNCTIONS ||
                     goog.array.ARRAY_PROTOTYPE_.reduce) ?
    function(arr, f, val, opt_obj) {
      goog.asserts.assert(arr.length != null);
      if (opt_obj) {
        f = goog.bind(f, opt_obj);
      }
      return goog.array.ARRAY_PROTOTYPE_.reduce.call(arr, f, val);
    } :
    function(arr, f, val, opt_obj) {
      var rval = val;
      goog.array.forEach(arr, function(val, index) {
        rval = f.call(opt_obj, rval, val, index, arr);
      });
      return rval;
    };


/**
 * Passes every element of an array into a function and accumulates the result,
 * starting from the last element and working towards the first.
 *
 * See {@link http://tinyurl.com/developer-mozilla-org-array-reduceright}
 *
 * For example:
 * var a = ['a', 'b', 'c'];
 * goog.array.reduceRight(a, function(r, v, i, arr) {return r + v;}, '');
 * returns 'cba'
 *
 * @param {Array.<T>|goog.array.ArrayLike} arr Array or array
 *     like object over which to iterate.
 * @param {?function(this:S, R, T, number, ?) : R} f The function to call for
 *     every element. This function
 *     takes 4 arguments (the function's previous result or the initial value,
 *     the value of the current array element, the current array index, and the
 *     array itself)
 *     function(previousValue, currentValue, index, array).
 * @param {?} val The initial value to pass into the function on the first call.
 * @param {S=} opt_obj The object to be used as the value of 'this'
 *     within f.
 * @return {R} Object returned as a result of evaluating f repeatedly across the
 *     values of the array.
 * @template T,S,R
 */
goog.array.reduceRight = goog.NATIVE_ARRAY_PROTOTYPES &&
                         (goog.array.ASSUME_NATIVE_FUNCTIONS ||
                          goog.array.ARRAY_PROTOTYPE_.reduceRight) ?
    function(arr, f, val, opt_obj) {
      goog.asserts.assert(arr.length != null);
      if (opt_obj) {
        f = goog.bind(f, opt_obj);
      }
      return goog.array.ARRAY_PROTOTYPE_.reduceRight.call(arr, f, val);
    } :
    function(arr, f, val, opt_obj) {
      var rval = val;
      goog.array.forEachRight(arr, function(val, index) {
        rval = f.call(opt_obj, rval, val, index, arr);
      });
      return rval;
    };


/**
 * Calls f for each element of an array. If any call returns true, some()
 * returns true (without checking the remaining elements). If all calls
 * return false, some() returns false.
 *
 * See {@link http://tinyurl.com/developer-mozilla-org-array-some}
 *
 * @param {Array.<T>|goog.array.ArrayLike} arr Array or array
 *     like object over which to iterate.
 * @param {?function(this:S, T, number, ?) : boolean} f The function to call for
 *     for every element. This function takes 3 arguments (the element, the
 *     index and the array) and should return a boolean.
 * @param {S=} opt_obj  The object to be used as the value of 'this'
 *     within f.
 * @return {boolean} true if any element passes the test.
 * @template T,S
 */
goog.array.some = goog.NATIVE_ARRAY_PROTOTYPES &&
                  (goog.array.ASSUME_NATIVE_FUNCTIONS ||
                   goog.array.ARRAY_PROTOTYPE_.some) ?
    function(arr, f, opt_obj) {
      goog.asserts.assert(arr.length != null);

      return goog.array.ARRAY_PROTOTYPE_.some.call(arr, f, opt_obj);
    } :
    function(arr, f, opt_obj) {
      var l = arr.length;  // must be fixed during loop... see docs
      var arr2 = goog.isString(arr) ? arr.split('') : arr;
      for (var i = 0; i < l; i++) {
        if (i in arr2 && f.call(opt_obj, arr2[i], i, arr)) {
          return true;
        }
      }
      return false;
    };


/**
 * Call f for each element of an array. If all calls return true, every()
 * returns true. If any call returns false, every() returns false and
 * does not continue to check the remaining elements.
 *
 * See {@link http://tinyurl.com/developer-mozilla-org-array-every}
 *
 * @param {Array.<T>|goog.array.ArrayLike} arr Array or array
 *     like object over which to iterate.
 * @param {?function(this:S, T, number, ?) : boolean} f The function to call for
 *     for every element. This function takes 3 arguments (the element, the
 *     index and the array) and should return a boolean.
 * @param {S=} opt_obj The object to be used as the value of 'this'
 *     within f.
 * @return {boolean} false if any element fails the test.
 * @template T,S
 */
goog.array.every = goog.NATIVE_ARRAY_PROTOTYPES &&
                   (goog.array.ASSUME_NATIVE_FUNCTIONS ||
                    goog.array.ARRAY_PROTOTYPE_.every) ?
    function(arr, f, opt_obj) {
      goog.asserts.assert(arr.length != null);

      return goog.array.ARRAY_PROTOTYPE_.every.call(arr, f, opt_obj);
    } :
    function(arr, f, opt_obj) {
      var l = arr.length;  // must be fixed during loop... see docs
      var arr2 = goog.isString(arr) ? arr.split('') : arr;
      for (var i = 0; i < l; i++) {
        if (i in arr2 && !f.call(opt_obj, arr2[i], i, arr)) {
          return false;
        }
      }
      return true;
    };


/**
 * Counts the array elements that fulfill the predicate, i.e. for which the
 * callback function returns true. Skips holes in the array.
 *
 * @param {!(Array.<T>|goog.array.ArrayLike)} arr Array or array like object
 *     over which to iterate.
 * @param {function(this: S, T, number, ?): boolean} f The function to call for
 *     every element. Takes 3 arguments (the element, the index and the array).
 * @param {S=} opt_obj The object to be used as the value of 'this' within f.
 * @return {number} The number of the matching elements.
 * @template T,S
 */
goog.array.count = function(arr, f, opt_obj) {
  var count = 0;
  goog.array.forEach(arr, function(element, index, arr) {
    if (f.call(opt_obj, element, index, arr)) {
      ++count;
    }
  }, opt_obj);
  return count;
};


/**
 * Search an array for the first element that satisfies a given condition and
 * return that element.
 * @param {Array.<T>|goog.array.ArrayLike} arr Array or array
 *     like object over which to iterate.
 * @param {?function(this:S, T, number, ?) : boolean} f The function to call
 *     for every element. This function takes 3 arguments (the element, the
 *     index and the array) and should return a boolean.
 * @param {S=} opt_obj An optional "this" context for the function.
 * @return {?T} The first array element that passes the test, or null if no
 *     element is found.
 * @template T,S
 */
goog.array.find = function(arr, f, opt_obj) {
  var i = goog.array.findIndex(arr, f, opt_obj);
  return i < 0 ? null : goog.isString(arr) ? arr.charAt(i) : arr[i];
};


/**
 * Search an array for the first element that satisfies a given condition and
 * return its index.
 * @param {Array.<T>|goog.array.ArrayLike} arr Array or array
 *     like object over which to iterate.
 * @param {?function(this:S, T, number, ?) : boolean} f The function to call for
 *     every element. This function
 *     takes 3 arguments (the element, the index and the array) and should
 *     return a boolean.
 * @param {S=} opt_obj An optional "this" context for the function.
 * @return {number} The index of the first array element that passes the test,
 *     or -1 if no element is found.
 * @template T,S
 */
goog.array.findIndex = function(arr, f, opt_obj) {
  var l = arr.length;  // must be fixed during loop... see docs
  var arr2 = goog.isString(arr) ? arr.split('') : arr;
  for (var i = 0; i < l; i++) {
    if (i in arr2 && f.call(opt_obj, arr2[i], i, arr)) {
      return i;
    }
  }
  return -1;
};


/**
 * Search an array (in reverse order) for the last element that satisfies a
 * given condition and return that element.
 * @param {Array.<T>|goog.array.ArrayLike} arr Array or array
 *     like object over which to iterate.
 * @param {?function(this:S, T, number, ?) : boolean} f The function to call
 *     for every element. This function
 *     takes 3 arguments (the element, the index and the array) and should
 *     return a boolean.
 * @param {S=} opt_obj An optional "this" context for the function.
 * @return {?T} The last array element that passes the test, or null if no
 *     element is found.
 * @template T,S
 */
goog.array.findRight = function(arr, f, opt_obj) {
  var i = goog.array.findIndexRight(arr, f, opt_obj);
  return i < 0 ? null : goog.isString(arr) ? arr.charAt(i) : arr[i];
};


/**
 * Search an array (in reverse order) for the last element that satisfies a
 * given condition and return its index.
 * @param {Array.<T>|goog.array.ArrayLike} arr Array or array
 *     like object over which to iterate.
 * @param {?function(this:S, T, number, ?) : boolean} f The function to call
 *     for every element. This function
 *     takes 3 arguments (the element, the index and the array) and should
 *     return a boolean.
 * @param {Object=} opt_obj An optional "this" context for the function.
 * @return {number} The index of the last array element that passes the test,
 *     or -1 if no element is found.
 * @template T,S
 */
goog.array.findIndexRight = function(arr, f, opt_obj) {
  var l = arr.length;  // must be fixed during loop... see docs
  var arr2 = goog.isString(arr) ? arr.split('') : arr;
  for (var i = l - 1; i >= 0; i--) {
    if (i in arr2 && f.call(opt_obj, arr2[i], i, arr)) {
      return i;
    }
  }
  return -1;
};


/**
 * Whether the array contains the given object.
 * @param {goog.array.ArrayLike} arr The array to test for the presence of the
 *     element.
 * @param {*} obj The object for which to test.
 * @return {boolean} true if obj is present.
 */
goog.array.contains = function(arr, obj) {
  return goog.array.indexOf(arr, obj) >= 0;
};


/**
 * Whether the array is empty.
 * @param {goog.array.ArrayLike} arr The array to test.
 * @return {boolean} true if empty.
 */
goog.array.isEmpty = function(arr) {
  return arr.length == 0;
};


/**
 * Clears the array.
 * @param {goog.array.ArrayLike} arr Array or array like object to clear.
 */
goog.array.clear = function(arr) {
  // For non real arrays we don't have the magic length so we delete the
  // indices.
  if (!goog.isArray(arr)) {
    for (var i = arr.length - 1; i >= 0; i--) {
      delete arr[i];
    }
  }
  arr.length = 0;
};


/**
 * Pushes an item into an array, if it's not already in the array.
 * @param {Array.<T>} arr Array into which to insert the item.
 * @param {T} obj Value to add.
 * @template T
 */
goog.array.insert = function(arr, obj) {
  if (!goog.array.contains(arr, obj)) {
    arr.push(obj);
  }
};


/**
 * Inserts an object at the given index of the array.
 * @param {goog.array.ArrayLike} arr The array to modify.
 * @param {*} obj The object to insert.
 * @param {number=} opt_i The index at which to insert the object. If omitted,
 *      treated as 0. A negative index is counted from the end of the array.
 */
goog.array.insertAt = function(arr, obj, opt_i) {
  goog.array.splice(arr, opt_i, 0, obj);
};


/**
 * Inserts at the given index of the array, all elements of another array.
 * @param {goog.array.ArrayLike} arr The array to modify.
 * @param {goog.array.ArrayLike} elementsToAdd The array of elements to add.
 * @param {number=} opt_i The index at which to insert the object. If omitted,
 *      treated as 0. A negative index is counted from the end of the array.
 */
goog.array.insertArrayAt = function(arr, elementsToAdd, opt_i) {
  goog.partial(goog.array.splice, arr, opt_i, 0).apply(null, elementsToAdd);
};


/**
 * Inserts an object into an array before a specified object.
 * @param {Array.<T>} arr The array to modify.
 * @param {T} obj The object to insert.
 * @param {T=} opt_obj2 The object before which obj should be inserted. If obj2
 *     is omitted or not found, obj is inserted at the end of the array.
 * @template T
 */
goog.array.insertBefore = function(arr, obj, opt_obj2) {
  var i;
  if (arguments.length == 2 || (i = goog.array.indexOf(arr, opt_obj2)) < 0) {
    arr.push(obj);
  } else {
    goog.array.insertAt(arr, obj, i);
  }
};


/**
 * Removes the first occurrence of a particular value from an array.
 * @param {Array.<T>|goog.array.ArrayLike} arr Array from which to remove
 *     value.
 * @param {T} obj Object to remove.
 * @return {boolean} True if an element was removed.
 * @template T
 */
goog.array.remove = function(arr, obj) {
  var i = goog.array.indexOf(arr, obj);
  var rv;
  if ((rv = i >= 0)) {
    goog.array.removeAt(arr, i);
  }
  return rv;
};


/**
 * Removes from an array the element at index i
 * @param {goog.array.ArrayLike} arr Array or array like object from which to
 *     remove value.
 * @param {number} i The index to remove.
 * @return {boolean} True if an element was removed.
 */
goog.array.removeAt = function(arr, i) {
  goog.asserts.assert(arr.length != null);

  // use generic form of splice
  // splice returns the removed items and if successful the length of that
  // will be 1
  return goog.array.ARRAY_PROTOTYPE_.splice.call(arr, i, 1).length == 1;
};


/**
 * Removes the first value that satisfies the given condition.
 * @param {Array.<T>|goog.array.ArrayLike} arr Array or array
 *     like object over which to iterate.
 * @param {?function(this:S, T, number, ?) : boolean} f The function to call
 *     for every element. This function
 *     takes 3 arguments (the element, the index and the array) and should
 *     return a boolean.
 * @param {S=} opt_obj An optional "this" context for the function.
 * @return {boolean} True if an element was removed.
 * @template T,S
 */
goog.array.removeIf = function(arr, f, opt_obj) {
  var i = goog.array.findIndex(arr, f, opt_obj);
  if (i >= 0) {
    goog.array.removeAt(arr, i);
    return true;
  }
  return false;
};


/**
 * Returns a new array that is the result of joining the arguments.  If arrays
 * are passed then their items are added, however, if non-arrays are passed they
 * will be added to the return array as is.
 *
 * Note that ArrayLike objects will be added as is, rather than having their
 * items added.
 *
 * goog.array.concat([1, 2], [3, 4]) -> [1, 2, 3, 4]
 * goog.array.concat(0, [1, 2]) -> [0, 1, 2]
 * goog.array.concat([1, 2], null) -> [1, 2, null]
 *
 * There is bug in all current versions of IE (6, 7 and 8) where arrays created
 * in an iframe become corrupted soon (not immediately) after the iframe is
 * destroyed. This is common if loading data via goog.net.IframeIo, for example.
 * This corruption only affects the concat method which will start throwing
 * Catastrophic Errors (#-2147418113).
 *
 * See http://endoflow.com/scratch/corrupted-arrays.html for a test case.
 *
 * Internally goog.array should use this, so that all methods will continue to
 * work on these broken array objects.
 *
 * @param {...*} var_args Items to concatenate.  Arrays will have each item
 *     added, while primitives and objects will be added as is.
 * @return {!Array} The new resultant array.
 */
goog.array.concat = function(var_args) {
  return goog.array.ARRAY_PROTOTYPE_.concat.apply(
      goog.array.ARRAY_PROTOTYPE_, arguments);
};


/**
 * Returns a new array that contains the contents of all the arrays passed.
 * @param {...!Array.<T>} var_args
 * @return {!Array.<T>}
 * @template T
 */
goog.array.join = function(var_args) {
  return goog.array.ARRAY_PROTOTYPE_.concat.apply(
      goog.array.ARRAY_PROTOTYPE_, arguments);
};


/**
 * Converts an object to an array.
 * @param {Array.<T>|goog.array.ArrayLike} object  The object to convert to an
 *     array.
 * @return {!Array.<T>} The object converted into an array. If object has a
 *     length property, every property indexed with a non-negative number
 *     less than length will be included in the result. If object does not
 *     have a length property, an empty array will be returned.
 * @template T
 */
goog.array.toArray = function(object) {
  var length = object.length;

  // If length is not a number the following it false. This case is kept for
  // backwards compatibility since there are callers that pass objects that are
  // not array like.
  if (length > 0) {
    var rv = new Array(length);
    for (var i = 0; i < length; i++) {
      rv[i] = object[i];
    }
    return rv;
  }
  return [];
};


/**
 * Does a shallow copy of an array.
 * @param {Array.<T>|goog.array.ArrayLike} arr  Array or array-like object to
 *     clone.
 * @return {!Array.<T>} Clone of the input array.
 * @template T
 */
goog.array.clone = goog.array.toArray;


/**
 * Extends an array with another array, element, or "array like" object.
 * This function operates 'in-place', it does not create a new Array.
 *
 * Example:
 * var a = [];
 * goog.array.extend(a, [0, 1]);
 * a; // [0, 1]
 * goog.array.extend(a, 2);
 * a; // [0, 1, 2]
 *
 * @param {Array.<VALUE>} arr1  The array to modify.
 * @param {...(Array.<VALUE>|VALUE)} var_args The elements or arrays of elements
 *     to add to arr1.
 * @template VALUE
 */
goog.array.extend = function(arr1, var_args) {
  for (var i = 1; i < arguments.length; i++) {
    var arr2 = arguments[i];
    // If we have an Array or an Arguments object we can just call push
    // directly.
    var isArrayLike;
    if (goog.isArray(arr2) ||
        // Detect Arguments. ES5 says that the [[Class]] of an Arguments object
        // is "Arguments" but only V8 and JSC/Safari gets this right. We instead
        // detect Arguments by checking for array like and presence of "callee".
        (isArrayLike = goog.isArrayLike(arr2)) &&
            // The getter for callee throws an exception in strict mode
            // according to section 10.6 in ES5 so check for presence instead.
            Object.prototype.hasOwnProperty.call(arr2, 'callee')) {
      arr1.push.apply(arr1, arr2);
    } else if (isArrayLike) {
      // Otherwise loop over arr2 to prevent copying the object.
      var len1 = arr1.length;
      var len2 = arr2.length;
      for (var j = 0; j < len2; j++) {
        arr1[len1 + j] = arr2[j];
      }
    } else {
      arr1.push(arr2);
    }
  }
};


/**
 * Adds or removes elements from an array. This is a generic version of Array
 * splice. This means that it might work on other objects similar to arrays,
 * such as the arguments object.
 *
 * @param {Array.<T>|goog.array.ArrayLike} arr The array to modify.
 * @param {number|undefined} index The index at which to start changing the
 *     array. If not defined, treated as 0.
 * @param {number} howMany How many elements to remove (0 means no removal. A
 *     value below 0 is treated as zero and so is any other non number. Numbers
 *     are floored).
 * @param {...T} var_args Optional, additional elements to insert into the
 *     array.
 * @return {!Array.<T>} the removed elements.
 * @template T
 */
goog.array.splice = function(arr, index, howMany, var_args) {
  goog.asserts.assert(arr.length != null);

  return goog.array.ARRAY_PROTOTYPE_.splice.apply(
      arr, goog.array.slice(arguments, 1));
};


/**
 * Returns a new array from a segment of an array. This is a generic version of
 * Array slice. This means that it might work on other objects similar to
 * arrays, such as the arguments object.
 *
 * @param {Array.<T>|goog.array.ArrayLike} arr The array from
 * which to copy a segment.
 * @param {number} start The index of the first element to copy.
 * @param {number=} opt_end The index after the last element to copy.
 * @return {!Array.<T>} A new array containing the specified segment of the
 *     original array.
 * @template T
 */
goog.array.slice = function(arr, start, opt_end) {
  goog.asserts.assert(arr.length != null);

  // passing 1 arg to slice is not the same as passing 2 where the second is
  // null or undefined (in that case the second argument is treated as 0).
  // we could use slice on the arguments object and then use apply instead of
  // testing the length
  if (arguments.length <= 2) {
    return goog.array.ARRAY_PROTOTYPE_.slice.call(arr, start);
  } else {
    return goog.array.ARRAY_PROTOTYPE_.slice.call(arr, start, opt_end);
  }
};


/**
 * Removes all duplicates from an array (retaining only the first
 * occurrence of each array element).  This function modifies the
 * array in place and doesn't change the order of the non-duplicate items.
 *
 * For objects, duplicates are identified as having the same unique ID as
 * defined by {@link goog.getUid}.
 *
 * Alternatively you can specify a custom hash function that returns a unique
 * value for each item in the array it should consider unique.
 *
 * Runtime: N,
 * Worstcase space: 2N (no dupes)
 *
 * @param {Array.<T>|goog.array.ArrayLike} arr The array from which to remove
 *     duplicates.
 * @param {Array=} opt_rv An optional array in which to return the results,
 *     instead of performing the removal inplace.  If specified, the original
 *     array will remain unchanged.
 * @param {function(T):string=} opt_hashFn An optional function to use to
 *     apply to every item in the array. This function should return a unique
 *     value for each item in the array it should consider unique.
 * @template T
 */
goog.array.removeDuplicates = function(arr, opt_rv, opt_hashFn) {
  var returnArray = opt_rv || arr;
  var defaultHashFn = function(item) {
    // Prefix each type with a single character representing the type to
    // prevent conflicting keys (e.g. true and 'true').
    return goog.isObject(current) ? 'o' + goog.getUid(current) :
        (typeof current).charAt(0) + current;
  };
  var hashFn = opt_hashFn || defaultHashFn;

  var seen = {}, cursorInsert = 0, cursorRead = 0;
  while (cursorRead < arr.length) {
    var current = arr[cursorRead++];
    var key = hashFn(current);
    if (!Object.prototype.hasOwnProperty.call(seen, key)) {
      seen[key] = true;
      returnArray[cursorInsert++] = current;
    }
  }
  returnArray.length = cursorInsert;
};


/**
 * Searches the specified array for the specified target using the binary
 * search algorithm.  If no opt_compareFn is specified, elements are compared
 * using <code>goog.array.defaultCompare</code>, which compares the elements
 * using the built in < and > operators.  This will produce the expected
 * behavior for homogeneous arrays of String(s) and Number(s). The array
 * specified <b>must</b> be sorted in ascending order (as defined by the
 * comparison function).  If the array is not sorted, results are undefined.
 * If the array contains multiple instances of the specified target value, any
 * of these instances may be found.
 *
 * Runtime: O(log n)
 *
 * @param {Array.<VALUE>|goog.array.ArrayLike} arr The array to be searched.
 * @param {TARGET} target The sought value.
 * @param {function(TARGET, VALUE): number=} opt_compareFn Optional comparison
 *     function by which the array is ordered. Should take 2 arguments to
 *     compare, and return a negative number, zero, or a positive number
 *     depending on whether the first argument is less than, equal to, or
 *     greater than the second.
 * @return {number} Lowest index of the target value if found, otherwise
 *     (-(insertion point) - 1). The insertion point is where the value should
 *     be inserted into arr to preserve the sorted property.  Return value >= 0
 *     iff target is found.
 * @template TARGET, VALUE
 */
goog.array.binarySearch = function(arr, target, opt_compareFn) {
  return goog.array.binarySearch_(arr,
      opt_compareFn || goog.array.defaultCompare, false /* isEvaluator */,
      target);
};


/**
 * Selects an index in the specified array using the binary search algorithm.
 * The evaluator receives an element and determines whether the desired index
 * is before, at, or after it.  The evaluator must be consistent (formally,
 * goog.array.map(goog.array.map(arr, evaluator, opt_obj), goog.math.sign)
 * must be monotonically non-increasing).
 *
 * Runtime: O(log n)
 *
 * @param {Array.<VALUE>|goog.array.ArrayLike} arr The array to be searched.
 * @param {function(this:THIS, VALUE, number, ?): number} evaluator
 *     Evaluator function that receives 3 arguments (the element, the index and
 *     the array). Should return a negative number, zero, or a positive number
 *     depending on whether the desired index is before, at, or after the
 *     element passed to it.
 * @param {THIS=} opt_obj The object to be used as the value of 'this'
 *     within evaluator.
 * @return {number} Index of the leftmost element matched by the evaluator, if
 *     such exists; otherwise (-(insertion point) - 1). The insertion point is
 *     the index of the first element for which the evaluator returns negative,
 *     or arr.length if no such element exists. The return value is non-negative
 *     iff a match is found.
 * @template THIS, VALUE
 */
goog.array.binarySelect = function(arr, evaluator, opt_obj) {
  return goog.array.binarySearch_(arr, evaluator, true /* isEvaluator */,
      undefined /* opt_target */, opt_obj);
};


/**
 * Implementation of a binary search algorithm which knows how to use both
 * comparison functions and evaluators. If an evaluator is provided, will call
 * the evaluator with the given optional data object, conforming to the
 * interface defined in binarySelect. Otherwise, if a comparison function is
 * provided, will call the comparison function against the given data object.
 *
 * This implementation purposefully does not use goog.bind or goog.partial for
 * performance reasons.
 *
 * Runtime: O(log n)
 *
 * @param {Array.<VALUE>|goog.array.ArrayLike} arr The array to be searched.
 * @param {function(TARGET, VALUE): number|
 *         function(this:THIS, VALUE, number, ?): number} compareFn Either an
 *     evaluator or a comparison function, as defined by binarySearch
 *     and binarySelect above.
 * @param {boolean} isEvaluator Whether the function is an evaluator or a
 *     comparison function.
 * @param {TARGET=} opt_target If the function is a comparison function, then
 *     this is the target to binary search for.
 * @param {THIS=} opt_selfObj If the function is an evaluator, this is an
  *    optional this object for the evaluator.
 * @return {number} Lowest index of the target value if found, otherwise
 *     (-(insertion point) - 1). The insertion point is where the value should
 *     be inserted into arr to preserve the sorted property.  Return value >= 0
 *     iff target is found.
 * @template THIS, VALUE, TARGET
 * @private
 */
goog.array.binarySearch_ = function(arr, compareFn, isEvaluator, opt_target,
    opt_selfObj) {
  var left = 0;  // inclusive
  var right = arr.length;  // exclusive
  var found;
  while (left < right) {
    var middle = (left + right) >> 1;
    var compareResult;
    if (isEvaluator) {
      compareResult = compareFn.call(opt_selfObj, arr[middle], middle, arr);
    } else {
      compareResult = compareFn(opt_target, arr[middle]);
    }
    if (compareResult > 0) {
      left = middle + 1;
    } else {
      right = middle;
      // We are looking for the lowest index so we can't return immediately.
      found = !compareResult;
    }
  }
  // left is the index if found, or the insertion point otherwise.
  // ~left is a shorthand for -left - 1.
  return found ? left : ~left;
};


/**
 * Sorts the specified array into ascending order.  If no opt_compareFn is
 * specified, elements are compared using
 * <code>goog.array.defaultCompare</code>, which compares the elements using
 * the built in < and > operators.  This will produce the expected behavior
 * for homogeneous arrays of String(s) and Number(s), unlike the native sort,
 * but will give unpredictable results for heterogenous lists of strings and
 * numbers with different numbers of digits.
 *
 * This sort is not guaranteed to be stable.
 *
 * Runtime: Same as <code>Array.prototype.sort</code>
 *
 * @param {Array.<T>} arr The array to be sorted.
 * @param {?function(T,T):number=} opt_compareFn Optional comparison
 *     function by which the
 *     array is to be ordered. Should take 2 arguments to compare, and return a
 *     negative number, zero, or a positive number depending on whether the
 *     first argument is less than, equal to, or greater than the second.
 * @template T
 */
goog.array.sort = function(arr, opt_compareFn) {
  // TODO(arv): Update type annotation since null is not accepted.
  arr.sort(opt_compareFn || goog.array.defaultCompare);
};


/**
 * Sorts the specified array into ascending order in a stable way.  If no
 * opt_compareFn is specified, elements are compared using
 * <code>goog.array.defaultCompare</code>, which compares the elements using
 * the built in < and > operators.  This will produce the expected behavior
 * for homogeneous arrays of String(s) and Number(s).
 *
 * Runtime: Same as <code>Array.prototype.sort</code>, plus an additional
 * O(n) overhead of copying the array twice.
 *
 * @param {Array.<T>} arr The array to be sorted.
 * @param {?function(T, T): number=} opt_compareFn Optional comparison function
 *     by which the array is to be ordered. Should take 2 arguments to compare,
 *     and return a negative number, zero, or a positive number depending on
 *     whether the first argument is less than, equal to, or greater than the
 *     second.
 * @template T
 */
goog.array.stableSort = function(arr, opt_compareFn) {
  for (var i = 0; i < arr.length; i++) {
    arr[i] = {index: i, value: arr[i]};
  }
  var valueCompareFn = opt_compareFn || goog.array.defaultCompare;
  function stableCompareFn(obj1, obj2) {
    return valueCompareFn(obj1.value, obj2.value) || obj1.index - obj2.index;
  };
  goog.array.sort(arr, stableCompareFn);
  for (var i = 0; i < arr.length; i++) {
    arr[i] = arr[i].value;
  }
};


/**
 * Sorts an array of objects by the specified object key and compare
 * function. If no compare function is provided, the key values are
 * compared in ascending order using <code>goog.array.defaultCompare</code>.
 * This won't work for keys that get renamed by the compiler. So use
 * {'foo': 1, 'bar': 2} rather than {foo: 1, bar: 2}.
 * @param {Array.<Object>} arr An array of objects to sort.
 * @param {string} key The object key to sort by.
 * @param {Function=} opt_compareFn The function to use to compare key
 *     values.
 */
goog.array.sortObjectsByKey = function(arr, key, opt_compareFn) {
  var compare = opt_compareFn || goog.array.defaultCompare;
  goog.array.sort(arr, function(a, b) {
    return compare(a[key], b[key]);
  });
};


/**
 * Tells if the array is sorted.
 * @param {!Array.<T>} arr The array.
 * @param {?function(T,T):number=} opt_compareFn Function to compare the
 *     array elements.
 *     Should take 2 arguments to compare, and return a negative number, zero,
 *     or a positive number depending on whether the first argument is less
 *     than, equal to, or greater than the second.
 * @param {boolean=} opt_strict If true no equal elements are allowed.
 * @return {boolean} Whether the array is sorted.
 * @template T
 */
goog.array.isSorted = function(arr, opt_compareFn, opt_strict) {
  var compare = opt_compareFn || goog.array.defaultCompare;
  for (var i = 1; i < arr.length; i++) {
    var compareResult = compare(arr[i - 1], arr[i]);
    if (compareResult > 0 || compareResult == 0 && opt_strict) {
      return false;
    }
  }
  return true;
};


/**
 * Compares two arrays for equality. Two arrays are considered equal if they
 * have the same length and their corresponding elements are equal according to
 * the comparison function.
 *
 * @param {goog.array.ArrayLike} arr1 The first array to compare.
 * @param {goog.array.ArrayLike} arr2 The second array to compare.
 * @param {Function=} opt_equalsFn Optional comparison function.
 *     Should take 2 arguments to compare, and return true if the arguments
 *     are equal. Defaults to {@link goog.array.defaultCompareEquality} which
 *     compares the elements using the built-in '===' operator.
 * @return {boolean} Whether the two arrays are equal.
 */
goog.array.equals = function(arr1, arr2, opt_equalsFn) {
  if (!goog.isArrayLike(arr1) || !goog.isArrayLike(arr2) ||
      arr1.length != arr2.length) {
    return false;
  }
  var l = arr1.length;
  var equalsFn = opt_equalsFn || goog.array.defaultCompareEquality;
  for (var i = 0; i < l; i++) {
    if (!equalsFn(arr1[i], arr2[i])) {
      return false;
    }
  }
  return true;
};


/**
 * 3-way array compare function.
 * @param {!Array.<VALUE>|!goog.array.ArrayLike} arr1 The first array to
 *     compare.
 * @param {!Array.<VALUE>|!goog.array.ArrayLike} arr2 The second array to
 *     compare.
 * @param {function(VALUE, VALUE): number=} opt_compareFn Optional comparison
 *     function by which the array is to be ordered. Should take 2 arguments to
 *     compare, and return a negative number, zero, or a positive number
 *     depending on whether the first argument is less than, equal to, or
 *     greater than the second.
 * @return {number} Negative number, zero, or a positive number depending on
 *     whether the first argument is less than, equal to, or greater than the
 *     second.
 * @template VALUE
 */
goog.array.compare3 = function(arr1, arr2, opt_compareFn) {
  var compare = opt_compareFn || goog.array.defaultCompare;
  var l = Math.min(arr1.length, arr2.length);
  for (var i = 0; i < l; i++) {
    var result = compare(arr1[i], arr2[i]);
    if (result != 0) {
      return result;
    }
  }
  return goog.array.defaultCompare(arr1.length, arr2.length);
};


/**
 * Compares its two arguments for order, using the built in < and >
 * operators.
 * @param {VALUE} a The first object to be compared.
 * @param {VALUE} b The second object to be compared.
 * @return {number} A negative number, zero, or a positive number as the first
 *     argument is less than, equal to, or greater than the second.
 * @template VALUE
 */
goog.array.defaultCompare = function(a, b) {
  return a > b ? 1 : a < b ? -1 : 0;
};


/**
 * Compares its two arguments for equality, using the built in === operator.
 * @param {*} a The first object to compare.
 * @param {*} b The second object to compare.
 * @return {boolean} True if the two arguments are equal, false otherwise.
 */
goog.array.defaultCompareEquality = function(a, b) {
  return a === b;
};


/**
 * Inserts a value into a sorted array. The array is not modified if the
 * value is already present.
 * @param {Array.<VALUE>|goog.array.ArrayLike} array The array to modify.
 * @param {VALUE} value The object to insert.
 * @param {function(VALUE, VALUE): number=} opt_compareFn Optional comparison
 *     function by which the array is ordered. Should take 2 arguments to
 *     compare, and return a negative number, zero, or a positive number
 *     depending on whether the first argument is less than, equal to, or
 *     greater than the second.
 * @return {boolean} True if an element was inserted.
 * @template VALUE
 */
goog.array.binaryInsert = function(array, value, opt_compareFn) {
  var index = goog.array.binarySearch(array, value, opt_compareFn);
  if (index < 0) {
    goog.array.insertAt(array, value, -(index + 1));
    return true;
  }
  return false;
};


/**
 * Removes a value from a sorted array.
 * @param {!Array.<VALUE>|!goog.array.ArrayLike} array The array to modify.
 * @param {VALUE} value The object to remove.
 * @param {function(VALUE, VALUE): number=} opt_compareFn Optional comparison
 *     function by which the array is ordered. Should take 2 arguments to
 *     compare, and return a negative number, zero, or a positive number
 *     depending on whether the first argument is less than, equal to, or
 *     greater than the second.
 * @return {boolean} True if an element was removed.
 * @template VALUE
 */
goog.array.binaryRemove = function(array, value, opt_compareFn) {
  var index = goog.array.binarySearch(array, value, opt_compareFn);
  return (index >= 0) ? goog.array.removeAt(array, index) : false;
};


/**
 * Splits an array into disjoint buckets according to a splitting function.
 * @param {Array.<T>} array The array.
 * @param {function(this:S, T,number,Array.<T>):?} sorter Function to call for
 *     every element.  This takes 3 arguments (the element, the index and the
 *     array) and must return a valid object key (a string, number, etc), or
 *     undefined, if that object should not be placed in a bucket.
 * @param {S=} opt_obj The object to be used as the value of 'this' within
 *     sorter.
 * @return {!Object} An object, with keys being all of the unique return values
 *     of sorter, and values being arrays containing the items for
 *     which the splitter returned that key.
 * @template T,S
 */
goog.array.bucket = function(array, sorter, opt_obj) {
  var buckets = {};

  for (var i = 0; i < array.length; i++) {
    var value = array[i];
    var key = sorter.call(opt_obj, value, i, array);
    if (goog.isDef(key)) {
      // Push the value to the right bucket, creating it if necessary.
      var bucket = buckets[key] || (buckets[key] = []);
      bucket.push(value);
    }
  }

  return buckets;
};


/**
 * Creates a new object built from the provided array and the key-generation
 * function.
 * @param {Array.<T>|goog.array.ArrayLike} arr Array or array like object over
 *     which to iterate whose elements will be the values in the new object.
 * @param {?function(this:S, T, number, ?) : string} keyFunc The function to
 *     call for every element. This function takes 3 arguments (the element, the
 *     index and the array) and should return a string that will be used as the
 *     key for the element in the new object. If the function returns the same
 *     key for more than one element, the value for that key is
 *     implementation-defined.
 * @param {S=} opt_obj The object to be used as the value of 'this'
 *     within keyFunc.
 * @return {!Object.<T>} The new object.
 * @template T,S
 */
goog.array.toObject = function(arr, keyFunc, opt_obj) {
  var ret = {};
  goog.array.forEach(arr, function(element, index) {
    ret[keyFunc.call(opt_obj, element, index, arr)] = element;
  });
  return ret;
};


/**
 * Creates a range of numbers in an arithmetic progression.
 *
 * Range takes 1, 2, or 3 arguments:
 * <pre>
 * range(5) is the same as range(0, 5, 1) and produces [0, 1, 2, 3, 4]
 * range(2, 5) is the same as range(2, 5, 1) and produces [2, 3, 4]
 * range(-2, -5, -1) produces [-2, -3, -4]
 * range(-2, -5, 1) produces [], since stepping by 1 wouldn't ever reach -5.
 * </pre>
 *
 * @param {number} startOrEnd The starting value of the range if an end argument
 *     is provided. Otherwise, the start value is 0, and this is the end value.
 * @param {number=} opt_end The optional end value of the range.
 * @param {number=} opt_step The step size between range values. Defaults to 1
 *     if opt_step is undefined or 0.
 * @return {!Array.<number>} An array of numbers for the requested range. May be
 *     an empty array if adding the step would not converge toward the end
 *     value.
 */
goog.array.range = function(startOrEnd, opt_end, opt_step) {
  var array = [];
  var start = 0;
  var end = startOrEnd;
  var step = opt_step || 1;
  if (opt_end !== undefined) {
    start = startOrEnd;
    end = opt_end;
  }

  if (step * (end - start) < 0) {
    // Sign mismatch: start + step will never reach the end value.
    return [];
  }

  if (step > 0) {
    for (var i = start; i < end; i += step) {
      array.push(i);
    }
  } else {
    for (var i = start; i > end; i += step) {
      array.push(i);
    }
  }
  return array;
};


/**
 * Returns an array consisting of the given value repeated N times.
 *
 * @param {VALUE} value The value to repeat.
 * @param {number} n The repeat count.
 * @return {!Array.<VALUE>} An array with the repeated value.
 * @template VALUE
 */
goog.array.repeat = function(value, n) {
  var array = [];
  for (var i = 0; i < n; i++) {
    array[i] = value;
  }
  return array;
};


/**
 * Returns an array consisting of every argument with all arrays
 * expanded in-place recursively.
 *
 * @param {...*} var_args The values to flatten.
 * @return {!Array} An array containing the flattened values.
 */
goog.array.flatten = function(var_args) {
  var result = [];
  for (var i = 0; i < arguments.length; i++) {
    var element = arguments[i];
    if (goog.isArray(element)) {
      result.push.apply(result, goog.array.flatten.apply(null, element));
    } else {
      result.push(element);
    }
  }
  return result;
};


/**
 * Rotates an array in-place. After calling this method, the element at
 * index i will be the element previously at index (i - n) %
 * array.length, for all values of i between 0 and array.length - 1,
 * inclusive.
 *
 * For example, suppose list comprises [t, a, n, k, s]. After invoking
 * rotate(array, 1) (or rotate(array, -4)), array will comprise [s, t, a, n, k].
 *
 * @param {!Array.<T>} array The array to rotate.
 * @param {number} n The amount to rotate.
 * @return {!Array.<T>} The array.
 * @template T
 */
goog.array.rotate = function(array, n) {
  goog.asserts.assert(array.length != null);

  if (array.length) {
    n %= array.length;
    if (n > 0) {
      goog.array.ARRAY_PROTOTYPE_.unshift.apply(array, array.splice(-n, n));
    } else if (n < 0) {
      goog.array.ARRAY_PROTOTYPE_.push.apply(array, array.splice(0, -n));
    }
  }
  return array;
};


/**
 * Moves one item of an array to a new position keeping the order of the rest
 * of the items. Example use case: keeping a list of JavaScript objects
 * synchronized with the corresponding list of DOM elements after one of the
 * elements has been dragged to a new position.
 * @param {!(Array|Arguments|{length:number})} arr The array to modify.
 * @param {number} fromIndex Index of the item to move between 0 and
 *     {@code arr.length - 1}.
 * @param {number} toIndex Target index between 0 and {@code arr.length - 1}.
 */
goog.array.moveItem = function(arr, fromIndex, toIndex) {
  goog.asserts.assert(fromIndex >= 0 && fromIndex < arr.length);
  goog.asserts.assert(toIndex >= 0 && toIndex < arr.length);
  // Remove 1 item at fromIndex.
  var removedItems = goog.array.ARRAY_PROTOTYPE_.splice.call(arr, fromIndex, 1);
  // Insert the removed item at toIndex.
  goog.array.ARRAY_PROTOTYPE_.splice.call(arr, toIndex, 0, removedItems[0]);
  // We don't use goog.array.insertAt and goog.array.removeAt, because they're
  // significantly slower than splice.
};


/**
 * Creates a new array for which the element at position i is an array of the
 * ith element of the provided arrays.  The returned array will only be as long
 * as the shortest array provided; additional values are ignored.  For example,
 * the result of zipping [1, 2] and [3, 4, 5] is [[1,3], [2, 4]].
 *
 * This is similar to the zip() function in Python.  See {@link
 * http://docs.python.org/library/functions.html#zip}
 *
 * @param {...!goog.array.ArrayLike} var_args Arrays to be combined.
 * @return {!Array.<!Array>} A new array of arrays created from provided arrays.
 */
goog.array.zip = function(var_args) {
  if (!arguments.length) {
    return [];
  }
  var result = [];
  for (var i = 0; true; i++) {
    var value = [];
    for (var j = 0; j < arguments.length; j++) {
      var arr = arguments[j];
      // If i is larger than the array length, this is the shortest array.
      if (i >= arr.length) {
        return result;
      }
      value.push(arr[i]);
    }
    result.push(value);
  }
};


/**
 * Shuffles the values in the specified array using the Fisher-Yates in-place
 * shuffle (also known as the Knuth Shuffle). By default, calls Math.random()
 * and so resets the state of that random number generator. Similarly, may reset
 * the state of the any other specified random number generator.
 *
 * Runtime: O(n)
 *
 * @param {!Array} arr The array to be shuffled.
 * @param {function():number=} opt_randFn Optional random function to use for
 *     shuffling.
 *     Takes no arguments, and returns a random number on the interval [0, 1).
 *     Defaults to Math.random() using JavaScript's built-in Math library.
 */
goog.array.shuffle = function(arr, opt_randFn) {
  var randFn = opt_randFn || Math.random;

  for (var i = arr.length - 1; i > 0; i--) {
    // Choose a random array index in [0, i] (inclusive with i).
    var j = Math.floor(randFn() * (i + 1));

    var tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
};

// Copyright 2013 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Utilities used by goog.labs.userAgent tools. These functions
 * should not be used outside of goog.labs.userAgent.*.
 *
 * @visibility {//closure/goog/bin/sizetests:__pkg__}
 * @visibility {//closure/goog/dom:__subpackages__}
 * @visibility {//closure/goog/style:__pkg__}
 * @visibility {//closure/goog/testing:__pkg__}
 * @visibility {//closure/goog/useragent:__subpackages__}
 * @visibility {//testing/puppet/modules:__pkg__} *
 *
 * @author nnaze@google.com (Nathan Naze)
 */

goog.provide('goog.labs.userAgent.util');

goog.require('goog.string');


/**
 * Gets the native userAgent string from navigator if it exists.
 * If navigator or navigator.userAgent string is missing, returns an empty
 * string.
 * @return {string}
 * @private
 */
goog.labs.userAgent.util.getNativeUserAgentString_ = function() {
  var navigator = goog.labs.userAgent.util.getNavigator_();
  if (navigator) {
    var userAgent = navigator.userAgent;
    if (userAgent) {
      return userAgent;
    }
  }
  return '';
};


/**
 * Getter for the native navigator.
 * This is a separate function so it can be stubbed out in testing.
 * @return {Navigator}
 * @private
 */
goog.labs.userAgent.util.getNavigator_ = function() {
  return goog.global.navigator;
};


/**
 * A possible override for applications which wish to not check
 * navigator.userAgent but use a specified value for detection instead.
 * @private {string}
 */
goog.labs.userAgent.util.userAgent_ =
    goog.labs.userAgent.util.getNativeUserAgentString_();


/**
 * Applications may override browser detection on the built in
 * navigator.userAgent object by setting this string. Set to null to use the
 * browser object instead.
 * @param {?string=} opt_userAgent The User-Agent override.
 */
goog.labs.userAgent.util.setUserAgent = function(opt_userAgent) {
  goog.labs.userAgent.util.userAgent_ = opt_userAgent ||
      goog.labs.userAgent.util.getNativeUserAgentString_();
};


/**
 * @return {string} The user agent string.
 */
goog.labs.userAgent.util.getUserAgent = function() {
  return goog.labs.userAgent.util.userAgent_;
};


/**
 * @param {string} str
 * @return {boolean} Whether the user agent contains the given string, ignoring
 *     case.
 */
goog.labs.userAgent.util.matchUserAgent = function(str) {
  var userAgent = goog.labs.userAgent.util.getUserAgent();
  return goog.string.contains(userAgent, str);
};


/**
 * @param {string} str
 * @return {boolean} Whether the user agent contains the given string.
 */
goog.labs.userAgent.util.matchUserAgentIgnoreCase = function(str) {
  var userAgent = goog.labs.userAgent.util.getUserAgent();
  return goog.string.caseInsensitiveContains(userAgent, str);
};


/**
 * Parses the user agent into tuples for each section.
 * @param {string} userAgent
 * @return {!Array.<!Array.<string>>} Tuples of key, version, and the contents
 *     of the parenthetical.
 */
goog.labs.userAgent.util.extractVersionTuples = function(userAgent) {
  // Matches each section of a user agent string.
  // Example UA:
  // Mozilla/5.0 (iPad; U; CPU OS 3_2_1 like Mac OS X; en-us)
  // AppleWebKit/531.21.10 (KHTML, like Gecko) Mobile/7B405
  // This has three version tuples: Mozilla, AppleWebKit, and Mobile.

  var versionRegExp = new RegExp(
      // Key. Note that a key may have a space.
      // (i.e. 'Mobile Safari' in 'Mobile Safari/5.0')
      '(\\w[\\w ]+)' +

      '/' +                // slash
      '([^\\s]+)' +        // version (i.e. '5.0b')
      '\\s*' +             // whitespace
      '(?:\\((.*?)\\))?',  // parenthetical info. parentheses not matched.
      'g');

  var data = [];
  var match;

  // Iterate and collect the version tuples.  Each iteration will be the
  // next regex match.
  while (match = versionRegExp.exec(userAgent)) {
    data.push([
      match[1],  // key
      match[2],  // value
      // || undefined as this is not undefined in IE7 and IE8
      match[3] || undefined  // info
    ]);
  }

  return data;
};


// Copyright 2013 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Closure user agent detection (Browser).
 * @see <a href="http://www.useragentstring.com/">User agent strings</a>
 * For more information on rendering engine, platform, or device see the other
 * sub-namespaces in goog.labs.userAgent, goog.labs.userAgent.platform,
 * goog.labs.userAgent.device respectively.)
 *
 */

goog.provide('goog.labs.userAgent.browser');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.labs.userAgent.util');
goog.require('goog.string');


/**
 * @return {boolean} Whether the user's browser is Opera.
 * @private
 */
goog.labs.userAgent.browser.matchOpera_ = function() {
  return goog.labs.userAgent.util.matchUserAgent('Opera') ||
      goog.labs.userAgent.util.matchUserAgent('OPR');
};


/**
 * @return {boolean} Whether the user's browser is IE.
 * @private
 */
goog.labs.userAgent.browser.matchIE_ = function() {
  return goog.labs.userAgent.util.matchUserAgent('Trident') ||
      goog.labs.userAgent.util.matchUserAgent('MSIE');
};


/**
 * @return {boolean} Whether the user's browser is Firefox.
 * @private
 */
goog.labs.userAgent.browser.matchFirefox_ = function() {
  return goog.labs.userAgent.util.matchUserAgent('Firefox');
};


/**
 * @return {boolean} Whether the user's browser is Safari.
 * @private
 */
goog.labs.userAgent.browser.matchSafari_ = function() {
  return goog.labs.userAgent.util.matchUserAgent('Safari') &&
      !goog.labs.userAgent.util.matchUserAgent('Chrome') &&
      !goog.labs.userAgent.util.matchUserAgent('CriOS') &&
      !goog.labs.userAgent.util.matchUserAgent('Android');
};


/**
 * @return {boolean} Whether the user's browser is Chrome.
 * @private
 */
goog.labs.userAgent.browser.matchChrome_ = function() {
  return goog.labs.userAgent.util.matchUserAgent('Chrome') ||
      goog.labs.userAgent.util.matchUserAgent('CriOS');
};


/**
 * @return {boolean} Whether the user's browser is the Android browser.
 * @private
 */
goog.labs.userAgent.browser.matchAndroidBrowser_ = function() {
  return goog.labs.userAgent.util.matchUserAgent('Android') &&
      !goog.labs.userAgent.util.matchUserAgent('Chrome') &&
      !goog.labs.userAgent.util.matchUserAgent('CriOS');
};


/**
 * @return {boolean} Whether the user's browser is Opera.
 */
goog.labs.userAgent.browser.isOpera = goog.labs.userAgent.browser.matchOpera_;


/**
 * @return {boolean} Whether the user's browser is IE.
 */
goog.labs.userAgent.browser.isIE = goog.labs.userAgent.browser.matchIE_;


/**
 * @return {boolean} Whether the user's browser is Firefox.
 */
goog.labs.userAgent.browser.isFirefox =
    goog.labs.userAgent.browser.matchFirefox_;


/**
 * @return {boolean} Whether the user's browser is Safari.
 */
goog.labs.userAgent.browser.isSafari =
    goog.labs.userAgent.browser.matchSafari_;


/**
 * @return {boolean} Whether the user's browser is Chrome.
 */
goog.labs.userAgent.browser.isChrome =
    goog.labs.userAgent.browser.matchChrome_;


/**
 * @return {boolean} Whether the user's browser is the Android browser.
 */
goog.labs.userAgent.browser.isAndroidBrowser =
    goog.labs.userAgent.browser.matchAndroidBrowser_;


/**
 * For more information, see:
 * http://docs.aws.amazon.com/silk/latest/developerguide/user-agent.html
 * @return {boolean} Whether the user's browser is Silk.
 */
goog.labs.userAgent.browser.isSilk = function() {
  return goog.labs.userAgent.util.matchUserAgent('Silk');
};


/**
 * @return {string} The browser version or empty string if version cannot be
 *     determined. Note that for Internet Explorer, this returns the version of
 *     the browser, not the version of the rendering engine. (IE 8 in
 *     compatibility mode will return 8.0 rather than 7.0. To determine the
 *     rendering engine version, look at document.documentMode instead. See
 *     http://msdn.microsoft.com/en-us/library/cc196988(v=vs.85).aspx for more
 *     details.)
 */
goog.labs.userAgent.browser.getVersion = function() {
  var userAgentString = goog.labs.userAgent.util.getUserAgent();
  // Special case IE since IE's version is inside the parenthesis and
  // without the '/'.
  if (goog.labs.userAgent.browser.isIE()) {
    return goog.labs.userAgent.browser.getIEVersion_(userAgentString);
  }

  if (goog.labs.userAgent.browser.isOpera()) {
    return goog.labs.userAgent.browser.getOperaVersion_(userAgentString);
  }

  var versionTuples =
      goog.labs.userAgent.util.extractVersionTuples(userAgentString);
  return goog.labs.userAgent.browser.getVersionFromTuples_(versionTuples);
};


/**
 * @param {string|number} version The version to check.
 * @return {boolean} Whether the browser version is higher or the same as the
 *     given version.
 */
goog.labs.userAgent.browser.isVersionOrHigher = function(version) {
  return goog.string.compareVersions(goog.labs.userAgent.browser.getVersion(),
                                     version) >= 0;
};


/**
 * Determines IE version. More information:
 * http://msdn.microsoft.com/en-us/library/ie/bg182625(v=vs.85).aspx#uaString
 * http://msdn.microsoft.com/en-us/library/hh869301(v=vs.85).aspx
 * http://blogs.msdn.com/b/ie/archive/2010/03/23/introducing-ie9-s-user-agent-string.aspx
 * http://blogs.msdn.com/b/ie/archive/2009/01/09/the-internet-explorer-8-user-agent-string-updated-edition.aspx
 *
 * @param {string} userAgent the User-Agent.
 * @return {string}
 * @private
 */
goog.labs.userAgent.browser.getIEVersion_ = function(userAgent) {
  // IE11 may identify itself as MSIE 9.0 or MSIE 10.0 due to an IE 11 upgrade
  // bug. Example UA:
  // Mozilla/5.0 (MSIE 9.0; Windows NT 6.1; WOW64; Trident/7.0; rv:11.0)
  // like Gecko.
  // See http://www.whatismybrowser.com/developers/unknown-user-agent-fragments.
  var rv = /rv: *([\d\.]*)/.exec(userAgent);
  if (rv && rv[1]) {
    return rv[1];
  }

  var version = '';
  var msie = /MSIE +([\d\.]+)/.exec(userAgent);
  if (msie && msie[1]) {
    // IE in compatibility mode usually identifies itself as MSIE 7.0; in this
    // case, use the Trident version to determine the version of IE. For more
    // details, see the links above.
    var tridentVersion = /Trident\/(\d.\d)/.exec(userAgent);
    if (msie[1] == '7.0') {
      if (tridentVersion && tridentVersion[1]) {
        switch (tridentVersion[1]) {
          case '4.0':
            version = '8.0';
            break;
          case '5.0':
            version = '9.0';
            break;
          case '6.0':
            version = '10.0';
            break;
          case '7.0':
            version = '11.0';
            break;
        }
      } else {
        version = '7.0';
      }
    } else {
      version = msie[1];
    }
  }
  return version;
};


/**
 * Determines Opera version. More information:
 * http://my.opera.com/ODIN/blog/2013/07/15/opera-user-agent-strings-opera-15-and-beyond
 *
 * @param {string} userAgent The User-Agent.
 * @return {string}
 * @private
 */
goog.labs.userAgent.browser.getOperaVersion_ = function(userAgent) {
  var versionTuples =
      goog.labs.userAgent.util.extractVersionTuples(userAgent);
  var lastTuple = goog.array.peek(versionTuples);
  if (lastTuple[0] == 'OPR' && lastTuple[1]) {
    return lastTuple[1];
  }

  return goog.labs.userAgent.browser.getVersionFromTuples_(versionTuples);
};


/**
 * Nearly all User-Agents start with Mozilla/N.0. This looks at the second tuple
 * for the actual browser version number.
 * @param {!Array.<!Array.<string>>} versionTuples
 * @return {string} The version or empty string if it cannot be determined.
 * @private
 */
goog.labs.userAgent.browser.getVersionFromTuples_ = function(versionTuples) {
  // versionTuples[2] (The first X/Y tuple after the parenthesis) contains the
  // browser version number.
  goog.asserts.assert(versionTuples.length > 2,
      'Couldn\'t extract version tuple from user agent string');
  return versionTuples[2] && versionTuples[2][1] ? versionTuples[2][1] : '';
};

// Copyright 2013 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Closure user agent detection.
 * @see http://en.wikipedia.org/wiki/User_agent
 * For more information on browser brand, platform, or device see the other
 * sub-namespaces in goog.labs.userAgent (browser, platform, and device).
 *
 */

goog.provide('goog.labs.userAgent.engine');

goog.require('goog.array');
goog.require('goog.labs.userAgent.util');
goog.require('goog.string');


/**
 * @return {boolean} Whether the rendering engine is Presto.
 */
goog.labs.userAgent.engine.isPresto = function() {
  return goog.labs.userAgent.util.matchUserAgent('Presto');
};


/**
 * @return {boolean} Whether the rendering engine is Trident.
 */
goog.labs.userAgent.engine.isTrident = function() {
  // IE only started including the Trident token in IE8.
  return goog.labs.userAgent.util.matchUserAgent('Trident') ||
      goog.labs.userAgent.util.matchUserAgent('MSIE');
};


/**
 * @return {boolean} Whether the rendering engine is WebKit.
 */
goog.labs.userAgent.engine.isWebKit = function() {
  return goog.labs.userAgent.util.matchUserAgentIgnoreCase('WebKit');
};


/**
 * @return {boolean} Whether the rendering engine is Gecko.
 */
goog.labs.userAgent.engine.isGecko = function() {
  return goog.labs.userAgent.util.matchUserAgent('Gecko') &&
      !goog.labs.userAgent.engine.isWebKit() &&
      !goog.labs.userAgent.engine.isTrident();
};


/**
 * @return {string} The rendering engine's version or empty string if version
 *     can't be determined.
 */
goog.labs.userAgent.engine.getVersion = function() {
  var userAgentString = goog.labs.userAgent.util.getUserAgent();
  if (userAgentString) {
    var tuples = goog.labs.userAgent.util.extractVersionTuples(
        userAgentString);

    var engineTuple = tuples[1];
    if (engineTuple) {
      // In Gecko, the version string is either in the browser info or the
      // Firefox version.  See Gecko user agent string reference:
      // http://goo.gl/mULqa
      if (engineTuple[0] == 'Gecko') {
        return goog.labs.userAgent.engine.getVersionForKey_(
            tuples, 'Firefox');
      }

      return engineTuple[1];
    }

    // IE has only one version identifier, and the Trident version is
    // specified in the parenthetical.
    var browserTuple = tuples[0];
    var info;
    if (browserTuple && (info = browserTuple[2])) {
      var match = /Trident\/([^\s;]+)/.exec(info);
      if (match) {
        return match[1];
      }
    }
  }
  return '';
};


/**
 * @param {string|number} version The version to check.
 * @return {boolean} Whether the rendering engine version is higher or the same
 *     as the given version.
 */
goog.labs.userAgent.engine.isVersionOrHigher = function(version) {
  return goog.string.compareVersions(goog.labs.userAgent.engine.getVersion(),
                                     version) >= 0;
};


/**
 * @param {!Array.<!Array.<string>>} tuples Version tuples.
 * @param {string} key The key to look for.
 * @return {string} The version string of the given key, if present.
 *     Otherwise, the empty string.
 * @private
 */
goog.labs.userAgent.engine.getVersionForKey_ = function(tuples, key) {
  // TODO(nnaze): Move to util if useful elsewhere.

  var pair = goog.array.find(tuples, function(pair) {
    return key == pair[0];
  });

  return pair && pair[1] || '';
};

// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Rendering engine detection.
 * @see <a href="http://www.useragentstring.com/">User agent strings</a>
 * For information on the browser brand (such as Safari versus Chrome), see
 * goog.userAgent.product.
 * @see ../demos/useragent.html
 */

goog.provide('goog.userAgent');

goog.require('goog.labs.userAgent.browser');
goog.require('goog.labs.userAgent.engine');
goog.require('goog.labs.userAgent.util');
goog.require('goog.string');


/**
 * @define {boolean} Whether we know at compile-time that the browser is IE.
 */
goog.define('goog.userAgent.ASSUME_IE', false);


/**
 * @define {boolean} Whether we know at compile-time that the browser is GECKO.
 */
goog.define('goog.userAgent.ASSUME_GECKO', false);


/**
 * @define {boolean} Whether we know at compile-time that the browser is WEBKIT.
 */
goog.define('goog.userAgent.ASSUME_WEBKIT', false);


/**
 * @define {boolean} Whether we know at compile-time that the browser is a
 *     mobile device running WebKit e.g. iPhone or Android.
 */
goog.define('goog.userAgent.ASSUME_MOBILE_WEBKIT', false);


/**
 * @define {boolean} Whether we know at compile-time that the browser is OPERA.
 */
goog.define('goog.userAgent.ASSUME_OPERA', false);


/**
 * @define {boolean} Whether the
 *     {@code goog.userAgent.isVersionOrHigher}
 *     function will return true for any version.
 */
goog.define('goog.userAgent.ASSUME_ANY_VERSION', false);


/**
 * Whether we know the browser engine at compile-time.
 * @type {boolean}
 * @private
 */
goog.userAgent.BROWSER_KNOWN_ =
    goog.userAgent.ASSUME_IE ||
    goog.userAgent.ASSUME_GECKO ||
    goog.userAgent.ASSUME_MOBILE_WEBKIT ||
    goog.userAgent.ASSUME_WEBKIT ||
    goog.userAgent.ASSUME_OPERA;


/**
 * Returns the userAgent string for the current browser.
 *
 * @return {string} The userAgent string.
 */
goog.userAgent.getUserAgentString = function() {
  return goog.labs.userAgent.util.getUserAgent();
};


/**
 * TODO(nnaze): Change type to "Navigator" and update compilation targets.
 * @return {Object} The native navigator object.
 */
goog.userAgent.getNavigator = function() {
  // Need a local navigator reference instead of using the global one,
  // to avoid the rare case where they reference different objects.
  // (in a WorkerPool, for example).
  return goog.global['navigator'] || null;
};


/**
 * Whether the user agent is Opera.
 * @type {boolean}
 */
goog.userAgent.OPERA = goog.userAgent.BROWSER_KNOWN_ ?
    goog.userAgent.ASSUME_OPERA :
    goog.labs.userAgent.browser.isOpera();


/**
 * Whether the user agent is Internet Explorer.
 * @type {boolean}
 */
goog.userAgent.IE = goog.userAgent.BROWSER_KNOWN_ ?
    goog.userAgent.ASSUME_IE :
    goog.labs.userAgent.browser.isIE();


/**
 * Whether the user agent is Gecko. Gecko is the rendering engine used by
 * Mozilla, Firefox, and others.
 * @type {boolean}
 */
goog.userAgent.GECKO = goog.userAgent.BROWSER_KNOWN_ ?
    goog.userAgent.ASSUME_GECKO :
    goog.labs.userAgent.engine.isGecko();


/**
 * Whether the user agent is WebKit. WebKit is the rendering engine that
 * Safari, Android and others use.
 * @type {boolean}
 */
goog.userAgent.WEBKIT = goog.userAgent.BROWSER_KNOWN_ ?
    goog.userAgent.ASSUME_WEBKIT || goog.userAgent.ASSUME_MOBILE_WEBKIT :
    goog.labs.userAgent.engine.isWebKit();


/**
 * Whether the user agent is running on a mobile device.
 *
 * This is a separate function so that the logic can be tested.
 *
 * TODO(nnaze): Investigate swapping in goog.labs.userAgent.device.isMobile().
 *
 * @return {boolean} Whether the user agent is running on a mobile device.
 * @private
 */
goog.userAgent.isMobile_ = function() {
  return goog.userAgent.WEBKIT &&
         goog.labs.userAgent.util.matchUserAgent('Mobile');
};


/**
 * Whether the user agent is running on a mobile device.
 *
 * TODO(nnaze): Consider deprecating MOBILE when labs.userAgent
 *   is promoted as the gecko/webkit logic is likely inaccurate.
 *
 * @type {boolean}
 */
goog.userAgent.MOBILE = goog.userAgent.ASSUME_MOBILE_WEBKIT ||
                        goog.userAgent.isMobile_();


/**
 * Used while transitioning code to use WEBKIT instead.
 * @type {boolean}
 * @deprecated Use {@link goog.userAgent.product.SAFARI} instead.
 * TODO(nicksantos): Delete this from goog.userAgent.
 */
goog.userAgent.SAFARI = goog.userAgent.WEBKIT;


/**
 * @return {string} the platform (operating system) the user agent is running
 *     on. Default to empty string because navigator.platform may not be defined
 *     (on Rhino, for example).
 * @private
 */
goog.userAgent.determinePlatform_ = function() {
  var navigator = goog.userAgent.getNavigator();
  return navigator && navigator.platform || '';
};


/**
 * The platform (operating system) the user agent is running on. Default to
 * empty string because navigator.platform may not be defined (on Rhino, for
 * example).
 * @type {string}
 */
goog.userAgent.PLATFORM = goog.userAgent.determinePlatform_();


/**
 * @define {boolean} Whether the user agent is running on a Macintosh operating
 *     system.
 */
goog.define('goog.userAgent.ASSUME_MAC', false);


/**
 * @define {boolean} Whether the user agent is running on a Windows operating
 *     system.
 */
goog.define('goog.userAgent.ASSUME_WINDOWS', false);


/**
 * @define {boolean} Whether the user agent is running on a Linux operating
 *     system.
 */
goog.define('goog.userAgent.ASSUME_LINUX', false);


/**
 * @define {boolean} Whether the user agent is running on a X11 windowing
 *     system.
 */
goog.define('goog.userAgent.ASSUME_X11', false);


/**
 * @define {boolean} Whether the user agent is running on Android.
 */
goog.define('goog.userAgent.ASSUME_ANDROID', false);


/**
 * @define {boolean} Whether the user agent is running on an iPhone.
 */
goog.define('goog.userAgent.ASSUME_IPHONE', false);


/**
 * @define {boolean} Whether the user agent is running on an iPad.
 */
goog.define('goog.userAgent.ASSUME_IPAD', false);


/**
 * @type {boolean}
 * @private
 */
goog.userAgent.PLATFORM_KNOWN_ =
    goog.userAgent.ASSUME_MAC ||
    goog.userAgent.ASSUME_WINDOWS ||
    goog.userAgent.ASSUME_LINUX ||
    goog.userAgent.ASSUME_X11 ||
    goog.userAgent.ASSUME_ANDROID ||
    goog.userAgent.ASSUME_IPHONE ||
    goog.userAgent.ASSUME_IPAD;


/**
 * Initialize the goog.userAgent constants that define which platform the user
 * agent is running on.
 * @private
 */
goog.userAgent.initPlatform_ = function() {
  /**
   * Whether the user agent is running on a Macintosh operating system.
   * @type {boolean}
   * @private
   */
  goog.userAgent.detectedMac_ = goog.string.contains(goog.userAgent.PLATFORM,
      'Mac');

  /**
   * Whether the user agent is running on a Windows operating system.
   * @type {boolean}
   * @private
   */
  goog.userAgent.detectedWindows_ = goog.string.contains(
      goog.userAgent.PLATFORM, 'Win');

  /**
   * Whether the user agent is running on a Linux operating system.
   * @type {boolean}
   * @private
   */
  goog.userAgent.detectedLinux_ = goog.string.contains(goog.userAgent.PLATFORM,
      'Linux');

  /**
   * Whether the user agent is running on a X11 windowing system.
   * @type {boolean}
   * @private
   */
  goog.userAgent.detectedX11_ = !!goog.userAgent.getNavigator() &&
      goog.string.contains(goog.userAgent.getNavigator()['appVersion'] || '',
          'X11');

  // Need user agent string for Android/IOS detection
  var ua = goog.userAgent.getUserAgentString();

  /**
   * Whether the user agent is running on Android.
   * @type {boolean}
   * @private
   */
  goog.userAgent.detectedAndroid_ = !!ua &&
      goog.string.contains(ua, 'Android');

  /**
   * Whether the user agent is running on an iPhone.
   * @type {boolean}
   * @private
   */
  goog.userAgent.detectedIPhone_ = !!ua && goog.string.contains(ua, 'iPhone');

  /**
   * Whether the user agent is running on an iPad.
   * @type {boolean}
   * @private
   */
  goog.userAgent.detectedIPad_ = !!ua && goog.string.contains(ua, 'iPad');
};


if (!goog.userAgent.PLATFORM_KNOWN_) {
  goog.userAgent.initPlatform_();
}


/**
 * Whether the user agent is running on a Macintosh operating system.
 * @type {boolean}
 */
goog.userAgent.MAC = goog.userAgent.PLATFORM_KNOWN_ ?
    goog.userAgent.ASSUME_MAC : goog.userAgent.detectedMac_;


/**
 * Whether the user agent is running on a Windows operating system.
 * @type {boolean}
 */
goog.userAgent.WINDOWS = goog.userAgent.PLATFORM_KNOWN_ ?
    goog.userAgent.ASSUME_WINDOWS : goog.userAgent.detectedWindows_;


/**
 * Whether the user agent is running on a Linux operating system.
 * @type {boolean}
 */
goog.userAgent.LINUX = goog.userAgent.PLATFORM_KNOWN_ ?
    goog.userAgent.ASSUME_LINUX : goog.userAgent.detectedLinux_;


/**
 * Whether the user agent is running on a X11 windowing system.
 * @type {boolean}
 */
goog.userAgent.X11 = goog.userAgent.PLATFORM_KNOWN_ ?
    goog.userAgent.ASSUME_X11 : goog.userAgent.detectedX11_;


/**
 * Whether the user agent is running on Android.
 * @type {boolean}
 */
goog.userAgent.ANDROID = goog.userAgent.PLATFORM_KNOWN_ ?
    goog.userAgent.ASSUME_ANDROID : goog.userAgent.detectedAndroid_;


/**
 * Whether the user agent is running on an iPhone.
 * @type {boolean}
 */
goog.userAgent.IPHONE = goog.userAgent.PLATFORM_KNOWN_ ?
    goog.userAgent.ASSUME_IPHONE : goog.userAgent.detectedIPhone_;


/**
 * Whether the user agent is running on an iPad.
 * @type {boolean}
 */
goog.userAgent.IPAD = goog.userAgent.PLATFORM_KNOWN_ ?
    goog.userAgent.ASSUME_IPAD : goog.userAgent.detectedIPad_;


/**
 * @return {string} The string that describes the version number of the user
 *     agent.
 * @private
 */
goog.userAgent.determineVersion_ = function() {
  // All browsers have different ways to detect the version and they all have
  // different naming schemes.

  // version is a string rather than a number because it may contain 'b', 'a',
  // and so on.
  var version = '', re;

  if (goog.userAgent.OPERA && goog.global['opera']) {
    var operaVersion = goog.global['opera'].version;
    return goog.isFunction(operaVersion) ? operaVersion() : operaVersion;
  }

  if (goog.userAgent.GECKO) {
    re = /rv\:([^\);]+)(\)|;)/;
  } else if (goog.userAgent.IE) {
    re = /\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/;
  } else if (goog.userAgent.WEBKIT) {
    // WebKit/125.4
    re = /WebKit\/(\S+)/;
  }

  if (re) {
    var arr = re.exec(goog.userAgent.getUserAgentString());
    version = arr ? arr[1] : '';
  }

  if (goog.userAgent.IE) {
    // IE9 can be in document mode 9 but be reporting an inconsistent user agent
    // version.  If it is identifying as a version lower than 9 we take the
    // documentMode as the version instead.  IE8 has similar behavior.
    // It is recommended to set the X-UA-Compatible header to ensure that IE9
    // uses documentMode 9.
    var docMode = goog.userAgent.getDocumentMode_();
    if (docMode > parseFloat(version)) {
      return String(docMode);
    }
  }

  return version;
};


/**
 * @return {number|undefined} Returns the document mode (for testing).
 * @private
 */
goog.userAgent.getDocumentMode_ = function() {
  // NOTE(user): goog.userAgent may be used in context where there is no DOM.
  var doc = goog.global['document'];
  return doc ? doc['documentMode'] : undefined;
};


/**
 * The version of the user agent. This is a string because it might contain
 * 'b' (as in beta) as well as multiple dots.
 * @type {string}
 */
goog.userAgent.VERSION = goog.userAgent.determineVersion_();


/**
 * Compares two version numbers.
 *
 * @param {string} v1 Version of first item.
 * @param {string} v2 Version of second item.
 *
 * @return {number}  1 if first argument is higher
 *                   0 if arguments are equal
 *                  -1 if second argument is higher.
 * @deprecated Use goog.string.compareVersions.
 */
goog.userAgent.compare = function(v1, v2) {
  return goog.string.compareVersions(v1, v2);
};


/**
 * Cache for {@link goog.userAgent.isVersionOrHigher}.
 * Calls to compareVersions are surprisingly expensive and, as a browser's
 * version number is unlikely to change during a session, we cache the results.
 * @const
 * @private
 */
goog.userAgent.isVersionOrHigherCache_ = {};


/**
 * Whether the user agent version is higher or the same as the given version.
 * NOTE: When checking the version numbers for Firefox and Safari, be sure to
 * use the engine's version, not the browser's version number.  For example,
 * Firefox 3.0 corresponds to Gecko 1.9 and Safari 3.0 to Webkit 522.11.
 * Opera and Internet Explorer versions match the product release number.<br>
 * @see <a href="http://en.wikipedia.org/wiki/Safari_version_history">
 *     Webkit</a>
 * @see <a href="http://en.wikipedia.org/wiki/Gecko_engine">Gecko</a>
 *
 * @param {string|number} version The version to check.
 * @return {boolean} Whether the user agent version is higher or the same as
 *     the given version.
 */
goog.userAgent.isVersionOrHigher = function(version) {
  return goog.userAgent.ASSUME_ANY_VERSION ||
      goog.userAgent.isVersionOrHigherCache_[version] ||
      (goog.userAgent.isVersionOrHigherCache_[version] =
          goog.string.compareVersions(goog.userAgent.VERSION, version) >= 0);
};


/**
 * Deprecated alias to {@code goog.userAgent.isVersionOrHigher}.
 * @param {string|number} version The version to check.
 * @return {boolean} Whether the user agent version is higher or the same as
 *     the given version.
 * @deprecated Use goog.userAgent.isVersionOrHigher().
 */
goog.userAgent.isVersion = goog.userAgent.isVersionOrHigher;


/**
 * Whether the IE effective document mode is higher or the same as the given
 * document mode version.
 * NOTE: Only for IE, return false for another browser.
 *
 * @param {number} documentMode The document mode version to check.
 * @return {boolean} Whether the IE effective document mode is higher or the
 *     same as the given version.
 */
goog.userAgent.isDocumentModeOrHigher = function(documentMode) {
  return goog.userAgent.IE && goog.userAgent.DOCUMENT_MODE >= documentMode;
};


/**
 * Deprecated alias to {@code goog.userAgent.isDocumentModeOrHigher}.
 * @param {number} version The version to check.
 * @return {boolean} Whether the IE effective document mode is higher or the
 *      same as the given version.
 * @deprecated Use goog.userAgent.isDocumentModeOrHigher().
 */
goog.userAgent.isDocumentMode = goog.userAgent.isDocumentModeOrHigher;


/**
 * For IE version < 7, documentMode is undefined, so attempt to use the
 * CSS1Compat property to see if we are in standards mode. If we are in
 * standards mode, treat the browser version as the document mode. Otherwise,
 * IE is emulating version 5.
 * @type {number|undefined}
 * @const
 */
goog.userAgent.DOCUMENT_MODE = (function() {
  var doc = goog.global['document'];
  if (!doc || !goog.userAgent.IE) {
    return undefined;
  }
  var mode = goog.userAgent.getDocumentMode_();
  return mode || (doc['compatMode'] == 'CSS1Compat' ?
      parseInt(goog.userAgent.VERSION, 10) : 5);
})();

// Copyright 2010 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Browser capability checks for the events package.
 *
 */


goog.provide('goog.events.BrowserFeature');

goog.require('goog.userAgent');


/**
 * Enum of browser capabilities.
 * @enum {boolean}
 */
goog.events.BrowserFeature = {
  /**
   * Whether the button attribute of the event is W3C compliant.  False in
   * Internet Explorer prior to version 9; document-version dependent.
   */
  HAS_W3C_BUTTON: !goog.userAgent.IE ||
      goog.userAgent.isDocumentModeOrHigher(9),

  /**
   * Whether the browser supports full W3C event model.
   */
  HAS_W3C_EVENT_SUPPORT: !goog.userAgent.IE ||
      goog.userAgent.isDocumentModeOrHigher(9),

  /**
   * To prevent default in IE7-8 for certain keydown events we need set the
   * keyCode to -1.
   */
  SET_KEY_CODE_TO_PREVENT_DEFAULT: goog.userAgent.IE &&
      !goog.userAgent.isVersionOrHigher('9'),

  /**
   * Whether the {@code navigator.onLine} property is supported.
   */
  HAS_NAVIGATOR_ONLINE_PROPERTY: !goog.userAgent.WEBKIT ||
      goog.userAgent.isVersionOrHigher('528'),

  /**
   * Whether HTML5 network online/offline events are supported.
   */
  HAS_HTML5_NETWORK_EVENT_SUPPORT:
      goog.userAgent.GECKO && goog.userAgent.isVersionOrHigher('1.9b') ||
      goog.userAgent.IE && goog.userAgent.isVersionOrHigher('8') ||
      goog.userAgent.OPERA && goog.userAgent.isVersionOrHigher('9.5') ||
      goog.userAgent.WEBKIT && goog.userAgent.isVersionOrHigher('528'),

  /**
   * Whether HTML5 network events fire on document.body, or otherwise the
   * window.
   */
  HTML5_NETWORK_EVENTS_FIRE_ON_BODY:
      goog.userAgent.GECKO && !goog.userAgent.isVersionOrHigher('8') ||
      goog.userAgent.IE && !goog.userAgent.isVersionOrHigher('9'),

  /**
   * Whether touch is enabled in the browser.
   */
  TOUCH_ENABLED:
      ('ontouchstart' in goog.global ||
          !!(goog.global['document'] &&
             document.documentElement &&
             'ontouchstart' in document.documentElement) ||
          // IE10 uses non-standard touch events, so it has a different check.
          !!(goog.global['navigator'] &&
              goog.global['navigator']['msMaxTouchPoints']))
};

// Copyright 2011 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Definition of the disposable interface.  A disposable object
 * has a dispose method to to clean up references and resources.
 * @author nnaze@google.com (Nathan Naze)
 */


goog.provide('goog.disposable.IDisposable');



/**
 * Interface for a disposable object.  If a instance requires cleanup
 * (references COM objects, DOM notes, or other disposable objects), it should
 * implement this interface (it may subclass goog.Disposable).
 * @interface
 */
goog.disposable.IDisposable = function() {};


/**
 * Disposes of the object and its resources.
 * @return {void} Nothing.
 */
goog.disposable.IDisposable.prototype.dispose = goog.abstractMethod;


/**
 * @return {boolean} Whether the object has been disposed of.
 */
goog.disposable.IDisposable.prototype.isDisposed = goog.abstractMethod;

// Copyright 2005 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Implements the disposable interface. The dispose method is used
 * to clean up references and resources.
 * @author arv@google.com (Erik Arvidsson)
 */


goog.provide('goog.Disposable');
/** @suppress {extraProvide} */
goog.provide('goog.dispose');
/** @suppress {extraProvide} */
goog.provide('goog.disposeAll');

goog.require('goog.disposable.IDisposable');



/**
 * Class that provides the basic implementation for disposable objects. If your
 * class holds one or more references to COM objects, DOM nodes, or other
 * disposable objects, it should extend this class or implement the disposable
 * interface (defined in goog.disposable.IDisposable).
 * @constructor
 * @implements {goog.disposable.IDisposable}
 */
goog.Disposable = function() {
  if (goog.Disposable.MONITORING_MODE != goog.Disposable.MonitoringMode.OFF) {
    if (goog.Disposable.INCLUDE_STACK_ON_CREATION) {
      this.creationStack = new Error().stack;
    }
    goog.Disposable.instances_[goog.getUid(this)] = this;
  }
};


/**
 * @enum {number} Different monitoring modes for Disposable.
 */
goog.Disposable.MonitoringMode = {
  /**
   * No monitoring.
   */
  OFF: 0,
  /**
   * Creating and disposing the goog.Disposable instances is monitored. All
   * disposable objects need to call the {@code goog.Disposable} base
   * constructor. The PERMANENT mode must be switched on before creating any
   * goog.Disposable instances.
   */
  PERMANENT: 1,
  /**
   * INTERACTIVE mode can be switched on and off on the fly without producing
   * errors. It also doesn't warn if the disposable objects don't call the
   * {@code goog.Disposable} base constructor.
   */
  INTERACTIVE: 2
};


/**
 * @define {number} The monitoring mode of the goog.Disposable
 *     instances. Default is OFF. Switching on the monitoring is only
 *     recommended for debugging because it has a significant impact on
 *     performance and memory usage. If switched off, the monitoring code
 *     compiles down to 0 bytes.
 */
goog.define('goog.Disposable.MONITORING_MODE', 0);


/**
 * @define {boolean} Whether to attach creation stack to each created disposable
 *     instance; This is only relevant for when MonitoringMode != OFF.
 */
goog.define('goog.Disposable.INCLUDE_STACK_ON_CREATION', true);


/**
 * Maps the unique ID of every undisposed {@code goog.Disposable} object to
 * the object itself.
 * @type {!Object.<number, !goog.Disposable>}
 * @private
 */
goog.Disposable.instances_ = {};


/**
 * @return {!Array.<!goog.Disposable>} All {@code goog.Disposable} objects that
 *     haven't been disposed of.
 */
goog.Disposable.getUndisposedObjects = function() {
  var ret = [];
  for (var id in goog.Disposable.instances_) {
    if (goog.Disposable.instances_.hasOwnProperty(id)) {
      ret.push(goog.Disposable.instances_[Number(id)]);
    }
  }
  return ret;
};


/**
 * Clears the registry of undisposed objects but doesn't dispose of them.
 */
goog.Disposable.clearUndisposedObjects = function() {
  goog.Disposable.instances_ = {};
};


/**
 * Whether the object has been disposed of.
 * @type {boolean}
 * @private
 */
goog.Disposable.prototype.disposed_ = false;


/**
 * Callbacks to invoke when this object is disposed.
 * @type {Array.<!Function>}
 * @private
 */
goog.Disposable.prototype.onDisposeCallbacks_;


/**
 * If monitoring the goog.Disposable instances is enabled, stores the creation
 * stack trace of the Disposable instance.
 * @type {string}
 */
goog.Disposable.prototype.creationStack;


/**
 * @return {boolean} Whether the object has been disposed of.
 * @override
 */
goog.Disposable.prototype.isDisposed = function() {
  return this.disposed_;
};


/**
 * @return {boolean} Whether the object has been disposed of.
 * @deprecated Use {@link #isDisposed} instead.
 */
goog.Disposable.prototype.getDisposed = goog.Disposable.prototype.isDisposed;


/**
 * Disposes of the object. If the object hasn't already been disposed of, calls
 * {@link #disposeInternal}. Classes that extend {@code goog.Disposable} should
 * override {@link #disposeInternal} in order to delete references to COM
 * objects, DOM nodes, and other disposable objects. Reentrant.
 *
 * @return {void} Nothing.
 * @override
 */
goog.Disposable.prototype.dispose = function() {
  if (!this.disposed_) {
    // Set disposed_ to true first, in case during the chain of disposal this
    // gets disposed recursively.
    this.disposed_ = true;
    this.disposeInternal();
    if (goog.Disposable.MONITORING_MODE != goog.Disposable.MonitoringMode.OFF) {
      var uid = goog.getUid(this);
      if (goog.Disposable.MONITORING_MODE ==
          goog.Disposable.MonitoringMode.PERMANENT &&
          !goog.Disposable.instances_.hasOwnProperty(uid)) {
        throw Error(this + ' did not call the goog.Disposable base ' +
            'constructor or was disposed of after a clearUndisposedObjects ' +
            'call');
      }
      delete goog.Disposable.instances_[uid];
    }
  }
};


/**
 * Associates a disposable object with this object so that they will be disposed
 * together.
 * @param {goog.disposable.IDisposable} disposable that will be disposed when
 *     this object is disposed.
 */
goog.Disposable.prototype.registerDisposable = function(disposable) {
  this.addOnDisposeCallback(goog.partial(goog.dispose, disposable));
};


/**
 * Invokes a callback function when this object is disposed. Callbacks are
 * invoked in the order in which they were added.
 * @param {function(this:T):?} callback The callback function.
 * @param {T=} opt_scope An optional scope to call the callback in.
 * @template T
 */
goog.Disposable.prototype.addOnDisposeCallback = function(callback, opt_scope) {
  if (!this.onDisposeCallbacks_) {
    this.onDisposeCallbacks_ = [];
  }

  this.onDisposeCallbacks_.push(
      goog.isDef(opt_scope) ? goog.bind(callback, opt_scope) : callback);
};


/**
 * Deletes or nulls out any references to COM objects, DOM nodes, or other
 * disposable objects. Classes that extend {@code goog.Disposable} should
 * override this method.
 * Not reentrant. To avoid calling it twice, it must only be called from the
 * subclass' {@code disposeInternal} method. Everywhere else the public
 * {@code dispose} method must be used.
 * For example:
 * <pre>
 *   mypackage.MyClass = function() {
 *     mypackage.MyClass.base(this, 'constructor');
 *     // Constructor logic specific to MyClass.
 *     ...
 *   };
 *   goog.inherits(mypackage.MyClass, goog.Disposable);
 *
 *   mypackage.MyClass.prototype.disposeInternal = function() {
 *     // Dispose logic specific to MyClass.
 *     ...
 *     // Call superclass's disposeInternal at the end of the subclass's, like
 *     // in C++, to avoid hard-to-catch issues.
 *     mypackage.MyClass.base(this, 'disposeInternal');
 *   };
 * </pre>
 * @protected
 */
goog.Disposable.prototype.disposeInternal = function() {
  if (this.onDisposeCallbacks_) {
    while (this.onDisposeCallbacks_.length) {
      this.onDisposeCallbacks_.shift()();
    }
  }
};


/**
 * Returns True if we can verify the object is disposed.
 * Calls {@code isDisposed} on the argument if it supports it.  If obj
 * is not an object with an isDisposed() method, return false.
 * @param {*} obj The object to investigate.
 * @return {boolean} True if we can verify the object is disposed.
 */
goog.Disposable.isDisposed = function(obj) {
  if (obj && typeof obj.isDisposed == 'function') {
    return obj.isDisposed();
  }
  return false;
};


/**
 * Calls {@code dispose} on the argument if it supports it. If obj is not an
 *     object with a dispose() method, this is a no-op.
 * @param {*} obj The object to dispose of.
 */
goog.dispose = function(obj) {
  if (obj && typeof obj.dispose == 'function') {
    obj.dispose();
  }
};


/**
 * Calls {@code dispose} on each member of the list that supports it. (If the
 * member is an ArrayLike, then {@code goog.disposeAll()} will be called
 * recursively on each of its members.) If the member is not an object with a
 * {@code dispose()} method, then it is ignored.
 * @param {...*} var_args The list.
 */
goog.disposeAll = function(var_args) {
  for (var i = 0, len = arguments.length; i < len; ++i) {
    var disposable = arguments[i];
    if (goog.isArrayLike(disposable)) {
      goog.disposeAll.apply(null, disposable);
    } else {
      goog.dispose(disposable);
    }
  }
};

// Copyright 2013 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

goog.provide('goog.events.EventId');



/**
 * A templated class that is used when registering for events. Typical usage:
 * <code>
 *   /** @type {goog.events.EventId.<MyEventObj>}
 *   var myEventId = new goog.events.EventId(
 *       goog.events.getUniqueId(('someEvent'));
 *
 *   // No need to cast or declare here since the compiler knows the correct
 *   // type of 'evt' (MyEventObj).
 *   something.listen(myEventId, function(evt) {});
 * </code>
 *
 * @param {string} eventId
 * @template T
 * @constructor
 * @struct
 * @final
 */
goog.events.EventId = function(eventId) {
  /** @const */ this.id = eventId;
};


/**
 * @override
 */
goog.events.EventId.prototype.toString = function() {
  return this.id;
};

// Copyright 2005 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview A base class for event objects.
 *
 */


goog.provide('goog.events.Event');
goog.provide('goog.events.EventLike');

/**
 * goog.events.Event no longer depends on goog.Disposable. Keep requiring
 * goog.Disposable here to not break projects which assume this dependency.
 * @suppress {extraRequire}
 */
goog.require('goog.Disposable');
goog.require('goog.events.EventId');


/**
 * A typedef for event like objects that are dispatchable via the
 * goog.events.dispatchEvent function. strings are treated as the type for a
 * goog.events.Event. Objects are treated as an extension of a new
 * goog.events.Event with the type property of the object being used as the type
 * of the Event.
 * @typedef {string|Object|goog.events.Event|goog.events.EventId}
 */
goog.events.EventLike;



/**
 * A base class for event objects, so that they can support preventDefault and
 * stopPropagation.
 *
 * @param {string|!goog.events.EventId} type Event Type.
 * @param {Object=} opt_target Reference to the object that is the target of
 *     this event. It has to implement the {@code EventTarget} interface
 *     declared at {@link http://developer.mozilla.org/en/DOM/EventTarget}.
 * @constructor
 */
goog.events.Event = function(type, opt_target) {
  /**
   * Event type.
   * @type {string}
   */
  this.type = type instanceof goog.events.EventId ? String(type) : type;

  /**
   * TODO(user): The type should probably be
   * EventTarget|goog.events.EventTarget.
   *
   * Target of the event.
   * @type {Object|undefined}
   */
  this.target = opt_target;

  /**
   * Object that had the listener attached.
   * @type {Object|undefined}
   */
  this.currentTarget = this.target;

  /**
   * Whether to cancel the event in internal capture/bubble processing for IE.
   * @type {boolean}
   * @public
   * @suppress {underscore|visibility} Technically public, but referencing this
   *     outside this package is strongly discouraged.
   */
  this.propagationStopped_ = false;

  /**
   * Whether the default action has been prevented.
   * This is a property to match the W3C specification at
   * {@link http://www.w3.org/TR/DOM-Level-3-Events/
   * #events-event-type-defaultPrevented}.
   * Must be treated as read-only outside the class.
   * @type {boolean}
   */
  this.defaultPrevented = false;

  /**
   * Return value for in internal capture/bubble processing for IE.
   * @type {boolean}
   * @public
   * @suppress {underscore|visibility} Technically public, but referencing this
   *     outside this package is strongly discouraged.
   */
  this.returnValue_ = true;
};


/**
 * For backwards compatibility (goog.events.Event used to inherit
 * goog.Disposable).
 * @deprecated Events don't need to be disposed.
 */
goog.events.Event.prototype.disposeInternal = function() {
};


/**
 * For backwards compatibility (goog.events.Event used to inherit
 * goog.Disposable).
 * @deprecated Events don't need to be disposed.
 */
goog.events.Event.prototype.dispose = function() {
};


/**
 * Stops event propagation.
 */
goog.events.Event.prototype.stopPropagation = function() {
  this.propagationStopped_ = true;
};


/**
 * Prevents the default action, for example a link redirecting to a url.
 */
goog.events.Event.prototype.preventDefault = function() {
  this.defaultPrevented = true;
  this.returnValue_ = false;
};


/**
 * Stops the propagation of the event. It is equivalent to
 * {@code e.stopPropagation()}, but can be used as the callback argument of
 * {@link goog.events.listen} without declaring another function.
 * @param {!goog.events.Event} e An event.
 */
goog.events.Event.stopPropagation = function(e) {
  e.stopPropagation();
};


/**
 * Prevents the default action. It is equivalent to
 * {@code e.preventDefault()}, but can be used as the callback argument of
 * {@link goog.events.listen} without declaring another function.
 * @param {!goog.events.Event} e An event.
 */
goog.events.Event.preventDefault = function(e) {
  e.preventDefault();
};

// Copyright 2010 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Event Types.
 *
 * @author arv@google.com (Erik Arvidsson)
 * @author mirkov@google.com (Mirko Visontai)
 */


goog.provide('goog.events.EventType');

goog.require('goog.userAgent');


/**
 * Returns a prefixed event name for the current browser.
 * @param {string} eventName The name of the event.
 * @return {string} The prefixed event name.
 * @suppress {missingRequire|missingProvide}
 * @private
 */
goog.events.getVendorPrefixedName_ = function(eventName) {
  return goog.userAgent.WEBKIT ? 'webkit' + eventName :
      (goog.userAgent.OPERA ? 'o' + eventName.toLowerCase() :
          eventName.toLowerCase());
};


/**
 * Constants for event names.
 * @enum {string}
 */
goog.events.EventType = {
  // Mouse events
  CLICK: 'click',
  RIGHTCLICK: 'rightclick',
  DBLCLICK: 'dblclick',
  MOUSEDOWN: 'mousedown',
  MOUSEUP: 'mouseup',
  MOUSEOVER: 'mouseover',
  MOUSEOUT: 'mouseout',
  MOUSEMOVE: 'mousemove',
  MOUSEENTER: 'mouseenter',
  MOUSELEAVE: 'mouseleave',
  // Select start is non-standard.
  // See http://msdn.microsoft.com/en-us/library/ie/ms536969(v=vs.85).aspx.
  SELECTSTART: 'selectstart', // IE, Safari, Chrome

  // Key events
  KEYPRESS: 'keypress',
  KEYDOWN: 'keydown',
  KEYUP: 'keyup',

  // Focus
  BLUR: 'blur',
  FOCUS: 'focus',
  DEACTIVATE: 'deactivate', // IE only
  // NOTE: The following two events are not stable in cross-browser usage.
  //     WebKit and Opera implement DOMFocusIn/Out.
  //     IE implements focusin/out.
  //     Gecko implements neither see bug at
  //     https://bugzilla.mozilla.org/show_bug.cgi?id=396927.
  // The DOM Events Level 3 Draft deprecates DOMFocusIn in favor of focusin:
  //     http://dev.w3.org/2006/webapi/DOM-Level-3-Events/html/DOM3-Events.html
  // You can use FOCUS in Capture phase until implementations converge.
  FOCUSIN: goog.userAgent.IE ? 'focusin' : 'DOMFocusIn',
  FOCUSOUT: goog.userAgent.IE ? 'focusout' : 'DOMFocusOut',

  // Forms
  CHANGE: 'change',
  SELECT: 'select',
  SUBMIT: 'submit',
  INPUT: 'input',
  PROPERTYCHANGE: 'propertychange', // IE only

  // Drag and drop
  DRAGSTART: 'dragstart',
  DRAG: 'drag',
  DRAGENTER: 'dragenter',
  DRAGOVER: 'dragover',
  DRAGLEAVE: 'dragleave',
  DROP: 'drop',
  DRAGEND: 'dragend',

  // WebKit touch events.
  TOUCHSTART: 'touchstart',
  TOUCHMOVE: 'touchmove',
  TOUCHEND: 'touchend',
  TOUCHCANCEL: 'touchcancel',

  // Misc
  BEFOREUNLOAD: 'beforeunload',
  CONSOLEMESSAGE: 'consolemessage',
  CONTEXTMENU: 'contextmenu',
  DOMCONTENTLOADED: 'DOMContentLoaded',
  ERROR: 'error',
  HELP: 'help',
  LOAD: 'load',
  LOSECAPTURE: 'losecapture',
  ORIENTATIONCHANGE: 'orientationchange',
  READYSTATECHANGE: 'readystatechange',
  RESIZE: 'resize',
  SCROLL: 'scroll',
  UNLOAD: 'unload',

  // HTML 5 History events
  // See http://www.w3.org/TR/html5/history.html#event-definitions
  HASHCHANGE: 'hashchange',
  PAGEHIDE: 'pagehide',
  PAGESHOW: 'pageshow',
  POPSTATE: 'popstate',

  // Copy and Paste
  // Support is limited. Make sure it works on your favorite browser
  // before using.
  // http://www.quirksmode.org/dom/events/cutcopypaste.html
  COPY: 'copy',
  PASTE: 'paste',
  CUT: 'cut',
  BEFORECOPY: 'beforecopy',
  BEFORECUT: 'beforecut',
  BEFOREPASTE: 'beforepaste',

  // HTML5 online/offline events.
  // http://www.w3.org/TR/offline-webapps/#related
  ONLINE: 'online',
  OFFLINE: 'offline',

  // HTML 5 worker events
  MESSAGE: 'message',
  CONNECT: 'connect',

  // CSS animation events.
  /** @suppress {missingRequire} */
  ANIMATIONSTART: goog.events.getVendorPrefixedName_('AnimationStart'),
  /** @suppress {missingRequire} */
  ANIMATIONEND: goog.events.getVendorPrefixedName_('AnimationEnd'),
  /** @suppress {missingRequire} */
  ANIMATIONITERATION: goog.events.getVendorPrefixedName_('AnimationIteration'),

  // CSS transition events. Based on the browser support described at:
  // https://developer.mozilla.org/en/css/css_transitions#Browser_compatibility
  /** @suppress {missingRequire} */
  TRANSITIONEND: goog.events.getVendorPrefixedName_('TransitionEnd'),

  // W3C Pointer Events
  // http://www.w3.org/TR/pointerevents/
  POINTERDOWN: 'pointerdown',
  POINTERUP: 'pointerup',
  POINTERCANCEL: 'pointercancel',
  POINTERMOVE: 'pointermove',
  POINTEROVER: 'pointerover',
  POINTEROUT: 'pointerout',
  POINTERENTER: 'pointerenter',
  POINTERLEAVE: 'pointerleave',
  GOTPOINTERCAPTURE: 'gotpointercapture',
  LOSTPOINTERCAPTURE: 'lostpointercapture',

  // IE specific events.
  // See http://msdn.microsoft.com/en-us/library/ie/hh772103(v=vs.85).aspx
  // Note: these events will be supplanted in IE11.
  MSGESTURECHANGE: 'MSGestureChange',
  MSGESTUREEND: 'MSGestureEnd',
  MSGESTUREHOLD: 'MSGestureHold',
  MSGESTURESTART: 'MSGestureStart',
  MSGESTURETAP: 'MSGestureTap',
  MSGOTPOINTERCAPTURE: 'MSGotPointerCapture',
  MSINERTIASTART: 'MSInertiaStart',
  MSLOSTPOINTERCAPTURE: 'MSLostPointerCapture',
  MSPOINTERCANCEL: 'MSPointerCancel',
  MSPOINTERDOWN: 'MSPointerDown',
  MSPOINTERENTER: 'MSPointerEnter',
  MSPOINTERHOVER: 'MSPointerHover',
  MSPOINTERLEAVE: 'MSPointerLeave',
  MSPOINTERMOVE: 'MSPointerMove',
  MSPOINTEROUT: 'MSPointerOut',
  MSPOINTEROVER: 'MSPointerOver',
  MSPOINTERUP: 'MSPointerUp',

  // Native IMEs/input tools events.
  TEXTINPUT: 'textinput',
  COMPOSITIONSTART: 'compositionstart',
  COMPOSITIONUPDATE: 'compositionupdate',
  COMPOSITIONEND: 'compositionend',

  // Webview tag events
  // See http://developer.chrome.com/dev/apps/webview_tag.html
  EXIT: 'exit',
  LOADABORT: 'loadabort',
  LOADCOMMIT: 'loadcommit',
  LOADREDIRECT: 'loadredirect',
  LOADSTART: 'loadstart',
  LOADSTOP: 'loadstop',
  RESPONSIVE: 'responsive',
  SIZECHANGED: 'sizechanged',
  UNRESPONSIVE: 'unresponsive',

  // HTML5 Page Visibility API.  See details at
  // {@code goog.labs.dom.PageVisibilityMonitor}.
  VISIBILITYCHANGE: 'visibilitychange',

  // LocalStorage event.
  STORAGE: 'storage',

  // DOM Level 2 mutation events (deprecated).
  DOMSUBTREEMODIFIED: 'DOMSubtreeModified',
  DOMNODEINSERTED: 'DOMNodeInserted',
  DOMNODEREMOVED: 'DOMNodeRemoved',
  DOMNODEREMOVEDFROMDOCUMENT: 'DOMNodeRemovedFromDocument',
  DOMNODEINSERTEDINTODOCUMENT: 'DOMNodeInsertedIntoDocument',
  DOMATTRMODIFIED: 'DOMAttrModified',
  DOMCHARACTERDATAMODIFIED: 'DOMCharacterDataModified'
};

// Copyright 2009 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Useful compiler idioms.
 *
 */

goog.provide('goog.reflect');


/**
 * Syntax for object literal casts.
 * @see http://go/jscompiler-renaming
 * @see http://code.google.com/p/closure-compiler/wiki/
 *      ExperimentalTypeBasedPropertyRenaming
 *
 * Use this if you have an object literal whose keys need to have the same names
 * as the properties of some class even after they are renamed by the compiler.
 *
 * @param {!Function} type Type to cast to.
 * @param {Object} object Object literal to cast.
 * @return {Object} The object literal.
 */
goog.reflect.object = function(type, object) {
  return object;
};


/**
 * To assert to the compiler that an operation is needed when it would
 * otherwise be stripped. For example:
 * <code>
 *     // Force a layout
 *     goog.reflect.sinkValue(dialog.offsetHeight);
 * </code>
 * @type {!Function}
 */
goog.reflect.sinkValue = function(x) {
  goog.reflect.sinkValue[' '](x);
  return x;
};


/**
 * The compiler should optimize this function away iff no one ever uses
 * goog.reflect.sinkValue.
 */
goog.reflect.sinkValue[' '] = goog.nullFunction;


/**
 * Check if a property can be accessed without throwing an exception.
 * @param {Object} obj The owner of the property.
 * @param {string} prop The property name.
 * @return {boolean} Whether the property is accessible. Will also return true
 *     if obj is null.
 */
goog.reflect.canAccessProperty = function(obj, prop) {
  /** @preserveTry */
  try {
    goog.reflect.sinkValue(obj[prop]);
    return true;
  } catch (e) {}
  return false;
};

// Copyright 2005 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview A patched, standardized event object for browser events.
 *
 * <pre>
 * The patched event object contains the following members:
 * - type           {string}    Event type, e.g. 'click'
 * - target         {Object}    The element that actually triggered the event
 * - currentTarget  {Object}    The element the listener is attached to
 * - relatedTarget  {Object}    For mouseover and mouseout, the previous object
 * - offsetX        {number}    X-coordinate relative to target
 * - offsetY        {number}    Y-coordinate relative to target
 * - clientX        {number}    X-coordinate relative to viewport
 * - clientY        {number}    Y-coordinate relative to viewport
 * - screenX        {number}    X-coordinate relative to the edge of the screen
 * - screenY        {number}    Y-coordinate relative to the edge of the screen
 * - button         {number}    Mouse button. Use isButton() to test.
 * - keyCode        {number}    Key-code
 * - ctrlKey        {boolean}   Was ctrl key depressed
 * - altKey         {boolean}   Was alt key depressed
 * - shiftKey       {boolean}   Was shift key depressed
 * - metaKey        {boolean}   Was meta key depressed
 * - defaultPrevented {boolean} Whether the default action has been prevented
 * - state          {Object}    History state object
 *
 * NOTE: The keyCode member contains the raw browser keyCode. For normalized
 * key and character code use {@link goog.events.KeyHandler}.
 * </pre>
 *
 */

goog.provide('goog.events.BrowserEvent');
goog.provide('goog.events.BrowserEvent.MouseButton');

goog.require('goog.events.BrowserFeature');
goog.require('goog.events.Event');
goog.require('goog.events.EventType');
goog.require('goog.reflect');
goog.require('goog.userAgent');



/**
 * Accepts a browser event object and creates a patched, cross browser event
 * object.
 * The content of this object will not be initialized if no event object is
 * provided. If this is the case, init() needs to be invoked separately.
 * @param {Event=} opt_e Browser event object.
 * @param {EventTarget=} opt_currentTarget Current target for event.
 * @constructor
 * @extends {goog.events.Event}
 */
goog.events.BrowserEvent = function(opt_e, opt_currentTarget) {
  goog.events.BrowserEvent.base(this, 'constructor', opt_e ? opt_e.type : '');

  /**
   * Target that fired the event.
   * @override
   * @type {Node}
   */
  this.target = null;

  /**
   * Node that had the listener attached.
   * @override
   * @type {Node|undefined}
   */
  this.currentTarget = null;

  /**
   * For mouseover and mouseout events, the related object for the event.
   * @type {Node}
   */
  this.relatedTarget = null;

  /**
   * X-coordinate relative to target.
   * @type {number}
   */
  this.offsetX = 0;

  /**
   * Y-coordinate relative to target.
   * @type {number}
   */
  this.offsetY = 0;

  /**
   * X-coordinate relative to the window.
   * @type {number}
   */
  this.clientX = 0;

  /**
   * Y-coordinate relative to the window.
   * @type {number}
   */
  this.clientY = 0;

  /**
   * X-coordinate relative to the monitor.
   * @type {number}
   */
  this.screenX = 0;

  /**
   * Y-coordinate relative to the monitor.
   * @type {number}
   */
  this.screenY = 0;

  /**
   * Which mouse button was pressed.
   * @type {number}
   */
  this.button = 0;

  /**
   * Keycode of key press.
   * @type {number}
   */
  this.keyCode = 0;

  /**
   * Keycode of key press.
   * @type {number}
   */
  this.charCode = 0;

  /**
   * Whether control was pressed at time of event.
   * @type {boolean}
   */
  this.ctrlKey = false;

  /**
   * Whether alt was pressed at time of event.
   * @type {boolean}
   */
  this.altKey = false;

  /**
   * Whether shift was pressed at time of event.
   * @type {boolean}
   */
  this.shiftKey = false;

  /**
   * Whether the meta key was pressed at time of event.
   * @type {boolean}
   */
  this.metaKey = false;

  /**
   * History state object, only set for PopState events where it's a copy of the
   * state object provided to pushState or replaceState.
   * @type {Object}
   */
  this.state = null;

  /**
   * Whether the default platform modifier key was pressed at time of event.
   * (This is control for all platforms except Mac, where it's Meta.)
   * @type {boolean}
   */
  this.platformModifierKey = false;

  /**
   * The browser event object.
   * @private {Event}
   */
  this.event_ = null;

  if (opt_e) {
    this.init(opt_e, opt_currentTarget);
  }
};
goog.inherits(goog.events.BrowserEvent, goog.events.Event);


/**
 * Normalized button constants for the mouse.
 * @enum {number}
 */
goog.events.BrowserEvent.MouseButton = {
  LEFT: 0,
  MIDDLE: 1,
  RIGHT: 2
};


/**
 * Static data for mapping mouse buttons.
 * @type {!Array.<number>}
 */
goog.events.BrowserEvent.IEButtonMap = [
  1, // LEFT
  4, // MIDDLE
  2  // RIGHT
];


/**
 * Accepts a browser event object and creates a patched, cross browser event
 * object.
 * @param {Event} e Browser event object.
 * @param {EventTarget=} opt_currentTarget Current target for event.
 */
goog.events.BrowserEvent.prototype.init = function(e, opt_currentTarget) {
  var type = this.type = e.type;

  // TODO(nicksantos): Change this.target to type EventTarget.
  this.target = /** @type {Node} */ (e.target) || e.srcElement;

  // TODO(nicksantos): Change this.currentTarget to type EventTarget.
  this.currentTarget = /** @type {Node} */ (opt_currentTarget);

  var relatedTarget = /** @type {Node} */ (e.relatedTarget);
  if (relatedTarget) {
    // There's a bug in FireFox where sometimes, relatedTarget will be a
    // chrome element, and accessing any property of it will get a permission
    // denied exception. See:
    // https://bugzilla.mozilla.org/show_bug.cgi?id=497780
    if (goog.userAgent.GECKO) {
      if (!goog.reflect.canAccessProperty(relatedTarget, 'nodeName')) {
        relatedTarget = null;
      }
    }
    // TODO(arv): Use goog.events.EventType when it has been refactored into its
    // own file.
  } else if (type == goog.events.EventType.MOUSEOVER) {
    relatedTarget = e.fromElement;
  } else if (type == goog.events.EventType.MOUSEOUT) {
    relatedTarget = e.toElement;
  }

  this.relatedTarget = relatedTarget;

  // Webkit emits a lame warning whenever layerX/layerY is accessed.
  // http://code.google.com/p/chromium/issues/detail?id=101733
  this.offsetX = (goog.userAgent.WEBKIT || e.offsetX !== undefined) ?
      e.offsetX : e.layerX;
  this.offsetY = (goog.userAgent.WEBKIT || e.offsetY !== undefined) ?
      e.offsetY : e.layerY;

  this.clientX = e.clientX !== undefined ? e.clientX : e.pageX;
  this.clientY = e.clientY !== undefined ? e.clientY : e.pageY;
  this.screenX = e.screenX || 0;
  this.screenY = e.screenY || 0;

  this.button = e.button;

  this.keyCode = e.keyCode || 0;
  this.charCode = e.charCode || (type == 'keypress' ? e.keyCode : 0);
  this.ctrlKey = e.ctrlKey;
  this.altKey = e.altKey;
  this.shiftKey = e.shiftKey;
  this.metaKey = e.metaKey;
  this.platformModifierKey = goog.userAgent.MAC ? e.metaKey : e.ctrlKey;
  this.state = e.state;
  this.event_ = e;
  if (e.defaultPrevented) {
    this.preventDefault();
  }
};


/**
 * Tests to see which button was pressed during the event. This is really only
 * useful in IE and Gecko browsers. And in IE, it's only useful for
 * mousedown/mouseup events, because click only fires for the left mouse button.
 *
 * Safari 2 only reports the left button being clicked, and uses the value '1'
 * instead of 0. Opera only reports a mousedown event for the middle button, and
 * no mouse events for the right button. Opera has default behavior for left and
 * middle click that can only be overridden via a configuration setting.
 *
 * There's a nice table of this mess at http://www.unixpapa.com/js/mouse.html.
 *
 * @param {goog.events.BrowserEvent.MouseButton} button The button
 *     to test for.
 * @return {boolean} True if button was pressed.
 */
goog.events.BrowserEvent.prototype.isButton = function(button) {
  if (!goog.events.BrowserFeature.HAS_W3C_BUTTON) {
    if (this.type == 'click') {
      return button == goog.events.BrowserEvent.MouseButton.LEFT;
    } else {
      return !!(this.event_.button &
          goog.events.BrowserEvent.IEButtonMap[button]);
    }
  } else {
    return this.event_.button == button;
  }
};


/**
 * Whether this has an "action"-producing mouse button.
 *
 * By definition, this includes left-click on windows/linux, and left-click
 * without the ctrl key on Macs.
 *
 * @return {boolean} The result.
 */
goog.events.BrowserEvent.prototype.isMouseActionButton = function() {
  // Webkit does not ctrl+click to be a right-click, so we
  // normalize it to behave like Gecko and Opera.
  return this.isButton(goog.events.BrowserEvent.MouseButton.LEFT) &&
      !(goog.userAgent.WEBKIT && goog.userAgent.MAC && this.ctrlKey);
};


/**
 * @override
 */
goog.events.BrowserEvent.prototype.stopPropagation = function() {
  goog.events.BrowserEvent.superClass_.stopPropagation.call(this);
  if (this.event_.stopPropagation) {
    this.event_.stopPropagation();
  } else {
    this.event_.cancelBubble = true;
  }
};


/**
 * @override
 */
goog.events.BrowserEvent.prototype.preventDefault = function() {
  goog.events.BrowserEvent.superClass_.preventDefault.call(this);
  var be = this.event_;
  if (!be.preventDefault) {
    be.returnValue = false;
    if (goog.events.BrowserFeature.SET_KEY_CODE_TO_PREVENT_DEFAULT) {
      /** @preserveTry */
      try {
        // Most keys can be prevented using returnValue. Some special keys
        // require setting the keyCode to -1 as well:
        //
        // In IE7:
        // F3, F5, F10, F11, Ctrl+P, Crtl+O, Ctrl+F (these are taken from IE6)
        //
        // In IE8:
        // Ctrl+P, Crtl+O, Ctrl+F (F1-F12 cannot be stopped through the event)
        //
        // We therefore do this for all function keys as well as when Ctrl key
        // is pressed.
        var VK_F1 = 112;
        var VK_F12 = 123;
        if (be.ctrlKey || be.keyCode >= VK_F1 && be.keyCode <= VK_F12) {
          be.keyCode = -1;
        }
      } catch (ex) {
        // IE throws an 'access denied' exception when trying to change
        // keyCode in some situations (e.g. srcElement is input[type=file],
        // or srcElement is an anchor tag rewritten by parent's innerHTML).
        // Do nothing in this case.
      }
    }
  } else {
    be.preventDefault();
  }
};


/**
 * @return {Event} The underlying browser event object.
 */
goog.events.BrowserEvent.prototype.getBrowserEvent = function() {
  return this.event_;
};


/** @override */
goog.events.BrowserEvent.prototype.disposeInternal = function() {
};

// Copyright 2012 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview An interface for a listenable JavaScript object.
 */

goog.provide('goog.events.Listenable');
goog.provide('goog.events.ListenableKey');

/** @suppress {extraRequire} */
goog.require('goog.events.EventId');



/**
 * A listenable interface. A listenable is an object with the ability
 * to dispatch/broadcast events to "event listeners" registered via
 * listen/listenOnce.
 *
 * The interface allows for an event propagation mechanism similar
 * to one offered by native browser event targets, such as
 * capture/bubble mechanism, stopping propagation, and preventing
 * default actions. Capture/bubble mechanism depends on the ancestor
 * tree constructed via {@code #getParentEventTarget}; this tree
 * must be directed acyclic graph. The meaning of default action(s)
 * in preventDefault is specific to a particular use case.
 *
 * Implementations that do not support capture/bubble or can not have
 * a parent listenable can simply not implement any ability to set the
 * parent listenable (and have {@code #getParentEventTarget} return
 * null).
 *
 * Implementation of this class can be used with or independently from
 * goog.events.
 *
 * Implementation must call {@code #addImplementation(implClass)}.
 *
 * @interface
 * @see goog.events
 * @see http://www.w3.org/TR/DOM-Level-2-Events/events.html
 */
goog.events.Listenable = function() {};


/**
 * An expando property to indicate that an object implements
 * goog.events.Listenable.
 *
 * See addImplementation/isImplementedBy.
 *
 * @type {string}
 * @const
 */
goog.events.Listenable.IMPLEMENTED_BY_PROP =
    'closure_listenable_' + ((Math.random() * 1e6) | 0);


/**
 * Marks a given class (constructor) as an implementation of
 * Listenable, do that we can query that fact at runtime. The class
 * must have already implemented the interface.
 * @param {!Function} cls The class constructor. The corresponding
 *     class must have already implemented the interface.
 */
goog.events.Listenable.addImplementation = function(cls) {
  cls.prototype[goog.events.Listenable.IMPLEMENTED_BY_PROP] = true;
};


/**
 * @param {Object} obj The object to check.
 * @return {boolean} Whether a given instance implements Listenable. The
 *     class/superclass of the instance must call addImplementation.
 */
goog.events.Listenable.isImplementedBy = function(obj) {
  return !!(obj && obj[goog.events.Listenable.IMPLEMENTED_BY_PROP]);
};


/**
 * Adds an event listener. A listener can only be added once to an
 * object and if it is added again the key for the listener is
 * returned. Note that if the existing listener is a one-off listener
 * (registered via listenOnce), it will no longer be a one-off
 * listener after a call to listen().
 *
 * @param {string|!goog.events.EventId.<EVENTOBJ>} type The event type id.
 * @param {function(this:SCOPE, EVENTOBJ):(boolean|undefined)} listener Callback
 *     method.
 * @param {boolean=} opt_useCapture Whether to fire in capture phase
 *     (defaults to false).
 * @param {SCOPE=} opt_listenerScope Object in whose scope to call the
 *     listener.
 * @return {goog.events.ListenableKey} Unique key for the listener.
 * @template SCOPE,EVENTOBJ
 */
goog.events.Listenable.prototype.listen;


/**
 * Adds an event listener that is removed automatically after the
 * listener fired once.
 *
 * If an existing listener already exists, listenOnce will do
 * nothing. In particular, if the listener was previously registered
 * via listen(), listenOnce() will not turn the listener into a
 * one-off listener. Similarly, if there is already an existing
 * one-off listener, listenOnce does not modify the listeners (it is
 * still a once listener).
 *
 * @param {string|!goog.events.EventId.<EVENTOBJ>} type The event type id.
 * @param {function(this:SCOPE, EVENTOBJ):(boolean|undefined)} listener Callback
 *     method.
 * @param {boolean=} opt_useCapture Whether to fire in capture phase
 *     (defaults to false).
 * @param {SCOPE=} opt_listenerScope Object in whose scope to call the
 *     listener.
 * @return {goog.events.ListenableKey} Unique key for the listener.
 * @template SCOPE,EVENTOBJ
 */
goog.events.Listenable.prototype.listenOnce;


/**
 * Removes an event listener which was added with listen() or listenOnce().
 *
 * @param {string|!goog.events.EventId.<EVENTOBJ>} type The event type id.
 * @param {function(this:SCOPE, EVENTOBJ):(boolean|undefined)} listener Callback
 *     method.
 * @param {boolean=} opt_useCapture Whether to fire in capture phase
 *     (defaults to false).
 * @param {SCOPE=} opt_listenerScope Object in whose scope to call
 *     the listener.
 * @return {boolean} Whether any listener was removed.
 * @template SCOPE,EVENTOBJ
 */
goog.events.Listenable.prototype.unlisten;


/**
 * Removes an event listener which was added with listen() by the key
 * returned by listen().
 *
 * @param {goog.events.ListenableKey} key The key returned by
 *     listen() or listenOnce().
 * @return {boolean} Whether any listener was removed.
 */
goog.events.Listenable.prototype.unlistenByKey;


/**
 * Dispatches an event (or event like object) and calls all listeners
 * listening for events of this type. The type of the event is decided by the
 * type property on the event object.
 *
 * If any of the listeners returns false OR calls preventDefault then this
 * function will return false.  If one of the capture listeners calls
 * stopPropagation, then the bubble listeners won't fire.
 *
 * @param {goog.events.EventLike} e Event object.
 * @return {boolean} If anyone called preventDefault on the event object (or
 *     if any of the listeners returns false) this will also return false.
 */
goog.events.Listenable.prototype.dispatchEvent;


/**
 * Removes all listeners from this listenable. If type is specified,
 * it will only remove listeners of the particular type. otherwise all
 * registered listeners will be removed.
 *
 * @param {string=} opt_type Type of event to remove, default is to
 *     remove all types.
 * @return {number} Number of listeners removed.
 */
goog.events.Listenable.prototype.removeAllListeners;


/**
 * Returns the parent of this event target to use for capture/bubble
 * mechanism.
 *
 * NOTE(user): The name reflects the original implementation of
 * custom event target ({@code goog.events.EventTarget}). We decided
 * that changing the name is not worth it.
 *
 * @return {goog.events.Listenable} The parent EventTarget or null if
 *     there is no parent.
 */
goog.events.Listenable.prototype.getParentEventTarget;


/**
 * Fires all registered listeners in this listenable for the given
 * type and capture mode, passing them the given eventObject. This
 * does not perform actual capture/bubble. Only implementors of the
 * interface should be using this.
 *
 * @param {string|!goog.events.EventId.<EVENTOBJ>} type The type of the
 *     listeners to fire.
 * @param {boolean} capture The capture mode of the listeners to fire.
 * @param {EVENTOBJ} eventObject The event object to fire.
 * @return {boolean} Whether all listeners succeeded without
 *     attempting to prevent default behavior. If any listener returns
 *     false or called goog.events.Event#preventDefault, this returns
 *     false.
 * @template EVENTOBJ
 */
goog.events.Listenable.prototype.fireListeners;


/**
 * Gets all listeners in this listenable for the given type and
 * capture mode.
 *
 * @param {string|!goog.events.EventId} type The type of the listeners to fire.
 * @param {boolean} capture The capture mode of the listeners to fire.
 * @return {!Array.<goog.events.ListenableKey>} An array of registered
 *     listeners.
 * @template EVENTOBJ
 */
goog.events.Listenable.prototype.getListeners;


/**
 * Gets the goog.events.ListenableKey for the event or null if no such
 * listener is in use.
 *
 * @param {string|!goog.events.EventId.<EVENTOBJ>} type The name of the event
 *     without the 'on' prefix.
 * @param {function(this:SCOPE, EVENTOBJ):(boolean|undefined)} listener The
 *     listener function to get.
 * @param {boolean} capture Whether the listener is a capturing listener.
 * @param {SCOPE=} opt_listenerScope Object in whose scope to call the
 *     listener.
 * @return {goog.events.ListenableKey} the found listener or null if not found.
 * @template SCOPE,EVENTOBJ
 */
goog.events.Listenable.prototype.getListener;


/**
 * Whether there is any active listeners matching the specified
 * signature. If either the type or capture parameters are
 * unspecified, the function will match on the remaining criteria.
 *
 * @param {string|!goog.events.EventId.<EVENTOBJ>=} opt_type Event type.
 * @param {boolean=} opt_capture Whether to check for capture or bubble
 *     listeners.
 * @return {boolean} Whether there is any active listeners matching
 *     the requested type and/or capture phase.
 * @template EVENTOBJ
 */
goog.events.Listenable.prototype.hasListener;



/**
 * An interface that describes a single registered listener.
 * @interface
 */
goog.events.ListenableKey = function() {};


/**
 * Counter used to create a unique key
 * @type {number}
 * @private
 */
goog.events.ListenableKey.counter_ = 0;


/**
 * Reserves a key to be used for ListenableKey#key field.
 * @return {number} A number to be used to fill ListenableKey#key
 *     field.
 */
goog.events.ListenableKey.reserveKey = function() {
  return ++goog.events.ListenableKey.counter_;
};


/**
 * The source event target.
 * @type {!(Object|goog.events.Listenable|goog.events.EventTarget)}
 */
goog.events.ListenableKey.prototype.src;


/**
 * The event type the listener is listening to.
 * @type {string}
 */
goog.events.ListenableKey.prototype.type;


/**
 * The listener function.
 * @type {function(?):?|{handleEvent:function(?):?}|null}
 */
goog.events.ListenableKey.prototype.listener;


/**
 * Whether the listener works on capture phase.
 * @type {boolean}
 */
goog.events.ListenableKey.prototype.capture;


/**
 * The 'this' object for the listener function's scope.
 * @type {Object}
 */
goog.events.ListenableKey.prototype.handler;


/**
 * A globally unique number to identify the key.
 * @type {number}
 */
goog.events.ListenableKey.prototype.key;

// Copyright 2005 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Listener object.
 * @see ../demos/events.html
 */

goog.provide('goog.events.Listener');

goog.require('goog.events.ListenableKey');



/**
 * Simple class that stores information about a listener
 * @param {!Function} listener Callback function.
 * @param {Function} proxy Wrapper for the listener that patches the event.
 * @param {EventTarget|goog.events.Listenable} src Source object for
 *     the event.
 * @param {string} type Event type.
 * @param {boolean} capture Whether in capture or bubble phase.
 * @param {Object=} opt_handler Object in whose context to execute the callback.
 * @implements {goog.events.ListenableKey}
 * @constructor
 */
goog.events.Listener = function(
    listener, proxy, src, type, capture, opt_handler) {
  if (goog.events.Listener.ENABLE_MONITORING) {
    this.creationStack = new Error().stack;
  }

  /**
   * Callback function.
   * @type {Function}
   */
  this.listener = listener;

  /**
   * A wrapper over the original listener. This is used solely to
   * handle native browser events (it is used to simulate the capture
   * phase and to patch the event object).
   * @type {Function}
   */
  this.proxy = proxy;

  /**
   * Object or node that callback is listening to
   * @type {EventTarget|goog.events.Listenable}
   */
  this.src = src;

  /**
   * The event type.
   * @const {string}
   */
  this.type = type;

  /**
   * Whether the listener is being called in the capture or bubble phase
   * @const {boolean}
   */
  this.capture = !!capture;

  /**
   * Optional object whose context to execute the listener in
   * @type {Object|undefined}
   */
  this.handler = opt_handler;

  /**
   * The key of the listener.
   * @const {number}
   * @override
   */
  this.key = goog.events.ListenableKey.reserveKey();

  /**
   * Whether to remove the listener after it has been called.
   * @type {boolean}
   */
  this.callOnce = false;

  /**
   * Whether the listener has been removed.
   * @type {boolean}
   */
  this.removed = false;
};


/**
 * @define {boolean} Whether to enable the monitoring of the
 *     goog.events.Listener instances. Switching on the monitoring is only
 *     recommended for debugging because it has a significant impact on
 *     performance and memory usage. If switched off, the monitoring code
 *     compiles down to 0 bytes.
 */
goog.define('goog.events.Listener.ENABLE_MONITORING', false);


/**
 * If monitoring the goog.events.Listener instances is enabled, stores the
 * creation stack trace of the Disposable instance.
 * @type {string}
 */
goog.events.Listener.prototype.creationStack;


/**
 * Marks this listener as removed. This also remove references held by
 * this listener object (such as listener and event source).
 */
goog.events.Listener.prototype.markAsRemoved = function() {
  this.removed = true;
  this.listener = null;
  this.proxy = null;
  this.src = null;
  this.handler = null;
};

// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Utilities for manipulating objects/maps/hashes.
 */

goog.provide('goog.object');


/**
 * Calls a function for each element in an object/map/hash.
 *
 * @param {Object.<K,V>} obj The object over which to iterate.
 * @param {function(this:T,V,?,Object.<K,V>):?} f The function to call
 *     for every element. This function takes 3 arguments (the element, the
 *     index and the object) and the return value is ignored.
 * @param {T=} opt_obj This is used as the 'this' object within f.
 * @template T,K,V
 */
goog.object.forEach = function(obj, f, opt_obj) {
  for (var key in obj) {
    f.call(opt_obj, obj[key], key, obj);
  }
};


/**
 * Calls a function for each element in an object/map/hash. If that call returns
 * true, adds the element to a new object.
 *
 * @param {Object.<K,V>} obj The object over which to iterate.
 * @param {function(this:T,V,?,Object.<K,V>):boolean} f The function to call
 *     for every element. This
 *     function takes 3 arguments (the element, the index and the object)
 *     and should return a boolean. If the return value is true the
 *     element is added to the result object. If it is false the
 *     element is not included.
 * @param {T=} opt_obj This is used as the 'this' object within f.
 * @return {!Object.<K,V>} a new object in which only elements that passed the
 *     test are present.
 * @template T,K,V
 */
goog.object.filter = function(obj, f, opt_obj) {
  var res = {};
  for (var key in obj) {
    if (f.call(opt_obj, obj[key], key, obj)) {
      res[key] = obj[key];
    }
  }
  return res;
};


/**
 * For every element in an object/map/hash calls a function and inserts the
 * result into a new object.
 *
 * @param {Object.<K,V>} obj The object over which to iterate.
 * @param {function(this:T,V,?,Object.<K,V>):R} f The function to call
 *     for every element. This function
 *     takes 3 arguments (the element, the index and the object)
 *     and should return something. The result will be inserted
 *     into a new object.
 * @param {T=} opt_obj This is used as the 'this' object within f.
 * @return {!Object.<K,R>} a new object with the results from f.
 * @template T,K,V,R
 */
goog.object.map = function(obj, f, opt_obj) {
  var res = {};
  for (var key in obj) {
    res[key] = f.call(opt_obj, obj[key], key, obj);
  }
  return res;
};


/**
 * Calls a function for each element in an object/map/hash. If any
 * call returns true, returns true (without checking the rest). If
 * all calls return false, returns false.
 *
 * @param {Object.<K,V>} obj The object to check.
 * @param {function(this:T,V,?,Object.<K,V>):boolean} f The function to
 *     call for every element. This function
 *     takes 3 arguments (the element, the index and the object) and should
 *     return a boolean.
 * @param {T=} opt_obj This is used as the 'this' object within f.
 * @return {boolean} true if any element passes the test.
 * @template T,K,V
 */
goog.object.some = function(obj, f, opt_obj) {
  for (var key in obj) {
    if (f.call(opt_obj, obj[key], key, obj)) {
      return true;
    }
  }
  return false;
};


/**
 * Calls a function for each element in an object/map/hash. If
 * all calls return true, returns true. If any call returns false, returns
 * false at this point and does not continue to check the remaining elements.
 *
 * @param {Object.<K,V>} obj The object to check.
 * @param {?function(this:T,V,?,Object.<K,V>):boolean} f The function to
 *     call for every element. This function
 *     takes 3 arguments (the element, the index and the object) and should
 *     return a boolean.
 * @param {T=} opt_obj This is used as the 'this' object within f.
 * @return {boolean} false if any element fails the test.
 * @template T,K,V
 */
goog.object.every = function(obj, f, opt_obj) {
  for (var key in obj) {
    if (!f.call(opt_obj, obj[key], key, obj)) {
      return false;
    }
  }
  return true;
};


/**
 * Returns the number of key-value pairs in the object map.
 *
 * @param {Object} obj The object for which to get the number of key-value
 *     pairs.
 * @return {number} The number of key-value pairs in the object map.
 */
goog.object.getCount = function(obj) {
  // JS1.5 has __count__ but it has been deprecated so it raises a warning...
  // in other words do not use. Also __count__ only includes the fields on the
  // actual object and not in the prototype chain.
  var rv = 0;
  for (var key in obj) {
    rv++;
  }
  return rv;
};


/**
 * Returns one key from the object map, if any exists.
 * For map literals the returned key will be the first one in most of the
 * browsers (a know exception is Konqueror).
 *
 * @param {Object} obj The object to pick a key from.
 * @return {string|undefined} The key or undefined if the object is empty.
 */
goog.object.getAnyKey = function(obj) {
  for (var key in obj) {
    return key;
  }
};


/**
 * Returns one value from the object map, if any exists.
 * For map literals the returned value will be the first one in most of the
 * browsers (a know exception is Konqueror).
 *
 * @param {Object.<K,V>} obj The object to pick a value from.
 * @return {V|undefined} The value or undefined if the object is empty.
 * @template K,V
 */
goog.object.getAnyValue = function(obj) {
  for (var key in obj) {
    return obj[key];
  }
};


/**
 * Whether the object/hash/map contains the given object as a value.
 * An alias for goog.object.containsValue(obj, val).
 *
 * @param {Object.<K,V>} obj The object in which to look for val.
 * @param {V} val The object for which to check.
 * @return {boolean} true if val is present.
 * @template K,V
 */
goog.object.contains = function(obj, val) {
  return goog.object.containsValue(obj, val);
};


/**
 * Returns the values of the object/map/hash.
 *
 * @param {Object.<K,V>} obj The object from which to get the values.
 * @return {!Array.<V>} The values in the object/map/hash.
 * @template K,V
 */
goog.object.getValues = function(obj) {
  var res = [];
  var i = 0;
  for (var key in obj) {
    res[i++] = obj[key];
  }
  return res;
};


/**
 * Returns the keys of the object/map/hash.
 *
 * @param {Object} obj The object from which to get the keys.
 * @return {!Array.<string>} Array of property keys.
 */
goog.object.getKeys = function(obj) {
  var res = [];
  var i = 0;
  for (var key in obj) {
    res[i++] = key;
  }
  return res;
};


/**
 * Get a value from an object multiple levels deep.  This is useful for
 * pulling values from deeply nested objects, such as JSON responses.
 * Example usage: getValueByKeys(jsonObj, 'foo', 'entries', 3)
 *
 * @param {!Object} obj An object to get the value from.  Can be array-like.
 * @param {...(string|number|!Array.<number|string>)} var_args A number of keys
 *     (as strings, or numbers, for array-like objects).  Can also be
 *     specified as a single array of keys.
 * @return {*} The resulting value.  If, at any point, the value for a key
 *     is undefined, returns undefined.
 */
goog.object.getValueByKeys = function(obj, var_args) {
  var isArrayLike = goog.isArrayLike(var_args);
  var keys = isArrayLike ? var_args : arguments;

  // Start with the 2nd parameter for the variable parameters syntax.
  for (var i = isArrayLike ? 0 : 1; i < keys.length; i++) {
    obj = obj[keys[i]];
    if (!goog.isDef(obj)) {
      break;
    }
  }

  return obj;
};


/**
 * Whether the object/map/hash contains the given key.
 *
 * @param {Object} obj The object in which to look for key.
 * @param {*} key The key for which to check.
 * @return {boolean} true If the map contains the key.
 */
goog.object.containsKey = function(obj, key) {
  return key in obj;
};


/**
 * Whether the object/map/hash contains the given value. This is O(n).
 *
 * @param {Object.<K,V>} obj The object in which to look for val.
 * @param {V} val The value for which to check.
 * @return {boolean} true If the map contains the value.
 * @template K,V
 */
goog.object.containsValue = function(obj, val) {
  for (var key in obj) {
    if (obj[key] == val) {
      return true;
    }
  }
  return false;
};


/**
 * Searches an object for an element that satisfies the given condition and
 * returns its key.
 * @param {Object.<K,V>} obj The object to search in.
 * @param {function(this:T,V,string,Object.<K,V>):boolean} f The
 *      function to call for every element. Takes 3 arguments (the value,
 *     the key and the object) and should return a boolean.
 * @param {T=} opt_this An optional "this" context for the function.
 * @return {string|undefined} The key of an element for which the function
 *     returns true or undefined if no such element is found.
 * @template T,K,V
 */
goog.object.findKey = function(obj, f, opt_this) {
  for (var key in obj) {
    if (f.call(opt_this, obj[key], key, obj)) {
      return key;
    }
  }
  return undefined;
};


/**
 * Searches an object for an element that satisfies the given condition and
 * returns its value.
 * @param {Object.<K,V>} obj The object to search in.
 * @param {function(this:T,V,string,Object.<K,V>):boolean} f The function
 *     to call for every element. Takes 3 arguments (the value, the key
 *     and the object) and should return a boolean.
 * @param {T=} opt_this An optional "this" context for the function.
 * @return {V} The value of an element for which the function returns true or
 *     undefined if no such element is found.
 * @template T,K,V
 */
goog.object.findValue = function(obj, f, opt_this) {
  var key = goog.object.findKey(obj, f, opt_this);
  return key && obj[key];
};


/**
 * Whether the object/map/hash is empty.
 *
 * @param {Object} obj The object to test.
 * @return {boolean} true if obj is empty.
 */
goog.object.isEmpty = function(obj) {
  for (var key in obj) {
    return false;
  }
  return true;
};


/**
 * Removes all key value pairs from the object/map/hash.
 *
 * @param {Object} obj The object to clear.
 */
goog.object.clear = function(obj) {
  for (var i in obj) {
    delete obj[i];
  }
};


/**
 * Removes a key-value pair based on the key.
 *
 * @param {Object} obj The object from which to remove the key.
 * @param {*} key The key to remove.
 * @return {boolean} Whether an element was removed.
 */
goog.object.remove = function(obj, key) {
  var rv;
  if ((rv = key in obj)) {
    delete obj[key];
  }
  return rv;
};


/**
 * Adds a key-value pair to the object. Throws an exception if the key is
 * already in use. Use set if you want to change an existing pair.
 *
 * @param {Object.<K,V>} obj The object to which to add the key-value pair.
 * @param {string} key The key to add.
 * @param {V} val The value to add.
 * @template K,V
 */
goog.object.add = function(obj, key, val) {
  if (key in obj) {
    throw Error('The object already contains the key "' + key + '"');
  }
  goog.object.set(obj, key, val);
};


/**
 * Returns the value for the given key.
 *
 * @param {Object.<K,V>} obj The object from which to get the value.
 * @param {string} key The key for which to get the value.
 * @param {R=} opt_val The value to return if no item is found for the given
 *     key (default is undefined).
 * @return {V|R|undefined} The value for the given key.
 * @template K,V,R
 */
goog.object.get = function(obj, key, opt_val) {
  if (key in obj) {
    return obj[key];
  }
  return opt_val;
};


/**
 * Adds a key-value pair to the object/map/hash.
 *
 * @param {Object.<K,V>} obj The object to which to add the key-value pair.
 * @param {string} key The key to add.
 * @param {V} value The value to add.
 * @template K,V
 */
goog.object.set = function(obj, key, value) {
  obj[key] = value;
};


/**
 * Adds a key-value pair to the object/map/hash if it doesn't exist yet.
 *
 * @param {Object.<K,V>} obj The object to which to add the key-value pair.
 * @param {string} key The key to add.
 * @param {V} value The value to add if the key wasn't present.
 * @return {V} The value of the entry at the end of the function.
 * @template K,V
 */
goog.object.setIfUndefined = function(obj, key, value) {
  return key in obj ? obj[key] : (obj[key] = value);
};


/**
 * Does a flat clone of the object.
 *
 * @param {Object.<K,V>} obj Object to clone.
 * @return {!Object.<K,V>} Clone of the input object.
 * @template K,V
 */
goog.object.clone = function(obj) {
  // We cannot use the prototype trick because a lot of methods depend on where
  // the actual key is set.

  var res = {};
  for (var key in obj) {
    res[key] = obj[key];
  }
  return res;
  // We could also use goog.mixin but I wanted this to be independent from that.
};


/**
 * Clones a value. The input may be an Object, Array, or basic type. Objects and
 * arrays will be cloned recursively.
 *
 * WARNINGS:
 * <code>goog.object.unsafeClone</code> does not detect reference loops. Objects
 * that refer to themselves will cause infinite recursion.
 *
 * <code>goog.object.unsafeClone</code> is unaware of unique identifiers, and
 * copies UIDs created by <code>getUid</code> into cloned results.
 *
 * @param {*} obj The value to clone.
 * @return {*} A clone of the input value.
 */
goog.object.unsafeClone = function(obj) {
  var type = goog.typeOf(obj);
  if (type == 'object' || type == 'array') {
    if (obj.clone) {
      return obj.clone();
    }
    var clone = type == 'array' ? [] : {};
    for (var key in obj) {
      clone[key] = goog.object.unsafeClone(obj[key]);
    }
    return clone;
  }

  return obj;
};


/**
 * Returns a new object in which all the keys and values are interchanged
 * (keys become values and values become keys). If multiple keys map to the
 * same value, the chosen transposed value is implementation-dependent.
 *
 * @param {Object} obj The object to transpose.
 * @return {!Object} The transposed object.
 */
goog.object.transpose = function(obj) {
  var transposed = {};
  for (var key in obj) {
    transposed[obj[key]] = key;
  }
  return transposed;
};


/**
 * The names of the fields that are defined on Object.prototype.
 * @type {Array.<string>}
 * @private
 */
goog.object.PROTOTYPE_FIELDS_ = [
  'constructor',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toLocaleString',
  'toString',
  'valueOf'
];


/**
 * Extends an object with another object.
 * This operates 'in-place'; it does not create a new Object.
 *
 * Example:
 * var o = {};
 * goog.object.extend(o, {a: 0, b: 1});
 * o; // {a: 0, b: 1}
 * goog.object.extend(o, {b: 2, c: 3});
 * o; // {a: 0, b: 2, c: 3}
 *
 * @param {Object} target The object to modify. Existing properties will be
 *     overwritten if they are also present in one of the objects in
 *     {@code var_args}.
 * @param {...Object} var_args The objects from which values will be copied.
 */
goog.object.extend = function(target, var_args) {
  var key, source;
  for (var i = 1; i < arguments.length; i++) {
    source = arguments[i];
    for (key in source) {
      target[key] = source[key];
    }

    // For IE the for-in-loop does not contain any properties that are not
    // enumerable on the prototype object (for example isPrototypeOf from
    // Object.prototype) and it will also not include 'replace' on objects that
    // extend String and change 'replace' (not that it is common for anyone to
    // extend anything except Object).

    for (var j = 0; j < goog.object.PROTOTYPE_FIELDS_.length; j++) {
      key = goog.object.PROTOTYPE_FIELDS_[j];
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }
};


/**
 * Creates a new object built from the key-value pairs provided as arguments.
 * @param {...*} var_args If only one argument is provided and it is an array
 *     then this is used as the arguments,  otherwise even arguments are used as
 *     the property names and odd arguments are used as the property values.
 * @return {!Object} The new object.
 * @throws {Error} If there are uneven number of arguments or there is only one
 *     non array argument.
 */
goog.object.create = function(var_args) {
  var argLength = arguments.length;
  if (argLength == 1 && goog.isArray(arguments[0])) {
    return goog.object.create.apply(null, arguments[0]);
  }

  if (argLength % 2) {
    throw Error('Uneven number of arguments');
  }

  var rv = {};
  for (var i = 0; i < argLength; i += 2) {
    rv[arguments[i]] = arguments[i + 1];
  }
  return rv;
};


/**
 * Creates a new object where the property names come from the arguments but
 * the value is always set to true
 * @param {...*} var_args If only one argument is provided and it is an array
 *     then this is used as the arguments,  otherwise the arguments are used
 *     as the property names.
 * @return {!Object} The new object.
 */
goog.object.createSet = function(var_args) {
  var argLength = arguments.length;
  if (argLength == 1 && goog.isArray(arguments[0])) {
    return goog.object.createSet.apply(null, arguments[0]);
  }

  var rv = {};
  for (var i = 0; i < argLength; i++) {
    rv[arguments[i]] = true;
  }
  return rv;
};


/**
 * Creates an immutable view of the underlying object, if the browser
 * supports immutable objects.
 *
 * In default mode, writes to this view will fail silently. In strict mode,
 * they will throw an error.
 *
 * @param {!Object.<K,V>} obj An object.
 * @return {!Object.<K,V>} An immutable view of that object, or the
 *     original object if this browser does not support immutables.
 * @template K,V
 */
goog.object.createImmutableView = function(obj) {
  var result = obj;
  if (Object.isFrozen && !Object.isFrozen(obj)) {
    result = Object.create(obj);
    Object.freeze(result);
  }
  return result;
};


/**
 * @param {!Object} obj An object.
 * @return {boolean} Whether this is an immutable view of the object.
 */
goog.object.isImmutableView = function(obj) {
  return !!Object.isFrozen && Object.isFrozen(obj);
};

// Copyright 2013 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview A map of listeners that provides utility functions to
 * deal with listeners on an event target. Used by
 * {@code goog.events.EventTarget}.
 *
 * WARNING: Do not use this class from outside goog.events package.
 *
 * @visibility {//closure/goog/bin/sizetests:__pkg__}
 * @visibility {//closure/goog/events:__pkg__}
 * @visibility {//closure/goog/labs/events:__pkg__}
 */

goog.provide('goog.events.ListenerMap');

goog.require('goog.array');
goog.require('goog.events.Listener');
goog.require('goog.object');



/**
 * Creates a new listener map.
 * @param {EventTarget|goog.events.Listenable} src The src object.
 * @constructor
 * @final
 */
goog.events.ListenerMap = function(src) {
  /** @type {EventTarget|goog.events.Listenable} */
  this.src = src;

  /**
   * Maps of event type to an array of listeners.
   * @type {Object.<string, !Array.<!goog.events.Listener>>}
   */
  this.listeners = {};

  /**
   * The count of types in this map that have registered listeners.
   * @private {number}
   */
  this.typeCount_ = 0;
};


/**
 * @return {number} The count of event types in this map that actually
 *     have registered listeners.
 */
goog.events.ListenerMap.prototype.getTypeCount = function() {
  return this.typeCount_;
};


/**
 * @return {number} Total number of registered listeners.
 */
goog.events.ListenerMap.prototype.getListenerCount = function() {
  var count = 0;
  for (var type in this.listeners) {
    count += this.listeners[type].length;
  }
  return count;
};


/**
 * Adds an event listener. A listener can only be added once to an
 * object and if it is added again the key for the listener is
 * returned.
 *
 * Note that a one-off listener will not change an existing listener,
 * if any. On the other hand a normal listener will change existing
 * one-off listener to become a normal listener.
 *
 * @param {string|!goog.events.EventId} type The listener event type.
 * @param {!Function} listener This listener callback method.
 * @param {boolean} callOnce Whether the listener is a one-off
 *     listener.
 * @param {boolean=} opt_useCapture The capture mode of the listener.
 * @param {Object=} opt_listenerScope Object in whose scope to call the
 *     listener.
 * @return {goog.events.ListenableKey} Unique key for the listener.
 */
goog.events.ListenerMap.prototype.add = function(
    type, listener, callOnce, opt_useCapture, opt_listenerScope) {
  var typeStr = type.toString();
  var listenerArray = this.listeners[typeStr];
  if (!listenerArray) {
    listenerArray = this.listeners[typeStr] = [];
    this.typeCount_++;
  }

  var listenerObj;
  var index = goog.events.ListenerMap.findListenerIndex_(
      listenerArray, listener, opt_useCapture, opt_listenerScope);
  if (index > -1) {
    listenerObj = listenerArray[index];
    if (!callOnce) {
      // Ensure that, if there is an existing callOnce listener, it is no
      // longer a callOnce listener.
      listenerObj.callOnce = false;
    }
  } else {
    listenerObj = new goog.events.Listener(
        listener, null, this.src, typeStr, !!opt_useCapture, opt_listenerScope);
    listenerObj.callOnce = callOnce;
    listenerArray.push(listenerObj);
  }
  return listenerObj;
};


/**
 * Removes a matching listener.
 * @param {string|!goog.events.EventId} type The listener event type.
 * @param {!Function} listener This listener callback method.
 * @param {boolean=} opt_useCapture The capture mode of the listener.
 * @param {Object=} opt_listenerScope Object in whose scope to call the
 *     listener.
 * @return {boolean} Whether any listener was removed.
 */
goog.events.ListenerMap.prototype.remove = function(
    type, listener, opt_useCapture, opt_listenerScope) {
  var typeStr = type.toString();
  if (!(typeStr in this.listeners)) {
    return false;
  }

  var listenerArray = this.listeners[typeStr];
  var index = goog.events.ListenerMap.findListenerIndex_(
      listenerArray, listener, opt_useCapture, opt_listenerScope);
  if (index > -1) {
    var listenerObj = listenerArray[index];
    listenerObj.markAsRemoved();
    goog.array.removeAt(listenerArray, index);
    if (listenerArray.length == 0) {
      delete this.listeners[typeStr];
      this.typeCount_--;
    }
    return true;
  }
  return false;
};


/**
 * Removes the given listener object.
 * @param {goog.events.ListenableKey} listener The listener to remove.
 * @return {boolean} Whether the listener is removed.
 */
goog.events.ListenerMap.prototype.removeByKey = function(listener) {
  var type = listener.type;
  if (!(type in this.listeners)) {
    return false;
  }

  var removed = goog.array.remove(this.listeners[type], listener);
  if (removed) {
    listener.markAsRemoved();
    if (this.listeners[type].length == 0) {
      delete this.listeners[type];
      this.typeCount_--;
    }
  }
  return removed;
};


/**
 * Removes all listeners from this map. If opt_type is provided, only
 * listeners that match the given type are removed.
 * @param {string|!goog.events.EventId=} opt_type Type of event to remove.
 * @return {number} Number of listeners removed.
 */
goog.events.ListenerMap.prototype.removeAll = function(opt_type) {
  var typeStr = opt_type && opt_type.toString();
  var count = 0;
  for (var type in this.listeners) {
    if (!typeStr || type == typeStr) {
      var listenerArray = this.listeners[type];
      for (var i = 0; i < listenerArray.length; i++) {
        ++count;
        listenerArray[i].markAsRemoved();
      }
      delete this.listeners[type];
      this.typeCount_--;
    }
  }
  return count;
};


/**
 * Gets all listeners that match the given type and capture mode. The
 * returned array is a copy (but the listener objects are not).
 * @param {string|!goog.events.EventId} type The type of the listeners
 *     to retrieve.
 * @param {boolean} capture The capture mode of the listeners to retrieve.
 * @return {!Array.<goog.events.ListenableKey>} An array of matching
 *     listeners.
 */
goog.events.ListenerMap.prototype.getListeners = function(type, capture) {
  var listenerArray = this.listeners[type.toString()];
  var rv = [];
  if (listenerArray) {
    for (var i = 0; i < listenerArray.length; ++i) {
      var listenerObj = listenerArray[i];
      if (listenerObj.capture == capture) {
        rv.push(listenerObj);
      }
    }
  }
  return rv;
};


/**
 * Gets the goog.events.ListenableKey for the event or null if no such
 * listener is in use.
 *
 * @param {string|!goog.events.EventId} type The type of the listener
 *     to retrieve.
 * @param {!Function} listener The listener function to get.
 * @param {boolean} capture Whether the listener is a capturing listener.
 * @param {Object=} opt_listenerScope Object in whose scope to call the
 *     listener.
 * @return {goog.events.ListenableKey} the found listener or null if not found.
 */
goog.events.ListenerMap.prototype.getListener = function(
    type, listener, capture, opt_listenerScope) {
  var listenerArray = this.listeners[type.toString()];
  var i = -1;
  if (listenerArray) {
    i = goog.events.ListenerMap.findListenerIndex_(
        listenerArray, listener, capture, opt_listenerScope);
  }
  return i > -1 ? listenerArray[i] : null;
};


/**
 * Whether there is a matching listener. If either the type or capture
 * parameters are unspecified, the function will match on the
 * remaining criteria.
 *
 * @param {string|!goog.events.EventId=} opt_type The type of the listener.
 * @param {boolean=} opt_capture The capture mode of the listener.
 * @return {boolean} Whether there is an active listener matching
 *     the requested type and/or capture phase.
 */
goog.events.ListenerMap.prototype.hasListener = function(
    opt_type, opt_capture) {
  var hasType = goog.isDef(opt_type);
  var typeStr = hasType ? opt_type.toString() : '';
  var hasCapture = goog.isDef(opt_capture);

  return goog.object.some(
      this.listeners, function(listenerArray, type) {
        for (var i = 0; i < listenerArray.length; ++i) {
          if ((!hasType || listenerArray[i].type == typeStr) &&
              (!hasCapture || listenerArray[i].capture == opt_capture)) {
            return true;
          }
        }

        return false;
      });
};


/**
 * Finds the index of a matching goog.events.Listener in the given
 * listenerArray.
 * @param {!Array.<!goog.events.Listener>} listenerArray Array of listener.
 * @param {!Function} listener The listener function.
 * @param {boolean=} opt_useCapture The capture flag for the listener.
 * @param {Object=} opt_listenerScope The listener scope.
 * @return {number} The index of the matching listener within the
 *     listenerArray.
 * @private
 */
goog.events.ListenerMap.findListenerIndex_ = function(
    listenerArray, listener, opt_useCapture, opt_listenerScope) {
  for (var i = 0; i < listenerArray.length; ++i) {
    var listenerObj = listenerArray[i];
    if (!listenerObj.removed &&
        listenerObj.listener == listener &&
        listenerObj.capture == !!opt_useCapture &&
        listenerObj.handler == opt_listenerScope) {
      return i;
    }
  }
  return -1;
};

// Copyright 2005 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview An event manager for both native browser event
 * targets and custom JavaScript event targets
 * ({@code goog.events.Listenable}). This provides an abstraction
 * over browsers' event systems.
 *
 * It also provides a simulation of W3C event model's capture phase in
 * Internet Explorer (IE 8 and below). Caveat: the simulation does not
 * interact well with listeners registered directly on the elements
 * (bypassing goog.events) or even with listeners registered via
 * goog.events in a separate JS binary. In these cases, we provide
 * no ordering guarantees.
 *
 * The listeners will receive a "patched" event object. Such event object
 * contains normalized values for certain event properties that differs in
 * different browsers.
 *
 * Example usage:
 * <pre>
 * goog.events.listen(myNode, 'click', function(e) { alert('woo') });
 * goog.events.listen(myNode, 'mouseover', mouseHandler, true);
 * goog.events.unlisten(myNode, 'mouseover', mouseHandler, true);
 * goog.events.removeAll(myNode);
 * </pre>
 *
 *                                            in IE and event object patching]
 *
 * @see ../demos/events.html
 * @see ../demos/event-propagation.html
 * @see ../demos/stopevent.html
 */

// IMPLEMENTATION NOTES:
// goog.events stores an auxiliary data structure on each EventTarget
// source being listened on. This allows us to take advantage of GC,
// having the data structure GC'd when the EventTarget is GC'd. This
// GC behavior is equivalent to using W3C DOM Events directly.

goog.provide('goog.events');
goog.provide('goog.events.CaptureSimulationMode');
goog.provide('goog.events.Key');
goog.provide('goog.events.ListenableType');

goog.require('goog.asserts');
goog.require('goog.debug.entryPointRegistry');
goog.require('goog.events.BrowserEvent');
goog.require('goog.events.BrowserFeature');
goog.require('goog.events.Listenable');
goog.require('goog.events.ListenerMap');


/**
 * @typedef {number|goog.events.ListenableKey}
 */
goog.events.Key;


/**
 * @typedef {EventTarget|goog.events.Listenable}
 */
goog.events.ListenableType;


/**
 * Container for storing event listeners and their proxies
 *
 * TODO(user): Remove this when all external usage is
 * purged. goog.events no longer use goog.events.listeners_ for
 * anything meaningful.
 *
 * @private {!Object.<goog.events.ListenableKey>}
 */
goog.events.listeners_ = {};


/**
 * Property name on a native event target for the listener map
 * associated with the event target.
 * @const
 * @private
 */
goog.events.LISTENER_MAP_PROP_ = 'closure_lm_' + ((Math.random() * 1e6) | 0);


/**
 * String used to prepend to IE event types.
 * @const
 * @private
 */
goog.events.onString_ = 'on';


/**
 * Map of computed "on<eventname>" strings for IE event types. Caching
 * this removes an extra object allocation in goog.events.listen which
 * improves IE6 performance.
 * @const
 * @dict
 * @private
 */
goog.events.onStringMap_ = {};


/**
 * @enum {number} Different capture simulation mode for IE8-.
 */
goog.events.CaptureSimulationMode = {
  /**
   * Does not perform capture simulation. Will asserts in IE8- when you
   * add capture listeners.
   */
  OFF_AND_FAIL: 0,

  /**
   * Does not perform capture simulation, silently ignore capture
   * listeners.
   */
  OFF_AND_SILENT: 1,

  /**
   * Performs capture simulation.
   */
  ON: 2
};


/**
 * @define {number} The capture simulation mode for IE8-. By default,
 *     this is ON.
 */
goog.define('goog.events.CAPTURE_SIMULATION_MODE', 2);


/**
 * Estimated count of total native listeners.
 * @private {number}
 */
goog.events.listenerCountEstimate_ = 0;


/**
 * Adds an event listener for a specific event on a native event
 * target (such as a DOM element) or an object that has implemented
 * {@link goog.events.Listenable}. A listener can only be added once
 * to an object and if it is added again the key for the listener is
 * returned. Note that if the existing listener is a one-off listener
 * (registered via listenOnce), it will no longer be a one-off
 * listener after a call to listen().
 *
 * @param {EventTarget|goog.events.Listenable} src The node to listen
 *     to events on.
 * @param {string|Array.<string>|
 *     !goog.events.EventId.<EVENTOBJ>|!Array.<!goog.events.EventId.<EVENTOBJ>>}
 *     type Event type or array of event types.
 * @param {function(this:T, EVENTOBJ):?|{handleEvent:function(?):?}|null}
 *     listener Callback method, or an object with a handleEvent function.
 *     WARNING: passing an Object is now softly deprecated.
 * @param {boolean=} opt_capt Whether to fire in capture phase (defaults to
 *     false).
 * @param {T=} opt_handler Element in whose scope to call the listener.
 * @return {goog.events.Key} Unique key for the listener.
 * @template T,EVENTOBJ
 */
goog.events.listen = function(src, type, listener, opt_capt, opt_handler) {
  if (goog.isArray(type)) {
    for (var i = 0; i < type.length; i++) {
      goog.events.listen(src, type[i], listener, opt_capt, opt_handler);
    }
    return null;
  }

  listener = goog.events.wrapListener(listener);
  if (goog.events.Listenable.isImplementedBy(src)) {
    return src.listen(
        /** @type {string|!goog.events.EventId} */ (type),
        listener, opt_capt, opt_handler);
  } else {
    return goog.events.listen_(
        /** @type {EventTarget} */ (src),
        /** @type {string|!goog.events.EventId} */ (type),
        listener, /* callOnce */ false, opt_capt, opt_handler);
  }
};


/**
 * Adds an event listener for a specific event on a native event
 * target. A listener can only be added once to an object and if it
 * is added again the key for the listener is returned.
 *
 * Note that a one-off listener will not change an existing listener,
 * if any. On the other hand a normal listener will change existing
 * one-off listener to become a normal listener.
 *
 * @param {EventTarget} src The node to listen to events on.
 * @param {string|!goog.events.EventId} type Event type.
 * @param {!Function} listener Callback function.
 * @param {boolean} callOnce Whether the listener is a one-off
 *     listener or otherwise.
 * @param {boolean=} opt_capt Whether to fire in capture phase (defaults to
 *     false).
 * @param {Object=} opt_handler Element in whose scope to call the listener.
 * @return {goog.events.ListenableKey} Unique key for the listener.
 * @private
 */
goog.events.listen_ = function(
    src, type, listener, callOnce, opt_capt, opt_handler) {
  if (!type) {
    throw Error('Invalid event type');
  }

  var capture = !!opt_capt;
  if (capture && !goog.events.BrowserFeature.HAS_W3C_EVENT_SUPPORT) {
    if (goog.events.CAPTURE_SIMULATION_MODE ==
        goog.events.CaptureSimulationMode.OFF_AND_FAIL) {
      goog.asserts.fail('Can not register capture listener in IE8-.');
      return null;
    } else if (goog.events.CAPTURE_SIMULATION_MODE ==
        goog.events.CaptureSimulationMode.OFF_AND_SILENT) {
      return null;
    }
  }

  var listenerMap = goog.events.getListenerMap_(src);
  if (!listenerMap) {
    src[goog.events.LISTENER_MAP_PROP_] = listenerMap =
        new goog.events.ListenerMap(src);
  }

  var listenerObj = listenerMap.add(
      type, listener, callOnce, opt_capt, opt_handler);

  // If the listenerObj already has a proxy, it has been set up
  // previously. We simply return.
  if (listenerObj.proxy) {
    return listenerObj;
  }

  var proxy = goog.events.getProxy();
  listenerObj.proxy = proxy;

  proxy.src = src;
  proxy.listener = listenerObj;

  // Attach the proxy through the browser's API
  if (src.addEventListener) {
    src.addEventListener(type.toString(), proxy, capture);
  } else {
    // The else above used to be else if (src.attachEvent) and then there was
    // another else statement that threw an exception warning the developer
    // they made a mistake. This resulted in an extra object allocation in IE6
    // due to a wrapper object that had to be implemented around the element
    // and so was removed.
    src.attachEvent(goog.events.getOnString_(type.toString()), proxy);
  }

  goog.events.listenerCountEstimate_++;
  return listenerObj;
};


/**
 * Helper function for returning a proxy function.
 * @return {!Function} A new or reused function object.
 */
goog.events.getProxy = function() {
  var proxyCallbackFunction = goog.events.handleBrowserEvent_;
  // Use a local var f to prevent one allocation.
  var f = goog.events.BrowserFeature.HAS_W3C_EVENT_SUPPORT ?
      function(eventObject) {
        return proxyCallbackFunction.call(f.src, f.listener, eventObject);
      } :
      function(eventObject) {
        var v = proxyCallbackFunction.call(f.src, f.listener, eventObject);
        // NOTE(user): In IE, we hack in a capture phase. However, if
        // there is inline event handler which tries to prevent default (for
        // example <a href="..." onclick="return false">...</a>) in a
        // descendant element, the prevent default will be overridden
        // by this listener if this listener were to return true. Hence, we
        // return undefined.
        if (!v) return v;
      };
  return f;
};


/**
 * Adds an event listener for a specific event on a native event
 * target (such as a DOM element) or an object that has implemented
 * {@link goog.events.Listenable}. After the event has fired the event
 * listener is removed from the target.
 *
 * If an existing listener already exists, listenOnce will do
 * nothing. In particular, if the listener was previously registered
 * via listen(), listenOnce() will not turn the listener into a
 * one-off listener. Similarly, if there is already an existing
 * one-off listener, listenOnce does not modify the listeners (it is
 * still a once listener).
 *
 * @param {EventTarget|goog.events.Listenable} src The node to listen
 *     to events on.
 * @param {string|Array.<string>|
 *     !goog.events.EventId.<EVENTOBJ>|!Array.<!goog.events.EventId.<EVENTOBJ>>}
 *     type Event type or array of event types.
 * @param {function(this:T, EVENTOBJ):?|{handleEvent:function(?):?}|null}
 *     listener Callback method.
 * @param {boolean=} opt_capt Fire in capture phase?.
 * @param {T=} opt_handler Element in whose scope to call the listener.
 * @return {goog.events.Key} Unique key for the listener.
 * @template T,EVENTOBJ
 */
goog.events.listenOnce = function(src, type, listener, opt_capt, opt_handler) {
  if (goog.isArray(type)) {
    for (var i = 0; i < type.length; i++) {
      goog.events.listenOnce(src, type[i], listener, opt_capt, opt_handler);
    }
    return null;
  }

  listener = goog.events.wrapListener(listener);
  if (goog.events.Listenable.isImplementedBy(src)) {
    return src.listenOnce(
        /** @type {string|!goog.events.EventId} */ (type),
        listener, opt_capt, opt_handler);
  } else {
    return goog.events.listen_(
        /** @type {EventTarget} */ (src),
        /** @type {string|!goog.events.EventId} */ (type),
        listener, /* callOnce */ true, opt_capt, opt_handler);
  }
};


/**
 * Adds an event listener with a specific event wrapper on a DOM Node or an
 * object that has implemented {@link goog.events.Listenable}. A listener can
 * only be added once to an object.
 *
 * @param {EventTarget|goog.events.Listenable} src The target to
 *     listen to events on.
 * @param {goog.events.EventWrapper} wrapper Event wrapper to use.
 * @param {function(this:T, ?):?|{handleEvent:function(?):?}|null} listener
 *     Callback method, or an object with a handleEvent function.
 * @param {boolean=} opt_capt Whether to fire in capture phase (defaults to
 *     false).
 * @param {T=} opt_handler Element in whose scope to call the listener.
 * @template T
 */
goog.events.listenWithWrapper = function(src, wrapper, listener, opt_capt,
    opt_handler) {
  wrapper.listen(src, listener, opt_capt, opt_handler);
};


/**
 * Removes an event listener which was added with listen().
 *
 * @param {EventTarget|goog.events.Listenable} src The target to stop
 *     listening to events on.
 * @param {string|Array.<string>|
 *     !goog.events.EventId.<EVENTOBJ>|!Array.<!goog.events.EventId.<EVENTOBJ>>}
 *     type Event type or array of event types to unlisten to.
 * @param {function(?):?|{handleEvent:function(?):?}|null} listener The
 *     listener function to remove.
 * @param {boolean=} opt_capt In DOM-compliant browsers, this determines
 *     whether the listener is fired during the capture or bubble phase of the
 *     event.
 * @param {Object=} opt_handler Element in whose scope to call the listener.
 * @return {?boolean} indicating whether the listener was there to remove.
 * @template EVENTOBJ
 */
goog.events.unlisten = function(src, type, listener, opt_capt, opt_handler) {
  if (goog.isArray(type)) {
    for (var i = 0; i < type.length; i++) {
      goog.events.unlisten(src, type[i], listener, opt_capt, opt_handler);
    }
    return null;
  }

  listener = goog.events.wrapListener(listener);
  if (goog.events.Listenable.isImplementedBy(src)) {
    return src.unlisten(
        /** @type {string|!goog.events.EventId} */ (type),
        listener, opt_capt, opt_handler);
  }

  if (!src) {
    // TODO(user): We should tighten the API to only accept
    // non-null objects, or add an assertion here.
    return false;
  }

  var capture = !!opt_capt;
  var listenerMap = goog.events.getListenerMap_(
      /** @type {EventTarget} */ (src));
  if (listenerMap) {
    var listenerObj = listenerMap.getListener(
        /** @type {string|!goog.events.EventId} */ (type),
        listener, capture, opt_handler);
    if (listenerObj) {
      return goog.events.unlistenByKey(listenerObj);
    }
  }

  return false;
};


/**
 * Removes an event listener which was added with listen() by the key
 * returned by listen().
 *
 * @param {goog.events.Key} key The key returned by listen() for this
 *     event listener.
 * @return {boolean} indicating whether the listener was there to remove.
 */
goog.events.unlistenByKey = function(key) {
  // TODO(user): Remove this check when tests that rely on this
  // are fixed.
  if (goog.isNumber(key)) {
    return false;
  }

  var listener = /** @type {goog.events.ListenableKey} */ (key);
  if (!listener || listener.removed) {
    return false;
  }

  var src = listener.src;
  if (goog.events.Listenable.isImplementedBy(src)) {
    return src.unlistenByKey(listener);
  }

  var type = listener.type;
  var proxy = listener.proxy;
  if (src.removeEventListener) {
    src.removeEventListener(type, proxy, listener.capture);
  } else if (src.detachEvent) {
    src.detachEvent(goog.events.getOnString_(type), proxy);
  }
  goog.events.listenerCountEstimate_--;

  var listenerMap = goog.events.getListenerMap_(
      /** @type {EventTarget} */ (src));
  // TODO(user): Try to remove this conditional and execute the
  // first branch always. This should be safe.
  if (listenerMap) {
    listenerMap.removeByKey(listener);
    if (listenerMap.getTypeCount() == 0) {
      // Null the src, just because this is simple to do (and useful
      // for IE <= 7).
      listenerMap.src = null;
      // We don't use delete here because IE does not allow delete
      // on a window object.
      src[goog.events.LISTENER_MAP_PROP_] = null;
    }
  } else {
    listener.markAsRemoved();
  }

  return true;
};


/**
 * Removes an event listener which was added with listenWithWrapper().
 *
 * @param {EventTarget|goog.events.Listenable} src The target to stop
 *     listening to events on.
 * @param {goog.events.EventWrapper} wrapper Event wrapper to use.
 * @param {function(?):?|{handleEvent:function(?):?}|null} listener The
 *     listener function to remove.
 * @param {boolean=} opt_capt In DOM-compliant browsers, this determines
 *     whether the listener is fired during the capture or bubble phase of the
 *     event.
 * @param {Object=} opt_handler Element in whose scope to call the listener.
 */
goog.events.unlistenWithWrapper = function(src, wrapper, listener, opt_capt,
    opt_handler) {
  wrapper.unlisten(src, listener, opt_capt, opt_handler);
};


/**
 * Removes all listeners from an object. You can also optionally
 * remove listeners of a particular type.
 *
 * @param {Object|undefined} obj Object to remove listeners from. Must be an
 *     EventTarget or a goog.events.Listenable.
 * @param {string|!goog.events.EventId=} opt_type Type of event to remove.
 *     Default is all types.
 * @return {number} Number of listeners removed.
 */
goog.events.removeAll = function(obj, opt_type) {
  // TODO(user): Change the type of obj to
  // (!EventTarget|!goog.events.Listenable).

  if (!obj) {
    return 0;
  }

  if (goog.events.Listenable.isImplementedBy(obj)) {
    return obj.removeAllListeners(opt_type);
  }

  var listenerMap = goog.events.getListenerMap_(
      /** @type {EventTarget} */ (obj));
  if (!listenerMap) {
    return 0;
  }

  var count = 0;
  var typeStr = opt_type && opt_type.toString();
  for (var type in listenerMap.listeners) {
    if (!typeStr || type == typeStr) {
      // Clone so that we don't need to worry about unlistenByKey
      // changing the content of the ListenerMap.
      var listeners = listenerMap.listeners[type].concat();
      for (var i = 0; i < listeners.length; ++i) {
        if (goog.events.unlistenByKey(listeners[i])) {
          ++count;
        }
      }
    }
  }
  return count;
};


/**
 * Removes all native listeners registered via goog.events. Native
 * listeners are listeners on native browser objects (such as DOM
 * elements). In particular, goog.events.Listenable and
 * goog.events.EventTarget listeners will NOT be removed.
 * @return {number} Number of listeners removed.
 * @deprecated This doesn't do anything, now that Closure no longer
 * stores a central listener registry.
 */
goog.events.removeAllNativeListeners = function() {
  goog.events.listenerCountEstimate_ = 0;
  return 0;
};


/**
 * Gets the listeners for a given object, type and capture phase.
 *
 * @param {Object} obj Object to get listeners for.
 * @param {string|!goog.events.EventId} type Event type.
 * @param {boolean} capture Capture phase?.
 * @return {Array.<goog.events.Listener>} Array of listener objects.
 */
goog.events.getListeners = function(obj, type, capture) {
  if (goog.events.Listenable.isImplementedBy(obj)) {
    return obj.getListeners(type, capture);
  } else {
    if (!obj) {
      // TODO(user): We should tighten the API to accept
      // !EventTarget|goog.events.Listenable, and add an assertion here.
      return [];
    }

    var listenerMap = goog.events.getListenerMap_(
        /** @type {EventTarget} */ (obj));
    return listenerMap ? listenerMap.getListeners(type, capture) : [];
  }
};


/**
 * Gets the goog.events.Listener for the event or null if no such listener is
 * in use.
 *
 * @param {EventTarget|goog.events.Listenable} src The target from
 *     which to get listeners.
 * @param {?string|!goog.events.EventId.<EVENTOBJ>} type The type of the event.
 * @param {function(EVENTOBJ):?|{handleEvent:function(?):?}|null} listener The
 *     listener function to get.
 * @param {boolean=} opt_capt In DOM-compliant browsers, this determines
 *                            whether the listener is fired during the
 *                            capture or bubble phase of the event.
 * @param {Object=} opt_handler Element in whose scope to call the listener.
 * @return {goog.events.ListenableKey} the found listener or null if not found.
 * @template EVENTOBJ
 */
goog.events.getListener = function(src, type, listener, opt_capt, opt_handler) {
  // TODO(user): Change type from ?string to string, or add assertion.
  type = /** @type {string} */ (type);
  listener = goog.events.wrapListener(listener);
  var capture = !!opt_capt;
  if (goog.events.Listenable.isImplementedBy(src)) {
    return src.getListener(type, listener, capture, opt_handler);
  }

  if (!src) {
    // TODO(user): We should tighten the API to only accept
    // non-null objects, or add an assertion here.
    return null;
  }

  var listenerMap = goog.events.getListenerMap_(
      /** @type {EventTarget} */ (src));
  if (listenerMap) {
    return listenerMap.getListener(type, listener, capture, opt_handler);
  }
  return null;
};


/**
 * Returns whether an event target has any active listeners matching the
 * specified signature. If either the type or capture parameters are
 * unspecified, the function will match on the remaining criteria.
 *
 * @param {EventTarget|goog.events.Listenable} obj Target to get
 *     listeners for.
 * @param {string|!goog.events.EventId=} opt_type Event type.
 * @param {boolean=} opt_capture Whether to check for capture or bubble-phase
 *     listeners.
 * @return {boolean} Whether an event target has one or more listeners matching
 *     the requested type and/or capture phase.
 */
goog.events.hasListener = function(obj, opt_type, opt_capture) {
  if (goog.events.Listenable.isImplementedBy(obj)) {
    return obj.hasListener(opt_type, opt_capture);
  }

  var listenerMap = goog.events.getListenerMap_(
      /** @type {EventTarget} */ (obj));
  return !!listenerMap && listenerMap.hasListener(opt_type, opt_capture);
};


/**
 * Provides a nice string showing the normalized event objects public members
 * @param {Object} e Event Object.
 * @return {string} String of the public members of the normalized event object.
 */
goog.events.expose = function(e) {
  var str = [];
  for (var key in e) {
    if (e[key] && e[key].id) {
      str.push(key + ' = ' + e[key] + ' (' + e[key].id + ')');
    } else {
      str.push(key + ' = ' + e[key]);
    }
  }
  return str.join('\n');
};


/**
 * Returns a string with on prepended to the specified type. This is used for IE
 * which expects "on" to be prepended. This function caches the string in order
 * to avoid extra allocations in steady state.
 * @param {string} type Event type.
 * @return {string} The type string with 'on' prepended.
 * @private
 */
goog.events.getOnString_ = function(type) {
  if (type in goog.events.onStringMap_) {
    return goog.events.onStringMap_[type];
  }
  return goog.events.onStringMap_[type] = goog.events.onString_ + type;
};


/**
 * Fires an object's listeners of a particular type and phase
 *
 * @param {Object} obj Object whose listeners to call.
 * @param {string|!goog.events.EventId} type Event type.
 * @param {boolean} capture Which event phase.
 * @param {Object} eventObject Event object to be passed to listener.
 * @return {boolean} True if all listeners returned true else false.
 */
goog.events.fireListeners = function(obj, type, capture, eventObject) {
  if (goog.events.Listenable.isImplementedBy(obj)) {
    return obj.fireListeners(type, capture, eventObject);
  }

  return goog.events.fireListeners_(obj, type, capture, eventObject);
};


/**
 * Fires an object's listeners of a particular type and phase.
 * @param {Object} obj Object whose listeners to call.
 * @param {string|!goog.events.EventId} type Event type.
 * @param {boolean} capture Which event phase.
 * @param {Object} eventObject Event object to be passed to listener.
 * @return {boolean} True if all listeners returned true else false.
 * @private
 */
goog.events.fireListeners_ = function(obj, type, capture, eventObject) {
  var retval = 1;

  var listenerMap = goog.events.getListenerMap_(
      /** @type {EventTarget} */ (obj));
  if (listenerMap) {
    // TODO(user): Original code avoids array creation when there
    // is no listener, so we do the same. If this optimization turns
    // out to be not required, we can replace this with
    // listenerMap.getListeners(type, capture) instead, which is simpler.
    var listenerArray = listenerMap.listeners[type.toString()];
    if (listenerArray) {
      listenerArray = listenerArray.concat();
      for (var i = 0; i < listenerArray.length; i++) {
        var listener = listenerArray[i];
        // We might not have a listener if the listener was removed.
        if (listener && listener.capture == capture && !listener.removed) {
          retval &=
              goog.events.fireListener(listener, eventObject) !== false;
        }
      }
    }
  }
  return Boolean(retval);
};


/**
 * Fires a listener with a set of arguments
 *
 * @param {goog.events.Listener} listener The listener object to call.
 * @param {Object} eventObject The event object to pass to the listener.
 * @return {boolean} Result of listener.
 */
goog.events.fireListener = function(listener, eventObject) {
  var listenerFn = listener.listener;
  var listenerHandler = listener.handler || listener.src;

  if (listener.callOnce) {
    goog.events.unlistenByKey(listener);
  }
  return listenerFn.call(listenerHandler, eventObject);
};


/**
 * Gets the total number of listeners currently in the system.
 * @return {number} Number of listeners.
 * @deprecated This returns estimated count, now that Closure no longer
 * stores a central listener registry. We still return an estimation
 * to keep existing listener-related tests passing. In the near future,
 * this function will be removed.
 */
goog.events.getTotalListenerCount = function() {
  return goog.events.listenerCountEstimate_;
};


/**
 * Dispatches an event (or event like object) and calls all listeners
 * listening for events of this type. The type of the event is decided by the
 * type property on the event object.
 *
 * If any of the listeners returns false OR calls preventDefault then this
 * function will return false.  If one of the capture listeners calls
 * stopPropagation, then the bubble listeners won't fire.
 *
 * @param {goog.events.Listenable} src The event target.
 * @param {goog.events.EventLike} e Event object.
 * @return {boolean} If anyone called preventDefault on the event object (or
 *     if any of the handlers returns false) this will also return false.
 *     If there are no handlers, or if all handlers return true, this returns
 *     true.
 */
goog.events.dispatchEvent = function(src, e) {
  goog.asserts.assert(
      goog.events.Listenable.isImplementedBy(src),
      'Can not use goog.events.dispatchEvent with ' +
      'non-goog.events.Listenable instance.');
  return src.dispatchEvent(e);
};


/**
 * Installs exception protection for the browser event entry point using the
 * given error handler.
 *
 * @param {goog.debug.ErrorHandler} errorHandler Error handler with which to
 *     protect the entry point.
 */
goog.events.protectBrowserEventEntryPoint = function(errorHandler) {
  goog.events.handleBrowserEvent_ = errorHandler.protectEntryPoint(
      goog.events.handleBrowserEvent_);
};


/**
 * Handles an event and dispatches it to the correct listeners. This
 * function is a proxy for the real listener the user specified.
 *
 * @param {goog.events.Listener} listener The listener object.
 * @param {Event=} opt_evt Optional event object that gets passed in via the
 *     native event handlers.
 * @return {boolean} Result of the event handler.
 * @this {EventTarget} The object or Element that fired the event.
 * @private
 */
goog.events.handleBrowserEvent_ = function(listener, opt_evt) {
  if (listener.removed) {
    return true;
  }

  // Synthesize event propagation if the browser does not support W3C
  // event model.
  if (!goog.events.BrowserFeature.HAS_W3C_EVENT_SUPPORT) {
    var ieEvent = opt_evt ||
        /** @type {Event} */ (goog.getObjectByName('window.event'));
    var evt = new goog.events.BrowserEvent(ieEvent, this);
    var retval = true;

    if (goog.events.CAPTURE_SIMULATION_MODE ==
            goog.events.CaptureSimulationMode.ON) {
      // If we have not marked this event yet, we should perform capture
      // simulation.
      if (!goog.events.isMarkedIeEvent_(ieEvent)) {
        goog.events.markIeEvent_(ieEvent);

        var ancestors = [];
        for (var parent = evt.currentTarget; parent;
             parent = parent.parentNode) {
          ancestors.push(parent);
        }

        // Fire capture listeners.
        var type = listener.type;
        for (var i = ancestors.length - 1; !evt.propagationStopped_ && i >= 0;
             i--) {
          evt.currentTarget = ancestors[i];
          retval &= goog.events.fireListeners_(ancestors[i], type, true, evt);
        }

        // Fire bubble listeners.
        //
        // We can technically rely on IE to perform bubble event
        // propagation. However, it turns out that IE fires events in
        // opposite order of attachEvent registration, which broke
        // some code and tests that rely on the order. (While W3C DOM
        // Level 2 Events TR leaves the event ordering unspecified,
        // modern browsers and W3C DOM Level 3 Events Working Draft
        // actually specify the order as the registration order.)
        for (var i = 0; !evt.propagationStopped_ && i < ancestors.length; i++) {
          evt.currentTarget = ancestors[i];
          retval &= goog.events.fireListeners_(ancestors[i], type, false, evt);
        }
      }
    } else {
      retval = goog.events.fireListener(listener, evt);
    }
    return retval;
  }

  // Otherwise, simply fire the listener.
  return goog.events.fireListener(
      listener, new goog.events.BrowserEvent(opt_evt, this));
};


/**
 * This is used to mark the IE event object so we do not do the Closure pass
 * twice for a bubbling event.
 * @param {Event} e The IE browser event.
 * @private
 */
goog.events.markIeEvent_ = function(e) {
  // Only the keyCode and the returnValue can be changed. We use keyCode for
  // non keyboard events.
  // event.returnValue is a bit more tricky. It is undefined by default. A
  // boolean false prevents the default action. In a window.onbeforeunload and
  // the returnValue is non undefined it will be alerted. However, we will only
  // modify the returnValue for keyboard events. We can get a problem if non
  // closure events sets the keyCode or the returnValue

  var useReturnValue = false;

  if (e.keyCode == 0) {
    // We cannot change the keyCode in case that srcElement is input[type=file].
    // We could test that that is the case but that would allocate 3 objects.
    // If we use try/catch we will only allocate extra objects in the case of a
    // failure.
    /** @preserveTry */
    try {
      e.keyCode = -1;
      return;
    } catch (ex) {
      useReturnValue = true;
    }
  }

  if (useReturnValue ||
      /** @type {boolean|undefined} */ (e.returnValue) == undefined) {
    e.returnValue = true;
  }
};


/**
 * This is used to check if an IE event has already been handled by the Closure
 * system so we do not do the Closure pass twice for a bubbling event.
 * @param {Event} e  The IE browser event.
 * @return {boolean} True if the event object has been marked.
 * @private
 */
goog.events.isMarkedIeEvent_ = function(e) {
  return e.keyCode < 0 || e.returnValue != undefined;
};


/**
 * Counter to create unique event ids.
 * @private {number}
 */
goog.events.uniqueIdCounter_ = 0;


/**
 * Creates a unique event id.
 *
 * @param {string} identifier The identifier.
 * @return {string} A unique identifier.
 * @idGenerator
 */
goog.events.getUniqueId = function(identifier) {
  return identifier + '_' + goog.events.uniqueIdCounter_++;
};


/**
 * @param {EventTarget} src The source object.
 * @return {goog.events.ListenerMap} A listener map for the given
 *     source object, or null if none exists.
 * @private
 */
goog.events.getListenerMap_ = function(src) {
  var listenerMap = src[goog.events.LISTENER_MAP_PROP_];
  // IE serializes the property as well (e.g. when serializing outer
  // HTML). So we must check that the value is of the correct type.
  return listenerMap instanceof goog.events.ListenerMap ? listenerMap : null;
};


/**
 * Expando property for listener function wrapper for Object with
 * handleEvent.
 * @const
 * @private
 */
goog.events.LISTENER_WRAPPER_PROP_ = '__closure_events_fn_' +
    ((Math.random() * 1e9) >>> 0);


/**
 * @param {Object|Function} listener The listener function or an
 *     object that contains handleEvent method.
 * @return {!Function} Either the original function or a function that
 *     calls obj.handleEvent. If the same listener is passed to this
 *     function more than once, the same function is guaranteed to be
 *     returned.
 */
goog.events.wrapListener = function(listener) {
  goog.asserts.assert(listener, 'Listener can not be null.');

  if (goog.isFunction(listener)) {
    return listener;
  }

  goog.asserts.assert(
      listener.handleEvent, 'An object listener must have handleEvent method.');
  return listener[goog.events.LISTENER_WRAPPER_PROP_] ||
      (listener[goog.events.LISTENER_WRAPPER_PROP_] = function(e) {
        return listener.handleEvent(e);
      });
};


// Register the browser event handler as an entry point, so that
// it can be monitored for exception handling, etc.
goog.debug.entryPointRegistry.register(
    /**
     * @param {function(!Function): !Function} transformer The transforming
     *     function.
     */
    function(transformer) {
      goog.events.handleBrowserEvent_ = transformer(
          goog.events.handleBrowserEvent_);
    });

goog.provide('olcs.AbstractSynchronizer');

goog.require('goog.events');
goog.require('ol.layer.Group');
goog.require('ol.layer.Layer');



/**
 * @param {!ol.Map} map
 * @param {!Cesium.Scene} scene
 * @constructor
 * @template T
 * @api
 */
olcs.AbstractSynchronizer = function(map, scene) {
  /**
   * @type {!ol.Map}
   * @protected
   */
  this.map = map;

  /**
   * @type {ol.View}
   * @protected
   */
  this.view = null;

  /**
   * @type {!Cesium.Scene}
   * @protected
   */
  this.scene = scene;

  /**
   * @type {ol.Collection.<ol.layer.Base>}
   * @protected
   */
  this.olLayers = null;

  /**
   * @type {!Array}
   * @private
   */
  this.olLayersListenKeys_ = [];

  /**
   * Map of ol3 layer ids (from goog.getUid) to the Cesium ImageryLayers.
   * null value means, that we are unable to create equivalent layer.
   * @type {Object.<number, ?T>}
   * @protected
   */
  this.layerMap = {};

  /**
   * Map of listen keys for ol3 layer groups ids (from goog.getUid).
   * @type {!Object.<number, !Array>}
   * @private
   */
  this.olGroupListenKeys_ = {};

  /**
   * @type {Object.<number, !Array>}
   * @private
   */
  this.unusedGroups_ = null;

  /**
   * @type {Object.<?T, number>}
   * @private
   */
  this.unusedCesiumObjects_ = null;

  this.map.on('change:view', function(e) {
    this.setView_(this.map.getView());
  }, this);
  this.setView_(this.map.getView());

  this.map.on('change:layergroup', function(e) {
    this.setLayers_(this.map.getLayers());
  }, this);
  this.setLayers_(this.map.getLayers());
};


/**
 * @param {ol.View} view New view to use.
 * @private
 */
olcs.AbstractSynchronizer.prototype.setView_ = function(view) {
  this.view = view;

  // destroy all, the change of view can affect which layers are synced
  this.destroyAll();
  this.synchronize();
};


/**
 * @param {ol.Collection.<ol.layer.Base>} layers New layers to use.
 * @private
 */
olcs.AbstractSynchronizer.prototype.setLayers_ = function(layers) {
  if (!goog.isNull(this.olLayers)) {
    goog.array.forEach(this.olLayersListenKeys_, this.olLayers.unByKey);
  }

  this.olLayers = layers;
  if (!goog.isNull(layers)) {
    var handleCollectionEvent_ = goog.bind(function(e) {
      this.synchronize();
    }, this);

    this.olLayersListenKeys_ = [
      layers.on('add', handleCollectionEvent_),
      layers.on('remove', handleCollectionEvent_)
    ];
  } else {
    this.olLayersListenKeys_ = [];
  }

  this.destroyAll();
  this.synchronize();
};


/**
 * Performs complete synchronization of the layers.
 * @api
 */
olcs.AbstractSynchronizer.prototype.synchronize = function() {
  if (goog.isNull(this.view) || goog.isNull(this.olLayers)) {
    return;
  }
  this.unusedGroups_ = goog.object.clone(this.olGroupListenKeys_);
  this.unusedCesiumObjects_ = goog.object.transpose(this.layerMap);
  this.removeAllCesiumObjects(false); // only remove, don't destroy

  this.olLayers.forEach(function(el, i, arr) {
    this.synchronizeSingle(el);
  }, this);

  // destroy unused Cesium Objects
  goog.array.forEach(goog.object.getValues(this.unusedCesiumObjects_),
      function(el, i, arr) {
        var layerId = el;
        var object = this.layerMap[layerId];
        if (goog.isDef(object)) {
          delete this.layerMap[layerId];
          if (!goog.isNull(object)) {
            this.destroyCesiumObject(object);
          }
        }
      }, this);
  this.unusedCesiumObjects_ = null;

  // unlisten unused ol layer groups
  goog.object.forEach(this.unusedGroups_, function(keys, groupId, obj) {
    goog.array.forEach(keys, this.map.unByKey);
    delete this.olGroupListenKeys_[groupId];
  }, this);
  this.unusedGroups_ = null;
};


/**
 * Synchronizes single layer.
 * @param {ol.layer.Base} olLayer
 * @protected
 */
olcs.AbstractSynchronizer.prototype.synchronizeSingle = function(olLayer) {
  if (goog.isNull(olLayer)) {
    return;
  }
  var olLayerId = goog.getUid(olLayer);

  // handle layer groups
  if (olLayer instanceof ol.layer.Group) {
    var sublayers = olLayer.getLayers();
    if (goog.isDef(sublayers)) {
      sublayers.forEach(function(el, i, arr) {
        this.synchronizeSingle(el);
      }, this);
    }

    if (!goog.isDef(this.olGroupListenKeys_[olLayerId])) {
      var listenKeyArray = [];
      this.olGroupListenKeys_[olLayerId] = listenKeyArray;

      // only the keys that need to be relistened when collection changes
      var collection, contentKeys = [];
      var listenAddRemove = goog.bind(function() {
        collection = /** @type {ol.layer.Group} */ (olLayer).getLayers();
        if (goog.isDef(collection)) {
          var handleContentChange_ = goog.bind(function(e) {
            this.synchronize();
          }, this);
          contentKeys = [
            collection.on('add', handleContentChange_),
            collection.on('remove', handleContentChange_)
          ];
          listenKeyArray.push.apply(listenKeyArray, contentKeys);
        }
      }, this);
      listenAddRemove();

      listenKeyArray.push(olLayer.on('change:layers', function(e) {
        goog.array.forEach(contentKeys, function(el, i, arr) {
          goog.array.remove(listenKeyArray, el);
          collection.unByKey(el);
        });
        listenAddRemove();
      }));
    }

    delete this.unusedGroups_[olLayerId];

    return;
  } else if (!(olLayer instanceof ol.layer.Layer)) {
    return;
  }

  var cesiumObject = this.layerMap[olLayerId];

  // no mapping -> create new layer and set up synchronization
  if (!goog.isDef(cesiumObject)) {
    cesiumObject = this.createSingleCounterpart(olLayer);
    this.layerMap[olLayerId] = cesiumObject;
  }

  // add Cesium layers
  if (goog.isDefAndNotNull(cesiumObject)) {
    this.addCesiumObject(cesiumObject);
    delete this.unusedCesiumObjects_[cesiumObject];
  }
};


/**
 * Destroys all the created Cesium objects.
 * @protected
 */
olcs.AbstractSynchronizer.prototype.destroyAll = function() {
  this.removeAllCesiumObjects(true); // destroy
  this.layerMap = {};
};


/**
 * Adds a single Cesium object to the collection.
 * @param {!T} object
 * @protected
 */
olcs.AbstractSynchronizer.prototype.addCesiumObject = goog.abstractMethod;


/**
 * @param {!T} object
 * @protected
 */
olcs.AbstractSynchronizer.prototype.destroyCesiumObject = goog.abstractMethod;


/**
 * Remove all Cesium objects from the collection.
 * @param {boolean} destroy
 * @protected
 */
olcs.AbstractSynchronizer.prototype.removeAllCesiumObjects =
    goog.abstractMethod;


/**
 * @param {!ol.layer.Layer} olLayer
 * @return {T}
 * @protected
 */
olcs.AbstractSynchronizer.prototype.createSingleCounterpart =
    goog.abstractMethod;

goog.provide('olcs.core.OLImageryProvider');

goog.require('goog.events');
goog.require('ol.proj');
goog.require('ol.tilegrid.XYZ');



/**
 * Special class derived from Cesium.ImageryProvider
 * that is connected to the given ol.source.TileImage.
 * @param {!ol.source.TileImage} source
 * @param {ol.proj.Projection=} opt_fallbackProj Projection to assume if the
 *                                               projection of the source
 *                                               is not defined.
 * @constructor
 * @extends {Cesium.ImageryProvider}
 */
olcs.core.OLImageryProvider = function(source, opt_fallbackProj) {
  /**
   * @type {!ol.source.TileImage}
   * @private
   */
  this.source_ = source;

  /**
   * @type {?ol.proj.Projection}
   * @private
   */
  this.projection_ = null;

  /**
   * @type {?ol.proj.Projection}
   * @private
   */
  this.fallbackProj_ = goog.isDef(opt_fallbackProj) ? opt_fallbackProj : null;

  this.ready_ = false;

  this.errorEvent_ = new Cesium.Event();

  this.emptyCanvas_ = goog.dom.createElement(goog.dom.TagName.CANVAS);
  this.emptyCanvas_.width = 1;
  this.emptyCanvas_.height = 1;

  this.source_.on(goog.events.EventType.CHANGE, function(e) {
    this.handleSourceChanged_();
  }, this);
  this.handleSourceChanged_();
};
goog.inherits(olcs.core.OLImageryProvider, Cesium.ImageryProvider);


// definitions of getters that are required to be present
// in the Cesium.ImageryProvider instance:
Object.defineProperties(olcs.core.OLImageryProvider.prototype, {
  ready: {
    get: /** @this {olcs.core.OLImageryProvider} */
        function() {return this.ready_;}
  },

  rectangle: {
    get: /** @this {olcs.core.OLImageryProvider} */
        function() {return this.rectangle_;}
  },

  tileWidth: {
    get: /** @this {olcs.core.OLImageryProvider} */
        function() {
          var tg = this.source_.getTileGrid();
          return !goog.isNull(tg) ? tg.getTileSize(0) : 256;
        }
  },

  tileHeight: {
    get: /** @this {olcs.core.OLImageryProvider} */
        function() {return this.tileWidth;}
  },

  maximumLevel: {
    get: /** @this {olcs.core.OLImageryProvider} */
        function() {
          var tg = this.source_.getTileGrid();
          return !goog.isNull(tg) ? tg.getMaxZoom() : 18;
        }
  },

  minimumLevel: {
    get: /** @this {olcs.core.OLImageryProvider} */
        function() {
          // WARNING: Do not use the minimum level (at least until the extent is
          // properly set). Cesium assumes the minimumLevel to contain only
          // a few tiles and tries to load them all at once -- this can
          // freeze and/or crash the browser !
          return 0;
          //var tg = this.source_.getTileGrid();
          //return !goog.isNull(tg) ? tg.getMinZoom() : 0;
        }
  },

  tilingScheme: {
    get: /** @this {olcs.core.OLImageryProvider} */
        function() {return this.tilingScheme_;}
  },

  tileDiscardPolicy: {
    get: function() {return undefined;}
  },

  errorEvent: {
    get: /** @this {olcs.core.OLImageryProvider} */
        function() {return this.errorEvent_;}
  },

  credit: {
    get: /** @this {olcs.core.OLImageryProvider} */
        function() {return this.credit_;}
  },

  proxy: {
    get: function() {return undefined;}
  },

  hasAlphaChannel: {
    get: function() {return true;}
  }
});


/**
 * Checks if the underlying source is ready and cached required data.
 * @private
 */
olcs.core.OLImageryProvider.prototype.handleSourceChanged_ = function() {
  if (!this.ready_ && this.source_.getState() == 'ready') {
    var proj = this.source_.getProjection();
    this.projection_ = goog.isDefAndNotNull(proj) ? proj : this.fallbackProj_;
    if (this.projection_ == ol.proj.get('EPSG:4326')) {
      this.tilingScheme_ = new Cesium.GeographicTilingScheme();
    } else if (this.projection_ == ol.proj.get('EPSG:3857')) {
      this.tilingScheme_ = new Cesium.WebMercatorTilingScheme();
    } else {
      return;
    }
    this.rectangle_ = this.tilingScheme_.rectangle;

    var credit =
        olcs.core.OLImageryProvider.createCreditForSource(this.source_);
    this.credit_ = !goog.isNull(credit) ? credit : undefined;

    this.ready_ = true;
  }
};


/**
 * Tries to create proper Cesium.Credit for
 * the given ol.source.Source as closely as possible.
 * @param {!ol.source.Source} source
 * @return {?Cesium.Credit}
 */
olcs.core.OLImageryProvider.createCreditForSource = function(source) {
  var text = '';
  var attributions = source.getAttributions();
  if (!goog.isNull(attributions)) {
    goog.array.forEach(attributions, function(el, i, arr) {
      // strip html tags (not supported in Cesium)
      text += el.getHTML().replace(/<\/?[^>]+(>|$)/g, '') + ' ';
    });
  }

  var imageUrl, link;
  if (text.length == 0) {
    // only use logo if no text is specified
    // otherwise the Cesium will automatically skip the text:
    // "The text to be displayed on the screen if no imageUrl is specified."
    var logo = source.getLogo();
    if (goog.isDef(logo)) {
      if (goog.isString(logo)) {
        imageUrl = logo;
      } else {
        imageUrl = logo.src;
        link = logo.href;
      }
    }
  }

  return (goog.isDef(imageUrl) || text.length > 0) ?
         new Cesium.Credit(text, imageUrl, link) : null;
};


/**
 * TODO: attributions for individual tile ranges
 * @override
 */
olcs.core.OLImageryProvider.prototype.getTileCredits = function(x, y, level) {
  return undefined;
};
goog.exportProperty(olcs.core.OLImageryProvider.prototype, 'getTileCredits',
                    olcs.core.OLImageryProvider.prototype.getTileCredits);


/**
 * @override
 */
olcs.core.OLImageryProvider.prototype.requestImage = function(x, y, level) {
  var tileUrlFunction = this.source_.getTileUrlFunction();
  if (!goog.isNull(tileUrlFunction) && !goog.isNull(this.projection_)) {
    // perform mapping of Cesium tile coordinates to ol3 tile coordinates
    var z_ = (this.tilingScheme_ instanceof Cesium.GeographicTilingScheme) ?
             (level + 1) : level;
    var y_ = (this.source_.getTileGrid() instanceof ol.tilegrid.XYZ) ?
             y : (y - (1 << level));
    y_ = -y_ - 1; // opposite indexing
    var url = tileUrlFunction([z_, x, y_], 1, this.projection_);
    return goog.isDef(url) ?
           Cesium.ImageryProvider.loadImage(this, url) : this.emptyCanvas_;
  } else {
    // return empty canvas to stop Cesium from retrying later
    return this.emptyCanvas_;
  }
};
goog.exportProperty(olcs.core.OLImageryProvider.prototype, 'requestImage',
                    olcs.core.OLImageryProvider.prototype.requestImage);

goog.provide('olcs.core.OlLayerPrimitive');



/**
 * Result of the conversion of an OpenLayers layer to Cesium.
 * @constructor
 * @param {!(ol.proj.Projection|string)} layerProjection
 * @extends {Cesium.PrimitiveCollection}
 */
olcs.core.OlLayerPrimitive = function(layerProjection) {
  goog.base(this);

  var billboards = new Cesium.BillboardCollection();
  var primitives = new Cesium.PrimitiveCollection();

  /**
   * @type {!olcsx.core.OlFeatureToCesiumContext}
   */
  this.context = {
    projection: layerProjection,
    billboards: billboards,
    featureToCesiumMap: {},
    primitives: primitives
  };

  this.add(billboards);
};
goog.inherits(olcs.core.OlLayerPrimitive, Cesium.PrimitiveCollection);


/**
 * Convert an OpenLayers feature to Cesium primitive collection.
 * @param {!ol.layer.Vector} layer
 * @param {!ol.View} view
 * @param {!ol.Feature} feature
 * @return {Cesium.Primitive}
 * @api
 */
olcs.core.OlLayerPrimitive.prototype.convert = function(layer, view, feature) {
  var proj = view.getProjection();
  var resolution = view.getResolution();

  if (!goog.isDef(resolution) || !proj) {
    return null;
  }

  var layerStyle = layer.getStyleFunction();
  var style = olcs.core.computePlainStyle(feature, layerStyle, resolution);

  if (!style) {
    // only 'render' features with a style
    return null;
  }

  this.context.projection = proj;
  return olcs.core.olFeatureToCesium(feature, style, this.context);
};



goog.provide('olcs.core');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('ol.extent');
goog.require('ol.geom.SimpleGeometry');
goog.require('ol.layer.Tile');
goog.require('ol.layer.Vector');
goog.require('ol.proj');
goog.require('ol.source.TileImage');
goog.require('ol.source.WMTS');
goog.require('ol.style.Style');
goog.require('olcs.core.OLImageryProvider');
goog.require('olcs.core.OlLayerPrimitive');



(function() {


  /**
   * -1 when not initialized.
   * @type {number}
   */
  olcs.core.glAliasedLineWidthRange = -1;


  /**
   * Compute the pixel width and height of a point in meters using the
   * camera frustum.
   * @param {!Cesium.Scene} scene
   * @param {!Cesium.Cartesian3} target
   * @return {!Cesium.Cartesian2} the pixel size
   * @api
   */
  olcs.core.computePixelSizeAtCoordinate = function(scene, target) {
    var camera = scene.camera;
    var canvas = scene.canvas;
    var frustum = camera.frustum;
    var canvasDimensions = new Cesium.Cartesian2(canvas.width, canvas.height);
    var distance = Cesium.Cartesian3.magnitude(Cesium.Cartesian3.subtract(
        camera.position, target, new Cesium.Cartesian3()));
    var pixelSize = frustum.getPixelSize(canvasDimensions, distance);
    return pixelSize;
  };


  /**
   * Compute bounding box around a target point.
   * @param {!Cesium.Scene} scene
   * @param {!Cesium.Cartesian3} target
   * @param {number} amount Half the side of the box, in pixels.
   * @return {Array<Cesium.Cartographic>} bottom left and top right
   * coordinates of the box
   */
  olcs.core.computeBoundingBoxAtTarget = function(scene, target, amount) {
    var pixelSize = olcs.core.computePixelSizeAtCoordinate(scene, target);
    var transform = Cesium.Transforms.eastNorthUpToFixedFrame(target);

    var bottomLeft = Cesium.Matrix4.multiplyByPoint(
        transform,
        new Cesium.Cartesian3(-pixelSize.x * amount, -pixelSize.y * amount, 0),
        new Cesium.Cartesian3());

    var topRight = Cesium.Matrix4.multiplyByPoint(
        transform,
        new Cesium.Cartesian3(pixelSize.x * amount, pixelSize.y * amount, 0),
        new Cesium.Cartesian3());

    return Cesium.Ellipsoid.WGS84.cartesianArrayToCartographicArray(
        [bottomLeft, topRight]);
  };


  /**
   *
   * @param {!ol.geom.Geometry} geometry
   * @param {number} height
   * @api
   */
  olcs.core.applyHeightOffsetToGeometry = function(geometry, height) {
    geometry.applyTransform(function(input, output, stride) {
      goog.asserts.assert(input === output);
      if (goog.isDef(stride) && stride >= 3) {
        for (var i = 0; i < output.length; i += stride) {
          output[i + 2] = output[i + 2] + height;
        }
      }
      return output;
    });
  };


  /**
   * @param {!Cesium.Camera} camera
   * @param {number} angle
   * @param {!Cesium.Cartesian3} axis
   * @param {!Cesium.Matrix4} transform
   * @param {olcsx.core.RotateAroundAxisOption=} opt_options
   * @api
   */
  olcs.core.rotateAroundAxis = function(camera, angle, axis, transform,
      opt_options) {
    var clamp = Cesium.Math.clamp;
    var defaultValue = Cesium.defaultValue;

    var options = opt_options || {};
    var duration = defaultValue(options.duration, 500); // ms
    var easing = defaultValue(options.easing, ol.easing.linear);
    var callback = options.callback;

    var start = goog.now();
    var lastProgress = 0;
    var oldTransform = new Cesium.Matrix4();

    var animation = new goog.async.AnimationDelay(function(millis) {
      var progress = easing(clamp((millis - start) / duration, 0, 1));
      goog.asserts.assert(progress > lastProgress);

      camera.transform.clone(oldTransform);
      var stepAngle = (progress - lastProgress) * angle;
      lastProgress = progress;
      camera.lookAtTransform(transform);
      camera.rotate(axis, stepAngle);
      camera.lookAtTransform(oldTransform);

      if (progress < 1) {
        animation.start();
      } else if (callback) {
        callback();
      }
    });
    animation.start();
  };


  /**
   * @param {!Cesium.Scene} scene
   * @param {number} heading
   * @param {!Cesium.Cartesian3} bottomCenter
   * @api
   */
  olcs.core.setHeadingUsingBottomCenter = function(scene, heading,
      bottomCenter) {
    var camera = scene.camera;
    // Compute the camera position to zenith quaternion
    var angleToZenith = olcs.core.computeAngleToZenith(scene, bottomCenter);
    var axis = camera.right;
    var quaternion = Cesium.Quaternion.fromAxisAngle(axis, angleToZenith);
    var rotation = Cesium.Matrix3.fromQuaternion(quaternion);

    // Get the zenith point from the rotation of the position vector
    var vector = new Cesium.Cartesian3();
    Cesium.Cartesian3.subtract(camera.position, bottomCenter, vector);
    var zenith = new Cesium.Cartesian3();
    Cesium.Matrix3.multiplyByVector(rotation, vector, zenith);
    Cesium.Cartesian3.add(zenith, bottomCenter, zenith);

    // Actually rotate around the zenith normal
    var transform = Cesium.Matrix4.fromTranslation(zenith);
    var rotateAroundAxis = olcs.core.rotateAroundAxis;
    rotateAroundAxis(camera, heading, zenith, transform);
  };


  /**
   * Get the 3D position of the given pixel of the canvas.
   * @param {!Cesium.Scene} scene
   * @param {!Cesium.Cartesian2} pixel
   * @return {!Cesium.Cartesian3|undefined}
   * @api
   */
  olcs.core.pickOnTerrainOrEllipsoid = function(scene, pixel) {
    var ray = scene.camera.getPickRay(pixel);
    var target = scene.globe.pick(ray, scene);
    return target || scene.camera.pickEllipsoid(pixel);
  };


  /**
   * Get the 3D position of the point at the bottom-center of the screen.
   * @param {!Cesium.Scene} scene
   * @return {!Cesium.Cartesian3|undefined}
   * @api
   */
  olcs.core.pickBottomPoint = function(scene) {
    var canvas = scene.canvas;
    var bottom = new Cesium.Cartesian2(canvas.width / 2, canvas.height);
    return olcs.core.pickOnTerrainOrEllipsoid(scene, bottom);
  };


  /**
   * Get the 3D position of the point at the center of the screen.
   * @param {!Cesium.Scene} scene
   * @return {!Cesium.Cartesian3|undefined}
   * @api
   */
  olcs.core.pickCenterPoint = function(scene) {
    var canvas = scene.canvas;
    var center = new Cesium.Cartesian2(canvas.width / 2, canvas.height / 2);
    return olcs.core.pickOnTerrainOrEllipsoid(scene, center);
  };


  /**
   * Compute the signed tilt angle on globe, between the opposite of the
   * camera direction and the target normal. Return undefined if there is no
   * intersection of the camera direction with the globe.
   * @param {!Cesium.Scene} scene
   * @return {number|undefined}
   * @api
   */
  olcs.core.computeSignedTiltAngleOnGlobe = function(scene) {
    var camera = scene.camera;
    var ray = new Cesium.Ray(camera.position, camera.direction);
    var target = scene.globe.pick(ray, scene);

    if (!target) {
      // no tiles in the area were loaded?
      var ellipsoid = Cesium.Ellipsoid.WGS84;
      var obj = Cesium.IntersectionTests.rayEllipsoid(ray, ellipsoid);
      if (obj) {
        target = Cesium.Ray.getPoint(ray, obj.start);
      }
    }

    if (!target) {
      return undefined;
    }

    var normal = new Cesium.Cartesian3();
    Cesium.Ellipsoid.WGS84.geocentricSurfaceNormal(target, normal);

    var angleBetween = olcs.core.signedAngleBetween;
    var angle = angleBetween(camera.direction, normal, camera.right) - Math.PI;
    return Cesium.Math.convertLongitudeRange(angle);
  };


  /**
   * Compute the ray from the camera to the bottom-center of the screen.
   * @param {!Cesium.Scene} scene
   * @return {!Cesium.Ray}
   */
  olcs.core.bottomFovRay = function(scene) {
    var camera = scene.camera;
    var fovy2 = camera.frustum.fovy / 2;
    var direction = camera.direction;
    var rotation = Cesium.Quaternion.fromAxisAngle(camera.right, fovy2);
    var matrix = Cesium.Matrix3.fromQuaternion(rotation);
    var vector = new Cesium.Cartesian3();
    Cesium.Matrix3.multiplyByVector(matrix, direction, vector);
    return new Cesium.Ray(camera.position, vector);
  };


  /**
   * Compute the angle between two Cartesian3.
   * @param {!Cesium.Cartesian3} first
   * @param {!Cesium.Cartesian3} second
   * @param {!Cesium.Cartesian3} normal Normal to test orientation against.
   * @return {number}
   */
  olcs.core.signedAngleBetween = function(first, second, normal) {
    // We are using the dot for the angle.
    // Then the cross and the dot for the sign.
    var a = new Cesium.Cartesian3();
    var b = new Cesium.Cartesian3();
    var c = new Cesium.Cartesian3();
    Cesium.Cartesian3.normalize(first, a);
    Cesium.Cartesian3.normalize(second, b);
    Cesium.Cartesian3.cross(a, b, c);

    var cosine = Cesium.Cartesian3.dot(a, b);
    var sine = Cesium.Cartesian3.magnitude(c);

    // Sign of the vector product and the orientation normal
    var sign = Cesium.Cartesian3.dot(normal, c);
    var angle = Math.atan2(sine, cosine);
    return sign >= 0 ? angle : -angle;
  };


  /**
   * Compute the rotation angle around a given point, needed to reach the
   * zenith position.
   * At a zenith position, the camera direction is going througth the earth
   * center and the frustrum bottom ray is going through the chosen pivot
   * point.
   * The bottom-center of the screen is a good candidate for the pivot point.
   * @param {!Cesium.Scene} scene
   * @param {!Cesium.Cartesian3} pivot Point around which the camera rotates.
   * @return {number}
   * @api
   */
  olcs.core.computeAngleToZenith = function(scene, pivot) {
    // This angle is the sum of the angles 'fy' and 'a', which are defined
    // using the pivot point and its surface normal.
    //        Zenith |    camera
    //           \   |   /
    //            \fy|  /
    //             \ |a/
    //              \|/pivot
    var camera = scene.camera;
    var fy = camera.frustum.fovy / 2;
    var ray = olcs.core.bottomFovRay(scene);
    var direction = Cesium.Cartesian3.clone(ray.direction);
    Cesium.Cartesian3.negate(direction, direction);

    var normal = new Cesium.Cartesian3();
    Cesium.Ellipsoid.WGS84.geocentricSurfaceNormal(pivot, normal);

    var left = new Cesium.Cartesian3();
    Cesium.Cartesian3.negate(camera.right, left);

    var a = olcs.core.signedAngleBetween(normal, direction, left);
    return a + fy;
  };



  /**
   * Rotate the camera so that its direction goes through the target point.
   * If a globe is given, the target height is first interpolated from terrain.
   * @param {!Cesium.Camera} camera
   * @param {!Cesium.Cartographic} target
   * @param {Cesium.Globe=} opt_globe
   * @api
   */
  olcs.core.lookAt = function(camera, target, opt_globe) {
    if (goog.isDef(opt_globe)) {
      var height = opt_globe.getHeight(target);
      target.height = goog.isDef(height) ? height : 0;
    }

    var ellipsoid = Cesium.Ellipsoid.WGS84;
    var targetb = ellipsoid.cartographicToCartesian(target);

    var position = camera.position;
    var up = new Cesium.Cartesian3();
    ellipsoid.geocentricSurfaceNormal(position, up);

    camera.lookAt(position, targetb, up);
  };


  /**
   * Convert an OpenLayers extent to a Cesium rectangle.
   * @param {ol.Extent} extent Extent.
   * @param {ol.proj.ProjectionLike} projection Extent projection.
   * @return {Cesium.Rectangle} The corresponding Cesium rectangle.
   * @api
   */
  olcs.core.extentToRectangle = function(extent, projection) {
    if (!goog.isNull(extent) && !goog.isNull(projection)) {
      var ext = ol.proj.transformExtent(extent, projection, 'EPSG:4326');
      return Cesium.Rectangle.fromDegrees(ext[0], ext[1], ext[2], ext[3]);
    } else {
      return null;
    }
  };


  /**
   * Creates Cesium.ImageryLayer best corresponding to the given ol.layer.Layer.
   * Only supports raster layers
   * @param {!ol.layer.Layer} olLayer
   * @param {?ol.proj.Projection} viewProj Projection of the view.
   * @return {?Cesium.ImageryLayer} null if not possible (or supported)
   * @api
   */
  olcs.core.tileLayerToImageryLayer = function(olLayer, viewProj) {
    if (!(olLayer instanceof ol.layer.Tile)) {
      return null;
    }

    var provider = null;

    var source = olLayer.getSource();
    // handle special cases before the general synchronization
    if (source instanceof ol.source.WMTS) {
      // WMTS uses different TileGrid which is not currently supported
      return null;
    }
    if (source instanceof ol.source.TileImage) {
      var projection = source.getProjection();

      if (goog.isNull(projection)) {
        // if not explicit, assume the same projection as view
        projection = viewProj;
      } else if (projection !== viewProj) {
        return null; // do not sync layers with projections different than view
      }

      var is3857 = projection === ol.proj.get('EPSG:3857');
      var is4326 = projection === ol.proj.get('EPSG:4326');
      if (is3857 || is4326) {
        provider = new olcs.core.OLImageryProvider(source, viewProj);
      } else {
        return null;
      }
    } else {
      // sources other than TileImage are currently not supported
      return null;
    }

    // the provider is always non-null if we got this far

    var layerOptions = {};

    var ext = olLayer.getExtent();
    if (goog.isDefAndNotNull(ext) && !goog.isNull(viewProj)) {
      layerOptions.rectangle = olcs.core.extentToRectangle(ext, viewProj);
    }

    var cesiumLayer = new Cesium.ImageryLayer(provider, layerOptions);
    return cesiumLayer;
  };


  /**
   * Synchronizes the layer rendering properties (brightness, contrast, hue,
   * opacity, saturation, visible) to the given Cesium ImageryLayer.
   * @param {!ol.layer.Layer} olLayer
   * @param {!Cesium.ImageryLayer} csLayer
   * @api
   */
  olcs.core.updateCesiumLayerProperties = function(olLayer, csLayer) {
    var opacity = olLayer.getOpacity();
    if (goog.isDef(opacity)) {
      csLayer.alpha = opacity;
    }
    var visible = olLayer.getVisible();
    if (goog.isDef(visible)) {
      csLayer.show = visible;
    }

    // saturation and contrast are working ok
    var saturation = olLayer.getSaturation();
    if (goog.isDef(saturation)) {
      csLayer.saturation = saturation;
    }
    var contrast = olLayer.getContrast();
    if (goog.isDef(contrast)) {
      csLayer.contrast = contrast;
    }

    // Cesium actually operates in YIQ space -> hard to emulate
    // The following values are only a rough approximations:

    // The hue in Cesium has different meaning than the OL equivalent.
    // var hue = olLayer.getHue();
    // if (goog.isDef(hue)) {
    //   csLayer.hue = hue;
    // }

    var brightness = olLayer.getBrightness();
    if (goog.isDef(brightness)) {
      // rough estimation
      csLayer.brightness = Math.pow(1 + parseFloat(brightness), 2);
    }
  };


  /**
   * Convert a 2D or 3D OpenLayers coordinate to Cesium.
   * @param {ol.Coordinate} coordinate Ol3 coordinate.
   * @return {!Cesium.Cartesian3} Cesium cartesian coordinate
   * @api
   */
  olcs.core.ol4326CoordinateToCesiumCartesian = function(coordinate) {
    var coo = coordinate;
    goog.isDefAndNotNull(coo);
    return coo.length > 2 ?
        Cesium.Cartesian3.fromDegrees(coo[0], coo[1], coo[2]) :
        Cesium.Cartesian3.fromDegrees(coo[0], coo[1]);
  };


  /**
   * Convert an array of 2D or 3D OpenLayers coordinates to Cesium.
   * @param {Array.<!ol.Coordinate>} coordinates Ol3 coordinates.
   * @return {!Array.<Cesium.Cartesian3>} Cesium cartesian coordinates
   * @api
   */
  olcs.core.ol4326CoordinateArrayToCsCartesians = function(coordinates) {
    goog.asserts.assert(coordinates !== null);
    var toCartesian = olcs.core.ol4326CoordinateToCesiumCartesian;
    var cartesians = [];
    for (var i = 0; i < coordinates.length; ++i) {
      cartesians.push(toCartesian(coordinates[i]));
    }
    return cartesians;
  };


  /**
   * Convert an OpenLayers geometry to 4326 projection.
   * The geometry will be cloned only when reprojection is required.
   * @param {!T} geometry
   * @param {!ol.proj.ProjectionLike} projection
   * @return {!T}
   * @template T
   */
  var olGeometryCloneTo4326 = function(geometry, projection) {
    goog.asserts.assert(goog.isDef(projection));

    var proj4326 = ol.proj.get('EPSG:4326');
    var proj = ol.proj.get(projection);
    if (proj !== proj4326) {
      geometry = geometry.clone();
      geometry.transform(proj, proj4326);
    }
    return geometry;
  };


  /**
   * Basics primitive creation using a color attribute.
   * Note that Cesium has 'interior' and outline geometries.
   * @param {!Cesium.Geometry} geometry
   * @param {!Cesium.Color} color
   * @param {number=} opt_lineWidth
   * @return {!Cesium.Primitive}
   */
  var createColoredPrimitive = function(geometry, color, opt_lineWidth) {
    var createInstance = function(geometry, color) {
      return new Cesium.GeometryInstance({
        // always update Cesium externs before adding a property
        geometry: geometry,
        attributes: {
          color: Cesium.ColorGeometryInstanceAttribute.fromColor(color)
        }
      });
    };

    var options = {
      // always update Cesium externs before adding a property
      flat: true, // work with all geometries
      renderState: {
        depthTest: {
          enabled: true
        }
      }
    };

    if (goog.isDef(opt_lineWidth)) {
      if (!options.renderState) {
        options.renderState = {};
      }
      options.renderState.lineWidth = opt_lineWidth;
    }
    var appearance = new Cesium.PerInstanceColorAppearance(options);

    var instances = createInstance(geometry, color);

    var primitive = new Cesium.Primitive({
      // always update Cesium externs before adding a property
      geometryInstances: instances,
      appearance: appearance
    });

    return primitive;
  };


  /**
   * Return the fill or stroke color from a plain ol style.
   * @param {!ol.style.Style|ol.style.Text} style
   * @param {boolean} outline
   * @return {!Cesium.Color}
   */
  var extractColorFromOlStyle = function(style, outline) {
    var fillColor = style.getFill() ? style.getFill().getColor() : null;
    var strokeColor = style.getStroke() ? style.getStroke().getColor() : null;

    var olColor = 'black';
    if (strokeColor && outline) {
      olColor = strokeColor;
    } else if (fillColor) {
      olColor = fillColor;
    }

    return convertOlColorToCesium(olColor);
  };


  /**
   * Return the width of stroke from a plain ol style.
   * Use GL aliased line width range constraint.
   * @param {!ol.style.Style|ol.style.Text} style
   * @return {number}
   */
  var extractLineWidthFromOlStyle = function(style) {
    if (olcs.core.glAliasedLineWidthRange == -1) {
      throw new Error('olcs.core.glAliasedLineWidthRange must be initialized ' +
          'using Cesium.Scene.maximumAliasedLineWidth');
    }
    var width = style.getStroke() ? style.getStroke().getWidth() : 1;
    return Math.min(width, olcs.core.glAliasedLineWidthRange);
  };


  /**
   * Create a primitive collection out of two Cesium geometries.
   * Only the OpenLayers style colors will be used.
   * @param {!Cesium.Geometry} fillGeometry
   * @param {!Cesium.Geometry} outlineGeometry
   * @param {!ol.style.Style} olStyle
   * @return {!Cesium.PrimitiveCollection}
   */
  var wrapFillAndOutlineGeometries = function(fillGeometry, outlineGeometry,
      olStyle) {
    var fillColor = extractColorFromOlStyle(olStyle, false);
    var outlineColor = extractColorFromOlStyle(olStyle, true);

    var primitives = new Cesium.PrimitiveCollection();
    if (olStyle.getFill()) {
      var p = createColoredPrimitive(fillGeometry, fillColor);
      primitives.add(p);
    }

    if (olStyle.getStroke()) {
      var width = extractLineWidthFromOlStyle(olStyle);
      var p = createColoredPrimitive(outlineGeometry, outlineColor, width);
      primitives.add(p);
    }

    return primitives;
  };



  // Geometry converters
  /**
   * Create a Cesium primitive if style has a text component.
   * Eventually return a PrimitiveCollection including current primitive.
   * @param {!ol.geom.Geometry} geometry
   * @param {!ol.style.Style} style
   * @param {!Cesium.Primitive} primitive current primitive
   * @return {!Cesium.PrimitiveCollection}
   */
  var addTextStyle = function(geometry, style, primitive) {
    var primitives;
    if (!(primitive instanceof Cesium.PrimitiveCollection)) {
      primitives = new Cesium.PrimitiveCollection();
      primitives.add(primitive);
    } else {
      primitives = primitive;
    }

    if (!style.getText()) {
      return primitives;
    }

    var text = /** @type {!ol.style.Text} */ (style.getText());
    var label = olcs.core.olGeometry4326TextPartToCesium(geometry, text);
    if (label) {
      primitives.add(label);
    }
    return primitives;
  };


  /**
   * Convert an OpenLayers circle geometry to Cesium.
   * @param {!ol.geom.Circle} olGeometry Ol3 circle geometry.
   * @param {!ol.proj.ProjectionLike} projection
   * @param {!ol.style.Style} olStyle
   * @return {!Cesium.PrimitiveCollection} primitives
   * @api
   */
  olcs.core.olCircleGeometryToCesium = function(olGeometry, projection,
      olStyle) {
    olGeometry = olGeometryCloneTo4326(olGeometry, projection);
    goog.asserts.assert(olGeometry.getType() == 'Circle');

    // ol.Coordinate
    var center = olGeometry.getCenter();
    var height = center.length == 3 ? center[2] : 0.0;
    var point = center.slice();
    point[0] += olGeometry.getRadius();

    // Cesium
    center = olcs.core.ol4326CoordinateToCesiumCartesian(center);
    point = olcs.core.ol4326CoordinateToCesiumCartesian(point);

    // Accurate computation of straight distance
    var radius = Cesium.Cartesian3.distance(center, point);

    var fillGeometry = new Cesium.CircleGeometry({
      // always update Cesium externs before adding a property
      center: center,
      radius: radius,
      height: height
    });

    var outlineGeometry = new Cesium.CircleOutlineGeometry({
      // always update Cesium externs before adding a property
      center: center,
      radius: radius,
      extrudedHeight: height,
      height: height
    });

    var wrap = wrapFillAndOutlineGeometries;
    var primitives = wrap(fillGeometry, outlineGeometry, olStyle);

    return addTextStyle(olGeometry, olStyle, primitives);
  };


  /**
   * Convert an OpenLayers line string geometry to Cesium.
   * @param {!ol.geom.LineString} olGeometry Ol3 line string geometry.
   * @param {!ol.proj.ProjectionLike} projection
   * @param {!ol.style.Style} olStyle
   * @return {!Cesium.PrimitiveCollection} primitives
   * @api
   */
  olcs.core.olLineStringGeometryToCesium = function(olGeometry, projection,
      olStyle) {

    olGeometry = olGeometryCloneTo4326(olGeometry, projection);
    goog.asserts.assert(olGeometry.getType() == 'LineString');

    var positions = olcs.core.ol4326CoordinateArrayToCsCartesians(
        olGeometry.getCoordinates());

    var appearance = new Cesium.PolylineMaterialAppearance({
      // always update Cesium externs before adding a property
      material: olcs.core.olStyleToCesium(olStyle, true)
    });

    // Handle both color and width
    var outlineGeometry = new Cesium.PolylineGeometry({
      // always update Cesium externs before adding a property
      positions: positions,
      vertexFormat: appearance.vertexFormat
    });

    var outlinePrimitive = new Cesium.Primitive({
      // always update Cesium externs before adding a property
      geometryInstances: new Cesium.GeometryInstance({
        geometry: outlineGeometry
      }),
      appearance: appearance
    });

    return addTextStyle(olGeometry, olStyle, outlinePrimitive);
  };


  /**
   * Convert an OpenLayers polygon geometry to Cesium.
   * @param {!ol.geom.Polygon} olGeometry Ol3 polygon geometry.
   * @param {!ol.proj.ProjectionLike} projection
   * @param {!ol.style.Style} olStyle
   * @return {!Cesium.PrimitiveCollection} primitives
   * @api
   */
  olcs.core.olPolygonGeometryToCesium = function(olGeometry, projection,
      olStyle) {

    olGeometry = olGeometryCloneTo4326(olGeometry, projection);
    goog.asserts.assert(olGeometry.getType() == 'Polygon');

    var rings = olGeometry.getLinearRings();
    // always update Cesium externs before adding a property
    var hierarchy = {};
    var polygonHierarchy = hierarchy;
    goog.asserts.assert(rings.length > 0);

    for (var i = 0; i < rings.length; ++i) {
      var olPos = rings[i].getCoordinates();
      var positions = olcs.core.ol4326CoordinateArrayToCsCartesians(olPos);
      goog.asserts.assert(positions && positions.length > 0);
      if (i == 0) {
        hierarchy.positions = positions;
      } else {
        hierarchy.holes = {
          // always update Cesium externs before adding a property
          positions: positions
        };
        hierarchy = hierarchy.holes;
      }
    }

    var fillGeometry = new Cesium.PolygonGeometry({
      // always update Cesium externs before adding a property
      polygonHierarchy: polygonHierarchy,
      perPositionHeight: true
    });

    var width = extractLineWidthFromOlStyle(olStyle);
    var outlineGeometry = new Cesium.PolygonOutlineGeometry({
      // always update Cesium externs before adding a property
      polygonHierarchy: hierarchy,
      perPositionHeight: true,
      width: width
    });

    var primitives = wrapFillAndOutlineGeometries(
        fillGeometry, outlineGeometry, olStyle);

    return addTextStyle(olGeometry, olStyle, primitives);
  };


  /**
   * Convert a point geometry to a Cesium BillboardCollection.
   * @param {!ol.geom.Point} geometry
   * @param {!ol.proj.ProjectionLike} projection
   * @param {!ol.style.Style} style
   * @param {!Cesium.BillboardCollection} billboards
   * @param {function(!Cesium.Billboard)=} opt_newBillboardCallback Called when
   * the new billboard is added.
   * @return {Cesium.Primitive} primitives
   * @api
   */
  olcs.core.olPointGeometryToCesium = function(geometry, projection, style,
      billboards, opt_newBillboardCallback) {
    goog.asserts.assert(geometry.getType() == 'Point');
    geometry = olGeometryCloneTo4326(geometry, projection);

    var imageStyle = style.getImage();
    var image = imageStyle.getImage(1); // get normal density
    var isImageLoaded = function(image) {
      return image.src != '' &&
          image.naturalHeight != 0 &&
          image.naturalWidth != 0 &&
          image.complete;
    };
    var reallyCreateBillboard = function() {
      if (goog.isNull(image) ||
          !(image instanceof HTMLCanvasElement || image instanceof Image)) {
        return;
      }
      var center = geometry.getCoordinates();
      var position = olcs.core.ol4326CoordinateToCesiumCartesian(center);
      var color;
      var opacity = imageStyle.getOpacity();
      if (goog.isDef(opacity)) {
        color = new Cesium.Color(1.0, 1.0, 1.0, opacity);
      }
      var bb = billboards.add({
        // always update Cesium externs before adding a property
        image: image,
        color: color,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        position: position
      });
      if (opt_newBillboardCallback) {
        opt_newBillboardCallback(bb);
      }
    };

    if (image instanceof Image && !isImageLoaded(image)) {
      // Cesium requires the image to be loaded
      var listener = function() {
        reallyCreateBillboard();
      };

      goog.events.listenOnce(image, 'load', listener);
    } else {
      reallyCreateBillboard();
    }

    if (style.getText()) {
      return addTextStyle(geometry, style, new Cesium.Primitive());
    } else {
      return null;
    }
  };


  /**
   * Convert an OpenLayers multi-something geometry to Cesium.
   * @param {!ol.geom.Geometry} geometry Ol3 geometry.
   * @param {!ol.proj.ProjectionLike} projection
   * @param {!ol.style.Style} olStyle
   * @param {function(!Cesium.Billboard)=} opt_newBillboardCallback Called when
   * the new billboard is added.
   * @return {!Cesium.Primitive} primitives
   * @api
   */
  olcs.core.olMultiGeometryToCesium = function(geometry, projection,
      olStyle, opt_newBillboardCallback) {
    // Do not reproject to 4326 now because it will be done later.

    // FIXME: would be better to combine all child geometries in one primitive
    // instead we create n primitives for simplicity.
    var accumulate = function(geometries, functor) {
      var primitives = new Cesium.PrimitiveCollection();
      goog.array.forEach(geometries, function(geometry) {
        primitives.add(functor(geometry, projection, olStyle));
      });
      return primitives;
    };

    var subgeos;
    switch (geometry.getType()) {
      case 'MultiPoint':
        geometry = /** @type {!ol.geom.MultiPoint} */ (geometry);
        subgeos = geometry.getPoints();
        var fn = olcs.core.olPointGeometryToCesium;
        var billboards = new Cesium.BillboardCollection();
        if (olStyle.getText()) {
          var primitives = new Cesium.PrimitiveCollection();
          goog.array.forEach(subgeos, function(geometry) {
            goog.asserts.assert(geometry);
            var result = fn(geometry, projection, olStyle, billboards,
                opt_newBillboardCallback);
            if (result) {
              primitives.add(result);
            }
          });
          return primitives;
        } else {
          goog.array.forEach(subgeos, function(geometry) {
            goog.asserts.assert(!goog.isNull(geometry));
            fn(geometry, projection, olStyle, billboards,
                opt_newBillboardCallback);
          });
          return billboards;
        }
      case 'MultiLineString':
        geometry = /** @type {!ol.geom.MultiLineString} */ (geometry);
        subgeos = geometry.getLineStrings();
        return accumulate(subgeos, olcs.core.olLineStringGeometryToCesium);
      case 'MultiPolygon':
        geometry = /** @type {!ol.geom.MultiPolygon} */ (geometry);
        subgeos = geometry.getPolygons();
        return accumulate(subgeos, olcs.core.olPolygonGeometryToCesium);
      default:
        goog.asserts.fail('Unhandled multi geometry type' + geometry.getType());
    }
  };


  /**
   * Convert an OpenLayers text style to Cesium.
   * @param {!ol.geom.Geometry} geometry
   * @param {!ol.style.Text} style
   * @return {Cesium.LabelCollection} Cesium primitive
   * @api
   */
  olcs.core.olGeometry4326TextPartToCesium = function(geometry, style) {
    var text = style.getText();
    goog.asserts.assert(goog.isDef(text));


    var primitives = new Cesium.LabelCollection();
    // TODO: export and use the text draw position from ol3 .
    // See src/ol/render/vector.js
    var extentCenter = ol.extent.getCenter(geometry.getExtent());
    if (geometry instanceof ol.geom.SimpleGeometry) {
      var first = geometry.getFirstCoordinate();
      extentCenter[2] = first.length == 3 ? first[2] : 0.0;
    }
    var position = olcs.core.ol4326CoordinateToCesiumCartesian(extentCenter);

    primitives.modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
        position);
    var options = /** @type {Cesium.optionsLabelCollection} */ ({});
    options.text = text;

    var offsetX = style.getOffsetX();
    var offsetY = style.getOffsetY();
    if (offsetX != 0 && offsetY != 0) {
      var offset = new Cesium.Cartesian2(offsetX, offsetY);
      options.pixelOffset = offset;
    }

    var font = style.getFont();
    if (goog.isDefAndNotNull(font)) {
      options.font = font;
    }

    var labelStyle = undefined;
    if (style.getFill()) {
      options.fillColor = extractColorFromOlStyle(style, false);
      labelStyle = Cesium.LabelStyle.FILL;
    }
    if (style.getStroke()) {
      options.outlineWidth = extractLineWidthFromOlStyle(style);
      options.outlineColor = extractColorFromOlStyle(style, true);
      labelStyle = Cesium.LabelStyle.OUTLINE;
    }
    if (style.getFill() && style.getStroke()) {
      labelStyle = Cesium.LabelStyle.FILL_AND_OUTLINE;
    }
    options.style = labelStyle;

    if (style.getTextAlign()) {
      var horizontalOrigin;
      switch (style.getTextAlign()) {
        case 'center':
          horizontalOrigin = Cesium.HorizontalOrigin.CENTER;
          break;
        case 'left':
          horizontalOrigin = Cesium.HorizontalOrigin.LEFT;
          break;
        case 'right':
          horizontalOrigin = Cesium.HorizontalOrigin.RIGHT;
          break;
        default:
          goog.asserts.fail('unhandled text align ' + style.getTextAlign());
      }
      options.horizontalOrigin = horizontalOrigin;
    }

    if (style.getTextBaseline()) {
      var verticalOrigin;
      switch (style.getTextBaseline()) {
        case 'top':
          verticalOrigin = Cesium.VerticalOrigin.TOP;
          break;
        case 'middle':
          verticalOrigin = Cesium.VerticalOrigin.CENTER;
          break;
        case 'bottom':
          verticalOrigin = Cesium.VerticalOrigin.BOTTOM;
          break;
        case 'alphabetic':
          verticalOrigin = Cesium.VerticalOrigin.TOP;
          break;
        case 'hanging':
          verticalOrigin = Cesium.VerticalOrigin.BOTTOM;
          break;
        default:
          goog.asserts.fail('unhandled baseline ' + style.getTextBaseline());
      }
      options.verticalOrigin = verticalOrigin;
    }


    primitives.add(options);
    return primitives;
  };


  /**
   * @param {ol.Color|string} olColor
   * @return {!Cesium.Color}
   */
  var convertOlColorToCesium = function(olColor) {
    olColor = olColor || 'black';
    if (goog.isArray(olColor)) {
      return new Cesium.Color(
          Cesium.Color.byteToFloat(olColor[0]),
          Cesium.Color.byteToFloat(olColor[1]),
          Cesium.Color.byteToFloat(olColor[2]),
          olColor[3]
      );
    } else if (goog.isString(olColor)) {
      return Cesium.Color.fromCssColorString(olColor);
    }
    goog.asserts.fail('impossible');
  };


  /**
   * Convert an OpenLayers style to a Cesium Material.
   * @param {!ol.style.Style} style
   * @param {boolean} outline
   * @return {Cesium.Material}
   * @api
   */
  olcs.core.olStyleToCesium = function(style, outline) {
    var fill = style.getFill();
    var stroke = style.getStroke();
    if ((outline && !stroke) || (!outline && !fill)) {
      return null; // FIXME use a default style? Developer error?
    }

    var color = outline ? stroke.getColor() : fill.getColor();
    color = convertOlColorToCesium(color);

    if (outline && stroke.getLineDash()) {
      return Cesium.Material.fromType('Stripe', {
        // always update Cesium externs before adding a property
        horizontal: false,
        repeat: 500, // TODO how to calculate this?
        evenColor: color,
        oddColor: new Cesium.Color(0, 0, 0, 0) // transparent
      });
    } else {
      return Cesium.Material.fromType('Color', {
        // always update Cesium externs before adding a property
        color: color
      });
    }

  };


  /**
   * Compute OpenLayers plain style.
   * Evaluates style function, blend arrays, get default style.
   * @param {!ol.Feature} feature
   * @param {ol.style.StyleFunction|undefined} fallbackStyle
   * @param {number} resolution
   * @return {ol.style.Style} null if no style is available
   * @api
   */
  olcs.core.computePlainStyle = function(feature, fallbackStyle, resolution) {
    var featureStyle = feature.getStyleFunction();
    var style;
    if (goog.isDef(featureStyle)) {
      style = featureStyle.call(feature, resolution);
    }
    if (!goog.isDefAndNotNull(style) && goog.isDefAndNotNull(fallbackStyle)) {
      style = fallbackStyle(feature, resolution);
    }

    if (!goog.isDef(style)) {
      // The feature must not be displayed
      return null;
    }

    goog.asserts.assert(goog.isArray(style));
    // FIXME combine materials as in cesium-materials-pack?
    // then this function must return a custom material
    // More simply, could blend the colors like described in
    // http://en.wikipedia.org/wiki/Alpha_compositing
    return style[0];
  };


  /**
   * Convert one OpenLayers feature up to a collection of Cesium primitives.
   * @param {!ol.Feature} feature Ol3 feature.
   * @param {!ol.style.Style} style
   * @param {!olcsx.core.OlFeatureToCesiumContext} context
   * @param {!ol.geom.Geometry=} opt_geom Geometry to be converted.
   * @return {Cesium.Primitive} primitives
   * @api
   */
  olcs.core.olFeatureToCesium = function(feature, style, context, opt_geom) {
    var geom = opt_geom || feature.getGeometry();
    var proj = context.projection;
    if (!geom) {
      // Ol3 features may not have a geometry
      // See http://geojson.org/geojson-spec.html#feature-objects
      return null;
    }

    var id = function(object) {
      object.olFeature = feature;
      return object;
    };

    var newBillboardAddedCallback = function(bb) {
      context.featureToCesiumMap[goog.getUid(feature)] = bb;
      id(bb);
    };

    switch (geom.getType()) {
      case 'GeometryCollection':
        var primitives = new Cesium.PrimitiveCollection();
        var collection = /** @type {!ol.geom.GeometryCollection} */ (geom);
        goog.array.forEach(collection.getGeometries(), function(geom) {
          if (geom) {
            var prims = olcs.core.olFeatureToCesium(feature, style, context,
                geom);
            if (prims) {
              primitives.add(prims);
            }
          }
        });
        return id(primitives);
      case 'Point':
        geom = /** @type {!ol.geom.Point} */ (geom);
        var bbs = context.billboards;
        var result = olcs.core.olPointGeometryToCesium(geom, proj, style, bbs,
            newBillboardAddedCallback);
        if (!result) {
          // no wrapping primitive
          return null;
        } else {
          return id(result);
        }
      case 'Circle':
        geom = /** @type {!ol.geom.Circle} */ (geom);
        return id(olcs.core.olCircleGeometryToCesium(geom, proj, style));
      case 'LineString':
        geom = /** @type {!ol.geom.LineString} */ (geom);
        return id(olcs.core.olLineStringGeometryToCesium(geom, proj, style));
      case 'Polygon':
        geom = /** @type {!ol.geom.Polygon} */ (geom);
        return id(olcs.core.olPolygonGeometryToCesium(geom, proj, style));
      case 'MultiPoint':
      case 'MultiLineString':
      case 'MultiPolygon':
        return id(olcs.core.olMultiGeometryToCesium(geom, proj, style,
            newBillboardAddedCallback));
      case 'LinearRing':
        throw new Error('LinearRing should only be part of polygon.');
      default:
        throw new Error('Ol geom type not handled : ' + geom.getType());
    }
  };


  /**
   * Convert an OpenLayers vector layer to Cesium primitive collection.
   * For each feature, the associated primitive will be stored in
   * `featurePrimitiveMap`.
   * @param {!ol.layer.Vector} olLayer
   * @param {!ol.View} olView
   * @param {!Object.<number, !Cesium.Primitive>} featurePrimitiveMap
   * @return {!olcs.core.OlLayerPrimitive}
   * @api
   */
  olcs.core.olVectorLayerToCesium = function(olLayer, olView,
      featurePrimitiveMap) {
    var vectorLayer = olLayer;
    var features = vectorLayer.getSource().getFeatures();
    var proj = olView.getProjection();
    var resolution = olView.getResolution();

    if (!goog.isDef(resolution) || !proj) {
      goog.asserts.fail('View not ready');
      // an assertion is not enough for closure to assume resolution and proj
      // are defined
      throw new Error('View not ready');
    }
    var allPrimitives = new olcs.core.OlLayerPrimitive(proj);
    var context = allPrimitives.context;
    for (var i = 0; i < features.length; ++i) {
      var feature = features[i];
      if (!goog.isDefAndNotNull(feature)) {
        continue;
      }
      var layerStyle = vectorLayer.getStyleFunction();
      var style = olcs.core.computePlainStyle(feature, layerStyle, resolution);
      if (!style) {
        // only 'render' features with a style
        continue;
      }
      var primitives = olcs.core.olFeatureToCesium(feature, style, context);
      if (!primitives) continue;
      featurePrimitiveMap[goog.getUid(feature)] = primitives;
      allPrimitives.add(primitives);
    }

    return allPrimitives;
  };

})();

goog.provide('olcs.Camera');

goog.require('goog.events');
goog.require('ol.proj');
goog.require('olcs.core');



/**
 * This object takes care of additional 3d-specific properties of the view and
 * ensures proper synchronization with the underlying raw Cesium.Camera object.
 * @param {!Cesium.Scene} scene
 * @param {!ol.Map} map
 * @constructor
 * @api
 */
olcs.Camera = function(scene, map) {
  /**
   * @type {!Cesium.Scene}
   * @private
   */
  this.scene_ = scene;

  /**
   * @type {!Cesium.Camera}
   * @private
   */
  this.cam_ = scene.camera;

  /**
   * @type {!ol.Map}
   * @private
   */
  this.map_ = map;

  /**
   * @type {?ol.View}
   * @private
   */
  this.view_ = null;

  /**
   * @type {?goog.events.Key}
   * @private
   */
  this.viewListenKey_ = null;

  /**
   * @type {?ol.TransformFunction}
   * @private
   */
  this.toLonLat_ = null;

  /**
   * @type {?ol.TransformFunction}
   * @private
   */
  this.fromLonLat_ = null;

  /**
   * 0 -- topdown, PI/2 -- the horizon
   * @type {number}
   * @private
   */
  this.tilt_ = 0;

  /**
   * @type {number}
   * @private
   */
  this.distance_ = 0;

  /**
   * @type {?Cesium.Matrix4}
   * @private
   */
  this.lastCameraViewMatrix_ = null;

  /**
   * This is used to discard change events on view caused by updateView method.
   * @type {boolean}
   * @private
   */
  this.viewUpdateInProgress_ = false;

  this.map_.on('change:view', function(e) {
    this.setView_(this.map_.getView());
  }, this);
  this.setView_(this.map_.getView());
};


/**
 * @param {?ol.View} view New view to use.
 * @private
 */
olcs.Camera.prototype.setView_ = function(view) {
  if (!goog.isNull(this.view_)) {
    this.view_.unByKey(this.viewListenKey_);
    this.viewListenKey_ = null;
  }

  this.view_ = view;
  if (!goog.isNull(view)) {
    this.toLonLat_ = ol.proj.getTransform(view.getProjection(), 'EPSG:4326');
    this.fromLonLat_ = ol.proj.getTransform('EPSG:4326', view.getProjection());

    this.viewListenKey_ = view.on('propertychange',
                                  this.handleViewEvent_, this);
    this.readFromView();
  } else {
    this.toLonLat_ = null;
    this.fromLonLat_ = null;
  }
};


/**
 * @param {?} e
 * @private
 */
olcs.Camera.prototype.handleViewEvent_ = function(e) {
  if (!this.viewUpdateInProgress_) {
    this.readFromView();
  }
};


/**
 * @param {number} heading In radians.
 * @api
 */
olcs.Camera.prototype.setHeading = function(heading) {
  if (goog.isNull(this.view_)) {
    return;
  }

  this.view_.setRotation(heading);
};


/**
 * @return {number|undefined} Heading in radians.
 * @api
 */
olcs.Camera.prototype.getHeading = function() {
  if (goog.isNull(this.view_)) {
    return undefined;
  }
  var rotation = this.view_.getRotation();
  return goog.isDef(rotation) ? rotation : 0;
};


/**
 * @param {number} tilt In radians.
 * @api
 */
olcs.Camera.prototype.setTilt = function(tilt) {
  this.tilt_ = tilt;
  this.updateCamera_();
};


/**
 * @return {number} Tilt in radians.
 * @api
 */
olcs.Camera.prototype.getTilt = function() {
  return this.tilt_;
};


/**
 * @param {number} distance In meters.
 * @api
 */
olcs.Camera.prototype.setDistance = function(distance) {
  this.distance_ = distance;
  this.updateCamera_();
  this.updateView();
};


/**
 * @return {number} Distance in meters.
 * @api
 */
olcs.Camera.prototype.getDistance = function() {
  return this.distance_;
};


/**
 * Shortcut for ol.View.setCenter().
 * @param {!ol.Coordinate} center Same projection as the ol.View.
 * @api
 */
olcs.Camera.prototype.setCenter = function(center) {
  if (goog.isNull(this.view_)) {
    return;
  }
  this.view_.setCenter(center);
};


/**
 * Shortcut for ol.View.getCenter().
 * @return {ol.Coordinate|undefined} Same projection as the ol.View.
 * @api
 */
olcs.Camera.prototype.getCenter = function() {
  if (goog.isNull(this.view_)) {
    return undefined;
  }
  return this.view_.getCenter();
};


/**
 * Sets the position of the camera.
 * @param {!ol.Coordinate} position Same projection as the ol.View.
 * @api
 */
olcs.Camera.prototype.setPosition = function(position) {
  if (goog.isNull(this.toLonLat_)) {
    return;
  }
  var ll = this.toLonLat_(position);
  goog.asserts.assert(!goog.isNull(ll));

  var carto = new Cesium.Cartographic(goog.math.toRadians(ll[0]),
                                      goog.math.toRadians(ll[1]),
                                      this.getAltitude());

  this.cam_.position = Cesium.Ellipsoid.WGS84.cartographicToCartesian(carto);
  this.updateView();
};


/**
 * Calculates position under the camera.
 * @return {!ol.Coordinate|undefined} Same projection as the ol.View.
 * @api
 */
olcs.Camera.prototype.getPosition = function() {
  if (goog.isNull(this.fromLonLat_)) {
    return undefined;
  }
  var carto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(
      this.cam_.position);

  var pos = this.fromLonLat_([goog.math.toDegrees(carto.longitude),
                              goog.math.toDegrees(carto.latitude)]);
  goog.asserts.assert(!goog.isNull(pos));
  return pos;
};


/**
 * @param {number} altitude In meters.
 * @api
 */
olcs.Camera.prototype.setAltitude = function(altitude) {
  var carto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(
      this.cam_.position);
  carto.height = altitude;
  this.cam_.position = Cesium.Ellipsoid.WGS84.cartographicToCartesian(carto);

  this.updateView();
};


/**
 * @return {number} Altitude in meters.
 * @api
 */
olcs.Camera.prototype.getAltitude = function() {
  var carto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(
      this.cam_.position);

  return carto.height;
};


/**
 * Rotates the camera to point at the specified target.
 * @param {!ol.Coordinate} position Same projection as the ol.View.
 * @api
 */
olcs.Camera.prototype.lookAt = function(position) {
  if (goog.isNull(this.toLonLat_)) {
    return;
  }
  var ll = this.toLonLat_(position);
  goog.asserts.assert(!goog.isNull(ll));

  var carto = Cesium.Cartographic.fromDegrees(ll[0], ll[1]);
  olcs.core.lookAt(this.cam_, carto, this.scene_.globe);

  this.updateView();
};


/**
 * Updates the state of the underlying Cesium.Camera
 * according to the current values of the properties.
 * @private
 */
olcs.Camera.prototype.updateCamera_ = function() {
  if (goog.isNull(this.view_) || goog.isNull(this.toLonLat_)) {
    return;
  }
  var center = this.view_.getCenter();
  if (!center) {
    return;
  }
  var ll = this.toLonLat_(center);
  goog.asserts.assert(!goog.isNull(ll));

  var carto = new Cesium.Cartographic(goog.math.toRadians(ll[0]),
                                      goog.math.toRadians(ll[1]));
  if (this.scene_.globe) {
    var height = this.scene_.globe.getHeight(carto);
    carto.height = goog.isDef(height) ? height : 0;
  }

  this.cam_.setView({
    positionCartographic: carto,
    pitch: this.tilt_ - Cesium.Math.PI_OVER_TWO,
    heading: -this.view_.getRotation()
  });

  this.cam_.moveBackward(this.distance_);

  this.checkCameraChange(true);
};


/**
 * Calculates the values of the properties from the current ol.View state.
 */
olcs.Camera.prototype.readFromView = function() {
  if (goog.isNull(this.view_) || goog.isNull(this.toLonLat_)) {
    return;
  }
  var center = this.view_.getCenter();
  if (!goog.isDefAndNotNull(center)) {
    return;
  }
  var ll = this.toLonLat_(center);
  goog.asserts.assert(!goog.isNull(ll));

  var resolution = this.view_.getResolution();
  this.distance_ = this.calcDistanceForResolution_(
      goog.isDef(resolution) ? resolution : 0, goog.math.toRadians(ll[1]));

  this.updateCamera_();
};


/**
 * Calculates the values of the properties from the current Cesium.Camera state.
 * Modifies the center, resolution and rotation properties of the view.
 * @api
 */
olcs.Camera.prototype.updateView = function() {
  if (goog.isNull(this.view_) || goog.isNull(this.fromLonLat_)) {
    return;
  }
  this.viewUpdateInProgress_ = true;

  // target & distance
  var ellipsoid = Cesium.Ellipsoid.WGS84;
  var scene = this.scene_;
  var target = olcs.core.pickCenterPoint(scene);

  var bestTarget = target;
  if (!bestTarget) {
    //TODO: how to handle this properly ?
    var globe = scene.globe;
    var carto = this.cam_.positionCartographic.clone();
    var height = globe.getHeight(carto);
    carto.height = goog.isDef(height) ? height : 0;
    bestTarget = Cesium.Ellipsoid.WGS84.cartographicToCartesian(carto);
  }
  this.distance_ = Cesium.Cartesian3.distance(bestTarget, this.cam_.position);
  var bestTargetCartographic = ellipsoid.cartesianToCartographic(bestTarget);
  this.view_.setCenter(this.fromLonLat_([
    goog.math.toDegrees(bestTargetCartographic.longitude),
    goog.math.toDegrees(bestTargetCartographic.latitude)]));

  // resolution
  this.view_.setResolution(
      this.calcResolutionForDistance_(this.distance_,
          bestTargetCartographic ? bestTargetCartographic.latitude : 0));


  /*
   * Since we are positioning the target, the values of heading and tilt
   * need to be calculated _at the target_.
   */
  if (target) {
    var pos = this.cam_.position;

    // normal to the ellipsoid at the target
    var targetNormal = new Cesium.Cartesian3();
    ellipsoid.geocentricSurfaceNormal(target, targetNormal);

    // vector from the target to the camera
    var targetToCamera = new Cesium.Cartesian3();
    Cesium.Cartesian3.subtract(pos, target, targetToCamera);
    Cesium.Cartesian3.normalize(targetToCamera, targetToCamera);


    // HEADING
    var up = this.cam_.up;
    var right = this.cam_.right;
    var normal = new Cesium.Cartesian3(-target.y, target.x, 0); // what is it?
    var heading = Cesium.Cartesian3.angleBetween(right, normal);
    var cross = Cesium.Cartesian3.cross(target, up, new Cesium.Cartesian3());
    var orientation = cross.z;

    this.view_.setRotation((orientation < 0 ? heading : -heading));

    // TILT
    var tiltAngle = Math.acos(
        Cesium.Cartesian3.dot(targetNormal, targetToCamera));
    this.tilt_ = isNaN(tiltAngle) ? 0 : tiltAngle;
  } else {
    // fallback when there is no target
    this.view_.setRotation(this.cam_.heading);
    this.tilt_ = -this.cam_.pitch + Math.PI / 2;
  }

  this.viewUpdateInProgress_ = false;
};


/**
 * Check if the underlying camera state has changed and ensure synchronization.
 * @param {boolean=} opt_dontSync Do not synchronize the view.
 */
olcs.Camera.prototype.checkCameraChange = function(opt_dontSync) {
  var viewMatrix = this.cam_.viewMatrix;
  if (!this.lastCameraViewMatrix_ ||
      !this.lastCameraViewMatrix_.equals(viewMatrix)) {
    this.lastCameraViewMatrix_ = viewMatrix.clone();
    if (opt_dontSync !== true) {
      this.updateView();
    }
  }
};


/**
 * @param {number} resolution
 * @param {number} latitude
 * @return {number} The calculated distance.
 * @private
 */
olcs.Camera.prototype.calcDistanceForResolution_ = function(resolution,
                                                            latitude) {
  var canvas = this.scene_.canvas;
  var fovy = this.cam_.frustum.fovy; // vertical field of view
  var metersPerUnit = this.view_.getProjection().getMetersPerUnit();

  // number of "map units" visible in 2D (vertically)
  var visibleMapUnits = resolution * canvas.height;

  // The metersPerUnit does not take latitude into account, but it should
  // be lower with increasing latitude -- we have to compensate.
  // In 3D it is not possible to maintain the resolution at more than one point,
  // so it only makes sense to use the latitude of the "target" point.
  var relativeCircumference = Math.cos(Math.abs(latitude));

  // how many meters should be visible in 3D
  var visibleMeters = visibleMapUnits * metersPerUnit * relativeCircumference;

  // distance required to view the calculated length in meters
  //
  //  fovy/2
  //    |\
  //  x | \
  //    |--\
  // visibleMeters/2
  var requiredDistance = (visibleMeters / 2) / Math.tan(fovy / 2);

  // NOTE: This calculation is not absolutely precise, because metersPerUnit
  // is a great simplification. It does not take ellipsoid/terrain into account.

  return requiredDistance;
};


/**
 * @param {number} distance
 * @param {number} latitude
 * @return {number} The calculated resolution.
 * @private
 */
olcs.Camera.prototype.calcResolutionForDistance_ = function(distance,
                                                            latitude) {
  // See the reverse calculation (calcDistanceForResolution_) for details
  var canvas = this.scene_.canvas;
  var fovy = this.cam_.frustum.fovy;
  var metersPerUnit = this.view_.getProjection().getMetersPerUnit();

  var visibleMeters = 2 * distance * Math.tan(fovy / 2);
  var relativeCircumference = Math.cos(Math.abs(latitude));
  var visibleMapUnits = visibleMeters / metersPerUnit / relativeCircumference;
  var resolution = visibleMapUnits / canvas.height;

  return resolution;
};

// Copyright 2005 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview A disposable implementation of a custom
 * listenable/event target. See also: documentation for
 * {@code goog.events.Listenable}.
 *
 * @author arv@google.com (Erik Arvidsson) [Original implementation]
 * @author pupius@google.com (Daniel Pupius) [Port to use goog.events]
 * @see ../demos/eventtarget.html
 * @see goog.events.Listenable
 */

goog.provide('goog.events.EventTarget');

goog.require('goog.Disposable');
goog.require('goog.asserts');
goog.require('goog.events');
goog.require('goog.events.Event');
goog.require('goog.events.Listenable');
goog.require('goog.events.ListenerMap');
goog.require('goog.object');



/**
 * An implementation of {@code goog.events.Listenable} with full W3C
 * EventTarget-like support (capture/bubble mechanism, stopping event
 * propagation, preventing default actions).
 *
 * You may subclass this class to turn your class into a Listenable.
 *
 * Unless propagation is stopped, an event dispatched by an
 * EventTarget will bubble to the parent returned by
 * {@code getParentEventTarget}. To set the parent, call
 * {@code setParentEventTarget}. Subclasses that don't support
 * changing the parent can override the setter to throw an error.
 *
 * Example usage:
 * <pre>
 *   var source = new goog.events.EventTarget();
 *   function handleEvent(e) {
 *     alert('Type: ' + e.type + '; Target: ' + e.target);
 *   }
 *   source.listen('foo', handleEvent);
 *   // Or: goog.events.listen(source, 'foo', handleEvent);
 *   ...
 *   source.dispatchEvent('foo');  // will call handleEvent
 *   ...
 *   source.unlisten('foo', handleEvent);
 *   // Or: goog.events.unlisten(source, 'foo', handleEvent);
 * </pre>
 *
 * @constructor
 * @extends {goog.Disposable}
 * @implements {goog.events.Listenable}
 */
goog.events.EventTarget = function() {
  goog.Disposable.call(this);

  /**
   * Maps of event type to an array of listeners.
   * @private {!goog.events.ListenerMap}
   */
  this.eventTargetListeners_ = new goog.events.ListenerMap(this);

  /**
   * The object to use for event.target. Useful when mixing in an
   * EventTarget to another object.
   * @private {!Object}
   */
  this.actualEventTarget_ = this;

  /**
   * Parent event target, used during event bubbling.
   *
   * TODO(user): Change this to goog.events.Listenable. This
   * currently breaks people who expect getParentEventTarget to return
   * goog.events.EventTarget.
   *
   * @private {goog.events.EventTarget}
   */
  this.parentEventTarget_ = null;
};
goog.inherits(goog.events.EventTarget, goog.Disposable);
goog.events.Listenable.addImplementation(goog.events.EventTarget);


/**
 * An artificial cap on the number of ancestors you can have. This is mainly
 * for loop detection.
 * @const {number}
 * @private
 */
goog.events.EventTarget.MAX_ANCESTORS_ = 1000;


/**
 * Returns the parent of this event target to use for bubbling.
 *
 * @return {goog.events.EventTarget} The parent EventTarget or null if
 *     there is no parent.
 * @override
 */
goog.events.EventTarget.prototype.getParentEventTarget = function() {
  return this.parentEventTarget_;
};


/**
 * Sets the parent of this event target to use for capture/bubble
 * mechanism.
 * @param {goog.events.EventTarget} parent Parent listenable (null if none).
 */
goog.events.EventTarget.prototype.setParentEventTarget = function(parent) {
  this.parentEventTarget_ = parent;
};


/**
 * Adds an event listener to the event target. The same handler can only be
 * added once per the type. Even if you add the same handler multiple times
 * using the same type then it will only be called once when the event is
 * dispatched.
 *
 * @param {string} type The type of the event to listen for.
 * @param {function(?):?|{handleEvent:function(?):?}|null} handler The function
 *     to handle the event. The handler can also be an object that implements
 *     the handleEvent method which takes the event object as argument.
 * @param {boolean=} opt_capture In DOM-compliant browsers, this determines
 *     whether the listener is fired during the capture or bubble phase
 *     of the event.
 * @param {Object=} opt_handlerScope Object in whose scope to call
 *     the listener.
 * @deprecated Use {@code #listen} instead, when possible. Otherwise, use
 *     {@code goog.events.listen} if you are passing Object
 *     (instead of Function) as handler.
 */
goog.events.EventTarget.prototype.addEventListener = function(
    type, handler, opt_capture, opt_handlerScope) {
  goog.events.listen(this, type, handler, opt_capture, opt_handlerScope);
};


/**
 * Removes an event listener from the event target. The handler must be the
 * same object as the one added. If the handler has not been added then
 * nothing is done.
 *
 * @param {string} type The type of the event to listen for.
 * @param {function(?):?|{handleEvent:function(?):?}|null} handler The function
 *     to handle the event. The handler can also be an object that implements
 *     the handleEvent method which takes the event object as argument.
 * @param {boolean=} opt_capture In DOM-compliant browsers, this determines
 *     whether the listener is fired during the capture or bubble phase
 *     of the event.
 * @param {Object=} opt_handlerScope Object in whose scope to call
 *     the listener.
 * @deprecated Use {@code #unlisten} instead, when possible. Otherwise, use
 *     {@code goog.events.unlisten} if you are passing Object
 *     (instead of Function) as handler.
 */
goog.events.EventTarget.prototype.removeEventListener = function(
    type, handler, opt_capture, opt_handlerScope) {
  goog.events.unlisten(this, type, handler, opt_capture, opt_handlerScope);
};


/** @override */
goog.events.EventTarget.prototype.dispatchEvent = function(e) {
  this.assertInitialized_();

  var ancestorsTree, ancestor = this.getParentEventTarget();
  if (ancestor) {
    ancestorsTree = [];
    var ancestorCount = 1;
    for (; ancestor; ancestor = ancestor.getParentEventTarget()) {
      ancestorsTree.push(ancestor);
      goog.asserts.assert(
          (++ancestorCount < goog.events.EventTarget.MAX_ANCESTORS_),
          'infinite loop');
    }
  }

  return goog.events.EventTarget.dispatchEventInternal_(
      this.actualEventTarget_, e, ancestorsTree);
};


/**
 * Removes listeners from this object.  Classes that extend EventTarget may
 * need to override this method in order to remove references to DOM Elements
 * and additional listeners.
 * @override
 */
goog.events.EventTarget.prototype.disposeInternal = function() {
  goog.events.EventTarget.superClass_.disposeInternal.call(this);

  this.removeAllListeners();
  this.parentEventTarget_ = null;
};


/** @override */
goog.events.EventTarget.prototype.listen = function(
    type, listener, opt_useCapture, opt_listenerScope) {
  this.assertInitialized_();
  return this.eventTargetListeners_.add(
      String(type), listener, false /* callOnce */, opt_useCapture,
      opt_listenerScope);
};


/** @override */
goog.events.EventTarget.prototype.listenOnce = function(
    type, listener, opt_useCapture, opt_listenerScope) {
  return this.eventTargetListeners_.add(
      String(type), listener, true /* callOnce */, opt_useCapture,
      opt_listenerScope);
};


/** @override */
goog.events.EventTarget.prototype.unlisten = function(
    type, listener, opt_useCapture, opt_listenerScope) {
  return this.eventTargetListeners_.remove(
      String(type), listener, opt_useCapture, opt_listenerScope);
};


/** @override */
goog.events.EventTarget.prototype.unlistenByKey = function(key) {
  return this.eventTargetListeners_.removeByKey(key);
};


/** @override */
goog.events.EventTarget.prototype.removeAllListeners = function(opt_type) {
  // TODO(user): Previously, removeAllListeners can be called on
  // uninitialized EventTarget, so we preserve that behavior. We
  // should remove this when usages that rely on that fact are purged.
  if (!this.eventTargetListeners_) {
    return 0;
  }
  return this.eventTargetListeners_.removeAll(opt_type);
};


/** @override */
goog.events.EventTarget.prototype.fireListeners = function(
    type, capture, eventObject) {
  // TODO(user): Original code avoids array creation when there
  // is no listener, so we do the same. If this optimization turns
  // out to be not required, we can replace this with
  // getListeners(type, capture) instead, which is simpler.
  var listenerArray = this.eventTargetListeners_.listeners[String(type)];
  if (!listenerArray) {
    return true;
  }
  listenerArray = listenerArray.concat();

  var rv = true;
  for (var i = 0; i < listenerArray.length; ++i) {
    var listener = listenerArray[i];
    // We might not have a listener if the listener was removed.
    if (listener && !listener.removed && listener.capture == capture) {
      var listenerFn = listener.listener;
      var listenerHandler = listener.handler || listener.src;

      if (listener.callOnce) {
        this.unlistenByKey(listener);
      }
      rv = listenerFn.call(listenerHandler, eventObject) !== false && rv;
    }
  }

  return rv && eventObject.returnValue_ != false;
};


/** @override */
goog.events.EventTarget.prototype.getListeners = function(type, capture) {
  return this.eventTargetListeners_.getListeners(String(type), capture);
};


/** @override */
goog.events.EventTarget.prototype.getListener = function(
    type, listener, capture, opt_listenerScope) {
  return this.eventTargetListeners_.getListener(
      String(type), listener, capture, opt_listenerScope);
};


/** @override */
goog.events.EventTarget.prototype.hasListener = function(
    opt_type, opt_capture) {
  var id = goog.isDef(opt_type) ? String(opt_type) : undefined;
  return this.eventTargetListeners_.hasListener(id, opt_capture);
};


/**
 * Sets the target to be used for {@code event.target} when firing
 * event. Mainly used for testing. For example, see
 * {@code goog.testing.events.mixinListenable}.
 * @param {!Object} target The target.
 */
goog.events.EventTarget.prototype.setTargetForTesting = function(target) {
  this.actualEventTarget_ = target;
};


/**
 * Asserts that the event target instance is initialized properly.
 * @private
 */
goog.events.EventTarget.prototype.assertInitialized_ = function() {
  goog.asserts.assert(
      this.eventTargetListeners_,
      'Event target is not initialized. Did you call the superclass ' +
      '(goog.events.EventTarget) constructor?');
};


/**
 * Dispatches the given event on the ancestorsTree.
 *
 * @param {!Object} target The target to dispatch on.
 * @param {goog.events.Event|Object|string} e The event object.
 * @param {Array.<goog.events.Listenable>=} opt_ancestorsTree The ancestors
 *     tree of the target, in reverse order from the closest ancestor
 *     to the root event target. May be null if the target has no ancestor.
 * @return {boolean} If anyone called preventDefault on the event object (or
 *     if any of the listeners returns false) this will also return false.
 * @private
 */
goog.events.EventTarget.dispatchEventInternal_ = function(
    target, e, opt_ancestorsTree) {
  var type = e.type || /** @type {string} */ (e);

  // If accepting a string or object, create a custom event object so that
  // preventDefault and stopPropagation work with the event.
  if (goog.isString(e)) {
    e = new goog.events.Event(e, target);
  } else if (!(e instanceof goog.events.Event)) {
    var oldEvent = e;
    e = new goog.events.Event(type, target);
    goog.object.extend(e, oldEvent);
  } else {
    e.target = e.target || target;
  }

  var rv = true, currentTarget;

  // Executes all capture listeners on the ancestors, if any.
  if (opt_ancestorsTree) {
    for (var i = opt_ancestorsTree.length - 1; !e.propagationStopped_ && i >= 0;
         i--) {
      currentTarget = e.currentTarget = opt_ancestorsTree[i];
      rv = currentTarget.fireListeners(type, true, e) && rv;
    }
  }

  // Executes capture and bubble listeners on the target.
  if (!e.propagationStopped_) {
    currentTarget = e.currentTarget = target;
    rv = currentTarget.fireListeners(type, true, e) && rv;
    if (!e.propagationStopped_) {
      rv = currentTarget.fireListeners(type, false, e) && rv;
    }
  }

  // Executes all bubble listeners on the ancestors, if any.
  if (opt_ancestorsTree) {
    for (i = 0; !e.propagationStopped_ && i < opt_ancestorsTree.length; i++) {
      currentTarget = e.currentTarget = opt_ancestorsTree[i];
      rv = currentTarget.fireListeners(type, false, e) && rv;
    }
  }

  return rv;
};

// FIXME: box style
goog.provide('olcs.DragBox');
goog.provide('olcs.DragBoxEventType');

goog.require('goog.asserts');
goog.require('goog.events.EventTarget');


/**
 * @enum {string}
 */
olcs.DragBoxEventType = {
  /**
   * Triggered upon drag box start.
   */
  BOXSTART: 'boxstart',
  /**
   * Triggered upon drag box end.
   */
  BOXEND: 'boxend'
};



/**
 * @constructor
 * @extends {goog.events.EventTarget}
 * @param {Object=} opt_options Options.
 * @api
 */
olcs.DragBox = function(opt_options) {

  var options = goog.isDef(opt_options) ? opt_options : {};

  goog.base(this);

  /**
   * @private
   * @type {Cesium.Scene}
   */
  this.scene_ = null;

  /**
   * @private
   * @type {Cesium.ScreenSpaceEventHandler}
   */
  this.handler_ = null;

  /**
   * @private
   * @type {Cesium.RectanglePrimitive}
   */
  this.box_ = new Cesium.RectanglePrimitive({
    asynchronous: false,
    rectangle: new Cesium.Rectangle(),
    material: Cesium.Material.fromType(Cesium.Material.ColorType)
  });

  // FIXME: configurable
  this.box_.material.uniforms.color = new Cesium.Color(0.0, 0.0, 1.0, 0.5);

  /**
   * @private
   * @type {Cesium.KeyboardEventModifier|undefined}
   */
  this.modifier_ = goog.isDef(options.modifier) ?
      options.modifier : Cesium.KeyboardEventModifier.SHIFT;

  /**
   * @private
   * @type {Cesium.Cartographic}
   */
  this.startPosition_ = null;

};
goog.inherits(olcs.DragBox, goog.events.EventTarget);


/**
 * @param {Object} event Mouse down event.
 */
olcs.DragBox.prototype.handleMouseDown = function(event) {
  var ellipsoid = this.scene_.globe.ellipsoid;
  var ray = this.scene_.camera.getPickRay(event.position);
  var intersection = this.scene_.globe.pick(ray, this.scene_);
  if (goog.isDef(intersection)) {
    this.handler_.setInputAction(goog.bind(this.handleMouseMove, this),
        Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    this.handler_.setInputAction(goog.bind(this.handleMouseUp, this),
        Cesium.ScreenSpaceEventType.LEFT_UP);

    if (goog.isDef(this.modifier_)) {
      // listen to the event with and without the modifier to be able to start
      // a box with the key pressed and finish it without.
      this.handler_.setInputAction(goog.bind(this.handleMouseMove, this),
          Cesium.ScreenSpaceEventType.MOUSE_MOVE, this.modifier_);
      this.handler_.setInputAction(goog.bind(this.handleMouseUp, this),
          Cesium.ScreenSpaceEventType.LEFT_UP, this.modifier_);
    }
    var cartographic = ellipsoid.cartesianToCartographic(intersection);
    var rectangle = this.box_.rectangle;
    rectangle.north = rectangle.south = cartographic.latitude;
    rectangle.east = rectangle.west = cartographic.longitude;
    this.box_.height = cartographic.height;

    this.box_.show = true;

    this.dispatchEvent({
      type: olcs.DragBoxEventType.BOXSTART,
      position: cartographic
    });

    goog.asserts.assert(!goog.isNull(this.box_));
    if (!this.scene_.primitives.contains(this.box_)) {
      this.scene_.primitives.add(this.box_);
    }
    this.scene_.screenSpaceCameraController.enableInputs = false;

    this.startPosition_ = cartographic;
  }
};


/**
 * @param {Object} event Mouse move event.
 */
olcs.DragBox.prototype.handleMouseMove = function(event) {
  var ellipsoid = this.scene_.globe.ellipsoid;
  var ray = this.scene_.camera.getPickRay(event.endPosition);
  var intersection = this.scene_.globe.pick(ray, this.scene_);
  if (goog.isDef(intersection)) {
    var cartographic = ellipsoid.cartesianToCartographic(intersection);
    this.box_.height = Math.max(this.box_.height, cartographic.height);

    if (cartographic.latitude < this.startPosition_.latitude) {
      this.box_.rectangle.south = cartographic.latitude;
    } else {
      this.box_.rectangle.north = cartographic.latitude;
    }
    if (cartographic.longitude < this.startPosition_.longitude) {
      this.box_.rectangle.west = cartographic.longitude;
    } else {
      this.box_.rectangle.east = cartographic.longitude;
    }
  }
};


/**
 * @param {Object} event Mouse up event.
 */
olcs.DragBox.prototype.handleMouseUp = function(event) {
  var ellipsoid = this.scene_.globe.ellipsoid;
  var ray = this.scene_.camera.getPickRay(event.position);
  var intersection = this.scene_.globe.pick(ray, this.scene_);
  if (goog.isDef(intersection)) {
    var cartographic = ellipsoid.cartesianToCartographic(intersection);

    this.box_.show = false;

    this.dispatchEvent({
      type: olcs.DragBoxEventType.BOXEND,
      position: cartographic
    });

    this.handler_.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_UP);
    this.handler_.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    if (goog.isDef(this.modifier_)) {
      this.handler_.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_UP,
          this.modifier_);
      this.handler_.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE,
          this.modifier_);
    }
  }
  this.scene_.screenSpaceCameraController.enableInputs = true;
};


/**
 * @param {Cesium.Scene} scene Scene.
 * @api
 */
olcs.DragBox.prototype.setScene = function(scene) {
  if (goog.isNull(scene)) {
    goog.asserts.assert(!goog.isNull(this.box_));
    if (this.scene_.primitives.contains(this.box_)) {
      this.scene_.primitives.remove(this.box_);
    }
    if (!goog.isNull(this.handler_)) {
      this.handler_.destroy();
      this.handler_ = null;
    }
  } else {
    goog.asserts.assert(scene.canvas);
    this.handler_ = new Cesium.ScreenSpaceEventHandler(scene.canvas);
    this.handler_.setInputAction(goog.bind(this.handleMouseDown, this),
        Cesium.ScreenSpaceEventType.LEFT_DOWN, this.modifier_);
  }
  this.scene_ = scene;
};


/**
 * Adds an event listener. A listener can only be added once to an
 * object and if it is added again the key for the listener is
 * returned. Note that if the existing listener is a one-off listener
 * (registered via listenOnce), it will no longer be a one-off
 * listener after a call to listen().
 *
 * @param {string|!goog.events.EventId.<EVENTOBJ>} type The event type id.
 * @param {function(this:SCOPE, EVENTOBJ):(boolean|undefined)} listener Callback
 *     method.
 * @param {boolean=} opt_useCapture Whether to fire in capture phase
 *     (defaults to false).
 * @param {SCOPE=} opt_listenerScope Object in whose scope to call the
 *     listener.
 * @return {goog.events.ListenableKey} Unique key for the listener.
 * @template SCOPE,EVENTOBJ
 * @api
 */
olcs.DragBox.prototype.listen;

// Copyright 2008 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Utilities for creating functions. Loosely inspired by the
 * java classes: http://goo.gl/GM0Hmu and http://goo.gl/6k7nI8.
 *
 * @author nicksantos@google.com (Nick Santos)
 */


goog.provide('goog.functions');


/**
 * Creates a function that always returns the same value.
 * @param {T} retValue The value to return.
 * @return {function():T} The new function.
 * @template T
 */
goog.functions.constant = function(retValue) {
  return function() {
    return retValue;
  };
};


/**
 * Always returns false.
 * @type {function(...): boolean}
 */
goog.functions.FALSE = goog.functions.constant(false);


/**
 * Always returns true.
 * @type {function(...): boolean}
 */
goog.functions.TRUE = goog.functions.constant(true);


/**
 * Always returns NULL.
 * @type {function(...): null}
 */
goog.functions.NULL = goog.functions.constant(null);


/**
 * A simple function that returns the first argument of whatever is passed
 * into it.
 * @param {T=} opt_returnValue The single value that will be returned.
 * @param {...*} var_args Optional trailing arguments. These are ignored.
 * @return {T} The first argument passed in, or undefined if nothing was passed.
 * @template T
 */
goog.functions.identity = function(opt_returnValue, var_args) {
  return opt_returnValue;
};


/**
 * Creates a function that always throws an error with the given message.
 * @param {string} message The error message.
 * @return {!Function} The error-throwing function.
 */
goog.functions.error = function(message) {
  return function() {
    throw Error(message);
  };
};


/**
 * Creates a function that throws the given object.
 * @param {*} err An object to be thrown.
 * @return {!Function} The error-throwing function.
 */
goog.functions.fail = function(err) {
  return function() {
    throw err;
  }
};


/**
 * Given a function, create a function that keeps opt_numArgs arguments and
 * silently discards all additional arguments.
 * @param {Function} f The original function.
 * @param {number=} opt_numArgs The number of arguments to keep. Defaults to 0.
 * @return {!Function} A version of f that only keeps the first opt_numArgs
 *     arguments.
 */
goog.functions.lock = function(f, opt_numArgs) {
  opt_numArgs = opt_numArgs || 0;
  return function() {
    return f.apply(this, Array.prototype.slice.call(arguments, 0, opt_numArgs));
  };
};


/**
 * Creates a function that returns its nth argument.
 * @param {number} n The position of the return argument.
 * @return {!Function} A new function.
 */
goog.functions.nth = function(n) {
  return function() {
    return arguments[n];
  };
};


/**
 * Given a function, create a new function that swallows its return value
 * and replaces it with a new one.
 * @param {Function} f A function.
 * @param {T} retValue A new return value.
 * @return {function(...[?]):T} A new function.
 * @template T
 */
goog.functions.withReturnValue = function(f, retValue) {
  return goog.functions.sequence(f, goog.functions.constant(retValue));
};


/**
 * Creates the composition of the functions passed in.
 * For example, (goog.functions.compose(f, g))(a) is equivalent to f(g(a)).
 * @param {function(...[?]):T} fn The final function.
 * @param {...Function} var_args A list of functions.
 * @return {function(...[?]):T} The composition of all inputs.
 * @template T
 */
goog.functions.compose = function(fn, var_args) {
  var functions = arguments;
  var length = functions.length;
  return function() {
    var result;
    if (length) {
      result = functions[length - 1].apply(this, arguments);
    }

    for (var i = length - 2; i >= 0; i--) {
      result = functions[i].call(this, result);
    }
    return result;
  };
};


/**
 * Creates a function that calls the functions passed in in sequence, and
 * returns the value of the last function. For example,
 * (goog.functions.sequence(f, g))(x) is equivalent to f(x),g(x).
 * @param {...Function} var_args A list of functions.
 * @return {!Function} A function that calls all inputs in sequence.
 */
goog.functions.sequence = function(var_args) {
  var functions = arguments;
  var length = functions.length;
  return function() {
    var result;
    for (var i = 0; i < length; i++) {
      result = functions[i].apply(this, arguments);
    }
    return result;
  };
};


/**
 * Creates a function that returns true if each of its components evaluates
 * to true. The components are evaluated in order, and the evaluation will be
 * short-circuited as soon as a function returns false.
 * For example, (goog.functions.and(f, g))(x) is equivalent to f(x) && g(x).
 * @param {...Function} var_args A list of functions.
 * @return {function(...[?]):boolean} A function that ANDs its component
 *      functions.
 */
goog.functions.and = function(var_args) {
  var functions = arguments;
  var length = functions.length;
  return function() {
    for (var i = 0; i < length; i++) {
      if (!functions[i].apply(this, arguments)) {
        return false;
      }
    }
    return true;
  };
};


/**
 * Creates a function that returns true if any of its components evaluates
 * to true. The components are evaluated in order, and the evaluation will be
 * short-circuited as soon as a function returns true.
 * For example, (goog.functions.or(f, g))(x) is equivalent to f(x) || g(x).
 * @param {...Function} var_args A list of functions.
 * @return {function(...[?]):boolean} A function that ORs its component
 *    functions.
 */
goog.functions.or = function(var_args) {
  var functions = arguments;
  var length = functions.length;
  return function() {
    for (var i = 0; i < length; i++) {
      if (functions[i].apply(this, arguments)) {
        return true;
      }
    }
    return false;
  };
};


/**
 * Creates a function that returns the Boolean opposite of a provided function.
 * For example, (goog.functions.not(f))(x) is equivalent to !f(x).
 * @param {!Function} f The original function.
 * @return {function(...[?]):boolean} A function that delegates to f and returns
 * opposite.
 */
goog.functions.not = function(f) {
  return function() {
    return !f.apply(this, arguments);
  };
};


/**
 * Generic factory function to construct an object given the constructor
 * and the arguments. Intended to be bound to create object factories.
 *
 * Callers should cast the result to the appropriate type for proper type
 * checking by the compiler.
 * @param {!Function} constructor The constructor for the Object.
 * @param {...*} var_args The arguments to be passed to the constructor.
 * @return {!Object} A new instance of the class given in {@code constructor}.
 */
goog.functions.create = function(constructor, var_args) {
  /**
 * @constructor
 * @final
 */
  var temp = function() {};
  temp.prototype = constructor.prototype;

  // obj will have constructor's prototype in its chain and
  // 'obj instanceof constructor' will be true.
  var obj = new temp();

  // obj is initialized by constructor.
  // arguments is only array-like so lacks shift(), but can be used with
  // the Array prototype function.
  constructor.apply(obj, Array.prototype.slice.call(arguments, 1));
  return obj;
};


/**
 * @define {boolean} Whether the return value cache should be used.
 *    This should only be used to disable caches when testing.
 */
goog.define('goog.functions.CACHE_RETURN_VALUE', true);


/**
 * Gives a wrapper function that caches the return value of a parameterless
 * function when first called.
 *
 * When called for the first time, the given function is called and its
 * return value is cached (thus this is only appropriate for idempotent
 * functions).  Subsequent calls will return the cached return value. This
 * allows the evaluation of expensive functions to be delayed until first used.
 *
 * To cache the return values of functions with parameters, see goog.memoize.
 *
 * @param {!function():T} fn A function to lazily evaluate.
 * @return {!function():T} A wrapped version the function.
 * @template T
 */
goog.functions.cacheReturnValue = function(fn) {
  var called = false;
  var value;

  return function() {
    if (!goog.functions.CACHE_RETURN_VALUE) {
      return fn();
    }

    if (!called) {
      value = fn();
      called = true;
    }

    return value;
  }
};

// Copyright 2012 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview A delayed callback that pegs to the next animation frame
 * instead of a user-configurable timeout.
 *
 */

goog.provide('goog.async.AnimationDelay');

goog.require('goog.Disposable');
goog.require('goog.events');
goog.require('goog.functions');



// TODO(nicksantos): Should we factor out the common code between this and
// goog.async.Delay? I'm not sure if there's enough code for this to really
// make sense. Subclassing seems like the wrong approach for a variety of
// reasons. Maybe there should be a common interface?



/**
 * A delayed callback that pegs to the next animation frame
 * instead of a user configurable timeout. By design, this should have
 * the same interface as goog.async.Delay.
 *
 * Uses requestAnimationFrame and friends when available, but falls
 * back to a timeout of goog.async.AnimationDelay.TIMEOUT.
 *
 * For more on requestAnimationFrame and how you can use it to create smoother
 * animations, see:
 * @see http://paulirish.com/2011/requestanimationframe-for-smart-animating/
 *
 * @param {function(number)} listener Function to call when the delay completes.
 *     Will be passed the timestamp when it's called, in unix ms.
 * @param {Window=} opt_window The window object to execute the delay in.
 *     Defaults to the global object.
 * @param {Object=} opt_handler The object scope to invoke the function in.
 * @constructor
 * @extends {goog.Disposable}
 * @final
 */
goog.async.AnimationDelay = function(listener, opt_window, opt_handler) {
  goog.async.AnimationDelay.base(this, 'constructor');

  /**
   * The function that will be invoked after a delay.
   * @type {function(number)}
   * @private
   */
  this.listener_ = listener;

  /**
   * The object context to invoke the callback in.
   * @type {Object|undefined}
   * @private
   */
  this.handler_ = opt_handler;

  /**
   * @type {Window}
   * @private
   */
  this.win_ = opt_window || window;

  /**
   * Cached callback function invoked when the delay finishes.
   * @type {function()}
   * @private
   */
  this.callback_ = goog.bind(this.doAction_, this);
};
goog.inherits(goog.async.AnimationDelay, goog.Disposable);


/**
 * Identifier of the active delay timeout, or event listener,
 * or null when inactive.
 * @type {goog.events.Key|number|null}
 * @private
 */
goog.async.AnimationDelay.prototype.id_ = null;


/**
 * If we're using dom listeners.
 * @type {?boolean}
 * @private
 */
goog.async.AnimationDelay.prototype.usingListeners_ = false;


/**
 * Default wait timeout for animations (in milliseconds).  Only used for timed
 * animation, which uses a timer (setTimeout) to schedule animation.
 *
 * @type {number}
 * @const
 */
goog.async.AnimationDelay.TIMEOUT = 20;


/**
 * Name of event received from the requestAnimationFrame in Firefox.
 *
 * @type {string}
 * @const
 * @private
 */
goog.async.AnimationDelay.MOZ_BEFORE_PAINT_EVENT_ = 'MozBeforePaint';


/**
 * Starts the delay timer. The provided listener function will be called
 * before the next animation frame.
 */
goog.async.AnimationDelay.prototype.start = function() {
  this.stop();
  this.usingListeners_ = false;

  var raf = this.getRaf_();
  var cancelRaf = this.getCancelRaf_();
  if (raf && !cancelRaf && this.win_.mozRequestAnimationFrame) {
    // Because Firefox (Gecko) runs animation in separate threads, it also saves
    // time by running the requestAnimationFrame callbacks in that same thread.
    // Sadly this breaks the assumption of implicit thread-safety in JS, and can
    // thus create thread-based inconsistencies on counters etc.
    //
    // Calling cycleAnimations_ using the MozBeforePaint event instead of as
    // callback fixes this.
    //
    // Trigger this condition only if the mozRequestAnimationFrame is available,
    // but not the W3C requestAnimationFrame function (as in draft) or the
    // equivalent cancel functions.
    this.id_ = goog.events.listen(
        this.win_,
        goog.async.AnimationDelay.MOZ_BEFORE_PAINT_EVENT_,
        this.callback_);
    this.win_.mozRequestAnimationFrame(null);
    this.usingListeners_ = true;
  } else if (raf && cancelRaf) {
    this.id_ = raf.call(this.win_, this.callback_);
  } else {
    this.id_ = this.win_.setTimeout(
        // Prior to Firefox 13, Gecko passed a non-standard parameter
        // to the callback that we want to ignore.
        goog.functions.lock(this.callback_),
        goog.async.AnimationDelay.TIMEOUT);
  }
};


/**
 * Stops the delay timer if it is active. No action is taken if the timer is not
 * in use.
 */
goog.async.AnimationDelay.prototype.stop = function() {
  if (this.isActive()) {
    var raf = this.getRaf_();
    var cancelRaf = this.getCancelRaf_();
    if (raf && !cancelRaf && this.win_.mozRequestAnimationFrame) {
      goog.events.unlistenByKey(this.id_);
    } else if (raf && cancelRaf) {
      cancelRaf.call(this.win_, /** @type {number} */ (this.id_));
    } else {
      this.win_.clearTimeout(/** @type {number} */ (this.id_));
    }
  }
  this.id_ = null;
};


/**
 * Fires delay's action even if timer has already gone off or has not been
 * started yet; guarantees action firing. Stops the delay timer.
 */
goog.async.AnimationDelay.prototype.fire = function() {
  this.stop();
  this.doAction_();
};


/**
 * Fires delay's action only if timer is currently active. Stops the delay
 * timer.
 */
goog.async.AnimationDelay.prototype.fireIfActive = function() {
  if (this.isActive()) {
    this.fire();
  }
};


/**
 * @return {boolean} True if the delay is currently active, false otherwise.
 */
goog.async.AnimationDelay.prototype.isActive = function() {
  return this.id_ != null;
};


/**
 * Invokes the callback function after the delay successfully completes.
 * @private
 */
goog.async.AnimationDelay.prototype.doAction_ = function() {
  if (this.usingListeners_ && this.id_) {
    goog.events.unlistenByKey(this.id_);
  }
  this.id_ = null;

  // We are not using the timestamp returned by requestAnimationFrame
  // because it may be either a Date.now-style time or a
  // high-resolution time (depending on browser implementation). Using
  // goog.now() will ensure that the timestamp used is consistent and
  // compatible with goog.fx.Animation.
  this.listener_.call(this.handler_, goog.now());
};


/** @override */
goog.async.AnimationDelay.prototype.disposeInternal = function() {
  this.stop();
  goog.async.AnimationDelay.base(this, 'disposeInternal');
};


/**
 * @return {?function(function(number)): number} The requestAnimationFrame
 *     function, or null if not available on this browser.
 * @private
 */
goog.async.AnimationDelay.prototype.getRaf_ = function() {
  var win = this.win_;
  return win.requestAnimationFrame ||
      win.webkitRequestAnimationFrame ||
      win.mozRequestAnimationFrame ||
      win.oRequestAnimationFrame ||
      win.msRequestAnimationFrame ||
      null;
};


/**
 * @return {?function(number): number} The cancelAnimationFrame function,
 *     or null if not available on this browser.
 * @private
 */
goog.async.AnimationDelay.prototype.getCancelRaf_ = function() {
  var win = this.win_;
  return win.cancelRequestAnimationFrame ||
      win.webkitCancelRequestAnimationFrame ||
      win.mozCancelRequestAnimationFrame ||
      win.oCancelRequestAnimationFrame ||
      win.msCancelRequestAnimationFrame ||
      null;
};

// Copyright 2010 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Browser capability checks for the dom package.
 *
 */


goog.provide('goog.dom.BrowserFeature');

goog.require('goog.userAgent');


/**
 * Enum of browser capabilities.
 * @enum {boolean}
 */
goog.dom.BrowserFeature = {
  /**
   * Whether attributes 'name' and 'type' can be added to an element after it's
   * created. False in Internet Explorer prior to version 9.
   */
  CAN_ADD_NAME_OR_TYPE_ATTRIBUTES: !goog.userAgent.IE ||
      goog.userAgent.isDocumentModeOrHigher(9),

  /**
   * Whether we can use element.children to access an element's Element
   * children. Available since Gecko 1.9.1, IE 9. (IE<9 also includes comment
   * nodes in the collection.)
   */
  CAN_USE_CHILDREN_ATTRIBUTE: !goog.userAgent.GECKO && !goog.userAgent.IE ||
      goog.userAgent.IE && goog.userAgent.isDocumentModeOrHigher(9) ||
      goog.userAgent.GECKO && goog.userAgent.isVersionOrHigher('1.9.1'),

  /**
   * Opera, Safari 3, and Internet Explorer 9 all support innerText but they
   * include text nodes in script and style tags. Not document-mode-dependent.
   */
  CAN_USE_INNER_TEXT: (
      goog.userAgent.IE && !goog.userAgent.isVersionOrHigher('9')),

  /**
   * MSIE, Opera, and Safari>=4 support element.parentElement to access an
   * element's parent if it is an Element.
   */
  CAN_USE_PARENT_ELEMENT_PROPERTY: goog.userAgent.IE || goog.userAgent.OPERA ||
      goog.userAgent.WEBKIT,

  /**
   * Whether NoScope elements need a scoped element written before them in
   * innerHTML.
   * MSDN: http://msdn.microsoft.com/en-us/library/ms533897(VS.85).aspx#1
   */
  INNER_HTML_NEEDS_SCOPED_ELEMENT: goog.userAgent.IE
};

// Copyright 2007 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Defines the goog.dom.TagName enum.  This enumerates
 * all HTML tag names specified in either the the W3C HTML 4.01 index of
 * elements or the HTML5 draft specification.
 *
 * References:
 * http://www.w3.org/TR/html401/index/elements.html
 * http://dev.w3.org/html5/spec/section-index.html
 *
 */
goog.provide('goog.dom.TagName');


/**
 * Enum of all html tag names specified by the W3C HTML4.01 and HTML5
 * specifications.
 * @enum {string}
 */
goog.dom.TagName = {
  A: 'A',
  ABBR: 'ABBR',
  ACRONYM: 'ACRONYM',
  ADDRESS: 'ADDRESS',
  APPLET: 'APPLET',
  AREA: 'AREA',
  ARTICLE: 'ARTICLE',
  ASIDE: 'ASIDE',
  AUDIO: 'AUDIO',
  B: 'B',
  BASE: 'BASE',
  BASEFONT: 'BASEFONT',
  BDI: 'BDI',
  BDO: 'BDO',
  BIG: 'BIG',
  BLOCKQUOTE: 'BLOCKQUOTE',
  BODY: 'BODY',
  BR: 'BR',
  BUTTON: 'BUTTON',
  CANVAS: 'CANVAS',
  CAPTION: 'CAPTION',
  CENTER: 'CENTER',
  CITE: 'CITE',
  CODE: 'CODE',
  COL: 'COL',
  COLGROUP: 'COLGROUP',
  COMMAND: 'COMMAND',
  DATA: 'DATA',
  DATALIST: 'DATALIST',
  DD: 'DD',
  DEL: 'DEL',
  DETAILS: 'DETAILS',
  DFN: 'DFN',
  DIALOG: 'DIALOG',
  DIR: 'DIR',
  DIV: 'DIV',
  DL: 'DL',
  DT: 'DT',
  EM: 'EM',
  EMBED: 'EMBED',
  FIELDSET: 'FIELDSET',
  FIGCAPTION: 'FIGCAPTION',
  FIGURE: 'FIGURE',
  FONT: 'FONT',
  FOOTER: 'FOOTER',
  FORM: 'FORM',
  FRAME: 'FRAME',
  FRAMESET: 'FRAMESET',
  H1: 'H1',
  H2: 'H2',
  H3: 'H3',
  H4: 'H4',
  H5: 'H5',
  H6: 'H6',
  HEAD: 'HEAD',
  HEADER: 'HEADER',
  HGROUP: 'HGROUP',
  HR: 'HR',
  HTML: 'HTML',
  I: 'I',
  IFRAME: 'IFRAME',
  IMG: 'IMG',
  INPUT: 'INPUT',
  INS: 'INS',
  ISINDEX: 'ISINDEX',
  KBD: 'KBD',
  KEYGEN: 'KEYGEN',
  LABEL: 'LABEL',
  LEGEND: 'LEGEND',
  LI: 'LI',
  LINK: 'LINK',
  MAP: 'MAP',
  MARK: 'MARK',
  MATH: 'MATH',
  MENU: 'MENU',
  META: 'META',
  METER: 'METER',
  NAV: 'NAV',
  NOFRAMES: 'NOFRAMES',
  NOSCRIPT: 'NOSCRIPT',
  OBJECT: 'OBJECT',
  OL: 'OL',
  OPTGROUP: 'OPTGROUP',
  OPTION: 'OPTION',
  OUTPUT: 'OUTPUT',
  P: 'P',
  PARAM: 'PARAM',
  PRE: 'PRE',
  PROGRESS: 'PROGRESS',
  Q: 'Q',
  RP: 'RP',
  RT: 'RT',
  RUBY: 'RUBY',
  S: 'S',
  SAMP: 'SAMP',
  SCRIPT: 'SCRIPT',
  SECTION: 'SECTION',
  SELECT: 'SELECT',
  SMALL: 'SMALL',
  SOURCE: 'SOURCE',
  SPAN: 'SPAN',
  STRIKE: 'STRIKE',
  STRONG: 'STRONG',
  STYLE: 'STYLE',
  SUB: 'SUB',
  SUMMARY: 'SUMMARY',
  SUP: 'SUP',
  SVG: 'SVG',
  TABLE: 'TABLE',
  TBODY: 'TBODY',
  TD: 'TD',
  TEXTAREA: 'TEXTAREA',
  TFOOT: 'TFOOT',
  TH: 'TH',
  THEAD: 'THEAD',
  TIME: 'TIME',
  TITLE: 'TITLE',
  TR: 'TR',
  TRACK: 'TRACK',
  TT: 'TT',
  U: 'U',
  UL: 'UL',
  VAR: 'VAR',
  VIDEO: 'VIDEO',
  WBR: 'WBR'
};

// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Utilities for adding, removing and setting classes.  Prefer
 * {@link goog.dom.classlist} over these utilities since goog.dom.classlist
 * conforms closer to the semantics of Element.classList, is faster (uses
 * native methods rather than parsing strings on every call) and compiles
 * to smaller code as a result.
 *
 * Note: these utilities are meant to operate on HTMLElements and
 * will not work on elements with differing interfaces (such as SVGElements).
 *
 */


goog.provide('goog.dom.classes');

goog.require('goog.array');


/**
 * Sets the entire class name of an element.
 * @param {Node} element DOM node to set class of.
 * @param {string} className Class name(s) to apply to element.
 * @deprecated Use goog.dom.classlist.set instead.
 */
goog.dom.classes.set = function(element, className) {
  element.className = className;
};


/**
 * Gets an array of class names on an element
 * @param {Node} element DOM node to get class of.
 * @return {!Array} Class names on {@code element}. Some browsers add extra
 *     properties to the array. Do not depend on any of these!
 * @deprecated Use goog.dom.classlist.get instead.
 */
goog.dom.classes.get = function(element) {
  var className = element.className;
  // Some types of elements don't have a className in IE (e.g. iframes).
  // Furthermore, in Firefox, className is not a string when the element is
  // an SVG element.
  return goog.isString(className) && className.match(/\S+/g) || [];
};


/**
 * Adds a class or classes to an element. Does not add multiples of class names.
 * @param {Node} element DOM node to add class to.
 * @param {...string} var_args Class names to add.
 * @return {boolean} Whether class was added (or all classes were added).
 * @deprecated Use goog.dom.classlist.add or goog.dom.classlist.addAll instead.
 */
goog.dom.classes.add = function(element, var_args) {
  var classes = goog.dom.classes.get(element);
  var args = goog.array.slice(arguments, 1);
  var expectedCount = classes.length + args.length;
  goog.dom.classes.add_(classes, args);
  goog.dom.classes.set(element, classes.join(' '));
  return classes.length == expectedCount;
};


/**
 * Removes a class or classes from an element.
 * @param {Node} element DOM node to remove class from.
 * @param {...string} var_args Class name(s) to remove.
 * @return {boolean} Whether all classes in {@code var_args} were found and
 *     removed.
 * @deprecated Use goog.dom.classlist.remove or goog.dom.classlist.removeAll
 *     instead.
 */
goog.dom.classes.remove = function(element, var_args) {
  var classes = goog.dom.classes.get(element);
  var args = goog.array.slice(arguments, 1);
  var newClasses = goog.dom.classes.getDifference_(classes, args);
  goog.dom.classes.set(element, newClasses.join(' '));
  return newClasses.length == classes.length - args.length;
};


/**
 * Helper method for {@link goog.dom.classes.add} and
 * {@link goog.dom.classes.addRemove}. Adds one or more classes to the supplied
 * classes array.
 * @param {Array.<string>} classes All class names for the element, will be
 *     updated to have the classes supplied in {@code args} added.
 * @param {Array.<string>} args Class names to add.
 * @private
 */
goog.dom.classes.add_ = function(classes, args) {
  for (var i = 0; i < args.length; i++) {
    if (!goog.array.contains(classes, args[i])) {
      classes.push(args[i]);
    }
  }
};


/**
 * Helper method for {@link goog.dom.classes.remove} and
 * {@link goog.dom.classes.addRemove}. Calculates the difference of two arrays.
 * @param {!Array.<string>} arr1 First array.
 * @param {!Array.<string>} arr2 Second array.
 * @return {!Array.<string>} The first array without the elements of the second
 *     array.
 * @private
 */
goog.dom.classes.getDifference_ = function(arr1, arr2) {
  return goog.array.filter(arr1, function(item) {
    return !goog.array.contains(arr2, item);
  });
};


/**
 * Switches a class on an element from one to another without disturbing other
 * classes. If the fromClass isn't removed, the toClass won't be added.
 * @param {Node} element DOM node to swap classes on.
 * @param {string} fromClass Class to remove.
 * @param {string} toClass Class to add.
 * @return {boolean} Whether classes were switched.
 * @deprecated Use goog.dom.classlist.swap instead.
 */
goog.dom.classes.swap = function(element, fromClass, toClass) {
  var classes = goog.dom.classes.get(element);

  var removed = false;
  for (var i = 0; i < classes.length; i++) {
    if (classes[i] == fromClass) {
      goog.array.splice(classes, i--, 1);
      removed = true;
    }
  }

  if (removed) {
    classes.push(toClass);
    goog.dom.classes.set(element, classes.join(' '));
  }

  return removed;
};


/**
 * Adds zero or more classes to an element and removes zero or more as a single
 * operation. Unlike calling {@link goog.dom.classes.add} and
 * {@link goog.dom.classes.remove} separately, this is more efficient as it only
 * parses the class property once.
 *
 * If a class is in both the remove and add lists, it will be added. Thus,
 * you can use this instead of {@link goog.dom.classes.swap} when you have
 * more than two class names that you want to swap.
 *
 * @param {Node} element DOM node to swap classes on.
 * @param {?(string|Array.<string>)} classesToRemove Class or classes to
 *     remove, if null no classes are removed.
 * @param {?(string|Array.<string>)} classesToAdd Class or classes to add, if
 *     null no classes are added.
 * @deprecated Use goog.dom.classlist.addRemove instead.
 */
goog.dom.classes.addRemove = function(element, classesToRemove, classesToAdd) {
  var classes = goog.dom.classes.get(element);
  if (goog.isString(classesToRemove)) {
    goog.array.remove(classes, classesToRemove);
  } else if (goog.isArray(classesToRemove)) {
    classes = goog.dom.classes.getDifference_(classes, classesToRemove);
  }

  if (goog.isString(classesToAdd) &&
      !goog.array.contains(classes, classesToAdd)) {
    classes.push(classesToAdd);
  } else if (goog.isArray(classesToAdd)) {
    goog.dom.classes.add_(classes, classesToAdd);
  }

  goog.dom.classes.set(element, classes.join(' '));
};


/**
 * Returns true if an element has a class.
 * @param {Node} element DOM node to test.
 * @param {string} className Class name to test for.
 * @return {boolean} Whether element has the class.
 * @deprecated Use goog.dom.classlist.contains instead.
 */
goog.dom.classes.has = function(element, className) {
  return goog.array.contains(goog.dom.classes.get(element), className);
};


/**
 * Adds or removes a class depending on the enabled argument.
 * @param {Node} element DOM node to add or remove the class on.
 * @param {string} className Class name to add or remove.
 * @param {boolean} enabled Whether to add or remove the class (true adds,
 *     false removes).
 * @deprecated Use goog.dom.classlist.enable or goog.dom.classlist.enableAll
 *     instead.
 */
goog.dom.classes.enable = function(element, className, enabled) {
  if (enabled) {
    goog.dom.classes.add(element, className);
  } else {
    goog.dom.classes.remove(element, className);
  }
};


/**
 * Removes a class if an element has it, and adds it the element doesn't have
 * it.  Won't affect other classes on the node.
 * @param {Node} element DOM node to toggle class on.
 * @param {string} className Class to toggle.
 * @return {boolean} True if class was added, false if it was removed
 *     (in other words, whether element has the class after this function has
 *     been called).
 * @deprecated Use goog.dom.classlist.toggle instead.
 */
goog.dom.classes.toggle = function(element, className) {
  var add = !goog.dom.classes.has(element, className);
  goog.dom.classes.enable(element, className, add);
  return add;
};

// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Additional mathematical functions.
 */

goog.provide('goog.math');

goog.require('goog.array');
goog.require('goog.asserts');


/**
 * Returns a random integer greater than or equal to 0 and less than {@code a}.
 * @param {number} a  The upper bound for the random integer (exclusive).
 * @return {number} A random integer N such that 0 <= N < a.
 */
goog.math.randomInt = function(a) {
  return Math.floor(Math.random() * a);
};


/**
 * Returns a random number greater than or equal to {@code a} and less than
 * {@code b}.
 * @param {number} a  The lower bound for the random number (inclusive).
 * @param {number} b  The upper bound for the random number (exclusive).
 * @return {number} A random number N such that a <= N < b.
 */
goog.math.uniformRandom = function(a, b) {
  return a + Math.random() * (b - a);
};


/**
 * Takes a number and clamps it to within the provided bounds.
 * @param {number} value The input number.
 * @param {number} min The minimum value to return.
 * @param {number} max The maximum value to return.
 * @return {number} The input number if it is within bounds, or the nearest
 *     number within the bounds.
 */
goog.math.clamp = function(value, min, max) {
  return Math.min(Math.max(value, min), max);
};


/**
 * The % operator in JavaScript returns the remainder of a / b, but differs from
 * some other languages in that the result will have the same sign as the
 * dividend. For example, -1 % 8 == -1, whereas in some other languages
 * (such as Python) the result would be 7. This function emulates the more
 * correct modulo behavior, which is useful for certain applications such as
 * calculating an offset index in a circular list.
 *
 * @param {number} a The dividend.
 * @param {number} b The divisor.
 * @return {number} a % b where the result is between 0 and b (either 0 <= x < b
 *     or b < x <= 0, depending on the sign of b).
 */
goog.math.modulo = function(a, b) {
  var r = a % b;
  // If r and b differ in sign, add b to wrap the result to the correct sign.
  return (r * b < 0) ? r + b : r;
};


/**
 * Performs linear interpolation between values a and b. Returns the value
 * between a and b proportional to x (when x is between 0 and 1. When x is
 * outside this range, the return value is a linear extrapolation).
 * @param {number} a A number.
 * @param {number} b A number.
 * @param {number} x The proportion between a and b.
 * @return {number} The interpolated value between a and b.
 */
goog.math.lerp = function(a, b, x) {
  return a + x * (b - a);
};


/**
 * Tests whether the two values are equal to each other, within a certain
 * tolerance to adjust for floating point errors.
 * @param {number} a A number.
 * @param {number} b A number.
 * @param {number=} opt_tolerance Optional tolerance range. Defaults
 *     to 0.000001. If specified, should be greater than 0.
 * @return {boolean} Whether {@code a} and {@code b} are nearly equal.
 */
goog.math.nearlyEquals = function(a, b, opt_tolerance) {
  return Math.abs(a - b) <= (opt_tolerance || 0.000001);
};


// TODO(user): Rename to normalizeAngle, retaining old name as deprecated
// alias.
/**
 * Normalizes an angle to be in range [0-360). Angles outside this range will
 * be normalized to be the equivalent angle with that range.
 * @param {number} angle Angle in degrees.
 * @return {number} Standardized angle.
 */
goog.math.standardAngle = function(angle) {
  return goog.math.modulo(angle, 360);
};


/**
 * Normalizes an angle to be in range [0-2*PI). Angles outside this range will
 * be normalized to be the equivalent angle with that range.
 * @param {number} angle Angle in radians.
 * @return {number} Standardized angle.
 */
goog.math.standardAngleInRadians = function(angle) {
  return goog.math.modulo(angle, 2 * Math.PI);
};


/**
 * Converts degrees to radians.
 * @param {number} angleDegrees Angle in degrees.
 * @return {number} Angle in radians.
 */
goog.math.toRadians = function(angleDegrees) {
  return angleDegrees * Math.PI / 180;
};


/**
 * Converts radians to degrees.
 * @param {number} angleRadians Angle in radians.
 * @return {number} Angle in degrees.
 */
goog.math.toDegrees = function(angleRadians) {
  return angleRadians * 180 / Math.PI;
};


/**
 * For a given angle and radius, finds the X portion of the offset.
 * @param {number} degrees Angle in degrees (zero points in +X direction).
 * @param {number} radius Radius.
 * @return {number} The x-distance for the angle and radius.
 */
goog.math.angleDx = function(degrees, radius) {
  return radius * Math.cos(goog.math.toRadians(degrees));
};


/**
 * For a given angle and radius, finds the Y portion of the offset.
 * @param {number} degrees Angle in degrees (zero points in +X direction).
 * @param {number} radius Radius.
 * @return {number} The y-distance for the angle and radius.
 */
goog.math.angleDy = function(degrees, radius) {
  return radius * Math.sin(goog.math.toRadians(degrees));
};


/**
 * Computes the angle between two points (x1,y1) and (x2,y2).
 * Angle zero points in the +X direction, 90 degrees points in the +Y
 * direction (down) and from there we grow clockwise towards 360 degrees.
 * @param {number} x1 x of first point.
 * @param {number} y1 y of first point.
 * @param {number} x2 x of second point.
 * @param {number} y2 y of second point.
 * @return {number} Standardized angle in degrees of the vector from
 *     x1,y1 to x2,y2.
 */
goog.math.angle = function(x1, y1, x2, y2) {
  return goog.math.standardAngle(goog.math.toDegrees(Math.atan2(y2 - y1,
                                                                x2 - x1)));
};


/**
 * Computes the difference between startAngle and endAngle (angles in degrees).
 * @param {number} startAngle  Start angle in degrees.
 * @param {number} endAngle  End angle in degrees.
 * @return {number} The number of degrees that when added to
 *     startAngle will result in endAngle. Positive numbers mean that the
 *     direction is clockwise. Negative numbers indicate a counter-clockwise
 *     direction.
 *     The shortest route (clockwise vs counter-clockwise) between the angles
 *     is used.
 *     When the difference is 180 degrees, the function returns 180 (not -180)
 *     angleDifference(30, 40) is 10, and angleDifference(40, 30) is -10.
 *     angleDifference(350, 10) is 20, and angleDifference(10, 350) is -20.
 */
goog.math.angleDifference = function(startAngle, endAngle) {
  var d = goog.math.standardAngle(endAngle) -
          goog.math.standardAngle(startAngle);
  if (d > 180) {
    d = d - 360;
  } else if (d <= -180) {
    d = 360 + d;
  }
  return d;
};


/**
 * Returns the sign of a number as per the "sign" or "signum" function.
 * @param {number} x The number to take the sign of.
 * @return {number} -1 when negative, 1 when positive, 0 when 0.
 */
goog.math.sign = function(x) {
  return x == 0 ? 0 : (x < 0 ? -1 : 1);
};


/**
 * JavaScript implementation of Longest Common Subsequence problem.
 * http://en.wikipedia.org/wiki/Longest_common_subsequence
 *
 * Returns the longest possible array that is subarray of both of given arrays.
 *
 * @param {Array.<Object>} array1 First array of objects.
 * @param {Array.<Object>} array2 Second array of objects.
 * @param {Function=} opt_compareFn Function that acts as a custom comparator
 *     for the array ojects. Function should return true if objects are equal,
 *     otherwise false.
 * @param {Function=} opt_collectorFn Function used to decide what to return
 *     as a result subsequence. It accepts 2 arguments: index of common element
 *     in the first array and index in the second. The default function returns
 *     element from the first array.
 * @return {!Array.<Object>} A list of objects that are common to both arrays
 *     such that there is no common subsequence with size greater than the
 *     length of the list.
 */
goog.math.longestCommonSubsequence = function(
    array1, array2, opt_compareFn, opt_collectorFn) {

  var compare = opt_compareFn || function(a, b) {
    return a == b;
  };

  var collect = opt_collectorFn || function(i1, i2) {
    return array1[i1];
  };

  var length1 = array1.length;
  var length2 = array2.length;

  var arr = [];
  for (var i = 0; i < length1 + 1; i++) {
    arr[i] = [];
    arr[i][0] = 0;
  }

  for (var j = 0; j < length2 + 1; j++) {
    arr[0][j] = 0;
  }

  for (i = 1; i <= length1; i++) {
    for (j = 1; j <= length2; j++) {
      if (compare(array1[i - 1], array2[j - 1])) {
        arr[i][j] = arr[i - 1][j - 1] + 1;
      } else {
        arr[i][j] = Math.max(arr[i - 1][j], arr[i][j - 1]);
      }
    }
  }

  // Backtracking
  var result = [];
  var i = length1, j = length2;
  while (i > 0 && j > 0) {
    if (compare(array1[i - 1], array2[j - 1])) {
      result.unshift(collect(i - 1, j - 1));
      i--;
      j--;
    } else {
      if (arr[i - 1][j] > arr[i][j - 1]) {
        i--;
      } else {
        j--;
      }
    }
  }

  return result;
};


/**
 * Returns the sum of the arguments.
 * @param {...number} var_args Numbers to add.
 * @return {number} The sum of the arguments (0 if no arguments were provided,
 *     {@code NaN} if any of the arguments is not a valid number).
 */
goog.math.sum = function(var_args) {
  return /** @type {number} */ (goog.array.reduce(arguments,
      function(sum, value) {
        return sum + value;
      }, 0));
};


/**
 * Returns the arithmetic mean of the arguments.
 * @param {...number} var_args Numbers to average.
 * @return {number} The average of the arguments ({@code NaN} if no arguments
 *     were provided or any of the arguments is not a valid number).
 */
goog.math.average = function(var_args) {
  return goog.math.sum.apply(null, arguments) / arguments.length;
};


/**
 * Returns the unbiased sample variance of the arguments. For a definition,
 * see e.g. http://en.wikipedia.org/wiki/Variance
 * @param {...number} var_args Number samples to analyze.
 * @return {number} The unbiased sample variance of the arguments (0 if fewer
 *     than two samples were provided, or {@code NaN} if any of the samples is
 *     not a valid number).
 */
goog.math.sampleVariance = function(var_args) {
  var sampleSize = arguments.length;
  if (sampleSize < 2) {
    return 0;
  }

  var mean = goog.math.average.apply(null, arguments);
  var variance = goog.math.sum.apply(null, goog.array.map(arguments,
      function(val) {
        return Math.pow(val - mean, 2);
      })) / (sampleSize - 1);

  return variance;
};


/**
 * Returns the sample standard deviation of the arguments.  For a definition of
 * sample standard deviation, see e.g.
 * http://en.wikipedia.org/wiki/Standard_deviation
 * @param {...number} var_args Number samples to analyze.
 * @return {number} The sample standard deviation of the arguments (0 if fewer
 *     than two samples were provided, or {@code NaN} if any of the samples is
 *     not a valid number).
 */
goog.math.standardDeviation = function(var_args) {
  return Math.sqrt(goog.math.sampleVariance.apply(null, arguments));
};


/**
 * Returns whether the supplied number represents an integer, i.e. that is has
 * no fractional component.  No range-checking is performed on the number.
 * @param {number} num The number to test.
 * @return {boolean} Whether {@code num} is an integer.
 */
goog.math.isInt = function(num) {
  return isFinite(num) && num % 1 == 0;
};


/**
 * Returns whether the supplied number is finite and not NaN.
 * @param {number} num The number to test.
 * @return {boolean} Whether {@code num} is a finite number.
 */
goog.math.isFiniteNumber = function(num) {
  return isFinite(num) && !isNaN(num);
};


/**
 * Returns the precise value of floor(log10(num)).
 * Simpler implementations didn't work because of floating point rounding
 * errors. For example
 * <ul>
 * <li>Math.floor(Math.log(num) / Math.LN10) is off by one for num == 1e+3.
 * <li>Math.floor(Math.log(num) * Math.LOG10E) is off by one for num == 1e+15.
 * <li>Math.floor(Math.log10(num)) is off by one for num == 1e+15 - 1.
 * </ul>
 * @param {number} num A floating point number.
 * @return {number} Its logarithm to base 10 rounded down to the nearest
 *     integer if num > 0. -Infinity if num == 0. NaN if num < 0.
 */
goog.math.log10Floor = function(num) {
  if (num > 0) {
    var x = Math.round(Math.log(num) * Math.LOG10E);
    return x - (parseFloat('1e' + x) > num);
  }
  return num == 0 ? -Infinity : NaN;
};


/**
 * A tweaked variant of {@code Math.floor} which tolerates if the passed number
 * is infinitesimally smaller than the closest integer. It often happens with
 * the results of floating point calculations because of the finite precision
 * of the intermediate results. For example {@code Math.floor(Math.log(1000) /
 * Math.LN10) == 2}, not 3 as one would expect.
 * @param {number} num A number.
 * @param {number=} opt_epsilon An infinitesimally small positive number, the
 *     rounding error to tolerate.
 * @return {number} The largest integer less than or equal to {@code num}.
 */
goog.math.safeFloor = function(num, opt_epsilon) {
  goog.asserts.assert(!goog.isDef(opt_epsilon) || opt_epsilon > 0);
  return Math.floor(num + (opt_epsilon || 2e-15));
};


/**
 * A tweaked variant of {@code Math.ceil}. See {@code goog.math.safeFloor} for
 * details.
 * @param {number} num A number.
 * @param {number=} opt_epsilon An infinitesimally small positive number, the
 *     rounding error to tolerate.
 * @return {number} The smallest integer greater than or equal to {@code num}.
 */
goog.math.safeCeil = function(num, opt_epsilon) {
  goog.asserts.assert(!goog.isDef(opt_epsilon) || opt_epsilon > 0);
  return Math.ceil(num - (opt_epsilon || 2e-15));
};

// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview A utility class for representing two-dimensional positions.
 */


goog.provide('goog.math.Coordinate');

goog.require('goog.math');



/**
 * Class for representing coordinates and positions.
 * @param {number=} opt_x Left, defaults to 0.
 * @param {number=} opt_y Top, defaults to 0.
 * @constructor
 */
goog.math.Coordinate = function(opt_x, opt_y) {
  /**
   * X-value
   * @type {number}
   */
  this.x = goog.isDef(opt_x) ? opt_x : 0;

  /**
   * Y-value
   * @type {number}
   */
  this.y = goog.isDef(opt_y) ? opt_y : 0;
};


/**
 * Returns a new copy of the coordinate.
 * @return {!goog.math.Coordinate} A clone of this coordinate.
 */
goog.math.Coordinate.prototype.clone = function() {
  return new goog.math.Coordinate(this.x, this.y);
};


if (goog.DEBUG) {
  /**
   * Returns a nice string representing the coordinate.
   * @return {string} In the form (50, 73).
   * @override
   */
  goog.math.Coordinate.prototype.toString = function() {
    return '(' + this.x + ', ' + this.y + ')';
  };
}


/**
 * Compares coordinates for equality.
 * @param {goog.math.Coordinate} a A Coordinate.
 * @param {goog.math.Coordinate} b A Coordinate.
 * @return {boolean} True iff the coordinates are equal, or if both are null.
 */
goog.math.Coordinate.equals = function(a, b) {
  if (a == b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  return a.x == b.x && a.y == b.y;
};


/**
 * Returns the distance between two coordinates.
 * @param {!goog.math.Coordinate} a A Coordinate.
 * @param {!goog.math.Coordinate} b A Coordinate.
 * @return {number} The distance between {@code a} and {@code b}.
 */
goog.math.Coordinate.distance = function(a, b) {
  var dx = a.x - b.x;
  var dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
};


/**
 * Returns the magnitude of a coordinate.
 * @param {!goog.math.Coordinate} a A Coordinate.
 * @return {number} The distance between the origin and {@code a}.
 */
goog.math.Coordinate.magnitude = function(a) {
  return Math.sqrt(a.x * a.x + a.y * a.y);
};


/**
 * Returns the angle from the origin to a coordinate.
 * @param {!goog.math.Coordinate} a A Coordinate.
 * @return {number} The angle, in degrees, clockwise from the positive X
 *     axis to {@code a}.
 */
goog.math.Coordinate.azimuth = function(a) {
  return goog.math.angle(0, 0, a.x, a.y);
};


/**
 * Returns the squared distance between two coordinates. Squared distances can
 * be used for comparisons when the actual value is not required.
 *
 * Performance note: eliminating the square root is an optimization often used
 * in lower-level languages, but the speed difference is not nearly as
 * pronounced in JavaScript (only a few percent.)
 *
 * @param {!goog.math.Coordinate} a A Coordinate.
 * @param {!goog.math.Coordinate} b A Coordinate.
 * @return {number} The squared distance between {@code a} and {@code b}.
 */
goog.math.Coordinate.squaredDistance = function(a, b) {
  var dx = a.x - b.x;
  var dy = a.y - b.y;
  return dx * dx + dy * dy;
};


/**
 * Returns the difference between two coordinates as a new
 * goog.math.Coordinate.
 * @param {!goog.math.Coordinate} a A Coordinate.
 * @param {!goog.math.Coordinate} b A Coordinate.
 * @return {!goog.math.Coordinate} A Coordinate representing the difference
 *     between {@code a} and {@code b}.
 */
goog.math.Coordinate.difference = function(a, b) {
  return new goog.math.Coordinate(a.x - b.x, a.y - b.y);
};


/**
 * Returns the sum of two coordinates as a new goog.math.Coordinate.
 * @param {!goog.math.Coordinate} a A Coordinate.
 * @param {!goog.math.Coordinate} b A Coordinate.
 * @return {!goog.math.Coordinate} A Coordinate representing the sum of the two
 *     coordinates.
 */
goog.math.Coordinate.sum = function(a, b) {
  return new goog.math.Coordinate(a.x + b.x, a.y + b.y);
};


/**
 * Rounds the x and y fields to the next larger integer values.
 * @return {!goog.math.Coordinate} This coordinate with ceil'd fields.
 */
goog.math.Coordinate.prototype.ceil = function() {
  this.x = Math.ceil(this.x);
  this.y = Math.ceil(this.y);
  return this;
};


/**
 * Rounds the x and y fields to the next smaller integer values.
 * @return {!goog.math.Coordinate} This coordinate with floored fields.
 */
goog.math.Coordinate.prototype.floor = function() {
  this.x = Math.floor(this.x);
  this.y = Math.floor(this.y);
  return this;
};


/**
 * Rounds the x and y fields to the nearest integer values.
 * @return {!goog.math.Coordinate} This coordinate with rounded fields.
 */
goog.math.Coordinate.prototype.round = function() {
  this.x = Math.round(this.x);
  this.y = Math.round(this.y);
  return this;
};


/**
 * Translates this box by the given offsets. If a {@code goog.math.Coordinate}
 * is given, then the x and y values are translated by the coordinate's x and y.
 * Otherwise, x and y are translated by {@code tx} and {@code opt_ty}
 * respectively.
 * @param {number|goog.math.Coordinate} tx The value to translate x by or the
 *     the coordinate to translate this coordinate by.
 * @param {number=} opt_ty The value to translate y by.
 * @return {!goog.math.Coordinate} This coordinate after translating.
 */
goog.math.Coordinate.prototype.translate = function(tx, opt_ty) {
  if (tx instanceof goog.math.Coordinate) {
    this.x += tx.x;
    this.y += tx.y;
  } else {
    this.x += tx;
    if (goog.isNumber(opt_ty)) {
      this.y += opt_ty;
    }
  }
  return this;
};


/**
 * Scales this coordinate by the given scale factors. The x and y values are
 * scaled by {@code sx} and {@code opt_sy} respectively.  If {@code opt_sy}
 * is not given, then {@code sx} is used for both x and y.
 * @param {number} sx The scale factor to use for the x dimension.
 * @param {number=} opt_sy The scale factor to use for the y dimension.
 * @return {!goog.math.Coordinate} This coordinate after scaling.
 */
goog.math.Coordinate.prototype.scale = function(sx, opt_sy) {
  var sy = goog.isNumber(opt_sy) ? opt_sy : sx;
  this.x *= sx;
  this.y *= sy;
  return this;
};


/**
 * Rotates this coordinate clockwise about the origin (or, optionally, the given
 * center) by the given angle, in radians.
 * @param {number} radians The angle by which to rotate this coordinate
 *     clockwise about the given center, in radians.
 * @param {!goog.math.Coordinate=} opt_center The center of rotation. Defaults
 *     to (0, 0) if not given.
 */
goog.math.Coordinate.prototype.rotateRadians = function(radians, opt_center) {
  var center = opt_center || new goog.math.Coordinate(0, 0);

  var x = this.x;
  var y = this.y;
  var cos = Math.cos(radians);
  var sin = Math.sin(radians);

  this.x = (x - center.x) * cos - (y - center.y) * sin + center.x;
  this.y = (x - center.x) * sin + (y - center.y) * cos + center.y;
};


/**
 * Rotates this coordinate clockwise about the origin (or, optionally, the given
 * center) by the given angle, in degrees.
 * @param {number} degrees The angle by which to rotate this coordinate
 *     clockwise about the given center, in degrees.
 * @param {!goog.math.Coordinate=} opt_center The center of rotation. Defaults
 *     to (0, 0) if not given.
 */
goog.math.Coordinate.prototype.rotateDegrees = function(degrees, opt_center) {
  this.rotateRadians(goog.math.toRadians(degrees), opt_center);
};

// Copyright 2007 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview A utility class for representing two-dimensional sizes.
 */


goog.provide('goog.math.Size');



/**
 * Class for representing sizes consisting of a width and height. Undefined
 * width and height support is deprecated and results in compiler warning.
 * @param {number} width Width.
 * @param {number} height Height.
 * @constructor
 */
goog.math.Size = function(width, height) {
  /**
   * Width
   * @type {number}
   */
  this.width = width;

  /**
   * Height
   * @type {number}
   */
  this.height = height;
};


/**
 * Compares sizes for equality.
 * @param {goog.math.Size} a A Size.
 * @param {goog.math.Size} b A Size.
 * @return {boolean} True iff the sizes have equal widths and equal
 *     heights, or if both are null.
 */
goog.math.Size.equals = function(a, b) {
  if (a == b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  return a.width == b.width && a.height == b.height;
};


/**
 * @return {!goog.math.Size} A new copy of the Size.
 */
goog.math.Size.prototype.clone = function() {
  return new goog.math.Size(this.width, this.height);
};


if (goog.DEBUG) {
  /**
   * Returns a nice string representing size.
   * @return {string} In the form (50 x 73).
   * @override
   */
  goog.math.Size.prototype.toString = function() {
    return '(' + this.width + ' x ' + this.height + ')';
  };
}


/**
 * @return {number} The longer of the two dimensions in the size.
 */
goog.math.Size.prototype.getLongest = function() {
  return Math.max(this.width, this.height);
};


/**
 * @return {number} The shorter of the two dimensions in the size.
 */
goog.math.Size.prototype.getShortest = function() {
  return Math.min(this.width, this.height);
};


/**
 * @return {number} The area of the size (width * height).
 */
goog.math.Size.prototype.area = function() {
  return this.width * this.height;
};


/**
 * @return {number} The perimeter of the size (width + height) * 2.
 */
goog.math.Size.prototype.perimeter = function() {
  return (this.width + this.height) * 2;
};


/**
 * @return {number} The ratio of the size's width to its height.
 */
goog.math.Size.prototype.aspectRatio = function() {
  return this.width / this.height;
};


/**
 * @return {boolean} True if the size has zero area, false if both dimensions
 *     are non-zero numbers.
 */
goog.math.Size.prototype.isEmpty = function() {
  return !this.area();
};


/**
 * Clamps the width and height parameters upward to integer values.
 * @return {!goog.math.Size} This size with ceil'd components.
 */
goog.math.Size.prototype.ceil = function() {
  this.width = Math.ceil(this.width);
  this.height = Math.ceil(this.height);
  return this;
};


/**
 * @param {!goog.math.Size} target The target size.
 * @return {boolean} True if this Size is the same size or smaller than the
 *     target size in both dimensions.
 */
goog.math.Size.prototype.fitsInside = function(target) {
  return this.width <= target.width && this.height <= target.height;
};


/**
 * Clamps the width and height parameters downward to integer values.
 * @return {!goog.math.Size} This size with floored components.
 */
goog.math.Size.prototype.floor = function() {
  this.width = Math.floor(this.width);
  this.height = Math.floor(this.height);
  return this;
};


/**
 * Rounds the width and height parameters to integer values.
 * @return {!goog.math.Size} This size with rounded components.
 */
goog.math.Size.prototype.round = function() {
  this.width = Math.round(this.width);
  this.height = Math.round(this.height);
  return this;
};


/**
 * Scales this size by the given scale factors. The width and height are scaled
 * by {@code sx} and {@code opt_sy} respectively.  If {@code opt_sy} is not
 * given, then {@code sx} is used for both the width and height.
 * @param {number} sx The scale factor to use for the width.
 * @param {number=} opt_sy The scale factor to use for the height.
 * @return {!goog.math.Size} This Size object after scaling.
 */
goog.math.Size.prototype.scale = function(sx, opt_sy) {
  var sy = goog.isNumber(opt_sy) ? opt_sy : sx;
  this.width *= sx;
  this.height *= sy;
  return this;
};


/**
 * Uniformly scales the size to fit inside the dimensions of a given size. The
 * original aspect ratio will be preserved.
 *
 * This function assumes that both Sizes contain strictly positive dimensions.
 * @param {!goog.math.Size} target The target size.
 * @return {!goog.math.Size} This Size object, after optional scaling.
 */
goog.math.Size.prototype.scaleToFit = function(target) {
  var s = this.aspectRatio() > target.aspectRatio() ?
      target.width / this.width :
      target.height / this.height;

  return this.scale(s);
};

// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Utilities for manipulating the browser's Document Object Model
 * Inspiration taken *heavily* from mochikit (http://mochikit.com/).
 *
 * You can use {@link goog.dom.DomHelper} to create new dom helpers that refer
 * to a different document object.  This is useful if you are working with
 * frames or multiple windows.
 *
 */


// TODO(arv): Rename/refactor getTextContent and getRawTextContent. The problem
// is that getTextContent should mimic the DOM3 textContent. We should add a
// getInnerText (or getText) which tries to return the visible text, innerText.


goog.provide('goog.dom');
goog.provide('goog.dom.Appendable');
goog.provide('goog.dom.DomHelper');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.dom.BrowserFeature');
goog.require('goog.dom.NodeType');
goog.require('goog.dom.TagName');
/**
 * Some projects use goog.dom.classes but only directly depend on goog.dom.
 * TODO: Notify the owners then remove goog.require('goog.dom.classes').
 * @suppress {extraRequire}
 */
goog.require('goog.dom.classes');
goog.require('goog.functions');
goog.require('goog.math.Coordinate');
goog.require('goog.math.Size');
goog.require('goog.object');
goog.require('goog.string');
goog.require('goog.userAgent');


/**
 * @define {boolean} Whether we know at compile time that the browser is in
 * quirks mode.
 */
goog.define('goog.dom.ASSUME_QUIRKS_MODE', false);


/**
 * @define {boolean} Whether we know at compile time that the browser is in
 * standards compliance mode.
 */
goog.define('goog.dom.ASSUME_STANDARDS_MODE', false);


/**
 * Whether we know the compatibility mode at compile time.
 * @type {boolean}
 * @private
 */
goog.dom.COMPAT_MODE_KNOWN_ =
    goog.dom.ASSUME_QUIRKS_MODE || goog.dom.ASSUME_STANDARDS_MODE;


/**
 * Gets the DomHelper object for the document where the element resides.
 * @param {(Node|Window)=} opt_element If present, gets the DomHelper for this
 *     element.
 * @return {!goog.dom.DomHelper} The DomHelper.
 */
goog.dom.getDomHelper = function(opt_element) {
  return opt_element ?
      new goog.dom.DomHelper(goog.dom.getOwnerDocument(opt_element)) :
      (goog.dom.defaultDomHelper_ ||
          (goog.dom.defaultDomHelper_ = new goog.dom.DomHelper()));
};


/**
 * Cached default DOM helper.
 * @type {goog.dom.DomHelper}
 * @private
 */
goog.dom.defaultDomHelper_;


/**
 * Gets the document object being used by the dom library.
 * @return {!Document} Document object.
 */
goog.dom.getDocument = function() {
  return document;
};


/**
 * Gets an element from the current document by element id.
 *
 * If an Element is passed in, it is returned.
 *
 * @param {string|Element} element Element ID or a DOM node.
 * @return {Element} The element with the given ID, or the node passed in.
 */
goog.dom.getElement = function(element) {
  return goog.dom.getElementHelper_(document, element);
};


/**
 * Gets an element by id from the given document (if present).
 * If an element is given, it is returned.
 * @param {!Document} doc
 * @param {string|Element} element Element ID or a DOM node.
 * @return {Element} The resulting element.
 * @private
 */
goog.dom.getElementHelper_ = function(doc, element) {
  return goog.isString(element) ?
      doc.getElementById(element) :
      element;
};


/**
 * Gets an element by id, asserting that the element is found.
 *
 * This is used when an element is expected to exist, and should fail with
 * an assertion error if it does not (if assertions are enabled).
 *
 * @param {string} id Element ID.
 * @return {!Element} The element with the given ID, if it exists.
 */
goog.dom.getRequiredElement = function(id) {
  return goog.dom.getRequiredElementHelper_(document, id);
};


/**
 * Helper function for getRequiredElementHelper functions, both static and
 * on DomHelper.  Asserts the element with the given id exists.
 * @param {!Document} doc
 * @param {string} id
 * @return {!Element} The element with the given ID, if it exists.
 * @private
 */
goog.dom.getRequiredElementHelper_ = function(doc, id) {
  // To prevent users passing in Elements as is permitted in getElement().
  goog.asserts.assertString(id);
  var element = goog.dom.getElementHelper_(doc, id);
  element = goog.asserts.assertElement(element,
      'No element found with id: ' + id);
  return element;
};


/**
 * Alias for getElement.
 * @param {string|Element} element Element ID or a DOM node.
 * @return {Element} The element with the given ID, or the node passed in.
 * @deprecated Use {@link goog.dom.getElement} instead.
 */
goog.dom.$ = goog.dom.getElement;


/**
 * Looks up elements by both tag and class name, using browser native functions
 * ({@code querySelectorAll}, {@code getElementsByTagName} or
 * {@code getElementsByClassName}) where possible. This function
 * is a useful, if limited, way of collecting a list of DOM elements
 * with certain characteristics.  {@code goog.dom.query} offers a
 * more powerful and general solution which allows matching on CSS3
 * selector expressions, but at increased cost in code size. If all you
 * need is particular tags belonging to a single class, this function
 * is fast and sleek.
 *
 * Note that tag names are case sensitive in the SVG namespace, and this
 * function converts opt_tag to uppercase for comparisons. For queries in the
 * SVG namespace you should use querySelector or querySelectorAll instead.
 * https://bugzilla.mozilla.org/show_bug.cgi?id=963870
 * https://bugs.webkit.org/show_bug.cgi?id=83438
 *
 * @see {goog.dom.query}
 *
 * @param {?string=} opt_tag Element tag name.
 * @param {?string=} opt_class Optional class name.
 * @param {(Document|Element)=} opt_el Optional element to look in.
 * @return { {length: number} } Array-like list of elements (only a length
 *     property and numerical indices are guaranteed to exist).
 */
goog.dom.getElementsByTagNameAndClass = function(opt_tag, opt_class, opt_el) {
  return goog.dom.getElementsByTagNameAndClass_(document, opt_tag, opt_class,
                                                opt_el);
};


/**
 * Returns a static, array-like list of the elements with the provided
 * className.
 * @see {goog.dom.query}
 * @param {string} className the name of the class to look for.
 * @param {(Document|Element)=} opt_el Optional element to look in.
 * @return { {length: number} } The items found with the class name provided.
 */
goog.dom.getElementsByClass = function(className, opt_el) {
  var parent = opt_el || document;
  if (goog.dom.canUseQuerySelector_(parent)) {
    return parent.querySelectorAll('.' + className);
  }
  return goog.dom.getElementsByTagNameAndClass_(
      document, '*', className, opt_el);
};


/**
 * Returns the first element with the provided className.
 * @see {goog.dom.query}
 * @param {string} className the name of the class to look for.
 * @param {Element|Document=} opt_el Optional element to look in.
 * @return {Element} The first item with the class name provided.
 */
goog.dom.getElementByClass = function(className, opt_el) {
  var parent = opt_el || document;
  var retVal = null;
  if (goog.dom.canUseQuerySelector_(parent)) {
    retVal = parent.querySelector('.' + className);
  } else {
    retVal = goog.dom.getElementsByTagNameAndClass_(
        document, '*', className, opt_el)[0];
  }
  return retVal || null;
};


/**
 * Ensures an element with the given className exists, and then returns the
 * first element with the provided className.
 * @see {goog.dom.query}
 * @param {string} className the name of the class to look for.
 * @param {!Element|!Document=} opt_root Optional element or document to look
 *     in.
 * @return {!Element} The first item with the class name provided.
 * @throws {goog.asserts.AssertionError} Thrown if no element is found.
 */
goog.dom.getRequiredElementByClass = function(className, opt_root) {
  var retValue = goog.dom.getElementByClass(className, opt_root);
  return goog.asserts.assert(retValue,
      'No element found with className: ' + className);
};


/**
 * Prefer the standardized (http://www.w3.org/TR/selectors-api/), native and
 * fast W3C Selectors API.
 * @param {!(Element|Document)} parent The parent document object.
 * @return {boolean} whether or not we can use parent.querySelector* APIs.
 * @private
 */
goog.dom.canUseQuerySelector_ = function(parent) {
  return !!(parent.querySelectorAll && parent.querySelector);
};


/**
 * Helper for {@code getElementsByTagNameAndClass}.
 * @param {!Document} doc The document to get the elements in.
 * @param {?string=} opt_tag Element tag name.
 * @param {?string=} opt_class Optional class name.
 * @param {(Document|Element)=} opt_el Optional element to look in.
 * @return { {length: number} } Array-like list of elements (only a length
 *     property and numerical indices are guaranteed to exist).
 * @private
 */
goog.dom.getElementsByTagNameAndClass_ = function(doc, opt_tag, opt_class,
                                                  opt_el) {
  var parent = opt_el || doc;
  var tagName = (opt_tag && opt_tag != '*') ? opt_tag.toUpperCase() : '';

  if (goog.dom.canUseQuerySelector_(parent) &&
      (tagName || opt_class)) {
    var query = tagName + (opt_class ? '.' + opt_class : '');
    return parent.querySelectorAll(query);
  }

  // Use the native getElementsByClassName if available, under the assumption
  // that even when the tag name is specified, there will be fewer elements to
  // filter through when going by class than by tag name
  if (opt_class && parent.getElementsByClassName) {
    var els = parent.getElementsByClassName(opt_class);

    if (tagName) {
      var arrayLike = {};
      var len = 0;

      // Filter for specific tags if requested.
      for (var i = 0, el; el = els[i]; i++) {
        if (tagName == el.nodeName) {
          arrayLike[len++] = el;
        }
      }
      arrayLike.length = len;

      return arrayLike;
    } else {
      return els;
    }
  }

  var els = parent.getElementsByTagName(tagName || '*');

  if (opt_class) {
    var arrayLike = {};
    var len = 0;
    for (var i = 0, el; el = els[i]; i++) {
      var className = el.className;
      // Check if className has a split function since SVG className does not.
      if (typeof className.split == 'function' &&
          goog.array.contains(className.split(/\s+/), opt_class)) {
        arrayLike[len++] = el;
      }
    }
    arrayLike.length = len;
    return arrayLike;
  } else {
    return els;
  }
};


/**
 * Alias for {@code getElementsByTagNameAndClass}.
 * @param {?string=} opt_tag Element tag name.
 * @param {?string=} opt_class Optional class name.
 * @param {Element=} opt_el Optional element to look in.
 * @return { {length: number} } Array-like list of elements (only a length
 *     property and numerical indices are guaranteed to exist).
 * @deprecated Use {@link goog.dom.getElementsByTagNameAndClass} instead.
 */
goog.dom.$$ = goog.dom.getElementsByTagNameAndClass;


/**
 * Sets multiple properties on a node.
 * @param {Element} element DOM node to set properties on.
 * @param {Object} properties Hash of property:value pairs.
 */
goog.dom.setProperties = function(element, properties) {
  goog.object.forEach(properties, function(val, key) {
    if (key == 'style') {
      element.style.cssText = val;
    } else if (key == 'class') {
      element.className = val;
    } else if (key == 'for') {
      element.htmlFor = val;
    } else if (key in goog.dom.DIRECT_ATTRIBUTE_MAP_) {
      element.setAttribute(goog.dom.DIRECT_ATTRIBUTE_MAP_[key], val);
    } else if (goog.string.startsWith(key, 'aria-') ||
        goog.string.startsWith(key, 'data-')) {
      element.setAttribute(key, val);
    } else {
      element[key] = val;
    }
  });
};


/**
 * Map of attributes that should be set using
 * element.setAttribute(key, val) instead of element[key] = val.  Used
 * by goog.dom.setProperties.
 *
 * @type {Object}
 * @private
 */
goog.dom.DIRECT_ATTRIBUTE_MAP_ = {
  'cellpadding': 'cellPadding',
  'cellspacing': 'cellSpacing',
  'colspan': 'colSpan',
  'frameborder': 'frameBorder',
  'height': 'height',
  'maxlength': 'maxLength',
  'role': 'role',
  'rowspan': 'rowSpan',
  'type': 'type',
  'usemap': 'useMap',
  'valign': 'vAlign',
  'width': 'width'
};


/**
 * Gets the dimensions of the viewport.
 *
 * Gecko Standards mode:
 * docEl.clientWidth  Width of viewport excluding scrollbar.
 * win.innerWidth     Width of viewport including scrollbar.
 * body.clientWidth   Width of body element.
 *
 * docEl.clientHeight Height of viewport excluding scrollbar.
 * win.innerHeight    Height of viewport including scrollbar.
 * body.clientHeight  Height of document.
 *
 * Gecko Backwards compatible mode:
 * docEl.clientWidth  Width of viewport excluding scrollbar.
 * win.innerWidth     Width of viewport including scrollbar.
 * body.clientWidth   Width of viewport excluding scrollbar.
 *
 * docEl.clientHeight Height of document.
 * win.innerHeight    Height of viewport including scrollbar.
 * body.clientHeight  Height of viewport excluding scrollbar.
 *
 * IE6/7 Standards mode:
 * docEl.clientWidth  Width of viewport excluding scrollbar.
 * win.innerWidth     Undefined.
 * body.clientWidth   Width of body element.
 *
 * docEl.clientHeight Height of viewport excluding scrollbar.
 * win.innerHeight    Undefined.
 * body.clientHeight  Height of document element.
 *
 * IE5 + IE6/7 Backwards compatible mode:
 * docEl.clientWidth  0.
 * win.innerWidth     Undefined.
 * body.clientWidth   Width of viewport excluding scrollbar.
 *
 * docEl.clientHeight 0.
 * win.innerHeight    Undefined.
 * body.clientHeight  Height of viewport excluding scrollbar.
 *
 * Opera 9 Standards and backwards compatible mode:
 * docEl.clientWidth  Width of viewport excluding scrollbar.
 * win.innerWidth     Width of viewport including scrollbar.
 * body.clientWidth   Width of viewport excluding scrollbar.
 *
 * docEl.clientHeight Height of document.
 * win.innerHeight    Height of viewport including scrollbar.
 * body.clientHeight  Height of viewport excluding scrollbar.
 *
 * WebKit:
 * Safari 2
 * docEl.clientHeight Same as scrollHeight.
 * docEl.clientWidth  Same as innerWidth.
 * win.innerWidth     Width of viewport excluding scrollbar.
 * win.innerHeight    Height of the viewport including scrollbar.
 * frame.innerHeight  Height of the viewport exluding scrollbar.
 *
 * Safari 3 (tested in 522)
 *
 * docEl.clientWidth  Width of viewport excluding scrollbar.
 * docEl.clientHeight Height of viewport excluding scrollbar in strict mode.
 * body.clientHeight  Height of viewport excluding scrollbar in quirks mode.
 *
 * @param {Window=} opt_window Optional window element to test.
 * @return {!goog.math.Size} Object with values 'width' and 'height'.
 */
goog.dom.getViewportSize = function(opt_window) {
  // TODO(arv): This should not take an argument
  return goog.dom.getViewportSize_(opt_window || window);
};


/**
 * Helper for {@code getViewportSize}.
 * @param {Window} win The window to get the view port size for.
 * @return {!goog.math.Size} Object with values 'width' and 'height'.
 * @private
 */
goog.dom.getViewportSize_ = function(win) {
  var doc = win.document;
  var el = goog.dom.isCss1CompatMode_(doc) ? doc.documentElement : doc.body;
  return new goog.math.Size(el.clientWidth, el.clientHeight);
};


/**
 * Calculates the height of the document.
 *
 * @return {number} The height of the current document.
 */
goog.dom.getDocumentHeight = function() {
  return goog.dom.getDocumentHeight_(window);
};


/**
 * Calculates the height of the document of the given window.
 *
 * Function code copied from the opensocial gadget api:
 *   gadgets.window.adjustHeight(opt_height)
 *
 * @private
 * @param {Window} win The window whose document height to retrieve.
 * @return {number} The height of the document of the given window.
 */
goog.dom.getDocumentHeight_ = function(win) {
  // NOTE(eae): This method will return the window size rather than the document
  // size in webkit quirks mode.
  var doc = win.document;
  var height = 0;

  if (doc) {
    // Calculating inner content height is hard and different between
    // browsers rendering in Strict vs. Quirks mode.  We use a combination of
    // three properties within document.body and document.documentElement:
    // - scrollHeight
    // - offsetHeight
    // - clientHeight
    // These values differ significantly between browsers and rendering modes.
    // But there are patterns.  It just takes a lot of time and persistence
    // to figure out.

    // If the window has no contents, it has no height. (In IE10,
    // document.body & document.documentElement are null in an empty iFrame.)
    var body = doc.body;
    var docEl = doc.documentElement;
    if (!body && !docEl) {
      return 0;
    }

    // Get the height of the viewport
    var vh = goog.dom.getViewportSize_(win).height;
    if (goog.dom.isCss1CompatMode_(doc) && docEl.scrollHeight) {
      // In Strict mode:
      // The inner content height is contained in either:
      //    document.documentElement.scrollHeight
      //    document.documentElement.offsetHeight
      // Based on studying the values output by different browsers,
      // use the value that's NOT equal to the viewport height found above.
      height = docEl.scrollHeight != vh ?
          docEl.scrollHeight : docEl.offsetHeight;
    } else {
      // In Quirks mode:
      // documentElement.clientHeight is equal to documentElement.offsetHeight
      // except in IE.  In most browsers, document.documentElement can be used
      // to calculate the inner content height.
      // However, in other browsers (e.g. IE), document.body must be used
      // instead.  How do we know which one to use?
      // If document.documentElement.clientHeight does NOT equal
      // document.documentElement.offsetHeight, then use document.body.
      var sh = docEl.scrollHeight;
      var oh = docEl.offsetHeight;
      if (docEl.clientHeight != oh) {
        sh = body.scrollHeight;
        oh = body.offsetHeight;
      }

      // Detect whether the inner content height is bigger or smaller
      // than the bounding box (viewport).  If bigger, take the larger
      // value.  If smaller, take the smaller value.
      if (sh > vh) {
        // Content is larger
        height = sh > oh ? sh : oh;
      } else {
        // Content is smaller
        height = sh < oh ? sh : oh;
      }
    }
  }

  return height;
};


/**
 * Gets the page scroll distance as a coordinate object.
 *
 * @param {Window=} opt_window Optional window element to test.
 * @return {!goog.math.Coordinate} Object with values 'x' and 'y'.
 * @deprecated Use {@link goog.dom.getDocumentScroll} instead.
 */
goog.dom.getPageScroll = function(opt_window) {
  var win = opt_window || goog.global || window;
  return goog.dom.getDomHelper(win.document).getDocumentScroll();
};


/**
 * Gets the document scroll distance as a coordinate object.
 *
 * @return {!goog.math.Coordinate} Object with values 'x' and 'y'.
 */
goog.dom.getDocumentScroll = function() {
  return goog.dom.getDocumentScroll_(document);
};


/**
 * Helper for {@code getDocumentScroll}.
 *
 * @param {!Document} doc The document to get the scroll for.
 * @return {!goog.math.Coordinate} Object with values 'x' and 'y'.
 * @private
 */
goog.dom.getDocumentScroll_ = function(doc) {
  var el = goog.dom.getDocumentScrollElement_(doc);
  var win = goog.dom.getWindow_(doc);
  if (goog.userAgent.IE && goog.userAgent.isVersionOrHigher('10') &&
      win.pageYOffset != el.scrollTop) {
    // The keyboard on IE10 touch devices shifts the page using the pageYOffset
    // without modifying scrollTop. For this case, we want the body scroll
    // offsets.
    return new goog.math.Coordinate(el.scrollLeft, el.scrollTop);
  }
  return new goog.math.Coordinate(win.pageXOffset || el.scrollLeft,
      win.pageYOffset || el.scrollTop);
};


/**
 * Gets the document scroll element.
 * @return {!Element} Scrolling element.
 */
goog.dom.getDocumentScrollElement = function() {
  return goog.dom.getDocumentScrollElement_(document);
};


/**
 * Helper for {@code getDocumentScrollElement}.
 * @param {!Document} doc The document to get the scroll element for.
 * @return {!Element} Scrolling element.
 * @private
 */
goog.dom.getDocumentScrollElement_ = function(doc) {
  // WebKit needs body.scrollLeft in both quirks mode and strict mode. We also
  // default to the documentElement if the document does not have a body (e.g.
  // a SVG document).
  if (!goog.userAgent.WEBKIT && goog.dom.isCss1CompatMode_(doc)) {
    return doc.documentElement;
  }
  return doc.body || doc.documentElement;
};


/**
 * Gets the window object associated with the given document.
 *
 * @param {Document=} opt_doc  Document object to get window for.
 * @return {!Window} The window associated with the given document.
 */
goog.dom.getWindow = function(opt_doc) {
  // TODO(arv): This should not take an argument.
  return opt_doc ? goog.dom.getWindow_(opt_doc) : window;
};


/**
 * Helper for {@code getWindow}.
 *
 * @param {!Document} doc  Document object to get window for.
 * @return {!Window} The window associated with the given document.
 * @private
 */
goog.dom.getWindow_ = function(doc) {
  return doc.parentWindow || doc.defaultView;
};


/**
 * Returns a dom node with a set of attributes.  This function accepts varargs
 * for subsequent nodes to be added.  Subsequent nodes will be added to the
 * first node as childNodes.
 *
 * So:
 * <code>createDom('div', null, createDom('p'), createDom('p'));</code>
 * would return a div with two child paragraphs
 *
 * @param {string} tagName Tag to create.
 * @param {(Object|Array.<string>|string)=} opt_attributes If object, then a map
 *     of name-value pairs for attributes. If a string, then this is the
 *     className of the new element. If an array, the elements will be joined
 *     together as the className of the new element.
 * @param {...(Object|string|Array|NodeList)} var_args Further DOM nodes or
 *     strings for text nodes. If one of the var_args is an array or NodeList,i
 *     its elements will be added as childNodes instead.
 * @return {!Element} Reference to a DOM node.
 */
goog.dom.createDom = function(tagName, opt_attributes, var_args) {
  return goog.dom.createDom_(document, arguments);
};


/**
 * Helper for {@code createDom}.
 * @param {!Document} doc The document to create the DOM in.
 * @param {!Arguments} args Argument object passed from the callers. See
 *     {@code goog.dom.createDom} for details.
 * @return {!Element} Reference to a DOM node.
 * @private
 */
goog.dom.createDom_ = function(doc, args) {
  var tagName = args[0];
  var attributes = args[1];

  // Internet Explorer is dumb: http://msdn.microsoft.com/workshop/author/
  //                            dhtml/reference/properties/name_2.asp
  // Also does not allow setting of 'type' attribute on 'input' or 'button'.
  if (!goog.dom.BrowserFeature.CAN_ADD_NAME_OR_TYPE_ATTRIBUTES && attributes &&
      (attributes.name || attributes.type)) {
    var tagNameArr = ['<', tagName];
    if (attributes.name) {
      tagNameArr.push(' name="', goog.string.htmlEscape(attributes.name),
                      '"');
    }
    if (attributes.type) {
      tagNameArr.push(' type="', goog.string.htmlEscape(attributes.type),
                      '"');

      // Clone attributes map to remove 'type' without mutating the input.
      var clone = {};
      goog.object.extend(clone, attributes);

      // JSCompiler can't see how goog.object.extend added this property,
      // because it was essentially added by reflection.
      // So it needs to be quoted.
      delete clone['type'];

      attributes = clone;
    }
    tagNameArr.push('>');
    tagName = tagNameArr.join('');
  }

  var element = doc.createElement(tagName);

  if (attributes) {
    if (goog.isString(attributes)) {
      element.className = attributes;
    } else if (goog.isArray(attributes)) {
      element.className = attributes.join(' ');
    } else {
      goog.dom.setProperties(element, attributes);
    }
  }

  if (args.length > 2) {
    goog.dom.append_(doc, element, args, 2);
  }

  return element;
};


/**
 * Appends a node with text or other nodes.
 * @param {!Document} doc The document to create new nodes in.
 * @param {!Node} parent The node to append nodes to.
 * @param {!Arguments} args The values to add. See {@code goog.dom.append}.
 * @param {number} startIndex The index of the array to start from.
 * @private
 */
goog.dom.append_ = function(doc, parent, args, startIndex) {
  function childHandler(child) {
    // TODO(user): More coercion, ala MochiKit?
    if (child) {
      parent.appendChild(goog.isString(child) ?
          doc.createTextNode(child) : child);
    }
  }

  for (var i = startIndex; i < args.length; i++) {
    var arg = args[i];
    // TODO(attila): Fix isArrayLike to return false for a text node.
    if (goog.isArrayLike(arg) && !goog.dom.isNodeLike(arg)) {
      // If the argument is a node list, not a real array, use a clone,
      // because forEach can't be used to mutate a NodeList.
      goog.array.forEach(goog.dom.isNodeList(arg) ?
          goog.array.toArray(arg) : arg,
          childHandler);
    } else {
      childHandler(arg);
    }
  }
};


/**
 * Alias for {@code createDom}.
 * @param {string} tagName Tag to create.
 * @param {(string|Object)=} opt_attributes If object, then a map of name-value
 *     pairs for attributes. If a string, then this is the className of the new
 *     element.
 * @param {...(Object|string|Array|NodeList)} var_args Further DOM nodes or
 *     strings for text nodes. If one of the var_args is an array, its
 *     children will be added as childNodes instead.
 * @return {!Element} Reference to a DOM node.
 * @deprecated Use {@link goog.dom.createDom} instead.
 */
goog.dom.$dom = goog.dom.createDom;


/**
 * Creates a new element.
 * @param {string} name Tag name.
 * @return {!Element} The new element.
 */
goog.dom.createElement = function(name) {
  return document.createElement(name);
};


/**
 * Creates a new text node.
 * @param {number|string} content Content.
 * @return {!Text} The new text node.
 */
goog.dom.createTextNode = function(content) {
  return document.createTextNode(String(content));
};


/**
 * Create a table.
 * @param {number} rows The number of rows in the table.  Must be >= 1.
 * @param {number} columns The number of columns in the table.  Must be >= 1.
 * @param {boolean=} opt_fillWithNbsp If true, fills table entries with nsbps.
 * @return {!Element} The created table.
 */
goog.dom.createTable = function(rows, columns, opt_fillWithNbsp) {
  return goog.dom.createTable_(document, rows, columns, !!opt_fillWithNbsp);
};


/**
 * Create a table.
 * @param {!Document} doc Document object to use to create the table.
 * @param {number} rows The number of rows in the table.  Must be >= 1.
 * @param {number} columns The number of columns in the table.  Must be >= 1.
 * @param {boolean} fillWithNbsp If true, fills table entries with nsbps.
 * @return {!Element} The created table.
 * @private
 */
goog.dom.createTable_ = function(doc, rows, columns, fillWithNbsp) {
  var rowHtml = ['<tr>'];
  for (var i = 0; i < columns; i++) {
    rowHtml.push(fillWithNbsp ? '<td>&nbsp;</td>' : '<td></td>');
  }
  rowHtml.push('</tr>');
  rowHtml = rowHtml.join('');
  var totalHtml = ['<table>'];
  for (i = 0; i < rows; i++) {
    totalHtml.push(rowHtml);
  }
  totalHtml.push('</table>');

  var elem = doc.createElement(goog.dom.TagName.DIV);
  elem.innerHTML = totalHtml.join('');
  return /** @type {!Element} */ (elem.removeChild(elem.firstChild));
};


/**
 * Converts an HTML string into a document fragment. The string must be
 * sanitized in order to avoid cross-site scripting. For example
 * {@code goog.dom.htmlToDocumentFragment('&lt;img src=x onerror=alert(0)&gt;')}
 * triggers an alert in all browsers, even if the returned document fragment
 * is thrown away immediately.
 *
 * @param {string} htmlString The HTML string to convert.
 * @return {!Node} The resulting document fragment.
 */
goog.dom.htmlToDocumentFragment = function(htmlString) {
  return goog.dom.htmlToDocumentFragment_(document, htmlString);
};


/**
 * Helper for {@code htmlToDocumentFragment}.
 *
 * @param {!Document} doc The document.
 * @param {string} htmlString The HTML string to convert.
 * @return {!Node} The resulting document fragment.
 * @private
 */
goog.dom.htmlToDocumentFragment_ = function(doc, htmlString) {
  var tempDiv = doc.createElement('div');
  if (goog.dom.BrowserFeature.INNER_HTML_NEEDS_SCOPED_ELEMENT) {
    tempDiv.innerHTML = '<br>' + htmlString;
    tempDiv.removeChild(tempDiv.firstChild);
  } else {
    tempDiv.innerHTML = htmlString;
  }
  if (tempDiv.childNodes.length == 1) {
    return /** @type {!Node} */ (tempDiv.removeChild(tempDiv.firstChild));
  } else {
    var fragment = doc.createDocumentFragment();
    while (tempDiv.firstChild) {
      fragment.appendChild(tempDiv.firstChild);
    }
    return fragment;
  }
};


/**
 * Returns true if the browser is in "CSS1-compatible" (standards-compliant)
 * mode, false otherwise.
 * @return {boolean} True if in CSS1-compatible mode.
 */
goog.dom.isCss1CompatMode = function() {
  return goog.dom.isCss1CompatMode_(document);
};


/**
 * Returns true if the browser is in "CSS1-compatible" (standards-compliant)
 * mode, false otherwise.
 * @param {Document} doc The document to check.
 * @return {boolean} True if in CSS1-compatible mode.
 * @private
 */
goog.dom.isCss1CompatMode_ = function(doc) {
  if (goog.dom.COMPAT_MODE_KNOWN_) {
    return goog.dom.ASSUME_STANDARDS_MODE;
  }

  return doc.compatMode == 'CSS1Compat';
};


/**
 * Determines if the given node can contain children, intended to be used for
 * HTML generation.
 *
 * IE natively supports node.canHaveChildren but has inconsistent behavior.
 * Prior to IE8 the base tag allows children and in IE9 all nodes return true
 * for canHaveChildren.
 *
 * In practice all non-IE browsers allow you to add children to any node, but
 * the behavior is inconsistent:
 *
 * <pre>
 *   var a = document.createElement('br');
 *   a.appendChild(document.createTextNode('foo'));
 *   a.appendChild(document.createTextNode('bar'));
 *   console.log(a.childNodes.length);  // 2
 *   console.log(a.innerHTML);  // Chrome: "", IE9: "foobar", FF3.5: "foobar"
 * </pre>
 *
 * For more information, see:
 * http://dev.w3.org/html5/markup/syntax.html#syntax-elements
 *
 * TODO(user): Rename shouldAllowChildren() ?
 *
 * @param {Node} node The node to check.
 * @return {boolean} Whether the node can contain children.
 */
goog.dom.canHaveChildren = function(node) {
  if (node.nodeType != goog.dom.NodeType.ELEMENT) {
    return false;
  }
  switch (node.tagName) {
    case goog.dom.TagName.APPLET:
    case goog.dom.TagName.AREA:
    case goog.dom.TagName.BASE:
    case goog.dom.TagName.BR:
    case goog.dom.TagName.COL:
    case goog.dom.TagName.COMMAND:
    case goog.dom.TagName.EMBED:
    case goog.dom.TagName.FRAME:
    case goog.dom.TagName.HR:
    case goog.dom.TagName.IMG:
    case goog.dom.TagName.INPUT:
    case goog.dom.TagName.IFRAME:
    case goog.dom.TagName.ISINDEX:
    case goog.dom.TagName.KEYGEN:
    case goog.dom.TagName.LINK:
    case goog.dom.TagName.NOFRAMES:
    case goog.dom.TagName.NOSCRIPT:
    case goog.dom.TagName.META:
    case goog.dom.TagName.OBJECT:
    case goog.dom.TagName.PARAM:
    case goog.dom.TagName.SCRIPT:
    case goog.dom.TagName.SOURCE:
    case goog.dom.TagName.STYLE:
    case goog.dom.TagName.TRACK:
    case goog.dom.TagName.WBR:
      return false;
  }
  return true;
};


/**
 * Appends a child to a node.
 * @param {Node} parent Parent.
 * @param {Node} child Child.
 */
goog.dom.appendChild = function(parent, child) {
  parent.appendChild(child);
};


/**
 * Appends a node with text or other nodes.
 * @param {!Node} parent The node to append nodes to.
 * @param {...goog.dom.Appendable} var_args The things to append to the node.
 *     If this is a Node it is appended as is.
 *     If this is a string then a text node is appended.
 *     If this is an array like object then fields 0 to length - 1 are appended.
 */
goog.dom.append = function(parent, var_args) {
  goog.dom.append_(goog.dom.getOwnerDocument(parent), parent, arguments, 1);
};


/**
 * Removes all the child nodes on a DOM node.
 * @param {Node} node Node to remove children from.
 */
goog.dom.removeChildren = function(node) {
  // Note: Iterations over live collections can be slow, this is the fastest
  // we could find. The double parenthesis are used to prevent JsCompiler and
  // strict warnings.
  var child;
  while ((child = node.firstChild)) {
    node.removeChild(child);
  }
};


/**
 * Inserts a new node before an existing reference node (i.e. as the previous
 * sibling). If the reference node has no parent, then does nothing.
 * @param {Node} newNode Node to insert.
 * @param {Node} refNode Reference node to insert before.
 */
goog.dom.insertSiblingBefore = function(newNode, refNode) {
  if (refNode.parentNode) {
    refNode.parentNode.insertBefore(newNode, refNode);
  }
};


/**
 * Inserts a new node after an existing reference node (i.e. as the next
 * sibling). If the reference node has no parent, then does nothing.
 * @param {Node} newNode Node to insert.
 * @param {Node} refNode Reference node to insert after.
 */
goog.dom.insertSiblingAfter = function(newNode, refNode) {
  if (refNode.parentNode) {
    refNode.parentNode.insertBefore(newNode, refNode.nextSibling);
  }
};


/**
 * Insert a child at a given index. If index is larger than the number of child
 * nodes that the parent currently has, the node is inserted as the last child
 * node.
 * @param {Element} parent The element into which to insert the child.
 * @param {Node} child The element to insert.
 * @param {number} index The index at which to insert the new child node. Must
 *     not be negative.
 */
goog.dom.insertChildAt = function(parent, child, index) {
  // Note that if the second argument is null, insertBefore
  // will append the child at the end of the list of children.
  parent.insertBefore(child, parent.childNodes[index] || null);
};


/**
 * Removes a node from its parent.
 * @param {Node} node The node to remove.
 * @return {Node} The node removed if removed; else, null.
 */
goog.dom.removeNode = function(node) {
  return node && node.parentNode ? node.parentNode.removeChild(node) : null;
};


/**
 * Replaces a node in the DOM tree. Will do nothing if {@code oldNode} has no
 * parent.
 * @param {Node} newNode Node to insert.
 * @param {Node} oldNode Node to replace.
 */
goog.dom.replaceNode = function(newNode, oldNode) {
  var parent = oldNode.parentNode;
  if (parent) {
    parent.replaceChild(newNode, oldNode);
  }
};


/**
 * Flattens an element. That is, removes it and replace it with its children.
 * Does nothing if the element is not in the document.
 * @param {Element} element The element to flatten.
 * @return {Element|undefined} The original element, detached from the document
 *     tree, sans children; or undefined, if the element was not in the document
 *     to begin with.
 */
goog.dom.flattenElement = function(element) {
  var child, parent = element.parentNode;
  if (parent && parent.nodeType != goog.dom.NodeType.DOCUMENT_FRAGMENT) {
    // Use IE DOM method (supported by Opera too) if available
    if (element.removeNode) {
      return /** @type {Element} */ (element.removeNode(false));
    } else {
      // Move all children of the original node up one level.
      while ((child = element.firstChild)) {
        parent.insertBefore(child, element);
      }

      // Detach the original element.
      return /** @type {Element} */ (goog.dom.removeNode(element));
    }
  }
};


/**
 * Returns an array containing just the element children of the given element.
 * @param {Element} element The element whose element children we want.
 * @return {!(Array|NodeList)} An array or array-like list of just the element
 *     children of the given element.
 */
goog.dom.getChildren = function(element) {
  // We check if the children attribute is supported for child elements
  // since IE8 misuses the attribute by also including comments.
  if (goog.dom.BrowserFeature.CAN_USE_CHILDREN_ATTRIBUTE &&
      element.children != undefined) {
    return element.children;
  }
  // Fall back to manually filtering the element's child nodes.
  return goog.array.filter(element.childNodes, function(node) {
    return node.nodeType == goog.dom.NodeType.ELEMENT;
  });
};


/**
 * Returns the first child node that is an element.
 * @param {Node} node The node to get the first child element of.
 * @return {Element} The first child node of {@code node} that is an element.
 */
goog.dom.getFirstElementChild = function(node) {
  if (node.firstElementChild != undefined) {
    return /** @type {Element} */(node).firstElementChild;
  }
  return goog.dom.getNextElementNode_(node.firstChild, true);
};


/**
 * Returns the last child node that is an element.
 * @param {Node} node The node to get the last child element of.
 * @return {Element} The last child node of {@code node} that is an element.
 */
goog.dom.getLastElementChild = function(node) {
  if (node.lastElementChild != undefined) {
    return /** @type {Element} */(node).lastElementChild;
  }
  return goog.dom.getNextElementNode_(node.lastChild, false);
};


/**
 * Returns the first next sibling that is an element.
 * @param {Node} node The node to get the next sibling element of.
 * @return {Element} The next sibling of {@code node} that is an element.
 */
goog.dom.getNextElementSibling = function(node) {
  if (node.nextElementSibling != undefined) {
    return /** @type {Element} */(node).nextElementSibling;
  }
  return goog.dom.getNextElementNode_(node.nextSibling, true);
};


/**
 * Returns the first previous sibling that is an element.
 * @param {Node} node The node to get the previous sibling element of.
 * @return {Element} The first previous sibling of {@code node} that is
 *     an element.
 */
goog.dom.getPreviousElementSibling = function(node) {
  if (node.previousElementSibling != undefined) {
    return /** @type {Element} */(node).previousElementSibling;
  }
  return goog.dom.getNextElementNode_(node.previousSibling, false);
};


/**
 * Returns the first node that is an element in the specified direction,
 * starting with {@code node}.
 * @param {Node} node The node to get the next element from.
 * @param {boolean} forward Whether to look forwards or backwards.
 * @return {Element} The first element.
 * @private
 */
goog.dom.getNextElementNode_ = function(node, forward) {
  while (node && node.nodeType != goog.dom.NodeType.ELEMENT) {
    node = forward ? node.nextSibling : node.previousSibling;
  }

  return /** @type {Element} */ (node);
};


/**
 * Returns the next node in source order from the given node.
 * @param {Node} node The node.
 * @return {Node} The next node in the DOM tree, or null if this was the last
 *     node.
 */
goog.dom.getNextNode = function(node) {
  if (!node) {
    return null;
  }

  if (node.firstChild) {
    return node.firstChild;
  }

  while (node && !node.nextSibling) {
    node = node.parentNode;
  }

  return node ? node.nextSibling : null;
};


/**
 * Returns the previous node in source order from the given node.
 * @param {Node} node The node.
 * @return {Node} The previous node in the DOM tree, or null if this was the
 *     first node.
 */
goog.dom.getPreviousNode = function(node) {
  if (!node) {
    return null;
  }

  if (!node.previousSibling) {
    return node.parentNode;
  }

  node = node.previousSibling;
  while (node && node.lastChild) {
    node = node.lastChild;
  }

  return node;
};


/**
 * Whether the object looks like a DOM node.
 * @param {?} obj The object being tested for node likeness.
 * @return {boolean} Whether the object looks like a DOM node.
 */
goog.dom.isNodeLike = function(obj) {
  return goog.isObject(obj) && obj.nodeType > 0;
};


/**
 * Whether the object looks like an Element.
 * @param {?} obj The object being tested for Element likeness.
 * @return {boolean} Whether the object looks like an Element.
 */
goog.dom.isElement = function(obj) {
  return goog.isObject(obj) && obj.nodeType == goog.dom.NodeType.ELEMENT;
};


/**
 * Returns true if the specified value is a Window object. This includes the
 * global window for HTML pages, and iframe windows.
 * @param {?} obj Variable to test.
 * @return {boolean} Whether the variable is a window.
 */
goog.dom.isWindow = function(obj) {
  return goog.isObject(obj) && obj['window'] == obj;
};


/**
 * Returns an element's parent, if it's an Element.
 * @param {Element} element The DOM element.
 * @return {Element} The parent, or null if not an Element.
 */
goog.dom.getParentElement = function(element) {
  var parent;
  if (goog.dom.BrowserFeature.CAN_USE_PARENT_ELEMENT_PROPERTY) {
    var isIe9 = goog.userAgent.IE &&
        goog.userAgent.isVersionOrHigher('9') &&
        !goog.userAgent.isVersionOrHigher('10');
    // SVG elements in IE9 can't use the parentElement property.
    // goog.global['SVGElement'] is not defined in IE9 quirks mode.
    if (!(isIe9 && goog.global['SVGElement'] &&
        element instanceof goog.global['SVGElement'])) {
      parent = element.parentElement;
      if (parent) {
        return parent;
      }
    }
  }
  parent = element.parentNode;
  return goog.dom.isElement(parent) ? /** @type {!Element} */ (parent) : null;
};


/**
 * Whether a node contains another node.
 * @param {Node} parent The node that should contain the other node.
 * @param {Node} descendant The node to test presence of.
 * @return {boolean} Whether the parent node contains the descendent node.
 */
goog.dom.contains = function(parent, descendant) {
  // We use browser specific methods for this if available since it is faster
  // that way.

  // IE DOM
  if (parent.contains && descendant.nodeType == goog.dom.NodeType.ELEMENT) {
    return parent == descendant || parent.contains(descendant);
  }

  // W3C DOM Level 3
  if (typeof parent.compareDocumentPosition != 'undefined') {
    return parent == descendant ||
        Boolean(parent.compareDocumentPosition(descendant) & 16);
  }

  // W3C DOM Level 1
  while (descendant && parent != descendant) {
    descendant = descendant.parentNode;
  }
  return descendant == parent;
};


/**
 * Compares the document order of two nodes, returning 0 if they are the same
 * node, a negative number if node1 is before node2, and a positive number if
 * node2 is before node1.  Note that we compare the order the tags appear in the
 * document so in the tree <b><i>text</i></b> the B node is considered to be
 * before the I node.
 *
 * @param {Node} node1 The first node to compare.
 * @param {Node} node2 The second node to compare.
 * @return {number} 0 if the nodes are the same node, a negative number if node1
 *     is before node2, and a positive number if node2 is before node1.
 */
goog.dom.compareNodeOrder = function(node1, node2) {
  // Fall out quickly for equality.
  if (node1 == node2) {
    return 0;
  }

  // Use compareDocumentPosition where available
  if (node1.compareDocumentPosition) {
    // 4 is the bitmask for FOLLOWS.
    return node1.compareDocumentPosition(node2) & 2 ? 1 : -1;
  }

  // Special case for document nodes on IE 7 and 8.
  if (goog.userAgent.IE && !goog.userAgent.isDocumentModeOrHigher(9)) {
    if (node1.nodeType == goog.dom.NodeType.DOCUMENT) {
      return -1;
    }
    if (node2.nodeType == goog.dom.NodeType.DOCUMENT) {
      return 1;
    }
  }

  // Process in IE using sourceIndex - we check to see if the first node has
  // a source index or if its parent has one.
  if ('sourceIndex' in node1 ||
      (node1.parentNode && 'sourceIndex' in node1.parentNode)) {
    var isElement1 = node1.nodeType == goog.dom.NodeType.ELEMENT;
    var isElement2 = node2.nodeType == goog.dom.NodeType.ELEMENT;

    if (isElement1 && isElement2) {
      return node1.sourceIndex - node2.sourceIndex;
    } else {
      var parent1 = node1.parentNode;
      var parent2 = node2.parentNode;

      if (parent1 == parent2) {
        return goog.dom.compareSiblingOrder_(node1, node2);
      }

      if (!isElement1 && goog.dom.contains(parent1, node2)) {
        return -1 * goog.dom.compareParentsDescendantNodeIe_(node1, node2);
      }


      if (!isElement2 && goog.dom.contains(parent2, node1)) {
        return goog.dom.compareParentsDescendantNodeIe_(node2, node1);
      }

      return (isElement1 ? node1.sourceIndex : parent1.sourceIndex) -
             (isElement2 ? node2.sourceIndex : parent2.sourceIndex);
    }
  }

  // For Safari, we compare ranges.
  var doc = goog.dom.getOwnerDocument(node1);

  var range1, range2;
  range1 = doc.createRange();
  range1.selectNode(node1);
  range1.collapse(true);

  range2 = doc.createRange();
  range2.selectNode(node2);
  range2.collapse(true);

  return range1.compareBoundaryPoints(goog.global['Range'].START_TO_END,
      range2);
};


/**
 * Utility function to compare the position of two nodes, when
 * {@code textNode}'s parent is an ancestor of {@code node}.  If this entry
 * condition is not met, this function will attempt to reference a null object.
 * @param {Node} textNode The textNode to compare.
 * @param {Node} node The node to compare.
 * @return {number} -1 if node is before textNode, +1 otherwise.
 * @private
 */
goog.dom.compareParentsDescendantNodeIe_ = function(textNode, node) {
  var parent = textNode.parentNode;
  if (parent == node) {
    // If textNode is a child of node, then node comes first.
    return -1;
  }
  var sibling = node;
  while (sibling.parentNode != parent) {
    sibling = sibling.parentNode;
  }
  return goog.dom.compareSiblingOrder_(sibling, textNode);
};


/**
 * Utility function to compare the position of two nodes known to be non-equal
 * siblings.
 * @param {Node} node1 The first node to compare.
 * @param {Node} node2 The second node to compare.
 * @return {number} -1 if node1 is before node2, +1 otherwise.
 * @private
 */
goog.dom.compareSiblingOrder_ = function(node1, node2) {
  var s = node2;
  while ((s = s.previousSibling)) {
    if (s == node1) {
      // We just found node1 before node2.
      return -1;
    }
  }

  // Since we didn't find it, node1 must be after node2.
  return 1;
};


/**
 * Find the deepest common ancestor of the given nodes.
 * @param {...Node} var_args The nodes to find a common ancestor of.
 * @return {Node} The common ancestor of the nodes, or null if there is none.
 *     null will only be returned if two or more of the nodes are from different
 *     documents.
 */
goog.dom.findCommonAncestor = function(var_args) {
  var i, count = arguments.length;
  if (!count) {
    return null;
  } else if (count == 1) {
    return arguments[0];
  }

  var paths = [];
  var minLength = Infinity;
  for (i = 0; i < count; i++) {
    // Compute the list of ancestors.
    var ancestors = [];
    var node = arguments[i];
    while (node) {
      ancestors.unshift(node);
      node = node.parentNode;
    }

    // Save the list for comparison.
    paths.push(ancestors);
    minLength = Math.min(minLength, ancestors.length);
  }
  var output = null;
  for (i = 0; i < minLength; i++) {
    var first = paths[0][i];
    for (var j = 1; j < count; j++) {
      if (first != paths[j][i]) {
        return output;
      }
    }
    output = first;
  }
  return output;
};


/**
 * Returns the owner document for a node.
 * @param {Node|Window} node The node to get the document for.
 * @return {!Document} The document owning the node.
 */
goog.dom.getOwnerDocument = function(node) {
  // TODO(nnaze): Update param signature to be non-nullable.
  goog.asserts.assert(node, 'Node cannot be null or undefined.');
  return /** @type {!Document} */ (
      node.nodeType == goog.dom.NodeType.DOCUMENT ? node :
      node.ownerDocument || node.document);
};


/**
 * Cross-browser function for getting the document element of a frame or iframe.
 * @param {Element} frame Frame element.
 * @return {!Document} The frame content document.
 */
goog.dom.getFrameContentDocument = function(frame) {
  var doc = frame.contentDocument || frame.contentWindow.document;
  return doc;
};


/**
 * Cross-browser function for getting the window of a frame or iframe.
 * @param {Element} frame Frame element.
 * @return {Window} The window associated with the given frame.
 */
goog.dom.getFrameContentWindow = function(frame) {
  return frame.contentWindow ||
      goog.dom.getWindow(goog.dom.getFrameContentDocument(frame));
};


/**
 * Sets the text content of a node, with cross-browser support.
 * @param {Node} node The node to change the text content of.
 * @param {string|number} text The value that should replace the node's content.
 */
goog.dom.setTextContent = function(node, text) {
  goog.asserts.assert(node != null,
      'goog.dom.setTextContent expects a non-null value for node');

  if ('textContent' in node) {
    node.textContent = text;
  } else if (node.nodeType == goog.dom.NodeType.TEXT) {
    node.data = text;
  } else if (node.firstChild &&
             node.firstChild.nodeType == goog.dom.NodeType.TEXT) {
    // If the first child is a text node we just change its data and remove the
    // rest of the children.
    while (node.lastChild != node.firstChild) {
      node.removeChild(node.lastChild);
    }
    node.firstChild.data = text;
  } else {
    goog.dom.removeChildren(node);
    var doc = goog.dom.getOwnerDocument(node);
    node.appendChild(doc.createTextNode(String(text)));
  }
};


/**
 * Gets the outerHTML of a node, which islike innerHTML, except that it
 * actually contains the HTML of the node itself.
 * @param {Element} element The element to get the HTML of.
 * @return {string} The outerHTML of the given element.
 */
goog.dom.getOuterHtml = function(element) {
  // IE, Opera and WebKit all have outerHTML.
  if ('outerHTML' in element) {
    return element.outerHTML;
  } else {
    var doc = goog.dom.getOwnerDocument(element);
    var div = doc.createElement('div');
    div.appendChild(element.cloneNode(true));
    return div.innerHTML;
  }
};


/**
 * Finds the first descendant node that matches the filter function, using
 * a depth first search. This function offers the most general purpose way
 * of finding a matching element. You may also wish to consider
 * {@code goog.dom.query} which can express many matching criteria using
 * CSS selector expressions. These expressions often result in a more
 * compact representation of the desired result.
 * @see goog.dom.query
 *
 * @param {Node} root The root of the tree to search.
 * @param {function(Node) : boolean} p The filter function.
 * @return {Node|undefined} The found node or undefined if none is found.
 */
goog.dom.findNode = function(root, p) {
  var rv = [];
  var found = goog.dom.findNodes_(root, p, rv, true);
  return found ? rv[0] : undefined;
};


/**
 * Finds all the descendant nodes that match the filter function, using a
 * a depth first search. This function offers the most general-purpose way
 * of finding a set of matching elements. You may also wish to consider
 * {@code goog.dom.query} which can express many matching criteria using
 * CSS selector expressions. These expressions often result in a more
 * compact representation of the desired result.

 * @param {Node} root The root of the tree to search.
 * @param {function(Node) : boolean} p The filter function.
 * @return {!Array.<!Node>} The found nodes or an empty array if none are found.
 */
goog.dom.findNodes = function(root, p) {
  var rv = [];
  goog.dom.findNodes_(root, p, rv, false);
  return rv;
};


/**
 * Finds the first or all the descendant nodes that match the filter function,
 * using a depth first search.
 * @param {Node} root The root of the tree to search.
 * @param {function(Node) : boolean} p The filter function.
 * @param {!Array.<!Node>} rv The found nodes are added to this array.
 * @param {boolean} findOne If true we exit after the first found node.
 * @return {boolean} Whether the search is complete or not. True in case findOne
 *     is true and the node is found. False otherwise.
 * @private
 */
goog.dom.findNodes_ = function(root, p, rv, findOne) {
  if (root != null) {
    var child = root.firstChild;
    while (child) {
      if (p(child)) {
        rv.push(child);
        if (findOne) {
          return true;
        }
      }
      if (goog.dom.findNodes_(child, p, rv, findOne)) {
        return true;
      }
      child = child.nextSibling;
    }
  }
  return false;
};


/**
 * Map of tags whose content to ignore when calculating text length.
 * @type {Object}
 * @private
 */
goog.dom.TAGS_TO_IGNORE_ = {
  'SCRIPT': 1,
  'STYLE': 1,
  'HEAD': 1,
  'IFRAME': 1,
  'OBJECT': 1
};


/**
 * Map of tags which have predefined values with regard to whitespace.
 * @type {Object}
 * @private
 */
goog.dom.PREDEFINED_TAG_VALUES_ = {'IMG': ' ', 'BR': '\n'};


/**
 * Returns true if the element has a tab index that allows it to receive
 * keyboard focus (tabIndex >= 0), false otherwise.  Note that some elements
 * natively support keyboard focus, even if they have no tab index.
 * @param {Element} element Element to check.
 * @return {boolean} Whether the element has a tab index that allows keyboard
 *     focus.
 * @see http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
 */
goog.dom.isFocusableTabIndex = function(element) {
  return goog.dom.hasSpecifiedTabIndex_(element) &&
         goog.dom.isTabIndexFocusable_(element);
};


/**
 * Enables or disables keyboard focus support on the element via its tab index.
 * Only elements for which {@link goog.dom.isFocusableTabIndex} returns true
 * (or elements that natively support keyboard focus, like form elements) can
 * receive keyboard focus.  See http://go/tabindex for more info.
 * @param {Element} element Element whose tab index is to be changed.
 * @param {boolean} enable Whether to set or remove a tab index on the element
 *     that supports keyboard focus.
 */
goog.dom.setFocusableTabIndex = function(element, enable) {
  if (enable) {
    element.tabIndex = 0;
  } else {
    // Set tabIndex to -1 first, then remove it. This is a workaround for
    // Safari (confirmed in version 4 on Windows). When removing the attribute
    // without setting it to -1 first, the element remains keyboard focusable
    // despite not having a tabIndex attribute anymore.
    element.tabIndex = -1;
    element.removeAttribute('tabIndex'); // Must be camelCase!
  }
};


/**
 * Returns true if the element can be focused, i.e. it has a tab index that
 * allows it to receive keyboard focus (tabIndex >= 0), or it is an element
 * that natively supports keyboard focus.
 * @param {Element} element Element to check.
 * @return {boolean} Whether the element allows keyboard focus.
 */
goog.dom.isFocusable = function(element) {
  var focusable;
  // Some elements can have unspecified tab index and still receive focus.
  if (goog.dom.nativelySupportsFocus_(element)) {
    // Make sure the element is not disabled ...
    focusable = !element.disabled &&
        // ... and if a tab index is specified, it allows focus.
        (!goog.dom.hasSpecifiedTabIndex_(element) ||
         goog.dom.isTabIndexFocusable_(element));
  } else {
    focusable = goog.dom.isFocusableTabIndex(element);
  }

  // IE requires elements to be visible in order to focus them.
  return focusable && goog.userAgent.IE ?
             goog.dom.hasNonZeroBoundingRect_(element) : focusable;
};


/**
 * Returns true if the element has a specified tab index.
 * @param {Element} element Element to check.
 * @return {boolean} Whether the element has a specified tab index.
 * @private
 */
goog.dom.hasSpecifiedTabIndex_ = function(element) {
  // IE returns 0 for an unset tabIndex, so we must use getAttributeNode(),
  // which returns an object with a 'specified' property if tabIndex is
  // specified.  This works on other browsers, too.
  var attrNode = element.getAttributeNode('tabindex'); // Must be lowercase!
  return goog.isDefAndNotNull(attrNode) && attrNode.specified;
};


/**
 * Returns true if the element's tab index allows the element to be focused.
 * @param {Element} element Element to check.
 * @return {boolean} Whether the element's tab index allows focus.
 * @private
 */
goog.dom.isTabIndexFocusable_ = function(element) {
  var index = element.tabIndex;
  // NOTE: IE9 puts tabIndex in 16-bit int, e.g. -2 is 65534.
  return goog.isNumber(index) && index >= 0 && index < 32768;
};


/**
 * Returns true if the element is focusable even when tabIndex is not set.
 * @param {Element} element Element to check.
 * @return {boolean} Whether the element natively supports focus.
 * @private
 */
goog.dom.nativelySupportsFocus_ = function(element) {
  return element.tagName == goog.dom.TagName.A ||
         element.tagName == goog.dom.TagName.INPUT ||
         element.tagName == goog.dom.TagName.TEXTAREA ||
         element.tagName == goog.dom.TagName.SELECT ||
         element.tagName == goog.dom.TagName.BUTTON;
};


/**
 * Returns true if the element has a bounding rectangle that would be visible
 * (i.e. its width and height are greater than zero).
 * @param {Element} element Element to check.
 * @return {boolean} Whether the element has a non-zero bounding rectangle.
 * @private
 */
goog.dom.hasNonZeroBoundingRect_ = function(element) {
  var rect = goog.isFunction(element['getBoundingClientRect']) ?
      element.getBoundingClientRect() :
      {'height': element.offsetHeight, 'width': element.offsetWidth};
  return goog.isDefAndNotNull(rect) && rect.height > 0 && rect.width > 0;
};


/**
 * Returns the text content of the current node, without markup and invisible
 * symbols. New lines are stripped and whitespace is collapsed,
 * such that each character would be visible.
 *
 * In browsers that support it, innerText is used.  Other browsers attempt to
 * simulate it via node traversal.  Line breaks are canonicalized in IE.
 *
 * @param {Node} node The node from which we are getting content.
 * @return {string} The text content.
 */
goog.dom.getTextContent = function(node) {
  var textContent;
  // Note(arv): IE9, Opera, and Safari 3 support innerText but they include
  // text nodes in script tags. So we revert to use a user agent test here.
  if (goog.dom.BrowserFeature.CAN_USE_INNER_TEXT && ('innerText' in node)) {
    textContent = goog.string.canonicalizeNewlines(node.innerText);
    // Unfortunately .innerText() returns text with &shy; symbols
    // We need to filter it out and then remove duplicate whitespaces
  } else {
    var buf = [];
    goog.dom.getTextContent_(node, buf, true);
    textContent = buf.join('');
  }

  // Strip &shy; entities. goog.format.insertWordBreaks inserts them in Opera.
  textContent = textContent.replace(/ \xAD /g, ' ').replace(/\xAD/g, '');
  // Strip &#8203; entities. goog.format.insertWordBreaks inserts them in IE8.
  textContent = textContent.replace(/\u200B/g, '');

  // Skip this replacement on old browsers with working innerText, which
  // automatically turns &nbsp; into ' ' and / +/ into ' ' when reading
  // innerText.
  if (!goog.dom.BrowserFeature.CAN_USE_INNER_TEXT) {
    textContent = textContent.replace(/ +/g, ' ');
  }
  if (textContent != ' ') {
    textContent = textContent.replace(/^\s*/, '');
  }

  return textContent;
};


/**
 * Returns the text content of the current node, without markup.
 *
 * Unlike {@code getTextContent} this method does not collapse whitespaces
 * or normalize lines breaks.
 *
 * @param {Node} node The node from which we are getting content.
 * @return {string} The raw text content.
 */
goog.dom.getRawTextContent = function(node) {
  var buf = [];
  goog.dom.getTextContent_(node, buf, false);

  return buf.join('');
};


/**
 * Recursive support function for text content retrieval.
 *
 * @param {Node} node The node from which we are getting content.
 * @param {Array} buf string buffer.
 * @param {boolean} normalizeWhitespace Whether to normalize whitespace.
 * @private
 */
goog.dom.getTextContent_ = function(node, buf, normalizeWhitespace) {
  if (node.nodeName in goog.dom.TAGS_TO_IGNORE_) {
    // ignore certain tags
  } else if (node.nodeType == goog.dom.NodeType.TEXT) {
    if (normalizeWhitespace) {
      buf.push(String(node.nodeValue).replace(/(\r\n|\r|\n)/g, ''));
    } else {
      buf.push(node.nodeValue);
    }
  } else if (node.nodeName in goog.dom.PREDEFINED_TAG_VALUES_) {
    buf.push(goog.dom.PREDEFINED_TAG_VALUES_[node.nodeName]);
  } else {
    var child = node.firstChild;
    while (child) {
      goog.dom.getTextContent_(child, buf, normalizeWhitespace);
      child = child.nextSibling;
    }
  }
};


/**
 * Returns the text length of the text contained in a node, without markup. This
 * is equivalent to the selection length if the node was selected, or the number
 * of cursor movements to traverse the node. Images & BRs take one space.  New
 * lines are ignored.
 *
 * @param {Node} node The node whose text content length is being calculated.
 * @return {number} The length of {@code node}'s text content.
 */
goog.dom.getNodeTextLength = function(node) {
  return goog.dom.getTextContent(node).length;
};


/**
 * Returns the text offset of a node relative to one of its ancestors. The text
 * length is the same as the length calculated by goog.dom.getNodeTextLength.
 *
 * @param {Node} node The node whose offset is being calculated.
 * @param {Node=} opt_offsetParent The node relative to which the offset will
 *     be calculated. Defaults to the node's owner document's body.
 * @return {number} The text offset.
 */
goog.dom.getNodeTextOffset = function(node, opt_offsetParent) {
  var root = opt_offsetParent || goog.dom.getOwnerDocument(node).body;
  var buf = [];
  while (node && node != root) {
    var cur = node;
    while ((cur = cur.previousSibling)) {
      buf.unshift(goog.dom.getTextContent(cur));
    }
    node = node.parentNode;
  }
  // Trim left to deal with FF cases when there might be line breaks and empty
  // nodes at the front of the text
  return goog.string.trimLeft(buf.join('')).replace(/ +/g, ' ').length;
};


/**
 * Returns the node at a given offset in a parent node.  If an object is
 * provided for the optional third parameter, the node and the remainder of the
 * offset will stored as properties of this object.
 * @param {Node} parent The parent node.
 * @param {number} offset The offset into the parent node.
 * @param {Object=} opt_result Object to be used to store the return value. The
 *     return value will be stored in the form {node: Node, remainder: number}
 *     if this object is provided.
 * @return {Node} The node at the given offset.
 */
goog.dom.getNodeAtOffset = function(parent, offset, opt_result) {
  var stack = [parent], pos = 0, cur = null;
  while (stack.length > 0 && pos < offset) {
    cur = stack.pop();
    if (cur.nodeName in goog.dom.TAGS_TO_IGNORE_) {
      // ignore certain tags
    } else if (cur.nodeType == goog.dom.NodeType.TEXT) {
      var text = cur.nodeValue.replace(/(\r\n|\r|\n)/g, '').replace(/ +/g, ' ');
      pos += text.length;
    } else if (cur.nodeName in goog.dom.PREDEFINED_TAG_VALUES_) {
      pos += goog.dom.PREDEFINED_TAG_VALUES_[cur.nodeName].length;
    } else {
      for (var i = cur.childNodes.length - 1; i >= 0; i--) {
        stack.push(cur.childNodes[i]);
      }
    }
  }
  if (goog.isObject(opt_result)) {
    opt_result.remainder = cur ? cur.nodeValue.length + offset - pos - 1 : 0;
    opt_result.node = cur;
  }

  return cur;
};


/**
 * Returns true if the object is a {@code NodeList}.  To qualify as a NodeList,
 * the object must have a numeric length property and an item function (which
 * has type 'string' on IE for some reason).
 * @param {Object} val Object to test.
 * @return {boolean} Whether the object is a NodeList.
 */
goog.dom.isNodeList = function(val) {
  // TODO(attila): Now the isNodeList is part of goog.dom we can use
  // goog.userAgent to make this simpler.
  // A NodeList must have a length property of type 'number' on all platforms.
  if (val && typeof val.length == 'number') {
    // A NodeList is an object everywhere except Safari, where it's a function.
    if (goog.isObject(val)) {
      // A NodeList must have an item function (on non-IE platforms) or an item
      // property of type 'string' (on IE).
      return typeof val.item == 'function' || typeof val.item == 'string';
    } else if (goog.isFunction(val)) {
      // On Safari, a NodeList is a function with an item property that is also
      // a function.
      return typeof val.item == 'function';
    }
  }

  // Not a NodeList.
  return false;
};


/**
 * Walks up the DOM hierarchy returning the first ancestor that has the passed
 * tag name and/or class name. If the passed element matches the specified
 * criteria, the element itself is returned.
 * @param {Node} element The DOM node to start with.
 * @param {?(goog.dom.TagName|string)=} opt_tag The tag name to match (or
 *     null/undefined to match only based on class name).
 * @param {?string=} opt_class The class name to match (or null/undefined to
 *     match only based on tag name).
 * @return {Element} The first ancestor that matches the passed criteria, or
 *     null if no match is found.
 */
goog.dom.getAncestorByTagNameAndClass = function(element, opt_tag, opt_class) {
  if (!opt_tag && !opt_class) {
    return null;
  }
  var tagName = opt_tag ? opt_tag.toUpperCase() : null;
  return /** @type {Element} */ (goog.dom.getAncestor(element,
      function(node) {
        return (!tagName || node.nodeName == tagName) &&
               (!opt_class || goog.isString(node.className) &&
                   goog.array.contains(node.className.split(/\s+/), opt_class));
      }, true));
};


/**
 * Walks up the DOM hierarchy returning the first ancestor that has the passed
 * class name. If the passed element matches the specified criteria, the
 * element itself is returned.
 * @param {Node} element The DOM node to start with.
 * @param {string} className The class name to match.
 * @return {Element} The first ancestor that matches the passed criteria, or
 *     null if none match.
 */
goog.dom.getAncestorByClass = function(element, className) {
  return goog.dom.getAncestorByTagNameAndClass(element, null, className);
};


/**
 * Walks up the DOM hierarchy returning the first ancestor that passes the
 * matcher function.
 * @param {Node} element The DOM node to start with.
 * @param {function(Node) : boolean} matcher A function that returns true if the
 *     passed node matches the desired criteria.
 * @param {boolean=} opt_includeNode If true, the node itself is included in
 *     the search (the first call to the matcher will pass startElement as
 *     the node to test).
 * @param {number=} opt_maxSearchSteps Maximum number of levels to search up the
 *     dom.
 * @return {Node} DOM node that matched the matcher, or null if there was
 *     no match.
 */
goog.dom.getAncestor = function(
    element, matcher, opt_includeNode, opt_maxSearchSteps) {
  if (!opt_includeNode) {
    element = element.parentNode;
  }
  var ignoreSearchSteps = opt_maxSearchSteps == null;
  var steps = 0;
  while (element && (ignoreSearchSteps || steps <= opt_maxSearchSteps)) {
    if (matcher(element)) {
      return element;
    }
    element = element.parentNode;
    steps++;
  }
  // Reached the root of the DOM without a match
  return null;
};


/**
 * Determines the active element in the given document.
 * @param {Document} doc The document to look in.
 * @return {Element} The active element.
 */
goog.dom.getActiveElement = function(doc) {
  try {
    return doc && doc.activeElement;
  } catch (e) {
    // NOTE(nicksantos): Sometimes, evaluating document.activeElement in IE
    // throws an exception. I'm not 100% sure why, but I suspect it chokes
    // on document.activeElement if the activeElement has been recently
    // removed from the DOM by a JS operation.
    //
    // We assume that an exception here simply means
    // "there is no active element."
  }

  return null;
};


/**
 * @private {number} Cached version of the devicePixelRatio.
 */
goog.dom.devicePixelRatio_;


/**
 * Gives the devicePixelRatio, or attempts to determine if not present.
 *
 * By default, this is the same value given by window.devicePixelRatio. If
 * devicePixelRatio is not defined, the ratio is calculated with
 * window.matchMedia, if present. Otherwise, gives 1.0.
 *
 * This function is cached so that the pixel ratio is calculated only once
 * and only calculated when first requested.
 *
 * @return {number} The number of actual pixels per virtual pixel.
 */
goog.dom.getPixelRatio = goog.functions.cacheReturnValue(function() {
  var win = goog.dom.getWindow();

  // devicePixelRatio does not work on Mobile firefox.
  // TODO(user): Enable this check on a known working mobile Gecko version.
  // Filed a bug: https://bugzilla.mozilla.org/show_bug.cgi?id=896804
  var isFirefoxMobile = goog.userAgent.GECKO && goog.userAgent.MOBILE;

  if (goog.isDef(win.devicePixelRatio) && !isFirefoxMobile) {
    return win.devicePixelRatio;
  } else if (win.matchMedia) {
    return goog.dom.matchesPixelRatio_(.75) ||
           goog.dom.matchesPixelRatio_(1.5) ||
           goog.dom.matchesPixelRatio_(2) ||
           goog.dom.matchesPixelRatio_(3) || 1;
  }
  return 1;
});


/**
 * Calculates a mediaQuery to check if the current device supports the
 * given actual to virtual pixel ratio.
 * @param {number} pixelRatio The ratio of actual pixels to virtual pixels.
 * @return {number} pixelRatio if applicable, otherwise 0.
 * @private
 */
goog.dom.matchesPixelRatio_ = function(pixelRatio) {
  var win = goog.dom.getWindow();
  var query = ('(-webkit-min-device-pixel-ratio: ' + pixelRatio + '),' +
               '(min--moz-device-pixel-ratio: ' + pixelRatio + '),' +
               '(min-resolution: ' + pixelRatio + 'dppx)');
  return win.matchMedia(query).matches ? pixelRatio : 0;
};



/**
 * Create an instance of a DOM helper with a new document object.
 * @param {Document=} opt_document Document object to associate with this
 *     DOM helper.
 * @constructor
 */
goog.dom.DomHelper = function(opt_document) {
  /**
   * Reference to the document object to use
   * @type {!Document}
   * @private
   */
  this.document_ = opt_document || goog.global.document || document;
};


/**
 * Gets the dom helper object for the document where the element resides.
 * @param {Node=} opt_node If present, gets the DomHelper for this node.
 * @return {!goog.dom.DomHelper} The DomHelper.
 */
goog.dom.DomHelper.prototype.getDomHelper = goog.dom.getDomHelper;


/**
 * Sets the document object.
 * @param {!Document} document Document object.
 */
goog.dom.DomHelper.prototype.setDocument = function(document) {
  this.document_ = document;
};


/**
 * Gets the document object being used by the dom library.
 * @return {!Document} Document object.
 */
goog.dom.DomHelper.prototype.getDocument = function() {
  return this.document_;
};


/**
 * Alias for {@code getElementById}. If a DOM node is passed in then we just
 * return that.
 * @param {string|Element} element Element ID or a DOM node.
 * @return {Element} The element with the given ID, or the node passed in.
 */
goog.dom.DomHelper.prototype.getElement = function(element) {
  return goog.dom.getElementHelper_(this.document_, element);
};


/**
 * Gets an element by id, asserting that the element is found.
 *
 * This is used when an element is expected to exist, and should fail with
 * an assertion error if it does not (if assertions are enabled).
 *
 * @param {string} id Element ID.
 * @return {!Element} The element with the given ID, if it exists.
 */
goog.dom.DomHelper.prototype.getRequiredElement = function(id) {
  return goog.dom.getRequiredElementHelper_(this.document_, id);
};


/**
 * Alias for {@code getElement}.
 * @param {string|Element} element Element ID or a DOM node.
 * @return {Element} The element with the given ID, or the node passed in.
 * @deprecated Use {@link goog.dom.DomHelper.prototype.getElement} instead.
 */
goog.dom.DomHelper.prototype.$ = goog.dom.DomHelper.prototype.getElement;


/**
 * Looks up elements by both tag and class name, using browser native functions
 * ({@code querySelectorAll}, {@code getElementsByTagName} or
 * {@code getElementsByClassName}) where possible. The returned array is a live
 * NodeList or a static list depending on the code path taken.
 *
 * @see goog.dom.query
 *
 * @param {?string=} opt_tag Element tag name or * for all tags.
 * @param {?string=} opt_class Optional class name.
 * @param {(Document|Element)=} opt_el Optional element to look in.
 * @return { {length: number} } Array-like list of elements (only a length
 *     property and numerical indices are guaranteed to exist).
 */
goog.dom.DomHelper.prototype.getElementsByTagNameAndClass = function(opt_tag,
                                                                     opt_class,
                                                                     opt_el) {
  return goog.dom.getElementsByTagNameAndClass_(this.document_, opt_tag,
                                                opt_class, opt_el);
};


/**
 * Returns an array of all the elements with the provided className.
 * @see {goog.dom.query}
 * @param {string} className the name of the class to look for.
 * @param {Element|Document=} opt_el Optional element to look in.
 * @return { {length: number} } The items found with the class name provided.
 */
goog.dom.DomHelper.prototype.getElementsByClass = function(className, opt_el) {
  var doc = opt_el || this.document_;
  return goog.dom.getElementsByClass(className, doc);
};


/**
 * Returns the first element we find matching the provided class name.
 * @see {goog.dom.query}
 * @param {string} className the name of the class to look for.
 * @param {(Element|Document)=} opt_el Optional element to look in.
 * @return {Element} The first item found with the class name provided.
 */
goog.dom.DomHelper.prototype.getElementByClass = function(className, opt_el) {
  var doc = opt_el || this.document_;
  return goog.dom.getElementByClass(className, doc);
};


/**
 * Ensures an element with the given className exists, and then returns the
 * first element with the provided className.
 * @see {goog.dom.query}
 * @param {string} className the name of the class to look for.
 * @param {(!Element|!Document)=} opt_root Optional element or document to look
 *     in.
 * @return {!Element} The first item found with the class name provided.
 * @throws {goog.asserts.AssertionError} Thrown if no element is found.
 */
goog.dom.DomHelper.prototype.getRequiredElementByClass = function(className,
                                                                  opt_root) {
  var root = opt_root || this.document_;
  return goog.dom.getRequiredElementByClass(className, root);
};


/**
 * Alias for {@code getElementsByTagNameAndClass}.
 * @deprecated Use DomHelper getElementsByTagNameAndClass.
 * @see goog.dom.query
 *
 * @param {?string=} opt_tag Element tag name.
 * @param {?string=} opt_class Optional class name.
 * @param {Element=} opt_el Optional element to look in.
 * @return { {length: number} } Array-like list of elements (only a length
 *     property and numerical indices are guaranteed to exist).
 */
goog.dom.DomHelper.prototype.$$ =
    goog.dom.DomHelper.prototype.getElementsByTagNameAndClass;


/**
 * Sets a number of properties on a node.
 * @param {Element} element DOM node to set properties on.
 * @param {Object} properties Hash of property:value pairs.
 */
goog.dom.DomHelper.prototype.setProperties = goog.dom.setProperties;


/**
 * Gets the dimensions of the viewport.
 * @param {Window=} opt_window Optional window element to test. Defaults to
 *     the window of the Dom Helper.
 * @return {!goog.math.Size} Object with values 'width' and 'height'.
 */
goog.dom.DomHelper.prototype.getViewportSize = function(opt_window) {
  // TODO(arv): This should not take an argument. That breaks the rule of a
  // a DomHelper representing a single frame/window/document.
  return goog.dom.getViewportSize(opt_window || this.getWindow());
};


/**
 * Calculates the height of the document.
 *
 * @return {number} The height of the document.
 */
goog.dom.DomHelper.prototype.getDocumentHeight = function() {
  return goog.dom.getDocumentHeight_(this.getWindow());
};


/**
 * Typedef for use with goog.dom.createDom and goog.dom.append.
 * @typedef {Object|string|Array|NodeList}
 */
goog.dom.Appendable;


/**
 * Returns a dom node with a set of attributes.  This function accepts varargs
 * for subsequent nodes to be added.  Subsequent nodes will be added to the
 * first node as childNodes.
 *
 * So:
 * <code>createDom('div', null, createDom('p'), createDom('p'));</code>
 * would return a div with two child paragraphs
 *
 * An easy way to move all child nodes of an existing element to a new parent
 * element is:
 * <code>createDom('div', null, oldElement.childNodes);</code>
 * which will remove all child nodes from the old element and add them as
 * child nodes of the new DIV.
 *
 * @param {string} tagName Tag to create.
 * @param {Object|string=} opt_attributes If object, then a map of name-value
 *     pairs for attributes. If a string, then this is the className of the new
 *     element.
 * @param {...goog.dom.Appendable} var_args Further DOM nodes or
 *     strings for text nodes. If one of the var_args is an array or
 *     NodeList, its elements will be added as childNodes instead.
 * @return {!Element} Reference to a DOM node.
 */
goog.dom.DomHelper.prototype.createDom = function(tagName,
                                                  opt_attributes,
                                                  var_args) {
  return goog.dom.createDom_(this.document_, arguments);
};


/**
 * Alias for {@code createDom}.
 * @param {string} tagName Tag to create.
 * @param {(Object|string)=} opt_attributes If object, then a map of name-value
 *     pairs for attributes. If a string, then this is the className of the new
 *     element.
 * @param {...goog.dom.Appendable} var_args Further DOM nodes or strings for
 *     text nodes.  If one of the var_args is an array, its children will be
 *     added as childNodes instead.
 * @return {!Element} Reference to a DOM node.
 * @deprecated Use {@link goog.dom.DomHelper.prototype.createDom} instead.
 */
goog.dom.DomHelper.prototype.$dom = goog.dom.DomHelper.prototype.createDom;


/**
 * Creates a new element.
 * @param {string} name Tag name.
 * @return {!Element} The new element.
 */
goog.dom.DomHelper.prototype.createElement = function(name) {
  return this.document_.createElement(name);
};


/**
 * Creates a new text node.
 * @param {number|string} content Content.
 * @return {!Text} The new text node.
 */
goog.dom.DomHelper.prototype.createTextNode = function(content) {
  return this.document_.createTextNode(String(content));
};


/**
 * Create a table.
 * @param {number} rows The number of rows in the table.  Must be >= 1.
 * @param {number} columns The number of columns in the table.  Must be >= 1.
 * @param {boolean=} opt_fillWithNbsp If true, fills table entries with nsbps.
 * @return {!Element} The created table.
 */
goog.dom.DomHelper.prototype.createTable = function(rows, columns,
    opt_fillWithNbsp) {
  return goog.dom.createTable_(this.document_, rows, columns,
      !!opt_fillWithNbsp);
};


/**
 * Converts an HTML string into a node or a document fragment.  A single Node
 * is used if the {@code htmlString} only generates a single node.  If the
 * {@code htmlString} generates multiple nodes then these are put inside a
 * {@code DocumentFragment}.
 *
 * @param {string} htmlString The HTML string to convert.
 * @return {!Node} The resulting node.
 */
goog.dom.DomHelper.prototype.htmlToDocumentFragment = function(htmlString) {
  return goog.dom.htmlToDocumentFragment_(this.document_, htmlString);
};


/**
 * Returns true if the browser is in "CSS1-compatible" (standards-compliant)
 * mode, false otherwise.
 * @return {boolean} True if in CSS1-compatible mode.
 */
goog.dom.DomHelper.prototype.isCss1CompatMode = function() {
  return goog.dom.isCss1CompatMode_(this.document_);
};


/**
 * Gets the window object associated with the document.
 * @return {!Window} The window associated with the given document.
 */
goog.dom.DomHelper.prototype.getWindow = function() {
  return goog.dom.getWindow_(this.document_);
};


/**
 * Gets the document scroll element.
 * @return {!Element} Scrolling element.
 */
goog.dom.DomHelper.prototype.getDocumentScrollElement = function() {
  return goog.dom.getDocumentScrollElement_(this.document_);
};


/**
 * Gets the document scroll distance as a coordinate object.
 * @return {!goog.math.Coordinate} Object with properties 'x' and 'y'.
 */
goog.dom.DomHelper.prototype.getDocumentScroll = function() {
  return goog.dom.getDocumentScroll_(this.document_);
};


/**
 * Determines the active element in the given document.
 * @param {Document=} opt_doc The document to look in.
 * @return {Element} The active element.
 */
goog.dom.DomHelper.prototype.getActiveElement = function(opt_doc) {
  return goog.dom.getActiveElement(opt_doc || this.document_);
};


/**
 * Appends a child to a node.
 * @param {Node} parent Parent.
 * @param {Node} child Child.
 */
goog.dom.DomHelper.prototype.appendChild = goog.dom.appendChild;


/**
 * Appends a node with text or other nodes.
 * @param {!Node} parent The node to append nodes to.
 * @param {...goog.dom.Appendable} var_args The things to append to the node.
 *     If this is a Node it is appended as is.
 *     If this is a string then a text node is appended.
 *     If this is an array like object then fields 0 to length - 1 are appended.
 */
goog.dom.DomHelper.prototype.append = goog.dom.append;


/**
 * Determines if the given node can contain children, intended to be used for
 * HTML generation.
 *
 * @param {Node} node The node to check.
 * @return {boolean} Whether the node can contain children.
 */
goog.dom.DomHelper.prototype.canHaveChildren = goog.dom.canHaveChildren;


/**
 * Removes all the child nodes on a DOM node.
 * @param {Node} node Node to remove children from.
 */
goog.dom.DomHelper.prototype.removeChildren = goog.dom.removeChildren;


/**
 * Inserts a new node before an existing reference node (i.e., as the previous
 * sibling). If the reference node has no parent, then does nothing.
 * @param {Node} newNode Node to insert.
 * @param {Node} refNode Reference node to insert before.
 */
goog.dom.DomHelper.prototype.insertSiblingBefore = goog.dom.insertSiblingBefore;


/**
 * Inserts a new node after an existing reference node (i.e., as the next
 * sibling). If the reference node has no parent, then does nothing.
 * @param {Node} newNode Node to insert.
 * @param {Node} refNode Reference node to insert after.
 */
goog.dom.DomHelper.prototype.insertSiblingAfter = goog.dom.insertSiblingAfter;


/**
 * Insert a child at a given index. If index is larger than the number of child
 * nodes that the parent currently has, the node is inserted as the last child
 * node.
 * @param {Element} parent The element into which to insert the child.
 * @param {Node} child The element to insert.
 * @param {number} index The index at which to insert the new child node. Must
 *     not be negative.
 */
goog.dom.DomHelper.prototype.insertChildAt = goog.dom.insertChildAt;


/**
 * Removes a node from its parent.
 * @param {Node} node The node to remove.
 * @return {Node} The node removed if removed; else, null.
 */
goog.dom.DomHelper.prototype.removeNode = goog.dom.removeNode;


/**
 * Replaces a node in the DOM tree. Will do nothing if {@code oldNode} has no
 * parent.
 * @param {Node} newNode Node to insert.
 * @param {Node} oldNode Node to replace.
 */
goog.dom.DomHelper.prototype.replaceNode = goog.dom.replaceNode;


/**
 * Flattens an element. That is, removes it and replace it with its children.
 * @param {Element} element The element to flatten.
 * @return {Element|undefined} The original element, detached from the document
 *     tree, sans children, or undefined if the element was already not in the
 *     document.
 */
goog.dom.DomHelper.prototype.flattenElement = goog.dom.flattenElement;


/**
 * Returns an array containing just the element children of the given element.
 * @param {Element} element The element whose element children we want.
 * @return {!(Array|NodeList)} An array or array-like list of just the element
 *     children of the given element.
 */
goog.dom.DomHelper.prototype.getChildren = goog.dom.getChildren;


/**
 * Returns the first child node that is an element.
 * @param {Node} node The node to get the first child element of.
 * @return {Element} The first child node of {@code node} that is an element.
 */
goog.dom.DomHelper.prototype.getFirstElementChild =
    goog.dom.getFirstElementChild;


/**
 * Returns the last child node that is an element.
 * @param {Node} node The node to get the last child element of.
 * @return {Element} The last child node of {@code node} that is an element.
 */
goog.dom.DomHelper.prototype.getLastElementChild = goog.dom.getLastElementChild;


/**
 * Returns the first next sibling that is an element.
 * @param {Node} node The node to get the next sibling element of.
 * @return {Element} The next sibling of {@code node} that is an element.
 */
goog.dom.DomHelper.prototype.getNextElementSibling =
    goog.dom.getNextElementSibling;


/**
 * Returns the first previous sibling that is an element.
 * @param {Node} node The node to get the previous sibling element of.
 * @return {Element} The first previous sibling of {@code node} that is
 *     an element.
 */
goog.dom.DomHelper.prototype.getPreviousElementSibling =
    goog.dom.getPreviousElementSibling;


/**
 * Returns the next node in source order from the given node.
 * @param {Node} node The node.
 * @return {Node} The next node in the DOM tree, or null if this was the last
 *     node.
 */
goog.dom.DomHelper.prototype.getNextNode = goog.dom.getNextNode;


/**
 * Returns the previous node in source order from the given node.
 * @param {Node} node The node.
 * @return {Node} The previous node in the DOM tree, or null if this was the
 *     first node.
 */
goog.dom.DomHelper.prototype.getPreviousNode = goog.dom.getPreviousNode;


/**
 * Whether the object looks like a DOM node.
 * @param {?} obj The object being tested for node likeness.
 * @return {boolean} Whether the object looks like a DOM node.
 */
goog.dom.DomHelper.prototype.isNodeLike = goog.dom.isNodeLike;


/**
 * Whether the object looks like an Element.
 * @param {?} obj The object being tested for Element likeness.
 * @return {boolean} Whether the object looks like an Element.
 */
goog.dom.DomHelper.prototype.isElement = goog.dom.isElement;


/**
 * Returns true if the specified value is a Window object. This includes the
 * global window for HTML pages, and iframe windows.
 * @param {?} obj Variable to test.
 * @return {boolean} Whether the variable is a window.
 */
goog.dom.DomHelper.prototype.isWindow = goog.dom.isWindow;


/**
 * Returns an element's parent, if it's an Element.
 * @param {Element} element The DOM element.
 * @return {Element} The parent, or null if not an Element.
 */
goog.dom.DomHelper.prototype.getParentElement = goog.dom.getParentElement;


/**
 * Whether a node contains another node.
 * @param {Node} parent The node that should contain the other node.
 * @param {Node} descendant The node to test presence of.
 * @return {boolean} Whether the parent node contains the descendent node.
 */
goog.dom.DomHelper.prototype.contains = goog.dom.contains;


/**
 * Compares the document order of two nodes, returning 0 if they are the same
 * node, a negative number if node1 is before node2, and a positive number if
 * node2 is before node1.  Note that we compare the order the tags appear in the
 * document so in the tree <b><i>text</i></b> the B node is considered to be
 * before the I node.
 *
 * @param {Node} node1 The first node to compare.
 * @param {Node} node2 The second node to compare.
 * @return {number} 0 if the nodes are the same node, a negative number if node1
 *     is before node2, and a positive number if node2 is before node1.
 */
goog.dom.DomHelper.prototype.compareNodeOrder = goog.dom.compareNodeOrder;


/**
 * Find the deepest common ancestor of the given nodes.
 * @param {...Node} var_args The nodes to find a common ancestor of.
 * @return {Node} The common ancestor of the nodes, or null if there is none.
 *     null will only be returned if two or more of the nodes are from different
 *     documents.
 */
goog.dom.DomHelper.prototype.findCommonAncestor = goog.dom.findCommonAncestor;


/**
 * Returns the owner document for a node.
 * @param {Node} node The node to get the document for.
 * @return {!Document} The document owning the node.
 */
goog.dom.DomHelper.prototype.getOwnerDocument = goog.dom.getOwnerDocument;


/**
 * Cross browser function for getting the document element of an iframe.
 * @param {Element} iframe Iframe element.
 * @return {!Document} The frame content document.
 */
goog.dom.DomHelper.prototype.getFrameContentDocument =
    goog.dom.getFrameContentDocument;


/**
 * Cross browser function for getting the window of a frame or iframe.
 * @param {Element} frame Frame element.
 * @return {Window} The window associated with the given frame.
 */
goog.dom.DomHelper.prototype.getFrameContentWindow =
    goog.dom.getFrameContentWindow;


/**
 * Sets the text content of a node, with cross-browser support.
 * @param {Node} node The node to change the text content of.
 * @param {string|number} text The value that should replace the node's content.
 */
goog.dom.DomHelper.prototype.setTextContent = goog.dom.setTextContent;


/**
 * Gets the outerHTML of a node, which islike innerHTML, except that it
 * actually contains the HTML of the node itself.
 * @param {Element} element The element to get the HTML of.
 * @return {string} The outerHTML of the given element.
 */
goog.dom.DomHelper.prototype.getOuterHtml = goog.dom.getOuterHtml;


/**
 * Finds the first descendant node that matches the filter function. This does
 * a depth first search.
 * @param {Node} root The root of the tree to search.
 * @param {function(Node) : boolean} p The filter function.
 * @return {Node|undefined} The found node or undefined if none is found.
 */
goog.dom.DomHelper.prototype.findNode = goog.dom.findNode;


/**
 * Finds all the descendant nodes that matches the filter function. This does a
 * depth first search.
 * @param {Node} root The root of the tree to search.
 * @param {function(Node) : boolean} p The filter function.
 * @return {Array.<Node>} The found nodes or an empty array if none are found.
 */
goog.dom.DomHelper.prototype.findNodes = goog.dom.findNodes;


/**
 * Returns true if the element has a tab index that allows it to receive
 * keyboard focus (tabIndex >= 0), false otherwise.  Note that some elements
 * natively support keyboard focus, even if they have no tab index.
 * @param {Element} element Element to check.
 * @return {boolean} Whether the element has a tab index that allows keyboard
 *     focus.
 */
goog.dom.DomHelper.prototype.isFocusableTabIndex = goog.dom.isFocusableTabIndex;


/**
 * Enables or disables keyboard focus support on the element via its tab index.
 * Only elements for which {@link goog.dom.isFocusableTabIndex} returns true
 * (or elements that natively support keyboard focus, like form elements) can
 * receive keyboard focus.  See http://go/tabindex for more info.
 * @param {Element} element Element whose tab index is to be changed.
 * @param {boolean} enable Whether to set or remove a tab index on the element
 *     that supports keyboard focus.
 */
goog.dom.DomHelper.prototype.setFocusableTabIndex =
    goog.dom.setFocusableTabIndex;


/**
 * Returns true if the element can be focused, i.e. it has a tab index that
 * allows it to receive keyboard focus (tabIndex >= 0), or it is an element
 * that natively supports keyboard focus.
 * @param {Element} element Element to check.
 * @return {boolean} Whether the element allows keyboard focus.
 */
goog.dom.DomHelper.prototype.isFocusable = goog.dom.isFocusable;


/**
 * Returns the text contents of the current node, without markup. New lines are
 * stripped and whitespace is collapsed, such that each character would be
 * visible.
 *
 * In browsers that support it, innerText is used.  Other browsers attempt to
 * simulate it via node traversal.  Line breaks are canonicalized in IE.
 *
 * @param {Node} node The node from which we are getting content.
 * @return {string} The text content.
 */
goog.dom.DomHelper.prototype.getTextContent = goog.dom.getTextContent;


/**
 * Returns the text length of the text contained in a node, without markup. This
 * is equivalent to the selection length if the node was selected, or the number
 * of cursor movements to traverse the node. Images & BRs take one space.  New
 * lines are ignored.
 *
 * @param {Node} node The node whose text content length is being calculated.
 * @return {number} The length of {@code node}'s text content.
 */
goog.dom.DomHelper.prototype.getNodeTextLength = goog.dom.getNodeTextLength;


/**
 * Returns the text offset of a node relative to one of its ancestors. The text
 * length is the same as the length calculated by
 * {@code goog.dom.getNodeTextLength}.
 *
 * @param {Node} node The node whose offset is being calculated.
 * @param {Node=} opt_offsetParent Defaults to the node's owner document's body.
 * @return {number} The text offset.
 */
goog.dom.DomHelper.prototype.getNodeTextOffset = goog.dom.getNodeTextOffset;


/**
 * Returns the node at a given offset in a parent node.  If an object is
 * provided for the optional third parameter, the node and the remainder of the
 * offset will stored as properties of this object.
 * @param {Node} parent The parent node.
 * @param {number} offset The offset into the parent node.
 * @param {Object=} opt_result Object to be used to store the return value. The
 *     return value will be stored in the form {node: Node, remainder: number}
 *     if this object is provided.
 * @return {Node} The node at the given offset.
 */
goog.dom.DomHelper.prototype.getNodeAtOffset = goog.dom.getNodeAtOffset;


/**
 * Returns true if the object is a {@code NodeList}.  To qualify as a NodeList,
 * the object must have a numeric length property and an item function (which
 * has type 'string' on IE for some reason).
 * @param {Object} val Object to test.
 * @return {boolean} Whether the object is a NodeList.
 */
goog.dom.DomHelper.prototype.isNodeList = goog.dom.isNodeList;


/**
 * Walks up the DOM hierarchy returning the first ancestor that has the passed
 * tag name and/or class name. If the passed element matches the specified
 * criteria, the element itself is returned.
 * @param {Node} element The DOM node to start with.
 * @param {?(goog.dom.TagName|string)=} opt_tag The tag name to match (or
 *     null/undefined to match only based on class name).
 * @param {?string=} opt_class The class name to match (or null/undefined to
 *     match only based on tag name).
 * @return {Element} The first ancestor that matches the passed criteria, or
 *     null if no match is found.
 */
goog.dom.DomHelper.prototype.getAncestorByTagNameAndClass =
    goog.dom.getAncestorByTagNameAndClass;


/**
 * Walks up the DOM hierarchy returning the first ancestor that has the passed
 * class name. If the passed element matches the specified criteria, the
 * element itself is returned.
 * @param {Node} element The DOM node to start with.
 * @param {string} class The class name to match.
 * @return {Element} The first ancestor that matches the passed criteria, or
 *     null if none match.
 */
goog.dom.DomHelper.prototype.getAncestorByClass =
    goog.dom.getAncestorByClass;


/**
 * Walks up the DOM hierarchy returning the first ancestor that passes the
 * matcher function.
 * @param {Node} element The DOM node to start with.
 * @param {function(Node) : boolean} matcher A function that returns true if the
 *     passed node matches the desired criteria.
 * @param {boolean=} opt_includeNode If true, the node itself is included in
 *     the search (the first call to the matcher will pass startElement as
 *     the node to test).
 * @param {number=} opt_maxSearchSteps Maximum number of levels to search up the
 *     dom.
 * @return {Node} DOM node that matched the matcher, or null if there was
 *     no match.
 */
goog.dom.DomHelper.prototype.getAncestor = goog.dom.getAncestor;

goog.provide('olcs.RasterSynchronizer');

goog.require('goog.events');
goog.require('ol.layer.Tile');
goog.require('olcs.AbstractSynchronizer');
goog.require('olcs.core');



/**
 * This object takes care of one-directional synchronization of
 * ol3 raster layers to the given Cesium globe.
 * @param {!ol.Map} map
 * @param {!Cesium.Scene} scene
 * @constructor
 * @extends {olcs.AbstractSynchronizer.<Cesium.ImageryLayer>}
 */
olcs.RasterSynchronizer = function(map, scene) {
  /**
   * @type {!Cesium.ImageryLayerCollection}
   * @private
   */
  this.cesiumLayers_ = scene.imageryLayers;

  /**
   * @type {!Cesium.ImageryLayerCollection}
   * @private
   */
  this.ourLayers_ = new Cesium.ImageryLayerCollection();

  goog.base(this, map, scene);
};
goog.inherits(olcs.RasterSynchronizer, olcs.AbstractSynchronizer);


/**
 * @inheritDoc
 */
olcs.RasterSynchronizer.prototype.addCesiumObject = function(object) {
  this.cesiumLayers_.add(object);
  this.ourLayers_.add(object);
};


/**
 * @inheritDoc
 */
olcs.RasterSynchronizer.prototype.destroyCesiumObject = function(object) {
  object.destroy();
};


/**
 * @inheritDoc
 */
olcs.RasterSynchronizer.prototype.removeAllCesiumObjects = function(destroy) {
  for (var i = 0; i < this.ourLayers_.length; ++i) {
    this.cesiumLayers_.remove(this.ourLayers_.get(i), destroy);
  }
  this.ourLayers_.removeAll(false);
};


/**
 * @inheritDoc
 */
olcs.RasterSynchronizer.prototype.createSingleCounterpart = function(olLayer) {
  if (!(olLayer instanceof ol.layer.Tile)) {
    return null;
  }

  var viewProj = this.view.getProjection();
  var cesiumObject = olcs.core.tileLayerToImageryLayer(olLayer, viewProj);
  if (!goog.isNull(cesiumObject)) {
    olLayer.on(
        ['change:brightness', 'change:contrast', 'change:hue',
         'change:opacity', 'change:saturation', 'change:visible'],
        function(e) {
          // the compiler does not seem to be able to infer this
          if (!goog.isNull(cesiumObject)) {
            olcs.core.updateCesiumLayerProperties(olLayer, cesiumObject);
          }
        });
    olcs.core.updateCesiumLayerProperties(olLayer, cesiumObject);

    // there is no way to modify Cesium layer extent,
    // we have to recreate when ol3 layer extent changes:
    olLayer.on('change:extent', function(e) {
      this.cesiumLayers_.remove(cesiumObject, true); // destroy
      this.ourLayers_.remove(cesiumObject, false);
      delete this.layerMap[goog.getUid(olLayer)]; // invalidate the map entry
      this.synchronize();
    }, this);

    olLayer.on('change', function(e) {
      // when the source changes, re-add the layer to force update
      var position = this.cesiumLayers_.indexOf(cesiumObject);
      if (position >= 0) {
        this.cesiumLayers_.remove(cesiumObject, false);
        this.cesiumLayers_.add(cesiumObject, position);
      }
    }, this);
  }

  return cesiumObject;
};

goog.provide('olcs.VectorSynchronizer');

goog.require('goog.events');
goog.require('ol.layer.Vector');
goog.require('olcs.AbstractSynchronizer');
goog.require('olcs.core');
goog.require('olcs.core.OlLayerPrimitive');



/**
 * Unidirectionally synchronize OpenLayers vector layers to Cesium.
 * @param {!ol.Map} map
 * @param {!Cesium.Scene} scene
 * @constructor
 * @extends {olcs.AbstractSynchronizer.<olcs.core.OlLayerPrimitive>}
 * @api
 */
olcs.VectorSynchronizer = function(map, scene) {

  /**
   * @type {!Cesium.PrimitiveCollection}
   * @private
   */
  this.csAllPrimitives_ = new Cesium.PrimitiveCollection();
  scene.primitives.add(this.csAllPrimitives_);
  this.csAllPrimitives_.destroyPrimitives = false;

  // Initialize core library
  olcs.core.glAliasedLineWidthRange = scene.maximumAliasedLineWidth;

  goog.base(this, map, scene);
};
goog.inherits(olcs.VectorSynchronizer, olcs.AbstractSynchronizer);


/**
 * @inheritDoc
 */
olcs.VectorSynchronizer.prototype.addCesiumObject = function(object) {
  goog.asserts.assert(!goog.isNull(object));
  this.csAllPrimitives_.add(object);
};


/**
 * @inheritDoc
 */
olcs.VectorSynchronizer.prototype.destroyCesiumObject = function(object) {
  object.destroy();
};


/**
 * @inheritDoc
 */
olcs.VectorSynchronizer.prototype.removeAllCesiumObjects = function(destroy) {
  this.csAllPrimitives_.destroyPrimitives = destroy;
  this.csAllPrimitives_.removeAll();
  this.csAllPrimitives_.destroyPrimitives = false;
};


/**
 * @inheritDoc
 */
olcs.VectorSynchronizer.prototype.createSingleCounterpart = function(olLayer) {
  if (!(olLayer instanceof ol.layer.Vector)) {
    return null;
  }
  goog.asserts.assertInstanceof(olLayer, ol.layer.Vector);
  goog.asserts.assert(!goog.isNull(this.view));

  var view = this.view;
  var source = olLayer.getSource();
  var featurePrimitiveMap = {};
  var csPrimitives = olcs.core.olVectorLayerToCesium(olLayer, view,
      featurePrimitiveMap);

  olLayer.on('change:visible', function(e) {
    csPrimitives.show = olLayer.getVisible();
  });

  var onAddFeature = function(feature) {
    goog.asserts.assertInstanceof(olLayer, ol.layer.Vector);
    var prim = csPrimitives.convert(olLayer, view, feature);
    if (prim) {
      featurePrimitiveMap[goog.getUid(feature)] = prim;
      csPrimitives.add(prim);
    }
  };

  var onRemoveFeature = function(feature) {
    var geometry = feature.getGeometry();
    var id = goog.getUid(feature);
    if (goog.isDefAndNotNull(geometry) && geometry.getType() == 'Point') {
      var context = csPrimitives.context;
      var bbs = context.billboards;
      var bb = context.featureToCesiumMap[id];
      delete context.featureToCesiumMap[id];
      if (goog.isDefAndNotNull(bb)) {
        goog.asserts.assertInstanceof(bb, Cesium.Billboard);
        bbs.remove(bb);
      }
    }
    var csPrimitive = featurePrimitiveMap[id];
    delete featurePrimitiveMap[id];
    if (goog.isDefAndNotNull(csPrimitive)) {
      csPrimitives.remove(csPrimitive);
    }
  };

  source.on('addfeature', function(e) {
    goog.asserts.assert(goog.isDefAndNotNull(e.feature));
    onAddFeature(e.feature);
  }, this);

  source.on('removefeature', function(e) {
    goog.asserts.assert(goog.isDefAndNotNull(e.feature));
    onRemoveFeature(e.feature);
  }, this);

  source.on('changefeature', function(e) {
    var feature = e.feature;
    goog.asserts.assert(goog.isDefAndNotNull(feature));
    onRemoveFeature(feature);
    onAddFeature(feature);
  }, this);

  return csPrimitives;
};

goog.provide('olcs.OLCesium');

goog.require('goog.async.AnimationDelay');
goog.require('goog.dom');
goog.require('goog.events');

goog.require('olcs.Camera');
goog.require('olcs.RasterSynchronizer');
goog.require('olcs.VectorSynchronizer');



/**
 * @param {!olcsx.OLCesiumOptions} options Options.
 * @constructor
 * @api
 */
olcs.OLCesium = function(options) {

  /**
   * @type {!ol.Map}
   * @private
   */
  this.map_ = options.map;

  var fillArea = 'position:absolute;top:0;left:0;width:100%;height:100%;';

  /**
   * @type {!Element}
   * @private
   */
  this.container_ = goog.dom.createDom(goog.dom.TagName.DIV,
      {style: fillArea + 'visibility:hidden;'});

  var targetElement = goog.dom.getElement(options.target || null);
  if (targetElement) {
    goog.dom.appendChild(targetElement, this.container_);
  } else {
    var vp = this.map_.getViewport();
    var oc = goog.dom.getElementByClass('ol-overlaycontainer', vp);
    if (oc) {
      goog.dom.insertSiblingBefore(this.container_, oc);
    }
  }

  /**
   * Whether the Cesium container is placed over the ol map.
   * @type {boolean}
   * @private
   */
  this.isOverMap_ = !goog.isDefAndNotNull(targetElement);

  /**
   * @type {!HTMLCanvasElement}
   * @private
   */
  this.canvas_ = /** @type {!HTMLCanvasElement} */
      (goog.dom.createDom(goog.dom.TagName.CANVAS, {style: fillArea}));
  this.canvas_.oncontextmenu = function() { return false; };
  this.canvas_.onselectstart = function() { return false; };

  goog.dom.appendChild(this.container_, this.canvas_);

  /**
   * @type {boolean}
   * @private
   */
  this.enabled_ = false;

  /**
   * @type {!Array.<ol.interaction.Interaction>}
   * @private
   */
  this.pausedInteractions_ = [];

  /**
   * @type {?ol.layer.Group}
   * @private
   */
  this.hiddenRootGroup_ = null;

  /**
   * @type {!Cesium.Scene}
   * @private
   */
  this.scene_ = new Cesium.Scene({
    canvas: this.canvas_,
    scene3DOnly: true
  });

  var sscc = this.scene_.screenSpaceCameraController;
  sscc.inertiaSpin = 0;
  sscc.ineartiaTranslate = 0;
  sscc.inertiaZoom = 0;

  sscc.tiltEventTypes.push({
    'eventType': Cesium.CameraEventType.LEFT_DRAG,
    'modifier': Cesium.KeyboardEventModifier.SHIFT
  });

  sscc.tiltEventTypes.push({
    'eventType': Cesium.CameraEventType.LEFT_DRAG,
    'modifier': Cesium.KeyboardEventModifier.ALT
  });

  sscc.enableLook = false;

  this.scene_.camera.constrainedAxis = Cesium.Cartesian3.UNIT_Z;

  /**
   * @type {!olcs.Camera}
   * @private
   */
  this.camera_ = new olcs.Camera(this.scene_, this.map_);

  /**
   * @type {!Cesium.Globe}
   * @private
   */
  this.globe_ = new Cesium.Globe(Cesium.Ellipsoid.WGS84);
  this.scene_.globe = this.globe_;
  this.scene_.skyAtmosphere = new Cesium.SkyAtmosphere();

  var synchronizers = goog.isDef(options.createSynchronizers) ?
      options.createSynchronizers(this.map_, this.scene_) :
      [
        new olcs.RasterSynchronizer(this.map_, this.scene_),
        new olcs.VectorSynchronizer(this.map_, this.scene_)
      ];

  for (var i = synchronizers.length - 1; i >= 0; --i) {
    synchronizers[i].synchronize();
  }

  if (this.isOverMap_) {
    // if in "stacked mode", hide everything except canvas (including credits)
    var credits = goog.dom.getNextElementSibling(this.canvas_);
    if (goog.isDefAndNotNull(credits)) {
      credits.style.display = 'none';
    }
  }

  this.camera_.readFromView();

  this.cesiumRenderingDelay_ = new goog.async.AnimationDelay(function(time) {
    this.scene_.initializeFrame();
    this.handleResize_();
    this.scene_.render();
    this.enabled_ && this.camera_.checkCameraChange();
    this.cesiumRenderingDelay_.start();
  }, undefined, this);
};


/**
 * @private
 */
olcs.OLCesium.prototype.handleResize_ = function() {
  var width = this.canvas_.clientWidth;
  var height = this.canvas_.clientHeight;

  if (this.canvas_.width === width && this.canvas_.height === height) {
    return;
  }

  this.canvas_.width = width;
  this.canvas_.height = height;
  this.scene_.camera.frustum.aspectRatio = width / height;
};


/**
 * @return {!olcs.Camera}
 * @api
 */
olcs.OLCesium.prototype.getCamera = function() {
  return this.camera_;
};


/**
 * @return {!ol.Map}
 * @api
 */
olcs.OLCesium.prototype.getOlMap = function() {
  return this.map_;
};


/**
 * @return {!Cesium.Scene}
 * @api
 */
olcs.OLCesium.prototype.getCesiumScene = function() {
  return this.scene_;
};


/**
 * @return {boolean}
 * @api
 */
olcs.OLCesium.prototype.getEnabled = function() {
  return this.enabled_;
};


/**
 * Enables/disables the Cesium.
 * This modifies the visibility style of the container element.
 * @param {boolean} enable
 * @api
 */
olcs.OLCesium.prototype.setEnabled = function(enable) {
  if (this.enabled_ == enable) {
    return;
  }
  this.enabled_ = enable;

  // some Cesium operations are operating with canvas.clientWidth,
  // so we can't remove it from DOM or even make display:none;
  this.container_.style.visibility = this.enabled_ ? 'visible' : 'hidden';
  if (this.enabled_) {
    if (this.isOverMap_) {
      var interactions = this.map_.getInteractions();
      interactions.forEach(function(el, i, arr) {
        this.pausedInteractions_.push(el);
      }, this);
      interactions.clear();

      var rootGroup = this.map_.getLayerGroup();
      if (rootGroup.getVisible()) {
        this.hiddenRootGroup_ = rootGroup;
        this.hiddenRootGroup_.setVisible(false);
      }
    }
    this.camera_.readFromView();
    this.cesiumRenderingDelay_.start();
  } else {
    if (this.isOverMap_) {
      var interactions = this.map_.getInteractions();
      goog.array.forEach(this.pausedInteractions_, function(el, i, arr) {
        interactions.push(el);
      }, this);
      this.pausedInteractions_.length = 0;

      if (!goog.isNull(this.hiddenRootGroup_)) {
        this.hiddenRootGroup_.setVisible(true);
        this.hiddenRootGroup_ = null;
      }
    }

    this.camera_.updateView();
    this.cesiumRenderingDelay_.stop();
  }
};


/**
* Preload Cesium so that it is ready when transitioning from 2D to 3D.
* @param {number} height Target height of the camera
* @param {number} timeout Milliseconds after which the warming will stop
* @api
*/
olcs.OLCesium.prototype.warmUp = function(height, timeout) {
  if (this.enabled_) {
    // already enabled
    return;
  }
  this.camera_.readFromView();
  var ellipsoid = this.globe_.ellipsoid;
  var csCamera = this.scene_.camera;
  var position = ellipsoid.cartesianToCartographic(csCamera.position);
  if (position.height < height) {
    position.height = height;
    csCamera.position = ellipsoid.cartographicToCartesian(position);
  }
  this.cesiumRenderingDelay_.start();
  var that = this;
  setTimeout(
      function() { !that.enabled_ && that.cesiumRenderingDelay_.stop(); },
      timeout);
};

// Copyright 2009 The Closure Library Authors.
// All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// This file has been auto-generated by GenJsDeps, please do not edit.

goog.addDependency('demos/editor/equationeditor.js', ['goog.demos.editor.EquationEditor'], ['goog.ui.equation.EquationEditorDialog']);
goog.addDependency('demos/editor/helloworld.js', ['goog.demos.editor.HelloWorld'], ['goog.dom', 'goog.dom.TagName', 'goog.editor.Plugin']);
goog.addDependency('demos/editor/helloworlddialog.js', ['goog.demos.editor.HelloWorldDialog', 'goog.demos.editor.HelloWorldDialog.OkEvent'], ['goog.dom.TagName', 'goog.events.Event', 'goog.string', 'goog.ui.editor.AbstractDialog', 'goog.ui.editor.AbstractDialog.Builder', 'goog.ui.editor.AbstractDialog.EventType']);
goog.addDependency('demos/editor/helloworlddialogplugin.js', ['goog.demos.editor.HelloWorldDialogPlugin', 'goog.demos.editor.HelloWorldDialogPlugin.Command'], ['goog.demos.editor.HelloWorldDialog', 'goog.dom.TagName', 'goog.editor.plugins.AbstractDialogPlugin', 'goog.editor.range', 'goog.functions', 'goog.ui.editor.AbstractDialog.EventType']);

// Copyright 2014 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// This file has been auto-generated by GenJsDeps, please do not edit.

goog.addDependency('../../third_party/closure/goog/caja/string/html/htmlparser.js', ['goog.string.html.HtmlParser', 'goog.string.html.HtmlParser.EFlags', 'goog.string.html.HtmlParser.Elements', 'goog.string.html.HtmlParser.Entities', 'goog.string.html.HtmlSaxHandler'], []);
goog.addDependency('../../third_party/closure/goog/caja/string/html/htmlsanitizer.js', ['goog.string.html.HtmlSanitizer', 'goog.string.html.HtmlSanitizer.AttributeType', 'goog.string.html.HtmlSanitizer.Attributes', 'goog.string.html.htmlSanitize'], ['goog.string.StringBuffer', 'goog.string.html.HtmlParser', 'goog.string.html.HtmlParser.EFlags', 'goog.string.html.HtmlParser.Elements', 'goog.string.html.HtmlSaxHandler']);
goog.addDependency('../../third_party/closure/goog/dojo/dom/query.js', ['goog.dom.query'], ['goog.array', 'goog.dom', 'goog.functions', 'goog.string', 'goog.userAgent']);
goog.addDependency('../../third_party/closure/goog/jpeg_encoder/jpeg_encoder_basic.js', ['goog.crypt.JpegEncoder'], ['goog.crypt.base64']);
goog.addDependency('../../third_party/closure/goog/loremipsum/text/loremipsum.js', ['goog.text.LoremIpsum'], ['goog.array', 'goog.math', 'goog.string', 'goog.structs.Map', 'goog.structs.Set']);
goog.addDependency('../../third_party/closure/goog/mochikit/async/deferred.js', ['goog.async.Deferred', 'goog.async.Deferred.AlreadyCalledError', 'goog.async.Deferred.CanceledError'], ['goog.Promise', 'goog.Thenable', 'goog.array', 'goog.asserts', 'goog.debug.Error']);
goog.addDependency('../../third_party/closure/goog/mochikit/async/deferredlist.js', ['goog.async.DeferredList'], ['goog.async.Deferred']);
goog.addDependency('../../third_party/closure/goog/osapi/osapi.js', ['goog.osapi'], []);
goog.addDependency('../../third_party/closure/goog/svgpan/svgpan.js', ['svgpan.SvgPan'], ['goog.Disposable', 'goog.events', 'goog.events.EventType', 'goog.events.MouseWheelHandler']);
goog.addDependency('a11y/aria/announcer.js', ['goog.a11y.aria.Announcer'], ['goog.Disposable', 'goog.a11y.aria', 'goog.a11y.aria.LivePriority', 'goog.a11y.aria.State', 'goog.dom', 'goog.object']);
goog.addDependency('a11y/aria/announcer_test.js', ['goog.a11y.aria.AnnouncerTest'], ['goog.a11y.aria', 'goog.a11y.aria.Announcer', 'goog.a11y.aria.LivePriority', 'goog.a11y.aria.State', 'goog.array', 'goog.dom', 'goog.dom.iframe', 'goog.testing.jsunit']);
goog.addDependency('a11y/aria/aria.js', ['goog.a11y.aria'], ['goog.a11y.aria.Role', 'goog.a11y.aria.State', 'goog.a11y.aria.datatables', 'goog.array', 'goog.asserts', 'goog.dom', 'goog.dom.TagName', 'goog.object']);
goog.addDependency('a11y/aria/aria_test.js', ['goog.a11y.ariaTest'], ['goog.a11y.aria', 'goog.a11y.aria.Role', 'goog.a11y.aria.State', 'goog.dom', 'goog.dom.TagName', 'goog.testing.jsunit']);
goog.addDependency('a11y/aria/attributes.js', ['goog.a11y.aria.AutoCompleteValues', 'goog.a11y.aria.CheckedValues', 'goog.a11y.aria.DropEffectValues', 'goog.a11y.aria.ExpandedValues', 'goog.a11y.aria.GrabbedValues', 'goog.a11y.aria.InvalidValues', 'goog.a11y.aria.LivePriority', 'goog.a11y.aria.OrientationValues', 'goog.a11y.aria.PressedValues', 'goog.a11y.aria.RelevantValues', 'goog.a11y.aria.SelectedValues', 'goog.a11y.aria.SortValues', 'goog.a11y.aria.State'], []);
goog.addDependency('a11y/aria/datatables.js', ['goog.a11y.aria.datatables'], ['goog.a11y.aria.State', 'goog.object']);
goog.addDependency('a11y/aria/roles.js', ['goog.a11y.aria.Role'], []);
goog.addDependency('array/array.js', ['goog.array', 'goog.array.ArrayLike'], ['goog.asserts']);
goog.addDependency('array/array_test.js', ['goog.arrayTest'], ['goog.array', 'goog.dom', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit', 'goog.testing.recordFunction']);
goog.addDependency('asserts/asserts.js', ['goog.asserts', 'goog.asserts.AssertionError'], ['goog.debug.Error', 'goog.dom.NodeType', 'goog.string']);
goog.addDependency('asserts/asserts_test.js', ['goog.assertsTest'], ['goog.asserts', 'goog.asserts.AssertionError', 'goog.dom', 'goog.string', 'goog.testing.jsunit']);
goog.addDependency('async/animationdelay.js', ['goog.async.AnimationDelay'], ['goog.Disposable', 'goog.events', 'goog.functions']);
goog.addDependency('async/animationdelay_test.js', ['goog.async.AnimationDelayTest'], ['goog.async.AnimationDelay', 'goog.testing.AsyncTestCase', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit', 'goog.testing.recordFunction']);
goog.addDependency('async/conditionaldelay.js', ['goog.async.ConditionalDelay'], ['goog.Disposable', 'goog.async.Delay']);
goog.addDependency('async/conditionaldelay_test.js', ['goog.async.ConditionalDelayTest'], ['goog.async.ConditionalDelay', 'goog.testing.MockClock', 'goog.testing.jsunit']);
goog.addDependency('async/delay.js', ['goog.Delay', 'goog.async.Delay'], ['goog.Disposable', 'goog.Timer']);
goog.addDependency('async/delay_test.js', ['goog.async.DelayTest'], ['goog.async.Delay', 'goog.testing.MockClock', 'goog.testing.jsunit']);
goog.addDependency('async/nexttick.js', ['goog.async.nextTick', 'goog.async.throwException'], ['goog.debug.entryPointRegistry', 'goog.functions']);
goog.addDependency('async/nexttick_test.js', ['goog.async.nextTickTest'], ['goog.async.nextTick', 'goog.debug.ErrorHandler', 'goog.debug.entryPointRegistry', 'goog.testing.AsyncTestCase', 'goog.testing.MockClock', 'goog.testing.jsunit']);
goog.addDependency('async/run.js', ['goog.async.run'], ['goog.async.nextTick', 'goog.async.throwException', 'goog.testing.watchers']);
goog.addDependency('async/run_test.js', ['goog.async.runTest'], ['goog.async.run', 'goog.testing.MockClock', 'goog.testing.jsunit', 'goog.testing.recordFunction']);
goog.addDependency('async/throttle.js', ['goog.Throttle', 'goog.async.Throttle'], ['goog.Disposable', 'goog.Timer']);
goog.addDependency('async/throttle_test.js', ['goog.async.ThrottleTest'], ['goog.async.Throttle', 'goog.testing.MockClock', 'goog.testing.jsunit']);
goog.addDependency('base.js', ['goog'], []);
goog.addDependency('base_test.js', ['an.existing.path', 'dup.base', 'far.out', 'goog.baseTest', 'goog.explicit', 'goog.implicit.explicit', 'goog.test', 'goog.test.name', 'goog.test.name.space', 'goog.xy', 'goog.xy.z', 'ns', 'testDep.bar'], ['goog.Timer', 'goog.functions', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit', 'goog.testing.recordFunction', 'goog.userAgent']);
goog.addDependency('color/alpha.js', ['goog.color.alpha'], ['goog.color']);
goog.addDependency('color/alpha_test.js', ['goog.color.alphaTest'], ['goog.array', 'goog.color', 'goog.color.alpha', 'goog.testing.jsunit']);
goog.addDependency('color/color.js', ['goog.color', 'goog.color.Hsl', 'goog.color.Hsv', 'goog.color.Rgb'], ['goog.color.names', 'goog.math']);
goog.addDependency('color/color_test.js', ['goog.colorTest'], ['goog.array', 'goog.color', 'goog.color.names', 'goog.testing.jsunit']);
goog.addDependency('color/names.js', ['goog.color.names'], []);
goog.addDependency('crypt/aes.js', ['goog.crypt.Aes'], ['goog.asserts', 'goog.crypt.BlockCipher']);
goog.addDependency('crypt/aes_test.js', ['goog.crypt.AesTest'], ['goog.crypt', 'goog.crypt.Aes', 'goog.testing.jsunit']);
goog.addDependency('crypt/arc4.js', ['goog.crypt.Arc4'], ['goog.asserts']);
goog.addDependency('crypt/arc4_test.js', ['goog.crypt.Arc4Test'], ['goog.array', 'goog.crypt.Arc4', 'goog.testing.jsunit']);
goog.addDependency('crypt/base64.js', ['goog.crypt.base64'], ['goog.crypt', 'goog.userAgent']);
goog.addDependency('crypt/base64_test.js', ['goog.crypt.base64Test'], ['goog.crypt', 'goog.crypt.base64', 'goog.testing.jsunit']);
goog.addDependency('crypt/basen.js', ['goog.crypt.baseN'], []);
goog.addDependency('crypt/basen_test.js', ['goog.crypt.baseNTest'], ['goog.crypt.baseN', 'goog.testing.jsunit']);
goog.addDependency('crypt/blobhasher.js', ['goog.crypt.BlobHasher', 'goog.crypt.BlobHasher.EventType'], ['goog.asserts', 'goog.crypt', 'goog.crypt.Hash', 'goog.events.EventTarget', 'goog.fs', 'goog.log']);
goog.addDependency('crypt/blobhasher_test.js', ['goog.crypt.BlobHasherTest'], ['goog.crypt', 'goog.crypt.BlobHasher', 'goog.crypt.Md5', 'goog.events', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit']);
goog.addDependency('crypt/blockcipher.js', ['goog.crypt.BlockCipher'], []);
goog.addDependency('crypt/bytestring_perf.js', ['goog.crypt.byteArrayToStringPerf'], ['goog.array', 'goog.dom', 'goog.testing.PerformanceTable']);
goog.addDependency('crypt/cbc.js', ['goog.crypt.Cbc'], ['goog.array', 'goog.asserts', 'goog.crypt']);
goog.addDependency('crypt/cbc_test.js', ['goog.crypt.CbcTest'], ['goog.crypt', 'goog.crypt.Aes', 'goog.crypt.Cbc', 'goog.testing.jsunit']);
goog.addDependency('crypt/crypt.js', ['goog.crypt'], ['goog.array', 'goog.asserts']);
goog.addDependency('crypt/crypt_test.js', ['goog.cryptTest'], ['goog.crypt', 'goog.string', 'goog.testing.jsunit']);
goog.addDependency('crypt/hash.js', ['goog.crypt.Hash'], []);
goog.addDependency('crypt/hash32.js', ['goog.crypt.hash32'], ['goog.crypt']);
goog.addDependency('crypt/hash32_test.js', ['goog.crypt.hash32Test'], ['goog.crypt.hash32', 'goog.testing.TestCase', 'goog.testing.jsunit']);
goog.addDependency('crypt/hashtester.js', ['goog.crypt.hashTester'], ['goog.array', 'goog.crypt', 'goog.testing.PerformanceTable', 'goog.testing.PseudoRandom', 'goog.testing.asserts']);
goog.addDependency('crypt/hmac.js', ['goog.crypt.Hmac'], ['goog.crypt.Hash']);
goog.addDependency('crypt/hmac_test.js', ['goog.crypt.HmacTest'], ['goog.crypt.Hmac', 'goog.crypt.Sha1', 'goog.crypt.hashTester', 'goog.testing.jsunit']);
goog.addDependency('crypt/md5.js', ['goog.crypt.Md5'], ['goog.crypt.Hash']);
goog.addDependency('crypt/md5_test.js', ['goog.crypt.Md5Test'], ['goog.crypt', 'goog.crypt.Md5', 'goog.crypt.hashTester', 'goog.testing.jsunit']);
goog.addDependency('crypt/pbkdf2.js', ['goog.crypt.pbkdf2'], ['goog.asserts', 'goog.crypt', 'goog.crypt.Hmac', 'goog.crypt.Sha1']);
goog.addDependency('crypt/pbkdf2_test.js', ['goog.crypt.pbkdf2Test'], ['goog.crypt', 'goog.crypt.pbkdf2', 'goog.testing.jsunit', 'goog.userAgent']);
goog.addDependency('crypt/sha1.js', ['goog.crypt.Sha1'], ['goog.crypt.Hash']);
goog.addDependency('crypt/sha1_test.js', ['goog.crypt.Sha1Test'], ['goog.crypt', 'goog.crypt.Sha1', 'goog.crypt.hashTester', 'goog.testing.jsunit', 'goog.userAgent']);
goog.addDependency('crypt/sha2.js', ['goog.crypt.Sha2'], ['goog.array', 'goog.asserts', 'goog.crypt.Hash']);
goog.addDependency('crypt/sha224.js', ['goog.crypt.Sha224'], ['goog.crypt.Sha2']);
goog.addDependency('crypt/sha224_test.js', ['goog.crypt.Sha224Test'], ['goog.crypt', 'goog.crypt.Sha224', 'goog.crypt.hashTester', 'goog.testing.jsunit']);
goog.addDependency('crypt/sha256.js', ['goog.crypt.Sha256'], ['goog.crypt.Sha2']);
goog.addDependency('crypt/sha256_test.js', ['goog.crypt.Sha256Test'], ['goog.crypt', 'goog.crypt.Sha256', 'goog.crypt.hashTester', 'goog.testing.jsunit']);
goog.addDependency('crypt/sha2_64bit.js', ['goog.crypt.Sha2_64bit'], ['goog.array', 'goog.asserts', 'goog.crypt.Hash', 'goog.math.Long']);
goog.addDependency('crypt/sha2_64bit_test.js', ['goog.crypt.Sha2_64bit_test'], ['goog.array', 'goog.crypt', 'goog.crypt.Sha384', 'goog.crypt.Sha512', 'goog.crypt.Sha512_256', 'goog.crypt.hashTester', 'goog.testing.jsunit', 'goog.userAgent']);
goog.addDependency('crypt/sha384.js', ['goog.crypt.Sha384'], ['goog.crypt.Sha2_64bit']);
goog.addDependency('crypt/sha512.js', ['goog.crypt.Sha512'], ['goog.crypt.Sha2_64bit']);
goog.addDependency('crypt/sha512_256.js', ['goog.crypt.Sha512_256'], ['goog.crypt.Sha2_64bit']);
goog.addDependency('cssom/cssom.js', ['goog.cssom', 'goog.cssom.CssRuleType'], ['goog.array', 'goog.dom']);
goog.addDependency('cssom/cssom_test.js', ['goog.cssomTest'], ['goog.array', 'goog.cssom', 'goog.cssom.CssRuleType', 'goog.testing.jsunit', 'goog.userAgent']);
goog.addDependency('cssom/iframe/style.js', ['goog.cssom.iframe.style'], ['goog.asserts', 'goog.cssom', 'goog.dom', 'goog.dom.NodeType', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.string', 'goog.style', 'goog.userAgent']);
goog.addDependency('cssom/iframe/style_test.js', ['goog.cssom.iframe.styleTest'], ['goog.cssom', 'goog.cssom.iframe.style', 'goog.dom', 'goog.dom.DomHelper', 'goog.testing.jsunit', 'goog.userAgent']);
goog.addDependency('datasource/datamanager.js', ['goog.ds.DataManager'], ['goog.ds.BasicNodeList', 'goog.ds.DataNode', 'goog.ds.Expr', 'goog.object', 'goog.string', 'goog.structs', 'goog.structs.Map']);
goog.addDependency('datasource/datasource.js', ['goog.ds.BaseDataNode', 'goog.ds.BasicNodeList', 'goog.ds.DataNode', 'goog.ds.DataNodeList', 'goog.ds.EmptyNodeList', 'goog.ds.LoadState', 'goog.ds.SortedNodeList', 'goog.ds.Util', 'goog.ds.logger'], ['goog.array', 'goog.log']);
goog.addDependency('datasource/datasource_test.js', ['goog.ds.JsDataSourceTest'], ['goog.dom.xml', 'goog.ds.DataManager', 'goog.ds.JsDataSource', 'goog.ds.SortedNodeList', 'goog.ds.XmlDataSource', 'goog.testing.jsunit']);
goog.addDependency('datasource/expr.js', ['goog.ds.Expr'], ['goog.ds.BasicNodeList', 'goog.ds.EmptyNodeList', 'goog.string']);
goog.addDependency('datasource/expr_test.js', ['goog.ds.ExprTest'], ['goog.ds.DataManager', 'goog.ds.Expr', 'goog.ds.JsDataSource', 'goog.testing.jsunit']);
goog.addDependency('datasource/fastdatanode.js', ['goog.ds.AbstractFastDataNode', 'goog.ds.FastDataNode', 'goog.ds.FastListNode', 'goog.ds.PrimitiveFastDataNode'], ['goog.ds.DataManager', 'goog.ds.EmptyNodeList', 'goog.string']);
goog.addDependency('datasource/fastdatanode_test.js', ['goog.ds.FastDataNodeTest'], ['goog.array', 'goog.ds.DataManager', 'goog.ds.Expr', 'goog.ds.FastDataNode', 'goog.testing.jsunit']);
goog.addDependency('datasource/jsdatasource.js', ['goog.ds.JsDataSource', 'goog.ds.JsPropertyDataSource'], ['goog.ds.BaseDataNode', 'goog.ds.BasicNodeList', 'goog.ds.DataManager', 'goog.ds.EmptyNodeList', 'goog.ds.LoadState']);
goog.addDependency('datasource/jsondatasource.js', ['goog.ds.JsonDataSource'], ['goog.Uri', 'goog.dom', 'goog.ds.DataManager', 'goog.ds.JsDataSource', 'goog.ds.LoadState', 'goog.ds.logger']);
goog.addDependency('datasource/jsxmlhttpdatasource.js', ['goog.ds.JsXmlHttpDataSource'], ['goog.Uri', 'goog.ds.DataManager', 'goog.ds.FastDataNode', 'goog.ds.LoadState', 'goog.ds.logger', 'goog.events', 'goog.log', 'goog.net.EventType', 'goog.net.XhrIo']);
goog.addDependency('datasource/jsxmlhttpdatasource_test.js', ['goog.ds.JsXmlHttpDataSourceTest'], ['goog.ds.JsXmlHttpDataSource', 'goog.testing.TestQueue', 'goog.testing.jsunit', 'goog.testing.net.XhrIo']);
goog.addDependency('datasource/xmldatasource.js', ['goog.ds.XmlDataSource', 'goog.ds.XmlHttpDataSource'], ['goog.Uri', 'goog.dom.NodeType', 'goog.dom.xml', 'goog.ds.BasicNodeList', 'goog.ds.DataManager', 'goog.ds.LoadState', 'goog.ds.logger', 'goog.net.XhrIo', 'goog.string']);
goog.addDependency('date/date.js', ['goog.date', 'goog.date.Date', 'goog.date.DateTime', 'goog.date.Interval', 'goog.date.month', 'goog.date.weekDay'], ['goog.asserts', 'goog.date.DateLike', 'goog.i18n.DateTimeSymbols', 'goog.string']);
goog.addDependency('date/date_test.js', ['goog.dateTest'], ['goog.array', 'goog.date', 'goog.date.Date', 'goog.date.DateTime', 'goog.date.Interval', 'goog.date.month', 'goog.date.weekDay', 'goog.i18n.DateTimeSymbols', 'goog.testing.ExpectedFailures', 'goog.testing.jsunit', 'goog.userAgent', 'goog.userAgent.platform', 'goog.userAgent.product', 'goog.userAgent.product.isVersion']);
goog.addDependency('date/datelike.js', ['goog.date.DateLike'], []);
goog.addDependency('date/daterange.js', ['goog.date.DateRange', 'goog.date.DateRange.Iterator', 'goog.date.DateRange.StandardDateRangeKeys'], ['goog.date.Date', 'goog.date.Interval', 'goog.iter.Iterator', 'goog.iter.StopIteration']);
goog.addDependency('date/daterange_test.js', ['goog.date.DateRangeTest'], ['goog.date.Date', 'goog.date.DateRange', 'goog.date.Interval', 'goog.i18n.DateTimeSymbols', 'goog.testing.jsunit']);
goog.addDependency('date/duration.js', ['goog.date.duration'], ['goog.i18n.DateTimeFormat', 'goog.i18n.MessageFormat']);
goog.addDependency('date/duration_test.js', ['goog.date.durationTest'], ['goog.date.duration', 'goog.i18n.DateTimeFormat', 'goog.i18n.DateTimeSymbols', 'goog.i18n.DateTimeSymbols_bn', 'goog.i18n.DateTimeSymbols_en', 'goog.i18n.DateTimeSymbols_fa', 'goog.testing.jsunit']);
goog.addDependency('date/relative.js', ['goog.date.relative', 'goog.date.relative.TimeDeltaFormatter', 'goog.date.relative.Unit'], ['goog.i18n.DateTimeFormat']);
goog.addDependency('date/relative_test.js', ['goog.date.relativeTest'], ['goog.date.DateTime', 'goog.date.relative', 'goog.i18n.DateTimeFormat', 'goog.testing.jsunit']);
goog.addDependency('date/relativewithplurals.js', ['goog.date.relativeWithPlurals'], ['goog.date.relative', 'goog.date.relative.Unit', 'goog.i18n.MessageFormat']);
goog.addDependency('date/relativewithplurals_test.js', ['goog.date.relativeWithPluralsTest'], ['goog.date.relative', 'goog.date.relativeTest', 'goog.date.relativeWithPlurals', 'goog.i18n.DateTimeFormat', 'goog.i18n.DateTimeSymbols', 'goog.i18n.DateTimeSymbols_bn', 'goog.i18n.DateTimeSymbols_en', 'goog.i18n.DateTimeSymbols_fa', 'goog.i18n.NumberFormatSymbols', 'goog.i18n.NumberFormatSymbols_bn', 'goog.i18n.NumberFormatSymbols_en', 'goog.i18n.NumberFormatSymbols_fa']);
goog.addDependency('date/utcdatetime.js', ['goog.date.UtcDateTime'], ['goog.date', 'goog.date.Date', 'goog.date.DateTime', 'goog.date.Interval']);
goog.addDependency('date/utcdatetime_test.js', ['goog.date.UtcDateTimeTest'], ['goog.date.Interval', 'goog.date.UtcDateTime', 'goog.date.month', 'goog.date.weekDay', 'goog.testing.jsunit']);
goog.addDependency('db/cursor.js', ['goog.db.Cursor'], ['goog.async.Deferred', 'goog.db.Error', 'goog.debug', 'goog.events.EventTarget']);
goog.addDependency('db/db.js', ['goog.db'], ['goog.async.Deferred', 'goog.db.Error', 'goog.db.IndexedDb', 'goog.db.Transaction']);
goog.addDependency('db/db_test.js', ['goog.dbTest'], ['goog.Disposable', 'goog.array', 'goog.async.Deferred', 'goog.async.DeferredList', 'goog.db', 'goog.db.Cursor', 'goog.db.Error', 'goog.db.IndexedDb', 'goog.db.KeyRange', 'goog.db.Transaction', 'goog.events', 'goog.object', 'goog.testing.AsyncTestCase', 'goog.testing.PropertyReplacer', 'goog.testing.asserts', 'goog.testing.jsunit', 'goog.userAgent.product', 'goog.userAgent.product.isVersion']);
goog.addDependency('db/error.js', ['goog.db.Error', 'goog.db.Error.ErrorCode', 'goog.db.Error.ErrorName', 'goog.db.Error.VersionChangeBlockedError'], ['goog.debug.Error']);
goog.addDependency('db/index.js', ['goog.db.Index'], ['goog.async.Deferred', 'goog.db.Cursor', 'goog.db.Error', 'goog.debug']);
goog.addDependency('db/indexeddb.js', ['goog.db.IndexedDb'], ['goog.async.Deferred', 'goog.db.Error', 'goog.db.ObjectStore', 'goog.db.Transaction', 'goog.events.Event', 'goog.events.EventHandler', 'goog.events.EventTarget']);
goog.addDependency('db/keyrange.js', ['goog.db.KeyRange'], []);
goog.addDependency('db/objectstore.js', ['goog.db.ObjectStore'], ['goog.async.Deferred', 'goog.db.Cursor', 'goog.db.Error', 'goog.db.Index', 'goog.debug', 'goog.events']);
goog.addDependency('db/old_db_test.js', ['goog.oldDbTest'], ['goog.async.Deferred', 'goog.db', 'goog.db.Cursor', 'goog.db.Error', 'goog.db.IndexedDb', 'goog.db.KeyRange', 'goog.db.Transaction', 'goog.events', 'goog.testing.AsyncTestCase', 'goog.testing.asserts', 'goog.testing.jsunit', 'goog.userAgent.product', 'goog.userAgent.product.isVersion']);
goog.addDependency('db/transaction.js', ['goog.db.Transaction', 'goog.db.Transaction.TransactionMode'], ['goog.async.Deferred', 'goog.db.Error', 'goog.db.ObjectStore', 'goog.events.EventHandler', 'goog.events.EventTarget']);
goog.addDependency('debug/console.js', ['goog.debug.Console'], ['goog.debug.LogManager', 'goog.debug.Logger.Level', 'goog.debug.TextFormatter']);
goog.addDependency('debug/console_test.js', ['goog.debug.ConsoleTest'], ['goog.debug.Console', 'goog.debug.LogRecord', 'goog.debug.Logger', 'goog.testing.jsunit', 'goog.testing.recordFunction']);
goog.addDependency('debug/debug.js', ['goog.debug'], ['goog.array', 'goog.string', 'goog.structs.Set', 'goog.userAgent']);
goog.addDependency('debug/debug_test.js', ['goog.debugTest'], ['goog.debug', 'goog.structs.Set', 'goog.testing.jsunit']);
goog.addDependency('debug/debugwindow.js', ['goog.debug.DebugWindow'], ['goog.debug.HtmlFormatter', 'goog.debug.LogManager', 'goog.debug.Logger', 'goog.structs.CircularBuffer', 'goog.userAgent']);
goog.addDependency('debug/debugwindow_test.js', ['goog.debug.DebugWindowTest'], ['goog.debug.DebugWindow', 'goog.testing.jsunit']);
goog.addDependency('debug/devcss/devcss.js', ['goog.debug.DevCss', 'goog.debug.DevCss.UserAgent'], ['goog.asserts', 'goog.cssom', 'goog.dom.classlist', 'goog.events', 'goog.events.EventType', 'goog.string', 'goog.userAgent']);
goog.addDependency('debug/devcss/devcss_test.js', ['goog.debug.DevCssTest'], ['goog.debug.DevCss', 'goog.style', 'goog.testing.jsunit']);
goog.addDependency('debug/devcss/devcssrunner.js', ['goog.debug.devCssRunner'], ['goog.debug.DevCss']);
goog.addDependency('debug/divconsole.js', ['goog.debug.DivConsole'], ['goog.debug.HtmlFormatter', 'goog.debug.LogManager', 'goog.style']);
goog.addDependency('debug/enhanceerror_test.js', ['goog.debugEnhanceErrorTest'], ['goog.debug', 'goog.testing.jsunit']);
goog.addDependency('debug/entrypointregistry.js', ['goog.debug.EntryPointMonitor', 'goog.debug.entryPointRegistry'], ['goog.asserts']);
goog.addDependency('debug/entrypointregistry_test.js', ['goog.debug.entryPointRegistryTest'], ['goog.debug.ErrorHandler', 'goog.debug.entryPointRegistry', 'goog.testing.jsunit']);
goog.addDependency('debug/error.js', ['goog.debug.Error'], []);
goog.addDependency('debug/error_test.js', ['goog.debug.ErrorTest'], ['goog.debug.Error', 'goog.testing.ExpectedFailures', 'goog.testing.jsunit', 'goog.userAgent', 'goog.userAgent.product']);
goog.addDependency('debug/errorhandler.js', ['goog.debug.ErrorHandler', 'goog.debug.ErrorHandler.ProtectedFunctionError'], ['goog.asserts', 'goog.debug', 'goog.debug.EntryPointMonitor', 'goog.debug.Trace']);
goog.addDependency('debug/errorhandler_async_test.js', ['goog.debug.ErrorHandlerAsyncTest'], ['goog.debug.ErrorHandler', 'goog.testing.AsyncTestCase', 'goog.testing.jsunit', 'goog.userAgent']);
goog.addDependency('debug/errorhandler_test.js', ['goog.debug.ErrorHandlerTest'], ['goog.debug.ErrorHandler', 'goog.testing.MockControl', 'goog.testing.jsunit']);
goog.addDependency('debug/errorhandlerweakdep.js', ['goog.debug.errorHandlerWeakDep'], []);
goog.addDependency('debug/errorreporter.js', ['goog.debug.ErrorReporter', 'goog.debug.ErrorReporter.ExceptionEvent'], ['goog.asserts', 'goog.debug', 'goog.debug.ErrorHandler', 'goog.debug.entryPointRegistry', 'goog.events', 'goog.events.Event', 'goog.events.EventTarget', 'goog.log', 'goog.net.XhrIo', 'goog.object', 'goog.string', 'goog.uri.utils', 'goog.userAgent']);
goog.addDependency('debug/errorreporter_test.js', ['goog.debug.ErrorReporterTest'], ['goog.debug.ErrorReporter', 'goog.events', 'goog.functions', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit', 'goog.userAgent']);
goog.addDependency('debug/fancywindow.js', ['goog.debug.FancyWindow'], ['goog.array', 'goog.debug.DebugWindow', 'goog.debug.LogManager', 'goog.debug.Logger', 'goog.dom.DomHelper', 'goog.dom.safe', 'goog.html.SafeHtml', 'goog.object', 'goog.string', 'goog.userAgent']);
goog.addDependency('debug/formatter.js', ['goog.debug.Formatter', 'goog.debug.HtmlFormatter', 'goog.debug.TextFormatter'], ['goog.debug.RelativeTimeProvider', 'goog.string']);
goog.addDependency('debug/fpsdisplay.js', ['goog.debug.FpsDisplay'], ['goog.asserts', 'goog.async.AnimationDelay', 'goog.ui.Component']);
goog.addDependency('debug/fpsdisplay_test.js', ['goog.debug.FpsDisplayTest'], ['goog.debug.FpsDisplay', 'goog.testing.AsyncTestCase', 'goog.testing.jsunit']);
goog.addDependency('debug/gcdiagnostics.js', ['goog.debug.GcDiagnostics'], ['goog.debug.Trace', 'goog.log', 'goog.userAgent']);
goog.addDependency('debug/logbuffer.js', ['goog.debug.LogBuffer'], ['goog.asserts', 'goog.debug.LogRecord']);
goog.addDependency('debug/logbuffer_test.js', ['goog.debug.LogBufferTest'], ['goog.debug.LogBuffer', 'goog.debug.Logger', 'goog.testing.jsunit']);
goog.addDependency('debug/logger.js', ['goog.debug.LogManager', 'goog.debug.Loggable', 'goog.debug.Logger', 'goog.debug.Logger.Level'], ['goog.array', 'goog.asserts', 'goog.debug', 'goog.debug.LogBuffer', 'goog.debug.LogRecord']);
goog.addDependency('debug/logger_test.js', ['goog.debug.LoggerTest'], ['goog.debug.LogManager', 'goog.debug.Logger', 'goog.testing.jsunit']);
goog.addDependency('debug/logrecord.js', ['goog.debug.LogRecord'], []);
goog.addDependency('debug/logrecordserializer.js', ['goog.debug.logRecordSerializer'], ['goog.debug.LogRecord', 'goog.debug.Logger.Level', 'goog.json', 'goog.object']);
goog.addDependency('debug/logrecordserializer_test.js', ['goog.debug.logRecordSerializerTest'], ['goog.debug.LogRecord', 'goog.debug.Logger', 'goog.debug.logRecordSerializer', 'goog.testing.jsunit']);
goog.addDependency('debug/relativetimeprovider.js', ['goog.debug.RelativeTimeProvider'], []);
goog.addDependency('debug/tracer.js', ['goog.debug.Trace'], ['goog.array', 'goog.iter', 'goog.log', 'goog.structs.Map', 'goog.structs.SimplePool']);
goog.addDependency('debug/tracer_test.js', ['goog.debug.TraceTest'], ['goog.debug.Trace', 'goog.testing.jsunit']);
goog.addDependency('defineclass_test.js', ['goog.defineClassTest'], ['goog.testing.jsunit']);
goog.addDependency('disposable/disposable.js', ['goog.Disposable', 'goog.dispose', 'goog.disposeAll'], ['goog.disposable.IDisposable']);
goog.addDependency('disposable/disposable_test.js', ['goog.DisposableTest'], ['goog.Disposable', 'goog.testing.jsunit', 'goog.testing.recordFunction']);
goog.addDependency('disposable/idisposable.js', ['goog.disposable.IDisposable'], []);
goog.addDependency('dom/abstractmultirange.js', ['goog.dom.AbstractMultiRange'], ['goog.array', 'goog.dom', 'goog.dom.AbstractRange']);
goog.addDependency('dom/abstractrange.js', ['goog.dom.AbstractRange', 'goog.dom.RangeIterator', 'goog.dom.RangeType'], ['goog.dom', 'goog.dom.NodeType', 'goog.dom.SavedCaretRange', 'goog.dom.TagIterator', 'goog.userAgent']);
goog.addDependency('dom/abstractrange_test.js', ['goog.dom.AbstractRangeTest'], ['goog.dom', 'goog.dom.AbstractRange', 'goog.dom.Range', 'goog.testing.jsunit']);
goog.addDependency('dom/animationframe/animationframe.js', ['goog.dom.animationFrame', 'goog.dom.animationFrame.Spec', 'goog.dom.animationFrame.State'], ['goog.dom.animationFrame.polyfill']);
goog.addDependency('dom/animationframe/polyfill.js', ['goog.dom.animationFrame.polyfill'], []);
goog.addDependency('dom/annotate.js', ['goog.dom.annotate', 'goog.dom.annotate.AnnotateFn'], ['goog.array', 'goog.asserts', 'goog.dom', 'goog.dom.NodeType', 'goog.dom.safe', 'goog.html.SafeHtml']);
goog.addDependency('dom/annotate_test.js', ['goog.dom.annotateTest'], ['goog.dom', 'goog.dom.annotate', 'goog.html.SafeHtml', 'goog.testing.jsunit']);
goog.addDependency('dom/browserfeature.js', ['goog.dom.BrowserFeature'], ['goog.userAgent']);
goog.addDependency('dom/browserrange/abstractrange.js', ['goog.dom.browserrange.AbstractRange'], ['goog.array', 'goog.asserts', 'goog.dom', 'goog.dom.NodeType', 'goog.dom.RangeEndpoint', 'goog.dom.TagName', 'goog.dom.TextRangeIterator', 'goog.iter', 'goog.math.Coordinate', 'goog.string', 'goog.string.StringBuffer', 'goog.userAgent']);
goog.addDependency('dom/browserrange/browserrange.js', ['goog.dom.browserrange', 'goog.dom.browserrange.Error'], ['goog.dom', 'goog.dom.NodeType', 'goog.dom.browserrange.GeckoRange', 'goog.dom.browserrange.IeRange', 'goog.dom.browserrange.OperaRange', 'goog.dom.browserrange.W3cRange', 'goog.dom.browserrange.WebKitRange', 'goog.userAgent']);
goog.addDependency('dom/browserrange/browserrange_test.js', ['goog.dom.browserrangeTest'], ['goog.dom', 'goog.dom.NodeType', 'goog.dom.Range', 'goog.dom.RangeEndpoint', 'goog.dom.TagName', 'goog.dom.browserrange', 'goog.testing.dom', 'goog.testing.jsunit', 'goog.userAgent']);
goog.addDependency('dom/browserrange/geckorange.js', ['goog.dom.browserrange.GeckoRange'], ['goog.dom.browserrange.W3cRange']);
goog.addDependency('dom/browserrange/ierange.js', ['goog.dom.browserrange.IeRange'], ['goog.array', 'goog.dom', 'goog.dom.NodeType', 'goog.dom.RangeEndpoint', 'goog.dom.TagName', 'goog.dom.browserrange.AbstractRange', 'goog.log', 'goog.string']);
goog.addDependency('dom/browserrange/operarange.js', ['goog.dom.browserrange.OperaRange'], ['goog.dom.browserrange.W3cRange']);
goog.addDependency('dom/browserrange/w3crange.js', ['goog.dom.browserrange.W3cRange'], ['goog.dom', 'goog.dom.NodeType', 'goog.dom.RangeEndpoint', 'goog.dom.browserrange.AbstractRange', 'goog.string']);
goog.addDependency('dom/browserrange/webkitrange.js', ['goog.dom.browserrange.WebKitRange'], ['goog.dom.RangeEndpoint', 'goog.dom.browserrange.W3cRange', 'goog.userAgent']);
goog.addDependency('dom/bufferedviewportsizemonitor.js', ['goog.dom.BufferedViewportSizeMonitor'], ['goog.asserts', 'goog.async.Delay', 'goog.events', 'goog.events.EventTarget', 'goog.events.EventType']);
goog.addDependency('dom/bufferedviewportsizemonitor_test.js', ['goog.dom.BufferedViewportSizeMonitorTest'], ['goog.dom.BufferedViewportSizeMonitor', 'goog.dom.ViewportSizeMonitor', 'goog.events', 'goog.events.EventType', 'goog.math.Size', 'goog.testing.MockClock', 'goog.testing.events', 'goog.testing.events.Event', 'goog.testing.jsunit']);
goog.addDependency('dom/classes.js', ['goog.dom.classes'], ['goog.array']);
goog.addDependency('dom/classes_test.js', ['goog.dom.classes_test'], ['goog.dom', 'goog.dom.classes', 'goog.testing.jsunit']);
goog.addDependency('dom/classlist.js', ['goog.dom.classlist'], ['goog.array']);
goog.addDependency('dom/classlist_test.js', ['goog.dom.classlist_test'], ['goog.dom', 'goog.dom.classlist', 'goog.testing.ExpectedFailures', 'goog.testing.jsunit', 'goog.userAgent.product']);
goog.addDependency('dom/controlrange.js', ['goog.dom.ControlRange', 'goog.dom.ControlRangeIterator'], ['goog.array', 'goog.dom', 'goog.dom.AbstractMultiRange', 'goog.dom.AbstractRange', 'goog.dom.RangeIterator', 'goog.dom.RangeType', 'goog.dom.SavedRange', 'goog.dom.TagWalkType', 'goog.dom.TextRange', 'goog.iter.StopIteration', 'goog.userAgent']);
goog.addDependency('dom/controlrange_test.js', ['goog.dom.ControlRangeTest'], ['goog.dom', 'goog.dom.ControlRange', 'goog.dom.RangeType', 'goog.dom.TagName', 'goog.dom.TextRange', 'goog.testing.dom', 'goog.testing.jsunit', 'goog.userAgent']);
goog.addDependency('dom/dataset.js', ['goog.dom.dataset'], ['goog.string']);
goog.addDependency('dom/dataset_test.js', ['goog.dom.datasetTest'], ['goog.dom', 'goog.dom.dataset', 'goog.testing.jsunit']);
goog.addDependency('dom/dom.js', ['goog.dom', 'goog.dom.Appendable', 'goog.dom.DomHelper'], ['goog.array', 'goog.asserts', 'goog.dom.BrowserFeature', 'goog.dom.NodeType', 'goog.dom.TagName', 'goog.dom.classes', 'goog.functions', 'goog.math.Coordinate', 'goog.math.Size', 'goog.object', 'goog.string', 'goog.userAgent']);
goog.addDependency('dom/dom_test.js', ['goog.dom.dom_test'], ['goog.dom', 'goog.dom.BrowserFeature', 'goog.dom.DomHelper', 'goog.dom.NodeType', 'goog.dom.TagName', 'goog.functions', 'goog.object', 'goog.string.Unicode', 'goog.testing.PropertyReplacer', 'goog.testing.asserts', 'goog.userAgent', 'goog.userAgent.product', 'goog.userAgent.product.isVersion']);
goog.addDependency('dom/fontsizemonitor.js', ['goog.dom.FontSizeMonitor', 'goog.dom.FontSizeMonitor.EventType'], ['goog.dom', 'goog.events', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.userAgent']);
goog.addDependency('dom/fontsizemonitor_test.js', ['goog.dom.FontSizeMonitorTest'], ['goog.dom', 'goog.dom.FontSizeMonitor', 'goog.events', 'goog.events.Event', 'goog.testing.PropertyReplacer', 'goog.testing.events', 'goog.testing.jsunit', 'goog.userAgent']);
goog.addDependency('dom/forms.js', ['goog.dom.forms'], ['goog.structs.Map']);
goog.addDependency('dom/forms_test.js', ['goog.dom.formsTest'], ['goog.dom', 'goog.dom.forms', 'goog.testing.jsunit']);
goog.addDependency('dom/fullscreen.js', ['goog.dom.fullscreen', 'goog.dom.fullscreen.EventType'], ['goog.dom', 'goog.userAgent']);
goog.addDependency('dom/iframe.js', ['goog.dom.iframe'], ['goog.dom', 'goog.userAgent']);
goog.addDependency('dom/iframe_test.js', ['goog.dom.iframeTest'], ['goog.dom', 'goog.dom.iframe', 'goog.testing.jsunit']);
goog.addDependency('dom/iter.js', ['goog.dom.iter.AncestorIterator', 'goog.dom.iter.ChildIterator', 'goog.dom.iter.SiblingIterator'], ['goog.iter.Iterator', 'goog.iter.StopIteration']);
goog.addDependency('dom/iter_test.js', ['goog.dom.iterTest'], ['goog.dom', 'goog.dom.NodeType', 'goog.dom.iter.AncestorIterator', 'goog.dom.iter.ChildIterator', 'goog.dom.iter.SiblingIterator', 'goog.testing.dom', 'goog.testing.jsunit']);
goog.addDependency('dom/multirange.js', ['goog.dom.MultiRange', 'goog.dom.MultiRangeIterator'], ['goog.array', 'goog.dom.AbstractMultiRange', 'goog.dom.AbstractRange', 'goog.dom.RangeIterator', 'goog.dom.RangeType', 'goog.dom.SavedRange', 'goog.dom.TextRange', 'goog.iter.StopIteration', 'goog.log']);
goog.addDependency('dom/multirange_test.js', ['goog.dom.MultiRangeTest'], ['goog.dom', 'goog.dom.MultiRange', 'goog.dom.Range', 'goog.iter', 'goog.testing.jsunit']);
goog.addDependency('dom/nodeiterator.js', ['goog.dom.NodeIterator'], ['goog.dom.TagIterator']);
goog.addDependency('dom/nodeiterator_test.js', ['goog.dom.NodeIteratorTest'], ['goog.dom', 'goog.dom.NodeIterator', 'goog.testing.dom', 'goog.testing.jsunit']);
goog.addDependency('dom/nodeoffset.js', ['goog.dom.NodeOffset'], ['goog.Disposable', 'goog.dom.TagName']);
goog.addDependency('dom/nodeoffset_test.js', ['goog.dom.NodeOffsetTest'], ['goog.dom', 'goog.dom.NodeOffset', 'goog.dom.NodeType', 'goog.dom.TagName', 'goog.testing.jsunit']);
goog.addDependency('dom/nodetype.js', ['goog.dom.NodeType'], []);
goog.addDependency('dom/pattern/abstractpattern.js', ['goog.dom.pattern.AbstractPattern'], ['goog.dom.pattern.MatchType']);
goog.addDependency('dom/pattern/allchildren.js', ['goog.dom.pattern.AllChildren'], ['goog.dom.pattern.AbstractPattern', 'goog.dom.pattern.MatchType']);
goog.addDependency('dom/pattern/callback/callback.js', ['goog.dom.pattern.callback'], ['goog.dom', 'goog.dom.TagWalkType', 'goog.iter']);
goog.addDependency('dom/pattern/callback/counter.js', ['goog.dom.pattern.callback.Counter'], []);
goog.addDependency('dom/pattern/callback/test.js', ['goog.dom.pattern.callback.Test'], ['goog.iter.StopIteration']);
goog.addDependency('dom/pattern/childmatches.js', ['goog.dom.pattern.ChildMatches'], ['goog.dom.pattern.AllChildren', 'goog.dom.pattern.MatchType']);
goog.addDependency('dom/pattern/endtag.js', ['goog.dom.pattern.EndTag'], ['goog.dom.TagWalkType', 'goog.dom.pattern.Tag']);
goog.addDependency('dom/pattern/fulltag.js', ['goog.dom.pattern.FullTag'], ['goog.dom.pattern.MatchType', 'goog.dom.pattern.StartTag', 'goog.dom.pattern.Tag']);
goog.addDependency('dom/pattern/matcher.js', ['goog.dom.pattern.Matcher'], ['goog.dom.TagIterator', 'goog.dom.pattern.MatchType', 'goog.iter']);
goog.addDependency('dom/pattern/matcher_test.js', ['goog.dom.pattern.matcherTest'], ['goog.dom', 'goog.dom.pattern.EndTag', 'goog.dom.pattern.FullTag', 'goog.dom.pattern.Matcher', 'goog.dom.pattern.Repeat', 'goog.dom.pattern.Sequence', 'goog.dom.pattern.StartTag', 'goog.dom.pattern.callback.Counter', 'goog.dom.pattern.callback.Test', 'goog.iter.StopIteration', 'goog.testing.jsunit']);
goog.addDependency('dom/pattern/nodetype.js', ['goog.dom.pattern.NodeType'], ['goog.dom.pattern.AbstractPattern', 'goog.dom.pattern.MatchType']);
goog.addDependency('dom/pattern/pattern.js', ['goog.dom.pattern', 'goog.dom.pattern.MatchType'], []);
goog.addDependency('dom/pattern/pattern_test.js', ['goog.dom.patternTest'], ['goog.dom', 'goog.dom.NodeType', 'goog.dom.TagWalkType', 'goog.dom.pattern.AllChildren', 'goog.dom.pattern.ChildMatches', 'goog.dom.pattern.EndTag', 'goog.dom.pattern.FullTag', 'goog.dom.pattern.MatchType', 'goog.dom.pattern.NodeType', 'goog.dom.pattern.Repeat', 'goog.dom.pattern.Sequence', 'goog.dom.pattern.StartTag', 'goog.dom.pattern.Text', 'goog.testing.jsunit']);
goog.addDependency('dom/pattern/repeat.js', ['goog.dom.pattern.Repeat'], ['goog.dom.NodeType', 'goog.dom.pattern.AbstractPattern', 'goog.dom.pattern.MatchType']);
goog.addDependency('dom/pattern/sequence.js', ['goog.dom.pattern.Sequence'], ['goog.dom.NodeType', 'goog.dom.pattern.AbstractPattern', 'goog.dom.pattern.MatchType']);
goog.addDependency('dom/pattern/starttag.js', ['goog.dom.pattern.StartTag'], ['goog.dom.TagWalkType', 'goog.dom.pattern.Tag']);
goog.addDependency('dom/pattern/tag.js', ['goog.dom.pattern.Tag'], ['goog.dom.pattern', 'goog.dom.pattern.AbstractPattern', 'goog.dom.pattern.MatchType', 'goog.object']);
goog.addDependency('dom/pattern/text.js', ['goog.dom.pattern.Text'], ['goog.dom.NodeType', 'goog.dom.pattern', 'goog.dom.pattern.AbstractPattern', 'goog.dom.pattern.MatchType']);
goog.addDependency('dom/range.js', ['goog.dom.Range'], ['goog.dom', 'goog.dom.AbstractRange', 'goog.dom.ControlRange', 'goog.dom.MultiRange', 'goog.dom.NodeType', 'goog.dom.TextRange', 'goog.userAgent']);
goog.addDependency('dom/range_test.js', ['goog.dom.RangeTest'], ['goog.dom', 'goog.dom.NodeType', 'goog.dom.Range', 'goog.dom.RangeType', 'goog.dom.TagName', 'goog.dom.TextRange', 'goog.dom.browserrange', 'goog.testing.dom', 'goog.testing.jsunit', 'goog.userAgent']);
goog.addDependency('dom/rangeendpoint.js', ['goog.dom.RangeEndpoint'], []);
goog.addDependency('dom/safe.js', ['goog.dom.safe'], ['goog.html.SafeHtml', 'goog.html.SafeUrl']);
goog.addDependency('dom/safe_test.js', ['goog.dom.safeTest'], ['goog.dom.safe', 'goog.html.SafeUrl', 'goog.html.testing', 'goog.string.Const', 'goog.testing.jsunit']);
goog.addDependency('dom/savedcaretrange.js', ['goog.dom.SavedCaretRange'], ['goog.array', 'goog.dom', 'goog.dom.SavedRange', 'goog.dom.TagName', 'goog.string']);
goog.addDependency('dom/savedcaretrange_test.js', ['goog.dom.SavedCaretRangeTest'], ['goog.dom', 'goog.dom.Range', 'goog.dom.SavedCaretRange', 'goog.testing.dom', 'goog.testing.jsunit', 'goog.userAgent']);
goog.addDependency('dom/savedrange.js', ['goog.dom.SavedRange'], ['goog.Disposable', 'goog.log']);
goog.addDependency('dom/savedrange_test.js', ['goog.dom.SavedRangeTest'], ['goog.dom', 'goog.dom.Range', 'goog.testing.jsunit', 'goog.userAgent']);
goog.addDependency('dom/selection.js', ['goog.dom.selection'], ['goog.string', 'goog.userAgent']);
goog.addDependency('dom/selection_test.js', ['goog.dom.selectionTest'], ['goog.dom', 'goog.dom.selection', 'goog.testing.jsunit', 'goog.userAgent']);
goog.addDependency('dom/tagiterator.js', ['goog.dom.TagIterator', 'goog.dom.TagWalkType'], ['goog.dom', 'goog.dom.NodeType', 'goog.iter.Iterator', 'goog.iter.StopIteration']);
goog.addDependency('dom/tagiterator_test.js', ['goog.dom.TagIteratorTest'], ['goog.dom', 'goog.dom.TagIterator', 'goog.dom.TagWalkType', 'goog.iter', 'goog.iter.StopIteration', 'goog.testing.dom', 'goog.testing.jsunit']);
goog.addDependency('dom/tagname.js', ['goog.dom.TagName'], []);
goog.addDependency('dom/tagname_test.js', ['goog.dom.TagNameTest'], ['goog.dom.TagName', 'goog.object', 'goog.testing.jsunit']);
goog.addDependency('dom/tags.js', ['goog.dom.tags'], ['goog.object']);
goog.addDependency('dom/tags_test.js', ['goog.dom.tagsTest'], ['goog.dom.tags', 'goog.testing.jsunit']);
goog.addDependency('dom/textrange.js', ['goog.dom.TextRange'], ['goog.array', 'goog.dom', 'goog.dom.AbstractRange', 'goog.dom.RangeType', 'goog.dom.SavedRange', 'goog.dom.TagName', 'goog.dom.TextRangeIterator', 'goog.dom.browserrange', 'goog.string', 'goog.userAgent']);
goog.addDependency('dom/textrange_test.js', ['goog.dom.TextRangeTest'], ['goog.dom', 'goog.dom.ControlRange', 'goog.dom.Range', 'goog.dom.TextRange', 'goog.math.Coordinate', 'goog.style', 'goog.testing.ExpectedFailures', 'goog.testing.jsunit', 'goog.userAgent']);
goog.addDependency('dom/textrangeiterator.js', ['goog.dom.TextRangeIterator'], ['goog.array', 'goog.dom.NodeType', 'goog.dom.RangeIterator', 'goog.dom.TagName', 'goog.iter.StopIteration']);
goog.addDependency('dom/textrangeiterator_test.js', ['goog.dom.TextRangeIteratorTest'], ['goog.dom', 'goog.dom.TagName', 'goog.dom.TextRangeIterator', 'goog.iter.StopIteration', 'goog.testing.dom', 'goog.testing.jsunit']);
goog.addDependency('dom/vendor.js', ['goog.dom.vendor'], ['goog.string', 'goog.userAgent']);
goog.addDependency('dom/vendor_test.js', ['goog.dom.vendorTest'], ['goog.array', 'goog.dom.vendor', 'goog.labs.userAgent.util', 'goog.testing.MockUserAgent', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit', 'goog.userAgent', 'goog.userAgentTestUtil']);
goog.addDependency('dom/viewportsizemonitor.js', ['goog.dom.ViewportSizeMonitor'], ['goog.dom', 'goog.events', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.math.Size']);
goog.addDependency('dom/viewportsizemonitor_test.js', ['goog.dom.ViewportSizeMonitorTest'], ['goog.dom.ViewportSizeMonitor', 'goog.events', 'goog.events.Event', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.math.Size', 'goog.testing.MockClock', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit']);
goog.addDependency('dom/xml.js', ['goog.dom.xml'], ['goog.dom', 'goog.dom.NodeType']);
goog.addDependency('dom/xml_test.js', ['goog.dom.xmlTest'], ['goog.dom.xml', 'goog.testing.jsunit', 'goog.userAgent']);
goog.addDependency('editor/browserfeature.js', ['goog.editor.BrowserFeature'], ['goog.editor.defines', 'goog.userAgent', 'goog.userAgent.product', 'goog.userAgent.product.isVersion']);
goog.addDependency('editor/browserfeature_test.js', ['goog.editor.BrowserFeatureTest'], ['goog.dom', 'goog.dom.Range', 'goog.editor.BrowserFeature', 'goog.testing.ExpectedFailures', 'goog.testing.jsunit']);
goog.addDependency('editor/clicktoeditwrapper.js', ['goog.editor.ClickToEditWrapper'], ['goog.Disposable', 'goog.asserts', 'goog.dom', 'goog.dom.Range', 'goog.dom.TagName', 'goog.editor.BrowserFeature', 'goog.editor.Command', 'goog.editor.Field.EventType', 'goog.editor.range', 'goog.events.BrowserEvent.MouseButton', 'goog.events.EventHandler', 'goog.events.EventType', 'goog.log']);
goog.addDependency('editor/clicktoeditwrapper_test.js', ['goog.editor.ClickToEditWrapperTest'], ['goog.dom', 'goog.dom.Range', 'goog.editor.ClickToEditWrapper', 'goog.editor.SeamlessField', 'goog.testing.MockClock', 'goog.testing.events', 'goog.testing.jsunit', 'goog.userAgent', 'goog.userAgent.product']);
goog.addDependency('editor/command.js', ['goog.editor.Command'], []);
goog.addDependency('editor/contenteditablefield.js', ['goog.editor.ContentEditableField'], ['goog.asserts', 'goog.editor.Field', 'goog.log']);
goog.addDependency('editor/contenteditablefield_test.js', ['goog.editor.ContentEditableFieldTest'], ['goog.dom', 'goog.editor.ContentEditableField', 'goog.editor.field_test', 'goog.testing.jsunit']);
goog.addDependency('editor/defines.js', ['goog.editor.defines'], []);
goog.addDependency('editor/field.js', ['goog.editor.Field', 'goog.editor.Field.EventType'], ['goog.a11y.aria', 'goog.a11y.aria.Role', 'goog.array', 'goog.asserts', 'goog.async.Delay', 'goog.dom', 'goog.dom.Range', 'goog.dom.TagName', 'goog.editor.BrowserFeature', 'goog.editor.Command', 'goog.editor.Plugin', 'goog.editor.icontent', 'goog.editor.icontent.FieldFormatInfo', 'goog.editor.icontent.FieldStyleInfo', 'goog.editor.node', 'goog.editor.range', 'goog.events', 'goog.events.EventHandler', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.functions', 'goog.log', 'goog.log.Level', 'goog.string', 'goog.string.Unicode', 'goog.style', 'goog.userAgent', 'goog.userAgent.product']);
goog.addDependency('editor/field_test.js', ['goog.editor.field_test'], ['goog.dom', 'goog.dom.Range', 'goog.editor.BrowserFeature', 'goog.editor.Field', 'goog.editor.Plugin', 'goog.editor.range', 'goog.events', 'goog.events.BrowserEvent', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.functions', 'goog.testing.LooseMock', 'goog.testing.MockClock', 'goog.testing.dom', 'goog.testing.events', 'goog.testing.events.Event', 'goog.testing.recordFunction', 'goog.userAgent']);
goog.addDependency('editor/focus.js', ['goog.editor.focus'], ['goog.dom.selection']);
goog.addDependency('editor/focus_test.js', ['goog.editor.focusTest'], ['goog.dom.selection', 'goog.editor.BrowserFeature', 'goog.editor.focus', 'goog.testing.jsunit']);
goog.addDependency('editor/icontent.js', ['goog.editor.icontent', 'goog.editor.icontent.FieldFormatInfo', 'goog.editor.icontent.FieldStyleInfo'], ['goog.editor.BrowserFeature', 'goog.style', 'goog.userAgent']);
goog.addDependency('editor/icontent_test.js', ['goog.editor.icontentTest'], ['goog.dom', 'goog.editor.BrowserFeature', 'goog.editor.icontent', 'goog.editor.icontent.FieldFormatInfo', 'goog.editor.icontent.FieldStyleInfo', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit', 'goog.userAgent']);
goog.addDependency('editor/link.js', ['goog.editor.Link'], ['goog.array', 'goog.dom', 'goog.dom.NodeType', 'goog.dom.Range', 'goog.dom.TagName', 'goog.editor.BrowserFeature', 'goog.editor.Command', 'goog.editor.node', 'goog.editor.range', 'goog.string', 'goog.string.Unicode', 'goog.uri.utils', 'goog.uri.utils.ComponentIndex']);
goog.addDependency('editor/link_test.js', ['goog.editor.LinkTest'], ['goog.dom', 'goog.dom.NodeType', 'goog.dom.Range', 'goog.dom.TagName', 'goog.editor.Link', 'goog.testing.jsunit', 'goog.userAgent']);
goog.addDependency('editor/node.js', ['goog.editor.node'], ['goog.dom', 'goog.dom.NodeType', 'goog.dom.TagName', 'goog.dom.iter.ChildIterator', 'goog.dom.iter.SiblingIterator', 'goog.iter', 'goog.object', 'goog.string', 'goog.string.Unicode', 'goog.userAgent']);
goog.addDependency('editor/node_test.js', ['goog.editor.nodeTest'], ['goog.array', 'goog.dom', 'goog.dom.NodeType', 'goog.dom.TagName', 'goog.editor.node', 'goog.style', 'goog.testing.ExpectedFailures', 'goog.testing.dom', 'goog.testing.jsunit', 'goog.userAgent']);
goog.addDependency('editor/plugin.js', ['goog.editor.Plugin'], ['goog.editor.Command', 'goog.events.EventTarget', 'goog.functions', 'goog.log', 'goog.object', 'goog.reflect']);
goog.addDependency('editor/plugin_test.js', ['goog.editor.PluginTest'], ['goog.editor.Field', 'goog.editor.Plugin', 'goog.functions', 'goog.testing.StrictMock', 'goog.testing.jsunit', 'goog.userAgent']);
goog.addDependency('editor/plugins/abstractbubbleplugin.js', ['goog.editor.plugins.AbstractBubblePlugin'], ['goog.dom', 'goog.dom.NodeType', 'goog.dom.Range', 'goog.dom.TagName', 'goog.editor.Plugin', 'goog.editor.style', 'goog.events', 'goog.events.EventHandler', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.events.actionEventWrapper', 'goog.functions', 'goog.string.Unicode', 'goog.ui.Component', 'goog.ui.editor.Bubble', 'goog.userAgent']);
goog.addDependency('editor/plugins/abstractbubbleplugin_test.js', ['goog.editor.plugins.AbstractBubblePluginTest'], ['goog.dom', 'goog.editor.plugins.AbstractBubblePlugin', 'goog.events.BrowserEvent', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.functions', 'goog.style', 'goog.testing.editor.FieldMock', 'goog.testing.editor.TestHelper', 'goog.testing.events', 'goog.testing.events.Event', 'goog.testing.jsunit', 'goog.ui.editor.Bubble', 'goog.userAgent']);
goog.addDependency('editor/plugins/abstractdialogplugin.js', ['goog.editor.plugins.AbstractDialogPlugin', 'goog.editor.plugins.AbstractDialogPlugin.EventType'], ['goog.dom', 'goog.dom.Range', 'goog.editor.Field.EventType', 'goog.editor.Plugin', 'goog.editor.range', 'goog.events', 'goog.ui.editor.AbstractDialog.EventType']);
goog.addDependency('editor/plugins/abstractdialogplugin_test.js', ['goog.editor.plugins.AbstractDialogPluginTest'], ['goog.dom.SavedRange', 'goog.editor.Field', 'goog.editor.plugins.AbstractDialogPlugin', 'goog.events.Event', 'goog.events.EventHandler', 'goog.functions', 'goog.testing.MockClock', 'goog.testing.MockControl', 'goog.testing.PropertyReplacer', 'goog.testing.editor.FieldMock', 'goog.testing.editor.TestHelper', 'goog.testing.events', 'goog.testing.jsunit', 'goog.testing.mockmatchers.ArgumentMatcher', 'goog.ui.editor.AbstractDialog', 'goog.userAgent']);
goog.addDependency('editor/plugins/abstracttabhandler.js', ['goog.editor.plugins.AbstractTabHandler'], ['goog.editor.Plugin', 'goog.events.KeyCodes']);
goog.addDependency('editor/plugins/abstracttabhandler_test.js', ['goog.editor.plugins.AbstractTabHandlerTest'], ['goog.editor.Field', 'goog.editor.plugins.AbstractTabHandler', 'goog.events.BrowserEvent', 'goog.events.KeyCodes', 'goog.testing.StrictMock', 'goog.testing.editor.FieldMock', 'goog.testing.jsunit', 'goog.userAgent']);
goog.addDependency('editor/plugins/basictextformatter.js', ['goog.editor.plugins.BasicTextFormatter', 'goog.editor.plugins.BasicTextFormatter.COMMAND'], ['goog.array', 'goog.dom', 'goog.dom.NodeType', 'goog.dom.Range', 'goog.dom.TagName', 'goog.editor.BrowserFeature', 'goog.editor.Command', 'goog.editor.Link', 'goog.editor.Plugin', 'goog.editor.node', 'goog.editor.range', 'goog.editor.style', 'goog.iter', 'goog.iter.StopIteration', 'goog.log', 'goog.object', 'goog.string', 'goog.string.Unicode', 'goog.style', 'goog.ui.editor.messages', 'goog.userAgent']);
goog.addDependency('editor/plugins/basictextformatter_test.js', ['goog.editor.plugins.BasicTextFormatterTest'], ['goog.dom', 'goog.dom.Range', 'goog.dom.TagName', 'goog.editor.BrowserFeature', 'goog.editor.Command', 'goog.editor.Field', 'goog.editor.Plugin', 'goog.editor.plugins.BasicTextFormatter', 'goog.object', 'goog.style', 'goog.testing.ExpectedFailures', 'goog.testing.LooseMock', 'goog.testing.PropertyReplacer', 'goog.testing.editor.FieldMock', 'goog.testing.editor.TestHelper', 'goog.testing.jsunit', 'goog.testing.mockmatchers', 'goog.userAgent']);
goog.addDependency('editor/plugins/blockquote.js', ['goog.editor.plugins.Blockquote'], ['goog.dom', 'goog.dom.NodeType', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.editor.BrowserFeature', 'goog.editor.Command', 'goog.editor.Plugin', 'goog.editor.node', 'goog.functions', 'goog.log']);
goog.addDependency('editor/plugins/blockquote_test.js', ['goog.editor.plugins.BlockquoteTest'], ['goog.dom', 'goog.dom.Range', 'goog.dom.TagName', 'goog.editor.plugins.Blockquote', 'goog.testing.editor.FieldMock', 'goog.testing.editor.TestHelper', 'goog.testing.jsunit', 'goog.userAgent']);
goog.addDependency('editor/plugins/emoticons.js', ['goog.editor.plugins.Emoticons'], ['goog.dom.TagName', 'goog.editor.Plugin', 'goog.editor.range', 'goog.functions', 'goog.ui.emoji.Emoji', 'goog.userAgent']);
goog.addDependency('editor/plugins/emoticons_test.js', ['goog.editor.plugins.EmoticonsTest'], ['goog.Uri', 'goog.array', 'goog.dom', 'goog.dom.TagName', 'goog.editor.Field', 'goog.editor.plugins.Emoticons', 'goog.testing.jsunit', 'goog.ui.emoji.Emoji', 'goog.userAgent']);
goog.addDependency('editor/plugins/enterhandler.js', ['goog.editor.plugins.EnterHandler'], ['goog.dom', 'goog.dom.NodeOffset', 'goog.dom.NodeType', 'goog.dom.Range', 'goog.dom.TagName', 'goog.editor.BrowserFeature', 'goog.editor.Plugin', 'goog.editor.node', 'goog.editor.plugins.Blockquote', 'goog.editor.range', 'goog.editor.style', 'goog.events.KeyCodes', 'goog.functions', 'goog.object', 'goog.string', 'goog.userAgent']);
goog.addDependency('editor/plugins/enterhandler_test.js', ['goog.editor.plugins.EnterHandlerTest'], ['goog.dom', 'goog.dom.NodeType', 'goog.dom.Range', 'goog.dom.TagName', 'goog.editor.BrowserFeature', 'goog.editor.Field', 'goog.editor.Plugin', 'goog.editor.plugins.Blockquote', 'goog.editor.plugins.EnterHandler', 'goog.editor.range', 'goog.events', 'goog.events.KeyCodes', 'goog.testing.ExpectedFailures', 'goog.testing.MockClock', 'goog.testing.dom', 'goog.testing.editor.TestHelper', 'goog.testing.events', 'goog.testing.jsunit', 'goog.userAgent']);
goog.addDependency('editor/plugins/equationeditorbubble.js', ['goog.editor.plugins.equation.EquationBubble'], ['goog.dom', 'goog.dom.TagName', 'goog.editor.Command', 'goog.editor.plugins.AbstractBubblePlugin', 'goog.string.Unicode', 'goog.ui.editor.Bubble', 'goog.ui.equation.ImageRenderer']);
goog.addDependency('editor/plugins/equationeditorplugin.js', ['goog.editor.plugins.EquationEditorPlugin'], ['goog.dom', 'goog.editor.Command', 'goog.editor.plugins.AbstractDialogPlugin', 'goog.editor.range', 'goog.events', 'goog.events.EventType', 'goog.functions', 'goog.log', 'goog.ui.editor.AbstractDialog', 'goog.ui.editor.EquationEditorDialog', 'goog.ui.equation.ImageRenderer', 'goog.ui.equation.PaletteManager']);
goog.addDependency('editor/plugins/equationeditorplugin_test.js', ['goog.editor.plugins.EquationEditorPluginTest'], ['goog.dom', 'goog.dom.DomHelper', 'goog.dom.TagName', 'goog.editor.plugins.EquationEditorPlugin', 'goog.testing.MockControl', 'goog.testing.MockRange', 'goog.testing.PropertyReplacer', 'goog.testing.editor.FieldMock', 'goog.testing.jsunit', 'goog.testing.mockmatchers.ArgumentMatcher', 'goog.ui.editor.EquationEditorOkEvent']);
goog.addDependency('editor/plugins/firststrong.js', ['goog.editor.plugins.FirstStrong'], ['goog.dom.NodeType', 'goog.dom.TagIterator', 'goog.dom.TagName', 'goog.editor.Command', 'goog.editor.Plugin', 'goog.editor.node', 'goog.editor.range', 'goog.i18n.bidi', 'goog.i18n.uChar', 'goog.iter', 'goog.userAgent']);
goog.addDependency('editor/plugins/firststrong_test.js', ['goog.editor.plugins.FirstStrongTest'], ['goog.dom.Range', 'goog.editor.Command', 'goog.editor.Field', 'goog.editor.plugins.FirstStrong', 'goog.editor.range', 'goog.events.KeyCodes', 'goog.testing.editor.TestHelper', 'goog.testing.events', 'goog.testing.jsunit', 'goog.userAgent']);
goog.addDependency('editor/plugins/headerformatter.js', ['goog.editor.plugins.HeaderFormatter'], ['goog.editor.Command', 'goog.editor.Plugin', 'goog.userAgent']);
goog.addDependency('editor/plugins/headerformatter_test.js', ['goog.editor.plugins.HeaderFormatterTest'], ['goog.dom', 'goog.editor.Command', 'goog.editor.plugins.BasicTextFormatter', 'goog.editor.plugins.HeaderFormatter', 'goog.events.BrowserEvent', 'goog.testing.LooseMock', 'goog.testing.editor.FieldMock', 'goog.testing.editor.TestHelper', 'goog.testing.jsunit', 'goog.userAgent']);
goog.addDependency('editor/plugins/linkbubble.js', ['goog.editor.plugins.LinkBubble', 'goog.editor.plugins.LinkBubble.Action'], ['goog.array', 'goog.dom', 'goog.dom.TagName', 'goog.editor.Command', 'goog.editor.Link', 'goog.editor.plugins.AbstractBubblePlugin', 'goog.editor.range', 'goog.functions', 'goog.string', 'goog.style', 'goog.ui.editor.messages', 'goog.uri.utils', 'goog.window']);
goog.addDependency('editor/plugins/linkbubble_test.js', ['goog.editor.plugins.LinkBubbleTest'], ['goog.dom', 'goog.dom.Range', 'goog.dom.TagName', 'goog.editor.Command', 'goog.editor.Link', 'goog.editor.plugins.LinkBubble', 'goog.events.BrowserEvent', 'goog.events.Event', 'goog.events.EventType', 'goog.string', 'goog.style', 'goog.testing.FunctionMock', 'goog.testing.PropertyReplacer', 'goog.testing.editor.FieldMock', 'goog.testing.editor.TestHelper', 'goog.testing.events', 'goog.testing.jsunit', 'goog.userAgent']);
goog.addDependency('editor/plugins/linkdialogplugin.js', ['goog.editor.plugins.LinkDialogPlugin'], ['goog.array', 'goog.dom', 'goog.editor.Command', 'goog.editor.plugins.AbstractDialogPlugin', 'goog.events.EventHandler', 'goog.functions', 'goog.ui.editor.AbstractDialog.EventType', 'goog.ui.editor.LinkDialog', 'goog.ui.editor.LinkDialog.EventType', 'goog.ui.editor.LinkDialog.OkEvent', 'goog.uri.utils']);
goog.addDependency('editor/plugins/linkdialogplugin_test.js', ['goog.ui.editor.LinkDialogTest'], ['goog.dom', 'goog.dom.DomHelper', 'goog.dom.NodeType', 'goog.dom.TagName', 'goog.editor.BrowserFeature', 'goog.editor.Command', 'goog.editor.Field', 'goog.editor.Link', 'goog.editor.plugins.LinkDialogPlugin', 'goog.string', 'goog.string.Unicode', 'goog.testing.MockControl', 'goog.testing.editor.FieldMock', 'goog.testing.editor.TestHelper', 'goog.testing.editor.dom', 'goog.testing.events', 'goog.testing.jsunit', 'goog.testing.mockmatchers', 'goog.ui.editor.AbstractDialog', 'goog.ui.editor.LinkDialog', 'goog.userAgent']);
goog.addDependency('editor/plugins/linkshortcutplugin.js', ['goog.editor.plugins.LinkShortcutPlugin'], ['goog.editor.Command', 'goog.editor.Link', 'goog.editor.Plugin', 'goog.string']);
goog.addDependency('editor/plugins/linkshortcutplugin_test.js', ['goog.editor.plugins.LinkShortcutPluginTest'], ['goog.dom', 'goog.editor.Field', 'goog.editor.plugins.BasicTextFormatter', 'goog.editor.plugins.LinkBubble', 'goog.editor.plugins.LinkShortcutPlugin', 'goog.events.KeyCodes', 'goog.testing.PropertyReplacer', 'goog.testing.dom', 'goog.testing.events', 'goog.testing.jsunit']);
goog.addDependency('editor/plugins/listtabhandler.js', ['goog.editor.plugins.ListTabHandler'], ['goog.dom.TagName', 'goog.editor.Command', 'goog.editor.plugins.AbstractTabHandler']);
goog.addDependency('editor/plugins/listtabhandler_test.js', ['goog.editor.plugins.ListTabHandlerTest'], ['goog.dom', 'goog.editor.Command', 'goog.editor.plugins.ListTabHandler', 'goog.events.BrowserEvent', 'goog.events.KeyCodes', 'goog.functions', 'goog.testing.StrictMock', 'goog.testing.editor.FieldMock', 'goog.testing.editor.TestHelper', 'goog.testing.jsunit']);
goog.addDependency('editor/plugins/loremipsum.js', ['goog.editor.plugins.LoremIpsum'], ['goog.asserts', 'goog.dom', 'goog.editor.Command', 'goog.editor.Plugin', 'goog.editor.node', 'goog.functions']);
goog.addDependency('editor/plugins/loremipsum_test.js', ['goog.editor.plugins.LoremIpsumTest'], ['goog.dom', 'goog.editor.Command', 'goog.editor.Field', 'goog.editor.plugins.LoremIpsum', 'goog.string.Unicode', 'goog.testing.jsunit', 'goog.userAgent']);
goog.addDependency('editor/plugins/removeformatting.js', ['goog.editor.plugins.RemoveFormatting'], ['goog.dom', 'goog.dom.NodeType', 'goog.dom.Range', 'goog.dom.TagName', 'goog.editor.BrowserFeature', 'goog.editor.Plugin', 'goog.editor.node', 'goog.editor.range', 'goog.string', 'goog.userAgent']);
goog.addDependency('editor/plugins/removeformatting_test.js', ['goog.editor.plugins.RemoveFormattingTest'], ['goog.dom', 'goog.dom.Range', 'goog.dom.TagName', 'goog.editor.BrowserFeature', 'goog.editor.plugins.RemoveFormatting', 'goog.string', 'goog.testing.ExpectedFailures', 'goog.testing.dom', 'goog.testing.editor.FieldMock', 'goog.testing.editor.TestHelper', 'goog.testing.jsunit', 'goog.userAgent']);
goog.addDependency('editor/plugins/spacestabhandler.js', ['goog.editor.plugins.SpacesTabHandler'], ['goog.dom', 'goog.dom.TagName', 'goog.editor.plugins.AbstractTabHandler', 'goog.editor.range']);
goog.addDependency('editor/plugins/spacestabhandler_test.js', ['goog.editor.plugins.SpacesTabHandlerTest'], ['goog.dom', 'goog.dom.Range', 'goog.editor.plugins.SpacesTabHandler', 'goog.events.BrowserEvent', 'goog.events.KeyCodes', 'goog.functions', 'goog.testing.StrictMock', 'goog.testing.editor.FieldMock', 'goog.testing.editor.TestHelper', 'goog.testing.jsunit']);
goog.addDependency('editor/plugins/tableeditor.js', ['goog.editor.plugins.TableEditor'], ['goog.array', 'goog.dom', 'goog.dom.TagName', 'goog.editor.Plugin', 'goog.editor.Table', 'goog.editor.node', 'goog.editor.range', 'goog.object']);
goog.addDependency('editor/plugins/tableeditor_test.js', ['goog.editor.plugins.TableEditorTest'], ['goog.dom', 'goog.dom.Range', 'goog.editor.plugins.TableEditor', 'goog.object', 'goog.string', 'goog.testing.ExpectedFailures', 'goog.testing.JsUnitException', 'goog.testing.editor.FieldMock', 'goog.testing.editor.TestHelper', 'goog.testing.jsunit', 'goog.userAgent']);
goog.addDependency('editor/plugins/tagonenterhandler.js', ['goog.editor.plugins.TagOnEnterHandler'], ['goog.dom', 'goog.dom.NodeType', 'goog.dom.Range', 'goog.dom.TagName', 'goog.editor.Command', 'goog.editor.node', 'goog.editor.plugins.EnterHandler', 'goog.editor.range', 'goog.editor.style', 'goog.events.KeyCodes', 'goog.string', 'goog.style', 'goog.userAgent']);
goog.addDependency('editor/plugins/tagonenterhandler_test.js', ['goog.editor.plugins.TagOnEnterHandlerTest'], ['goog.dom', 'goog.dom.NodeType', 'goog.dom.Range', 'goog.dom.TagName', 'goog.editor.BrowserFeature', 'goog.editor.Field', 'goog.editor.Plugin', 'goog.editor.plugins.TagOnEnterHandler', 'goog.events.KeyCodes', 'goog.string.Unicode', 'goog.testing.dom', 'goog.testing.editor.TestHelper', 'goog.testing.events', 'goog.testing.jsunit', 'goog.userAgent']);
goog.addDependency('editor/plugins/undoredo.js', ['goog.editor.plugins.UndoRedo'], ['goog.dom', 'goog.dom.NodeOffset', 'goog.dom.Range', 'goog.editor.BrowserFeature', 'goog.editor.Command', 'goog.editor.Field.EventType', 'goog.editor.Plugin', 'goog.editor.node', 'goog.editor.plugins.UndoRedoManager', 'goog.editor.plugins.UndoRedoState', 'goog.events', 'goog.events.EventHandler', 'goog.log']);
goog.addDependency('editor/plugins/undoredo_test.js', ['goog.editor.plugins.UndoRedoTest'], ['goog.array', 'goog.dom', 'goog.dom.browserrange', 'goog.editor.Field', 'goog.editor.plugins.LoremIpsum', 'goog.editor.plugins.UndoRedo', 'goog.events', 'goog.functions', 'goog.testing.MockClock', 'goog.testing.PropertyReplacer', 'goog.testing.StrictMock', 'goog.testing.jsunit']);
goog.addDependency('editor/plugins/undoredomanager.js', ['goog.editor.plugins.UndoRedoManager', 'goog.editor.plugins.UndoRedoManager.EventType'], ['goog.editor.plugins.UndoRedoState', 'goog.events.EventTarget']);
goog.addDependency('editor/plugins/undoredomanager_test.js', ['goog.editor.plugins.UndoRedoManagerTest'], ['goog.editor.plugins.UndoRedoManager', 'goog.editor.plugins.UndoRedoState', 'goog.events', 'goog.testing.StrictMock', 'goog.testing.jsunit']);
goog.addDependency('editor/plugins/undoredostate.js', ['goog.editor.plugins.UndoRedoState'], ['goog.events.EventTarget']);
goog.addDependency('editor/plugins/undoredostate_test.js', ['goog.editor.plugins.UndoRedoStateTest'], ['goog.editor.plugins.UndoRedoState', 'goog.testing.jsunit']);
goog.addDependency('editor/range.js', ['goog.editor.range', 'goog.editor.range.Point'], ['goog.array', 'goog.dom', 'goog.dom.NodeType', 'goog.dom.Range', 'goog.dom.RangeEndpoint', 'goog.dom.SavedCaretRange', 'goog.editor.node', 'goog.editor.style', 'goog.iter', 'goog.userAgent']);
goog.addDependency('editor/range_test.js', ['goog.editor.rangeTest'], ['goog.dom', 'goog.dom.Range', 'goog.dom.TagName', 'goog.editor.range', 'goog.editor.range.Point', 'goog.string', 'goog.testing.dom', 'goog.testing.jsunit', 'goog.userAgent']);
goog.addDependency('editor/seamlessfield.js', ['goog.editor.SeamlessField'], ['goog.cssom.iframe.style', 'goog.dom', 'goog.dom.Range', 'goog.dom.TagName', 'goog.editor.BrowserFeature', 'goog.editor.Field', 'goog.editor.icontent', 'goog.editor.icontent.FieldFormatInfo', 'goog.editor.icontent.FieldStyleInfo', 'goog.editor.node', 'goog.events', 'goog.events.EventType', 'goog.log', 'goog.style']);
goog.addDependency('editor/seamlessfield_test.js', ['goog.editor.seamlessfield_test'], ['goog.dom', 'goog.dom.DomHelper', 'goog.dom.Range', 'goog.editor.BrowserFeature', 'goog.editor.Field', 'goog.editor.SeamlessField', 'goog.events', 'goog.functions', 'goog.style', 'goog.testing.MockClock', 'goog.testing.MockRange', 'goog.testing.jsunit']);
goog.addDependency('editor/style.js', ['goog.editor.style'], ['goog.dom', 'goog.dom.NodeType', 'goog.editor.BrowserFeature', 'goog.events.EventType', 'goog.object', 'goog.style', 'goog.userAgent']);
goog.addDependency('editor/style_test.js', ['goog.editor.styleTest'], ['goog.dom', 'goog.dom.TagName', 'goog.editor.BrowserFeature', 'goog.editor.style', 'goog.events.EventHandler', 'goog.events.EventType', 'goog.style', 'goog.testing.LooseMock', 'goog.testing.jsunit', 'goog.testing.mockmatchers']);
goog.addDependency('editor/table.js', ['goog.editor.Table', 'goog.editor.TableCell', 'goog.editor.TableRow'], ['goog.dom', 'goog.dom.DomHelper', 'goog.dom.NodeType', 'goog.dom.TagName', 'goog.log', 'goog.string.Unicode', 'goog.style']);
goog.addDependency('editor/table_test.js', ['goog.editor.TableTest'], ['goog.dom', 'goog.editor.Table', 'goog.testing.jsunit', 'goog.userAgent']);
goog.addDependency('events/actioneventwrapper.js', ['goog.events.actionEventWrapper'], ['goog.a11y.aria', 'goog.a11y.aria.Role', 'goog.events', 'goog.events.EventHandler', 'goog.events.EventType', 'goog.events.EventWrapper', 'goog.events.KeyCodes', 'goog.userAgent']);
goog.addDependency('events/actioneventwrapper_test.js', ['goog.events.actionEventWrapperTest'], ['goog.a11y.aria', 'goog.a11y.aria.Role', 'goog.events', 'goog.events.EventHandler', 'goog.events.KeyCodes', 'goog.events.actionEventWrapper', 'goog.testing.events', 'goog.testing.jsunit']);
goog.addDependency('events/actionhandler.js', ['goog.events.ActionEvent', 'goog.events.ActionHandler', 'goog.events.ActionHandler.EventType', 'goog.events.BeforeActionEvent'], ['goog.events', 'goog.events.BrowserEvent', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.userAgent']);
goog.addDependency('events/actionhandler_test.js', ['goog.events.ActionHandlerTest'], ['goog.dom', 'goog.events', 'goog.events.ActionHandler', 'goog.testing.events', 'goog.testing.jsunit']);
goog.addDependency('events/browserevent.js', ['goog.events.BrowserEvent', 'goog.events.BrowserEvent.MouseButton'], ['goog.events.BrowserFeature', 'goog.events.Event', 'goog.events.EventType', 'goog.reflect', 'goog.userAgent']);
goog.addDependency('events/browserevent_test.js', ['goog.events.BrowserEventTest'], ['goog.events.BrowserEvent', 'goog.events.BrowserFeature', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit', 'goog.userAgent']);
goog.addDependency('events/browserfeature.js', ['goog.events.BrowserFeature'], ['goog.userAgent']);
goog.addDependency('events/event.js', ['goog.events.Event', 'goog.events.EventLike'], ['goog.Disposable', 'goog.events.EventId']);
goog.addDependency('events/event_test.js', ['goog.events.EventTest'], ['goog.events.Event', 'goog.events.EventId', 'goog.events.EventTarget', 'goog.testing.jsunit']);
goog.addDependency('events/eventhandler.js', ['goog.events.EventHandler'], ['goog.Disposable', 'goog.events', 'goog.object']);
goog.addDependency('events/eventhandler_test.js', ['goog.events.EventHandlerTest'], ['goog.events', 'goog.events.EventHandler', 'goog.events.EventTarget', 'goog.testing.jsunit', 'goog.testing.recordFunction']);
goog.addDependency('events/eventid.js', ['goog.events.EventId'], []);
goog.addDependency('events/events.js', ['goog.events', 'goog.events.CaptureSimulationMode', 'goog.events.Key', 'goog.events.ListenableType'], ['goog.asserts', 'goog.debug.entryPointRegistry', 'goog.events.BrowserEvent', 'goog.events.BrowserFeature', 'goog.events.Listenable', 'goog.events.ListenerMap']);
goog.addDependency('events/events_test.js', ['goog.eventsTest'], ['goog.asserts.AssertionError', 'goog.debug.EntryPointMonitor', 'goog.debug.ErrorHandler', 'goog.debug.entryPointRegistry', 'goog.dom', 'goog.events', 'goog.events.BrowserFeature', 'goog.events.CaptureSimulationMode', 'goog.events.Event', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.events.Listener', 'goog.functions', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit', 'goog.testing.recordFunction']);
goog.addDependency('events/eventtarget.js', ['goog.events.EventTarget'], ['goog.Disposable', 'goog.asserts', 'goog.events', 'goog.events.Event', 'goog.events.Listenable', 'goog.events.ListenerMap', 'goog.object']);
goog.addDependency('events/eventtarget_test.js', ['goog.events.EventTargetTest'], ['goog.events.EventTarget', 'goog.events.Listenable', 'goog.events.eventTargetTester', 'goog.events.eventTargetTester.KeyType', 'goog.events.eventTargetTester.UnlistenReturnType', 'goog.testing.jsunit']);
goog.addDependency('events/eventtarget_via_googevents_test.js', ['goog.events.EventTargetGoogEventsTest'], ['goog.events', 'goog.events.EventTarget', 'goog.events.eventTargetTester', 'goog.events.eventTargetTester.KeyType', 'goog.events.eventTargetTester.UnlistenReturnType', 'goog.object', 'goog.testing', 'goog.testing.jsunit']);
goog.addDependency('events/eventtarget_via_w3cinterface_test.js', ['goog.events.EventTargetW3CTest'], ['goog.events.EventTarget', 'goog.events.eventTargetTester', 'goog.events.eventTargetTester.KeyType', 'goog.events.eventTargetTester.UnlistenReturnType', 'goog.testing.jsunit']);
goog.addDependency('events/eventtargettester.js', ['goog.events.eventTargetTester', 'goog.events.eventTargetTester.KeyType', 'goog.events.eventTargetTester.UnlistenReturnType'], ['goog.array', 'goog.events', 'goog.events.Event', 'goog.events.EventTarget', 'goog.testing.asserts', 'goog.testing.recordFunction']);
goog.addDependency('events/eventtype.js', ['goog.events.EventType'], ['goog.userAgent']);
goog.addDependency('events/eventwrapper.js', ['goog.events.EventWrapper'], []);
goog.addDependency('events/filedrophandler.js', ['goog.events.FileDropHandler', 'goog.events.FileDropHandler.EventType'], ['goog.array', 'goog.dom', 'goog.events', 'goog.events.BrowserEvent', 'goog.events.EventHandler', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.log']);
goog.addDependency('events/filedrophandler_test.js', ['goog.events.FileDropHandlerTest'], ['goog.events', 'goog.events.BrowserEvent', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.events.FileDropHandler', 'goog.testing.jsunit']);
goog.addDependency('events/focushandler.js', ['goog.events.FocusHandler', 'goog.events.FocusHandler.EventType'], ['goog.events', 'goog.events.BrowserEvent', 'goog.events.EventTarget', 'goog.userAgent']);
goog.addDependency('events/imehandler.js', ['goog.events.ImeHandler', 'goog.events.ImeHandler.Event', 'goog.events.ImeHandler.EventType'], ['goog.events.Event', 'goog.events.EventHandler', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.userAgent']);
goog.addDependency('events/imehandler_test.js', ['goog.events.ImeHandlerTest'], ['goog.array', 'goog.dom', 'goog.events', 'goog.events.ImeHandler', 'goog.events.KeyCodes', 'goog.object', 'goog.string', 'goog.testing.PropertyReplacer', 'goog.testing.events', 'goog.testing.events.Event', 'goog.testing.jsunit', 'goog.userAgent']);
goog.addDependency('events/inputhandler.js', ['goog.events.InputHandler', 'goog.events.InputHandler.EventType'], ['goog.Timer', 'goog.dom', 'goog.events.BrowserEvent', 'goog.events.EventHandler', 'goog.events.EventTarget', 'goog.events.KeyCodes', 'goog.userAgent']);
goog.addDependency('events/inputhandler_test.js', ['goog.events.InputHandlerTest'], ['goog.dom', 'goog.events.EventHandler', 'goog.events.EventType', 'goog.events.InputHandler', 'goog.events.KeyCodes', 'goog.testing.events', 'goog.testing.events.Event', 'goog.testing.jsunit', 'goog.testing.recordFunction', 'goog.userAgent']);
goog.addDependency('events/keycodes.js', ['goog.events.KeyCodes'], ['goog.userAgent']);
goog.addDependency('events/keycodes_test.js', ['goog.events.KeyCodesTest'], ['goog.events.BrowserEvent', 'goog.events.KeyCodes', 'goog.object', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit', 'goog.userAgent']);
goog.addDependency('events/keyhandler.js', ['goog.events.KeyEvent', 'goog.events.KeyHandler', 'goog.events.KeyHandler.EventType'], ['goog.events', 'goog.events.BrowserEvent', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.userAgent']);
goog.addDependency('events/keyhandler_test.js', ['goog.events.KeyEventTest'], ['goog.dom', 'goog.events', 'goog.events.BrowserEvent', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.events.KeyHandler', 'goog.testing.events', 'goog.testing.jsunit', 'goog.userAgent']);
goog.addDependency('events/keynames.js', ['goog.events.KeyNames'], []);
goog.addDependency('events/listenable.js', ['goog.events.Listenable', 'goog.events.ListenableKey'], ['goog.events.EventId']);
goog.addDependency('events/listenable_test.js', ['goog.events.ListenableTest'], ['goog.events.Listenable', 'goog.testing.jsunit']);
goog.addDependency('events/listener.js', ['goog.events.Listener'], ['goog.events.ListenableKey']);
goog.addDependency('events/listenermap.js', ['goog.events.ListenerMap'], ['goog.array', 'goog.events.Listener', 'goog.object']);
goog.addDependency('events/listenermap_test.js', ['goog.events.ListenerMapTest'], ['goog.dispose', 'goog.events', 'goog.events.EventId', 'goog.events.EventTarget', 'goog.events.ListenerMap', 'goog.testing.jsunit']);
goog.addDependency('events/mousewheelhandler.js', ['goog.events.MouseWheelEvent', 'goog.events.MouseWheelHandler', 'goog.events.MouseWheelHandler.EventType'], ['goog.dom', 'goog.events', 'goog.events.BrowserEvent', 'goog.events.EventTarget', 'goog.math', 'goog.style', 'goog.userAgent']);
goog.addDependency('events/mousewheelhandler_test.js', ['goog.events.MouseWheelHandlerTest'], ['goog.dom', 'goog.events', 'goog.events.BrowserEvent', 'goog.events.MouseWheelEvent', 'goog.events.MouseWheelHandler', 'goog.functions', 'goog.string', 'goog.testing.PropertyReplacer', 'goog.testing.events', 'goog.testing.jsunit', 'goog.userAgent']);
goog.addDependency('events/onlinehandler.js', ['goog.events.OnlineHandler', 'goog.events.OnlineHandler.EventType'], ['goog.Timer', 'goog.events.BrowserFeature', 'goog.events.EventHandler', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.net.NetworkStatusMonitor', 'goog.userAgent']);
goog.addDependency('events/onlinelistener_test.js', ['goog.events.OnlineHandlerTest'], ['goog.events', 'goog.events.BrowserFeature', 'goog.events.Event', 'goog.events.EventHandler', 'goog.events.OnlineHandler', 'goog.net.NetworkStatusMonitor', 'goog.testing.MockClock', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit', 'goog.testing.recordFunction']);
goog.addDependency('events/pastehandler.js', ['goog.events.PasteHandler', 'goog.events.PasteHandler.EventType', 'goog.events.PasteHandler.State'], ['goog.Timer', 'goog.async.ConditionalDelay', 'goog.events.BrowserEvent', 'goog.events.EventHandler', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.log', 'goog.userAgent']);
goog.addDependency('events/pastehandler_test.js', ['goog.events.PasteHandlerTest'], ['goog.dom', 'goog.events', 'goog.events.BrowserEvent', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.events.PasteHandler', 'goog.testing.MockClock', 'goog.testing.MockUserAgent', 'goog.testing.jsunit', 'goog.userAgent']);
goog.addDependency('format/emailaddress.js', ['goog.format.EmailAddress'], ['goog.string']);
goog.addDependency('format/emailaddress_test.js', ['goog.format.EmailAddressTest'], ['goog.array', 'goog.format.EmailAddress', 'goog.testing.jsunit']);
goog.addDependency('format/format.js', ['goog.format'], ['goog.i18n.GraphemeBreak', 'goog.string', 'goog.userAgent']);
goog.addDependency('format/format_test.js', ['goog.formatTest'], ['goog.dom', 'goog.format', 'goog.string', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit']);
goog.addDependency('format/htmlprettyprinter.js', ['goog.format.HtmlPrettyPrinter', 'goog.format.HtmlPrettyPrinter.Buffer'], ['goog.object', 'goog.string.StringBuffer']);
goog.addDependency('format/htmlprettyprinter_test.js', ['goog.format.HtmlPrettyPrinterTest'], ['goog.format.HtmlPrettyPrinter', 'goog.testing.MockClock', 'goog.testing.jsunit']);
goog.addDependency('format/internationalizedemailaddress.js', ['goog.format.InternationalizedEmailAddress'], ['goog.format.EmailAddress']);
goog.addDependency('format/internationalizedemailaddress_test.js', ['goog.format.InternationalizedEmailAddressTest'], ['goog.array', 'goog.format.InternationalizedEmailAddress', 'goog.testing.jsunit']);
goog.addDependency('format/jsonprettyprinter.js', ['goog.format.JsonPrettyPrinter', 'goog.format.JsonPrettyPrinter.HtmlDelimiters', 'goog.format.JsonPrettyPrinter.TextDelimiters'], ['goog.json', 'goog.json.Serializer', 'goog.string', 'goog.string.StringBuffer', 'goog.string.format']);
goog.addDependency('format/jsonprettyprinter_test.js', ['goog.format.JsonPrettyPrinterTest'], ['goog.format.JsonPrettyPrinter', 'goog.testing.jsunit']);
goog.addDependency('fs/entry.js', ['goog.fs.DirectoryEntry', 'goog.fs.DirectoryEntry.Behavior', 'goog.fs.Entry', 'goog.fs.FileEntry'], []);
goog.addDependency('fs/entryimpl.js', ['goog.fs.DirectoryEntryImpl', 'goog.fs.EntryImpl', 'goog.fs.FileEntryImpl'], ['goog.array', 'goog.async.Deferred', 'goog.fs.DirectoryEntry', 'goog.fs.Entry', 'goog.fs.Error', 'goog.fs.FileEntry', 'goog.fs.FileWriter', 'goog.functions', 'goog.string']);
goog.addDependency('fs/error.js', ['goog.fs.Error', 'goog.fs.Error.ErrorCode'], ['goog.debug.Error', 'goog.object', 'goog.string']);
goog.addDependency('fs/filereader.js', ['goog.fs.FileReader', 'goog.fs.FileReader.EventType', 'goog.fs.FileReader.ReadyState'], ['goog.async.Deferred', 'goog.events.EventTarget', 'goog.fs.Error', 'goog.fs.ProgressEvent']);
goog.addDependency('fs/filesaver.js', ['goog.fs.FileSaver', 'goog.fs.FileSaver.EventType', 'goog.fs.FileSaver.ProgressEvent', 'goog.fs.FileSaver.ReadyState'], ['goog.events.EventTarget', 'goog.fs.Error', 'goog.fs.ProgressEvent']);
goog.addDependency('fs/filesystem.js', ['goog.fs.FileSystem'], []);
goog.addDependency('fs/filesystemimpl.js', ['goog.fs.FileSystemImpl'], ['goog.fs.DirectoryEntryImpl', 'goog.fs.FileSystem']);
goog.addDependency('fs/filewriter.js', ['goog.fs.FileWriter'], ['goog.fs.Error', 'goog.fs.FileSaver']);
goog.addDependency('fs/fs.js', ['goog.fs'], ['goog.array', 'goog.async.Deferred', 'goog.fs.Error', 'goog.fs.FileReader', 'goog.fs.FileSystemImpl', 'goog.userAgent']);
goog.addDependency('fs/fs_test.js', ['goog.fsTest'], ['goog.array', 'goog.async.Deferred', 'goog.async.DeferredList', 'goog.dom', 'goog.events', 'goog.fs', 'goog.fs.DirectoryEntry', 'goog.fs.Error', 'goog.fs.FileReader', 'goog.fs.FileSaver', 'goog.string', 'goog.testing.AsyncTestCase', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit']);
goog.addDependency('fs/progressevent.js', ['goog.fs.ProgressEvent'], ['goog.events.Event']);
goog.addDependency('functions/functions.js', ['goog.functions'], []);
goog.addDependency('functions/functions_test.js', ['goog.functionsTest'], ['goog.functions', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit', 'goog.testing.recordFunction']);
goog.addDependency('fx/abstractdragdrop.js', ['goog.fx.AbstractDragDrop', 'goog.fx.AbstractDragDrop.EventType', 'goog.fx.DragDropEvent', 'goog.fx.DragDropItem'], ['goog.asserts', 'goog.dom', 'goog.dom.classlist', 'goog.events', 'goog.events.Event', 'goog.events.EventHandler', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.fx.Dragger', 'goog.math.Box', 'goog.math.Coordinate', 'goog.style']);
goog.addDependency('fx/abstractdragdrop_test.js', ['goog.fx.AbstractDragDropTest'], ['goog.array', 'goog.events.EventType', 'goog.functions', 'goog.fx.AbstractDragDrop', 'goog.fx.DragDropItem', 'goog.math.Box', 'goog.math.Coordinate', 'goog.style', 'goog.testing.events', 'goog.testing.jsunit']);
goog.addDependency('fx/anim/anim.js', ['goog.fx.anim', 'goog.fx.anim.Animated'], ['goog.async.AnimationDelay', 'goog.async.Delay', 'goog.object']);
goog.addDependency('fx/anim/anim_test.js', ['goog.fx.animTest'], ['goog.async.AnimationDelay', 'goog.async.Delay', 'goog.events', 'goog.functions', 'goog.fx.Animation', 'goog.fx.anim', 'goog.object', 'goog.testing.MockClock', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit', 'goog.testing.recordFunction', 'goog.userAgent']);
goog.addDependency('fx/animation.js', ['goog.fx.Animation', 'goog.fx.Animation.EventType', 'goog.fx.Animation.State', 'goog.fx.AnimationEvent'], ['goog.array', 'goog.events.Event', 'goog.fx.Transition', 'goog.fx.Transition.EventType', 'goog.fx.TransitionBase.State', 'goog.fx.anim', 'goog.fx.anim.Animated']);
goog.addDependency('fx/animation_test.js', ['goog.fx.AnimationTest'], ['goog.events', 'goog.fx.Animation', 'goog.testing.MockClock', 'goog.testing.jsunit']);
goog.addDependency('fx/animationqueue.js', ['goog.fx.AnimationParallelQueue', 'goog.fx.AnimationQueue', 'goog.fx.AnimationSerialQueue'], ['goog.array', 'goog.asserts', 'goog.events.EventHandler', 'goog.fx.Transition.EventType', 'goog.fx.TransitionBase', 'goog.fx.TransitionBase.State']);
goog.addDependency('fx/animationqueue_test.js', ['goog.fx.AnimationQueueTest'], ['goog.events', 'goog.fx.Animation', 'goog.fx.AnimationParallelQueue', 'goog.fx.AnimationSerialQueue', 'goog.fx.Transition', 'goog.fx.anim', 'goog.testing.MockClock', 'goog.testing.jsunit']);
goog.addDependency('fx/css3/fx.js', ['goog.fx.css3'], ['goog.fx.css3.Transition']);
goog.addDependency('fx/css3/transition.js', ['goog.fx.css3.Transition'], ['goog.Timer', 'goog.fx.TransitionBase', 'goog.style', 'goog.style.transition']);
goog.addDependency('fx/css3/transition_test.js', ['goog.fx.css3.TransitionTest'], ['goog.dispose', 'goog.dom', 'goog.events', 'goog.fx.Transition', 'goog.fx.css3.Transition', 'goog.style.transition', 'goog.testing.MockClock', 'goog.testing.jsunit', 'goog.testing.recordFunction']);
goog.addDependency('fx/cssspriteanimation.js', ['goog.fx.CssSpriteAnimation'], ['goog.fx.Animation']);
goog.addDependency('fx/cssspriteanimation_test.js', ['goog.fx.CssSpriteAnimationTest'], ['goog.fx.CssSpriteAnimation', 'goog.math.Box', 'goog.math.Size', 'goog.testing.MockClock', 'goog.testing.jsunit']);
goog.addDependency('fx/dom.js', ['goog.fx.dom', 'goog.fx.dom.BgColorTransform', 'goog.fx.dom.ColorTransform', 'goog.fx.dom.Fade', 'goog.fx.dom.FadeIn', 'goog.fx.dom.FadeInAndShow', 'goog.fx.dom.FadeOut', 'goog.fx.dom.FadeOutAndHide', 'goog.fx.dom.PredefinedEffect', 'goog.fx.dom.Resize', 'goog.fx.dom.ResizeHeight', 'goog.fx.dom.ResizeWidth', 'goog.fx.dom.Scroll', 'goog.fx.dom.Slide', 'goog.fx.dom.SlideFrom', 'goog.fx.dom.Swipe'], ['goog.color', 'goog.events', 'goog.fx.Animation', 'goog.fx.Transition', 'goog.style', 'goog.style.bidi']);
goog.addDependency('fx/dragdrop.js', ['goog.fx.DragDrop'], ['goog.fx.AbstractDragDrop', 'goog.fx.DragDropItem']);
goog.addDependency('fx/dragdropgroup.js', ['goog.fx.DragDropGroup'], ['goog.dom', 'goog.fx.AbstractDragDrop', 'goog.fx.DragDropItem']);
goog.addDependency('fx/dragdropgroup_test.js', ['goog.fx.DragDropGroupTest'], ['goog.events', 'goog.fx.DragDropGroup', 'goog.testing.jsunit']);
goog.addDependency('fx/dragger.js', ['goog.fx.DragEvent', 'goog.fx.Dragger', 'goog.fx.Dragger.EventType'], ['goog.dom', 'goog.events', 'goog.events.Event', 'goog.events.EventHandler', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.math.Coordinate', 'goog.math.Rect', 'goog.style', 'goog.style.bidi', 'goog.userAgent']);
goog.addDependency('fx/dragger_test.js', ['goog.fx.DraggerTest'], ['goog.dom', 'goog.events', 'goog.events.BrowserEvent', 'goog.events.Event', 'goog.events.EventType', 'goog.fx.Dragger', 'goog.math.Rect', 'goog.style.bidi', 'goog.testing.StrictMock', 'goog.testing.events', 'goog.testing.jsunit', 'goog.userAgent']);
goog.addDependency('fx/draglistgroup.js', ['goog.fx.DragListDirection', 'goog.fx.DragListGroup', 'goog.fx.DragListGroup.EventType', 'goog.fx.DragListGroupEvent'], ['goog.array', 'goog.asserts', 'goog.dom', 'goog.dom.classlist', 'goog.events', 'goog.events.Event', 'goog.events.EventHandler', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.fx.Dragger', 'goog.math.Coordinate', 'goog.string', 'goog.style']);
goog.addDependency('fx/draglistgroup_test.js', ['goog.fx.DragListGroupTest'], ['goog.array', 'goog.dom', 'goog.dom.classlist', 'goog.events', 'goog.events.BrowserEvent', 'goog.events.BrowserFeature', 'goog.events.Event', 'goog.events.EventType', 'goog.fx.DragEvent', 'goog.fx.DragListDirection', 'goog.fx.DragListGroup', 'goog.fx.Dragger', 'goog.math.Coordinate', 'goog.object', 'goog.testing.events', 'goog.testing.jsunit']);
goog.addDependency('fx/dragscrollsupport.js', ['goog.fx.DragScrollSupport'], ['goog.Disposable', 'goog.Timer', 'goog.dom', 'goog.events.EventHandler', 'goog.events.EventType', 'goog.math.Coordinate', 'goog.style']);
goog.addDependency('fx/dragscrollsupport_test.js', ['goog.fx.DragScrollSupportTest'], ['goog.fx.DragScrollSupport', 'goog.math.Coordinate', 'goog.testing.MockClock', 'goog.testing.events', 'goog.testing.jsunit']);
goog.addDependency('fx/easing.js', ['goog.fx.easing'], []);
goog.addDependency('fx/easing_test.js', ['goog.fx.easingTest'], ['goog.fx.easing', 'goog.testing.jsunit']);
goog.addDependency('fx/fx.js', ['goog.fx'], ['goog.asserts', 'goog.fx.Animation', 'goog.fx.Animation.EventType', 'goog.fx.Animation.State', 'goog.fx.AnimationEvent', 'goog.fx.Transition.EventType', 'goog.fx.easing']);
goog.addDependency('fx/fx_test.js', ['goog.fxTest'], ['goog.fx.Animation', 'goog.object', 'goog.testing.MockClock', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit']);
goog.addDependency('fx/transition.js', ['goog.fx.Transition', 'goog.fx.Transition.EventType'], []);
goog.addDependency('fx/transitionbase.js', ['goog.fx.TransitionBase', 'goog.fx.TransitionBase.State'], ['goog.events.EventTarget', 'goog.fx.Transition', 'goog.fx.Transition.EventType']);
goog.addDependency('graphics/abstractgraphics.js', ['goog.graphics.AbstractGraphics'], ['goog.dom', 'goog.graphics.Path', 'goog.math.Coordinate', 'goog.math.Size', 'goog.style', 'goog.ui.Component']);
goog.addDependency('graphics/affinetransform.js', ['goog.graphics.AffineTransform'], ['goog.math']);
goog.addDependency('graphics/canvaselement.js', ['goog.graphics.CanvasEllipseElement', 'goog.graphics.CanvasGroupElement', 'goog.graphics.CanvasImageElement', 'goog.graphics.CanvasPathElement', 'goog.graphics.CanvasRectElement', 'goog.graphics.CanvasTextElement'], ['goog.array', 'goog.dom', 'goog.dom.TagName', 'goog.graphics.EllipseElement', 'goog.graphics.GroupElement', 'goog.graphics.ImageElement', 'goog.graphics.Path', 'goog.graphics.PathElement', 'goog.graphics.RectElement', 'goog.graphics.TextElement', 'goog.math', 'goog.string']);
goog.addDependency('graphics/canvasgraphics.js', ['goog.graphics.CanvasGraphics'], ['goog.events.EventType', 'goog.graphics.AbstractGraphics', 'goog.graphics.CanvasEllipseElement', 'goog.graphics.CanvasGroupElement', 'goog.graphics.CanvasImageElement', 'goog.graphics.CanvasPathElement', 'goog.graphics.CanvasRectElement', 'goog.graphics.CanvasTextElement', 'goog.graphics.SolidFill', 'goog.math.Size', 'goog.style']);
goog.addDependency('graphics/element.js', ['goog.graphics.Element'], ['goog.asserts', 'goog.events', 'goog.events.EventTarget', 'goog.events.Listenable', 'goog.graphics.AffineTransform', 'goog.math']);
goog.addDependency('graphics/ellipseelement.js', ['goog.graphics.EllipseElement'], ['goog.graphics.StrokeAndFillElement']);
goog.addDependency('graphics/ext/coordinates.js', ['goog.graphics.ext.coordinates'], ['goog.string']);
goog.addDependency('graphics/ext/element.js', ['goog.graphics.ext.Element'], ['goog.events.EventTarget', 'goog.functions', 'goog.graphics.ext.coordinates']);
goog.addDependency('graphics/ext/ellipse.js', ['goog.graphics.ext.Ellipse'], ['goog.graphics.ext.StrokeAndFillElement']);
goog.addDependency('graphics/ext/ext.js', ['goog.graphics.ext'], ['goog.graphics.ext.Ellipse', 'goog.graphics.ext.Graphics', 'goog.graphics.ext.Group', 'goog.graphics.ext.Image', 'goog.graphics.ext.Rectangle', 'goog.graphics.ext.Shape', 'goog.graphics.ext.coordinates']);
goog.addDependency('graphics/ext/graphics.js', ['goog.graphics.ext.Graphics'], ['goog.events.EventType', 'goog.graphics.ext.Group']);
goog.addDependency('graphics/ext/group.js', ['goog.graphics.ext.Group'], ['goog.array', 'goog.graphics.ext.Element']);
goog.addDependency('graphics/ext/image.js', ['goog.graphics.ext.Image'], ['goog.graphics.ext.Element']);
goog.addDependency('graphics/ext/path.js', ['goog.graphics.ext.Path'], ['goog.graphics.AffineTransform', 'goog.graphics.Path', 'goog.math', 'goog.math.Rect']);
goog.addDependency('graphics/ext/rectangle.js', ['goog.graphics.ext.Rectangle'], ['goog.graphics.ext.StrokeAndFillElement']);
goog.addDependency('graphics/ext/shape.js', ['goog.graphics.ext.Shape'], ['goog.graphics.ext.Path', 'goog.graphics.ext.StrokeAndFillElement', 'goog.math.Rect']);
goog.addDependency('graphics/ext/strokeandfillelement.js', ['goog.graphics.ext.StrokeAndFillElement'], ['goog.graphics.ext.Element']);
goog.addDependency('graphics/fill.js', ['goog.graphics.Fill'], []);
goog.addDependency('graphics/font.js', ['goog.graphics.Font'], []);
goog.addDependency('graphics/graphics.js', ['goog.graphics'], ['goog.dom', 'goog.graphics.CanvasGraphics', 'goog.graphics.SvgGraphics', 'goog.graphics.VmlGraphics', 'goog.userAgent']);
goog.addDependency('graphics/groupelement.js', ['goog.graphics.GroupElement'], ['goog.graphics.Element']);
goog.addDependency('graphics/imageelement.js', ['goog.graphics.ImageElement'], ['goog.graphics.Element']);
goog.addDependency('graphics/lineargradient.js', ['goog.graphics.LinearGradient'], ['goog.asserts', 'goog.graphics.Fill']);
goog.addDependency('graphics/path.js', ['goog.graphics.Path', 'goog.graphics.Path.Segment'], ['goog.array', 'goog.math']);
goog.addDependency('graphics/pathelement.js', ['goog.graphics.PathElement'], ['goog.graphics.StrokeAndFillElement']);
goog.addDependency('graphics/paths.js', ['goog.graphics.paths'], ['goog.graphics.Path', 'goog.math.Coordinate']);
goog.addDependency('graphics/rectelement.js', ['goog.graphics.RectElement'], ['goog.graphics.StrokeAndFillElement']);
goog.addDependency('graphics/solidfill.js', ['goog.graphics.SolidFill'], ['goog.graphics.Fill']);
goog.addDependency('graphics/stroke.js', ['goog.graphics.Stroke'], []);
goog.addDependency('graphics/strokeandfillelement.js', ['goog.graphics.StrokeAndFillElement'], ['goog.graphics.Element']);
goog.addDependency('graphics/svgelement.js', ['goog.graphics.SvgEllipseElement', 'goog.graphics.SvgGroupElement', 'goog.graphics.SvgImageElement', 'goog.graphics.SvgPathElement', 'goog.graphics.SvgRectElement', 'goog.graphics.SvgTextElement'], ['goog.dom', 'goog.graphics.EllipseElement', 'goog.graphics.GroupElement', 'goog.graphics.ImageElement', 'goog.graphics.PathElement', 'goog.graphics.RectElement', 'goog.graphics.TextElement']);
goog.addDependency('graphics/svggraphics.js', ['goog.graphics.SvgGraphics'], ['goog.Timer', 'goog.dom', 'goog.events.EventHandler', 'goog.events.EventType', 'goog.graphics.AbstractGraphics', 'goog.graphics.LinearGradient', 'goog.graphics.Path', 'goog.graphics.SolidFill', 'goog.graphics.Stroke', 'goog.graphics.SvgEllipseElement', 'goog.graphics.SvgGroupElement', 'goog.graphics.SvgImageElement', 'goog.graphics.SvgPathElement', 'goog.graphics.SvgRectElement', 'goog.graphics.SvgTextElement', 'goog.math', 'goog.math.Size', 'goog.style', 'goog.userAgent']);
goog.addDependency('graphics/textelement.js', ['goog.graphics.TextElement'], ['goog.graphics.StrokeAndFillElement']);
goog.addDependency('graphics/vmlelement.js', ['goog.graphics.VmlEllipseElement', 'goog.graphics.VmlGroupElement', 'goog.graphics.VmlImageElement', 'goog.graphics.VmlPathElement', 'goog.graphics.VmlRectElement', 'goog.graphics.VmlTextElement'], ['goog.dom', 'goog.graphics.EllipseElement', 'goog.graphics.GroupElement', 'goog.graphics.ImageElement', 'goog.graphics.PathElement', 'goog.graphics.RectElement', 'goog.graphics.TextElement']);
goog.addDependency('graphics/vmlgraphics.js', ['goog.graphics.VmlGraphics'], ['goog.array', 'goog.events', 'goog.events.EventHandler', 'goog.events.EventType', 'goog.graphics.AbstractGraphics', 'goog.graphics.LinearGradient', 'goog.graphics.Path', 'goog.graphics.SolidFill', 'goog.graphics.VmlEllipseElement', 'goog.graphics.VmlGroupElement', 'goog.graphics.VmlImageElement', 'goog.graphics.VmlPathElement', 'goog.graphics.VmlRectElement', 'goog.graphics.VmlTextElement', 'goog.math', 'goog.math.Size', 'goog.string', 'goog.style']);
goog.addDependency('history/event.js', ['goog.history.Event'], ['goog.events.Event', 'goog.history.EventType']);
goog.addDependency('history/eventtype.js', ['goog.history.EventType'], []);
goog.addDependency('history/history.js', ['goog.History', 'goog.History.Event', 'goog.History.EventType'], ['goog.Timer', 'goog.dom', 'goog.events.EventHandler', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.history.Event', 'goog.history.EventType', 'goog.memoize', 'goog.string', 'goog.userAgent']);
goog.addDependency('history/history_test.js', ['goog.HistoryTest'], ['goog.History', 'goog.dispose', 'goog.dom', 'goog.testing.jsunit', 'goog.userAgent']);
goog.addDependency('history/html5history.js', ['goog.history.Html5History', 'goog.history.Html5History.TokenTransformer'], ['goog.asserts', 'goog.events', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.history.Event', 'goog.history.EventType']);
goog.addDependency('history/html5history_test.js', ['goog.history.Html5HistoryTest'], ['goog.history.Html5History', 'goog.testing.MockControl', 'goog.testing.jsunit', 'goog.testing.mockmatchers']);
goog.addDependency('html/legacyconversions.js', ['goog.html.legacyconversions'], ['goog.html.SafeHtml', 'goog.html.SafeUrl', 'goog.html.TrustedResourceUrl']);
goog.addDependency('html/legacyconversions_test.js', ['goog.html.legacyconversionsTest'], ['goog.html.SafeHtml', 'goog.html.SafeUrl', 'goog.html.TrustedResourceUrl', 'goog.html.legacyconversions', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit']);
goog.addDependency('html/safehtml.js', ['goog.html.SafeHtml'], ['goog.array', 'goog.asserts', 'goog.dom.tags', 'goog.html.SafeStyle', 'goog.html.SafeUrl', 'goog.i18n.bidi.Dir', 'goog.i18n.bidi.DirectionalString', 'goog.object', 'goog.string', 'goog.string.Const', 'goog.string.TypedString']);
goog.addDependency('html/safehtml_test.js', ['goog.html.safeHtmlTest'], ['goog.html.SafeHtml', 'goog.html.SafeStyle', 'goog.html.SafeUrl', 'goog.html.testing', 'goog.i18n.bidi.Dir', 'goog.string.Const', 'goog.testing.jsunit']);
goog.addDependency('html/safestyle.js', ['goog.html.SafeStyle'], ['goog.array', 'goog.asserts', 'goog.string', 'goog.string.Const', 'goog.string.TypedString']);
goog.addDependency('html/safestyle_test.js', ['goog.html.safeStyleTest'], ['goog.html.SafeStyle', 'goog.string.Const', 'goog.testing.jsunit']);
goog.addDependency('html/safeurl.js', ['goog.html.SafeUrl'], ['goog.asserts', 'goog.i18n.bidi.Dir', 'goog.i18n.bidi.DirectionalString', 'goog.string.Const', 'goog.string.TypedString']);
goog.addDependency('html/safeurl_test.js', ['goog.html.safeUrlTest'], ['goog.html.SafeUrl', 'goog.i18n.bidi.Dir', 'goog.string.Const', 'goog.testing.jsunit']);
goog.addDependency('html/testing.js', ['goog.html.testing'], ['goog.html.SafeHtml', 'goog.html.SafeStyle', 'goog.html.SafeUrl', 'goog.html.TrustedResourceUrl']);
goog.addDependency('html/trustedresourceurl.js', ['goog.html.TrustedResourceUrl'], ['goog.asserts', 'goog.i18n.bidi.Dir', 'goog.i18n.bidi.DirectionalString', 'goog.string.Const', 'goog.string.TypedString']);
goog.addDependency('html/trustedresourceurl_test.js', ['goog.html.trustedResourceUrlTest'], ['goog.html.TrustedResourceUrl', 'goog.i18n.bidi.Dir', 'goog.string.Const', 'goog.testing.jsunit']);
goog.addDependency('html/uncheckedconversions.js', ['goog.html.uncheckedconversions'], ['goog.asserts', 'goog.html.SafeHtml', 'goog.html.SafeStyle', 'goog.html.SafeUrl', 'goog.html.TrustedResourceUrl', 'goog.string', 'goog.string.Const']);
goog.addDependency('html/uncheckedconversions_test.js', ['goog.html.uncheckedconversionsTest'], ['goog.html.SafeHtml', 'goog.html.SafeUrl', 'goog.html.TrustedResourceUrl', 'goog.html.uncheckedconversions', 'goog.i18n.bidi.Dir', 'goog.string.Const', 'goog.testing.jsunit']);
goog.addDependency('html/utils.js', ['goog.html.utils'], ['goog.string']);
goog.addDependency('html/utils_test.js', ['goog.html.UtilsTest'], ['goog.array', 'goog.dom.TagName', 'goog.html.utils', 'goog.object', 'goog.testing.jsunit']);
goog.addDependency('i18n/bidi.js', ['goog.i18n.bidi', 'goog.i18n.bidi.Dir', 'goog.i18n.bidi.DirectionalString', 'goog.i18n.bidi.Format'], []);
goog.addDependency('i18n/bidi_test.js', ['goog.i18n.bidiTest'], ['goog.i18n.bidi', 'goog.i18n.bidi.Dir', 'goog.testing.jsunit']);
goog.addDependency('i18n/bidiformatter.js', ['goog.i18n.BidiFormatter'], ['goog.html.SafeHtml', 'goog.html.legacyconversions', 'goog.i18n.bidi', 'goog.i18n.bidi.Dir', 'goog.i18n.bidi.Format']);
goog.addDependency('i18n/bidiformatter_test.js', ['goog.i18n.BidiFormatterTest'], ['goog.html.SafeHtml', 'goog.i18n.BidiFormatter', 'goog.i18n.bidi.Dir', 'goog.i18n.bidi.Format', 'goog.testing.jsunit']);
goog.addDependency('i18n/charlistdecompressor.js', ['goog.i18n.CharListDecompressor'], ['goog.array', 'goog.i18n.uChar']);
goog.addDependency('i18n/charlistdecompressor_test.js', ['goog.i18n.CharListDecompressorTest'], ['goog.i18n.CharListDecompressor', 'goog.testing.jsunit']);
goog.addDependency('i18n/charpickerdata.js', ['goog.i18n.CharPickerData'], []);
goog.addDependency('i18n/collation.js', ['goog.i18n.collation'], []);
goog.addDependency('i18n/collation_test.js', ['goog.i18n.collationTest'], ['goog.i18n.collation', 'goog.testing.ExpectedFailures', 'goog.testing.jsunit', 'goog.userAgent']);
goog.addDependency('i18n/compactnumberformatsymbols.js', ['goog.i18n.CompactNumberFormatSymbols', 'goog.i18n.CompactNumberFormatSymbols_af', 'goog.i18n.CompactNumberFormatSymbols_af_ZA', 'goog.i18n.CompactNumberFormatSymbols_am', 'goog.i18n.CompactNumberFormatSymbols_am_ET', 'goog.i18n.CompactNumberFormatSymbols_ar', 'goog.i18n.CompactNumberFormatSymbols_ar_001', 'goog.i18n.CompactNumberFormatSymbols_az', 'goog.i18n.CompactNumberFormatSymbols_az_Cyrl_AZ', 'goog.i18n.CompactNumberFormatSymbols_az_Latn_AZ', 'goog.i18n.CompactNumberFormatSymbols_bg', 'goog.i18n.CompactNumberFormatSymbols_bg_BG', 'goog.i18n.CompactNumberFormatSymbols_bn', 'goog.i18n.CompactNumberFormatSymbols_bn_BD', 'goog.i18n.CompactNumberFormatSymbols_br', 'goog.i18n.CompactNumberFormatSymbols_br_FR', 'goog.i18n.CompactNumberFormatSymbols_ca', 'goog.i18n.CompactNumberFormatSymbols_ca_AD', 'goog.i18n.CompactNumberFormatSymbols_ca_ES', 'goog.i18n.CompactNumberFormatSymbols_ca_ES_VALENCIA', 'goog.i18n.CompactNumberFormatSymbols_ca_FR', 'goog.i18n.CompactNumberFormatSymbols_ca_IT', 'goog.i18n.CompactNumberFormatSymbols_chr', 'goog.i18n.CompactNumberFormatSymbols_chr_US', 'goog.i18n.CompactNumberFormatSymbols_cs', 'goog.i18n.CompactNumberFormatSymbols_cs_CZ', 'goog.i18n.CompactNumberFormatSymbols_cy', 'goog.i18n.CompactNumberFormatSymbols_cy_GB', 'goog.i18n.CompactNumberFormatSymbols_da', 'goog.i18n.CompactNumberFormatSymbols_da_DK', 'goog.i18n.CompactNumberFormatSymbols_da_GL', 'goog.i18n.CompactNumberFormatSymbols_de', 'goog.i18n.CompactNumberFormatSymbols_de_AT', 'goog.i18n.CompactNumberFormatSymbols_de_BE', 'goog.i18n.CompactNumberFormatSymbols_de_CH', 'goog.i18n.CompactNumberFormatSymbols_de_DE', 'goog.i18n.CompactNumberFormatSymbols_de_LU', 'goog.i18n.CompactNumberFormatSymbols_el', 'goog.i18n.CompactNumberFormatSymbols_el_GR', 'goog.i18n.CompactNumberFormatSymbols_en', 'goog.i18n.CompactNumberFormatSymbols_en_001', 'goog.i18n.CompactNumberFormatSymbols_en_AS', 'goog.i18n.CompactNumberFormatSymbols_en_AU', 'goog.i18n.CompactNumberFormatSymbols_en_DG', 'goog.i18n.CompactNumberFormatSymbols_en_FM', 'goog.i18n.CompactNumberFormatSymbols_en_GB', 'goog.i18n.CompactNumberFormatSymbols_en_GU', 'goog.i18n.CompactNumberFormatSymbols_en_IE', 'goog.i18n.CompactNumberFormatSymbols_en_IN', 'goog.i18n.CompactNumberFormatSymbols_en_IO', 'goog.i18n.CompactNumberFormatSymbols_en_MH', 'goog.i18n.CompactNumberFormatSymbols_en_MP', 'goog.i18n.CompactNumberFormatSymbols_en_PR', 'goog.i18n.CompactNumberFormatSymbols_en_PW', 'goog.i18n.CompactNumberFormatSymbols_en_SG', 'goog.i18n.CompactNumberFormatSymbols_en_TC', 'goog.i18n.CompactNumberFormatSymbols_en_UM', 'goog.i18n.CompactNumberFormatSymbols_en_US', 'goog.i18n.CompactNumberFormatSymbols_en_VG', 'goog.i18n.CompactNumberFormatSymbols_en_VI', 'goog.i18n.CompactNumberFormatSymbols_en_ZA', 'goog.i18n.CompactNumberFormatSymbols_en_ZW', 'goog.i18n.CompactNumberFormatSymbols_es', 'goog.i18n.CompactNumberFormatSymbols_es_419', 'goog.i18n.CompactNumberFormatSymbols_es_EA', 'goog.i18n.CompactNumberFormatSymbols_es_ES', 'goog.i18n.CompactNumberFormatSymbols_es_IC', 'goog.i18n.CompactNumberFormatSymbols_et', 'goog.i18n.CompactNumberFormatSymbols_et_EE', 'goog.i18n.CompactNumberFormatSymbols_eu', 'goog.i18n.CompactNumberFormatSymbols_eu_ES', 'goog.i18n.CompactNumberFormatSymbols_fa', 'goog.i18n.CompactNumberFormatSymbols_fa_IR', 'goog.i18n.CompactNumberFormatSymbols_fi', 'goog.i18n.CompactNumberFormatSymbols_fi_FI', 'goog.i18n.CompactNumberFormatSymbols_fil', 'goog.i18n.CompactNumberFormatSymbols_fil_PH', 'goog.i18n.CompactNumberFormatSymbols_fr', 'goog.i18n.CompactNumberFormatSymbols_fr_BL', 'goog.i18n.CompactNumberFormatSymbols_fr_CA', 'goog.i18n.CompactNumberFormatSymbols_fr_FR', 'goog.i18n.CompactNumberFormatSymbols_fr_GF', 'goog.i18n.CompactNumberFormatSymbols_fr_GP', 'goog.i18n.CompactNumberFormatSymbols_fr_MC', 'goog.i18n.CompactNumberFormatSymbols_fr_MF', 'goog.i18n.CompactNumberFormatSymbols_fr_MQ', 'goog.i18n.CompactNumberFormatSymbols_fr_PM', 'goog.i18n.CompactNumberFormatSymbols_fr_RE', 'goog.i18n.CompactNumberFormatSymbols_fr_YT', 'goog.i18n.CompactNumberFormatSymbols_gl', 'goog.i18n.CompactNumberFormatSymbols_gl_ES', 'goog.i18n.CompactNumberFormatSymbols_gsw', 'goog.i18n.CompactNumberFormatSymbols_gsw_CH', 'goog.i18n.CompactNumberFormatSymbols_gsw_LI', 'goog.i18n.CompactNumberFormatSymbols_gu', 'goog.i18n.CompactNumberFormatSymbols_gu_IN', 'goog.i18n.CompactNumberFormatSymbols_haw', 'goog.i18n.CompactNumberFormatSymbols_haw_US', 'goog.i18n.CompactNumberFormatSymbols_he', 'goog.i18n.CompactNumberFormatSymbols_he_IL', 'goog.i18n.CompactNumberFormatSymbols_hi', 'goog.i18n.CompactNumberFormatSymbols_hi_IN', 'goog.i18n.CompactNumberFormatSymbols_hr', 'goog.i18n.CompactNumberFormatSymbols_hr_HR', 'goog.i18n.CompactNumberFormatSymbols_hu', 'goog.i18n.CompactNumberFormatSymbols_hu_HU', 'goog.i18n.CompactNumberFormatSymbols_hy', 'goog.i18n.CompactNumberFormatSymbols_hy_AM', 'goog.i18n.CompactNumberFormatSymbols_id', 'goog.i18n.CompactNumberFormatSymbols_id_ID', 'goog.i18n.CompactNumberFormatSymbols_in', 'goog.i18n.CompactNumberFormatSymbols_is', 'goog.i18n.CompactNumberFormatSymbols_is_IS', 'goog.i18n.CompactNumberFormatSymbols_it', 'goog.i18n.CompactNumberFormatSymbols_it_IT', 'goog.i18n.CompactNumberFormatSymbols_it_SM', 'goog.i18n.CompactNumberFormatSymbols_iw', 'goog.i18n.CompactNumberFormatSymbols_ja', 'goog.i18n.CompactNumberFormatSymbols_ja_JP', 'goog.i18n.CompactNumberFormatSymbols_ka', 'goog.i18n.CompactNumberFormatSymbols_ka_GE', 'goog.i18n.CompactNumberFormatSymbols_kk', 'goog.i18n.CompactNumberFormatSymbols_kk_Cyrl_KZ', 'goog.i18n.CompactNumberFormatSymbols_km', 'goog.i18n.CompactNumberFormatSymbols_km_KH', 'goog.i18n.CompactNumberFormatSymbols_kn', 'goog.i18n.CompactNumberFormatSymbols_kn_IN', 'goog.i18n.CompactNumberFormatSymbols_ko', 'goog.i18n.CompactNumberFormatSymbols_ko_KR', 'goog.i18n.CompactNumberFormatSymbols_ky', 'goog.i18n.CompactNumberFormatSymbols_ky_Cyrl_KG', 'goog.i18n.CompactNumberFormatSymbols_ln', 'goog.i18n.CompactNumberFormatSymbols_ln_CD', 'goog.i18n.CompactNumberFormatSymbols_lo', 'goog.i18n.CompactNumberFormatSymbols_lo_LA', 'goog.i18n.CompactNumberFormatSymbols_lt', 'goog.i18n.CompactNumberFormatSymbols_lt_LT', 'goog.i18n.CompactNumberFormatSymbols_lv', 'goog.i18n.CompactNumberFormatSymbols_lv_LV', 'goog.i18n.CompactNumberFormatSymbols_mk', 'goog.i18n.CompactNumberFormatSymbols_mk_MK', 'goog.i18n.CompactNumberFormatSymbols_ml', 'goog.i18n.CompactNumberFormatSymbols_ml_IN', 'goog.i18n.CompactNumberFormatSymbols_mn', 'goog.i18n.CompactNumberFormatSymbols_mn_Cyrl_MN', 'goog.i18n.CompactNumberFormatSymbols_mr', 'goog.i18n.CompactNumberFormatSymbols_mr_IN', 'goog.i18n.CompactNumberFormatSymbols_ms', 'goog.i18n.CompactNumberFormatSymbols_ms_Latn_MY', 'goog.i18n.CompactNumberFormatSymbols_mt', 'goog.i18n.CompactNumberFormatSymbols_mt_MT', 'goog.i18n.CompactNumberFormatSymbols_my', 'goog.i18n.CompactNumberFormatSymbols_my_MM', 'goog.i18n.CompactNumberFormatSymbols_nb', 'goog.i18n.CompactNumberFormatSymbols_nb_NO', 'goog.i18n.CompactNumberFormatSymbols_nb_SJ', 'goog.i18n.CompactNumberFormatSymbols_ne', 'goog.i18n.CompactNumberFormatSymbols_ne_NP', 'goog.i18n.CompactNumberFormatSymbols_nl', 'goog.i18n.CompactNumberFormatSymbols_nl_NL', 'goog.i18n.CompactNumberFormatSymbols_no', 'goog.i18n.CompactNumberFormatSymbols_no_NO', 'goog.i18n.CompactNumberFormatSymbols_or', 'goog.i18n.CompactNumberFormatSymbols_or_IN', 'goog.i18n.CompactNumberFormatSymbols_pa', 'goog.i18n.CompactNumberFormatSymbols_pa_Guru_IN', 'goog.i18n.CompactNumberFormatSymbols_pl', 'goog.i18n.CompactNumberFormatSymbols_pl_PL', 'goog.i18n.CompactNumberFormatSymbols_pt', 'goog.i18n.CompactNumberFormatSymbols_pt_BR', 'goog.i18n.CompactNumberFormatSymbols_pt_PT', 'goog.i18n.CompactNumberFormatSymbols_ro', 'goog.i18n.CompactNumberFormatSymbols_ro_RO', 'goog.i18n.CompactNumberFormatSymbols_ru', 'goog.i18n.CompactNumberFormatSymbols_ru_RU', 'goog.i18n.CompactNumberFormatSymbols_si', 'goog.i18n.CompactNumberFormatSymbols_si_LK', 'goog.i18n.CompactNumberFormatSymbols_sk', 'goog.i18n.CompactNumberFormatSymbols_sk_SK', 'goog.i18n.CompactNumberFormatSymbols_sl', 'goog.i18n.CompactNumberFormatSymbols_sl_SI', 'goog.i18n.CompactNumberFormatSymbols_sq', 'goog.i18n.CompactNumberFormatSymbols_sq_AL', 'goog.i18n.CompactNumberFormatSymbols_sr', 'goog.i18n.CompactNumberFormatSymbols_sr_Cyrl_RS', 'goog.i18n.CompactNumberFormatSymbols_sv', 'goog.i18n.CompactNumberFormatSymbols_sv_SE', 'goog.i18n.CompactNumberFormatSymbols_sw', 'goog.i18n.CompactNumberFormatSymbols_sw_TZ', 'goog.i18n.CompactNumberFormatSymbols_ta', 'goog.i18n.CompactNumberFormatSymbols_ta_IN', 'goog.i18n.CompactNumberFormatSymbols_te', 'goog.i18n.CompactNumberFormatSymbols_te_IN', 'goog.i18n.CompactNumberFormatSymbols_th', 'goog.i18n.CompactNumberFormatSymbols_th_TH', 'goog.i18n.CompactNumberFormatSymbols_tl', 'goog.i18n.CompactNumberFormatSymbols_tr', 'goog.i18n.CompactNumberFormatSymbols_tr_TR', 'goog.i18n.CompactNumberFormatSymbols_uk', 'goog.i18n.CompactNumberFormatSymbols_uk_UA', 'goog.i18n.CompactNumberFormatSymbols_ur', 'goog.i18n.CompactNumberFormatSymbols_ur_PK', 'goog.i18n.CompactNumberFormatSymbols_uz', 'goog.i18n.CompactNumberFormatSymbols_uz_Latn_UZ', 'goog.i18n.CompactNumberFormatSymbols_vi', 'goog.i18n.CompactNumberFormatSymbols_vi_VN', 'goog.i18n.CompactNumberFormatSymbols_zh', 'goog.i18n.CompactNumberFormatSymbols_zh_CN', 'goog.i18n.CompactNumberFormatSymbols_zh_HK', 'goog.i18n.CompactNumberFormatSymbols_zh_Hans_CN', 'goog.i18n.CompactNumberFormatSymbols_zh_TW', 'goog.i18n.CompactNumberFormatSymbols_zu', 'goog.i18n.CompactNumberFormatSymbols_zu_ZA'], []);
goog.addDependency('i18n/compactnumberformatsymbols_ext.js', ['goog.i18n.CompactNumberFormatSymbolsExt', 'goog.i18n.CompactNumberFormatSymbols_aa', 'goog.i18n.CompactNumberFormatSymbols_aa_DJ', 'goog.i18n.CompactNumberFormatSymbols_aa_ER', 'goog.i18n.CompactNumberFormatSymbols_aa_ET', 'goog.i18n.CompactNumberFormatSymbols_af_NA', 'goog.i18n.CompactNumberFormatSymbols_agq', 'goog.i18n.CompactNumberFormatSymbols_agq_CM', 'goog.i18n.CompactNumberFormatSymbols_ak', 'goog.i18n.CompactNumberFormatSymbols_ak_GH', 'goog.i18n.CompactNumberFormatSymbols_ar_AE', 'goog.i18n.CompactNumberFormatSymbols_ar_BH', 'goog.i18n.CompactNumberFormatSymbols_ar_DJ', 'goog.i18n.CompactNumberFormatSymbols_ar_DZ', 'goog.i18n.CompactNumberFormatSymbols_ar_EG', 'goog.i18n.CompactNumberFormatSymbols_ar_EH', 'goog.i18n.CompactNumberFormatSymbols_ar_ER', 'goog.i18n.CompactNumberFormatSymbols_ar_IL', 'goog.i18n.CompactNumberFormatSymbols_ar_IQ', 'goog.i18n.CompactNumberFormatSymbols_ar_JO', 'goog.i18n.CompactNumberFormatSymbols_ar_KM', 'goog.i18n.CompactNumberFormatSymbols_ar_KW', 'goog.i18n.CompactNumberFormatSymbols_ar_LB', 'goog.i18n.CompactNumberFormatSymbols_ar_LY', 'goog.i18n.CompactNumberFormatSymbols_ar_MA', 'goog.i18n.CompactNumberFormatSymbols_ar_MR', 'goog.i18n.CompactNumberFormatSymbols_ar_OM', 'goog.i18n.CompactNumberFormatSymbols_ar_PS', 'goog.i18n.CompactNumberFormatSymbols_ar_QA', 'goog.i18n.CompactNumberFormatSymbols_ar_SA', 'goog.i18n.CompactNumberFormatSymbols_ar_SD', 'goog.i18n.CompactNumberFormatSymbols_ar_SO', 'goog.i18n.CompactNumberFormatSymbols_ar_SS', 'goog.i18n.CompactNumberFormatSymbols_ar_SY', 'goog.i18n.CompactNumberFormatSymbols_ar_TD', 'goog.i18n.CompactNumberFormatSymbols_ar_TN', 'goog.i18n.CompactNumberFormatSymbols_ar_YE', 'goog.i18n.CompactNumberFormatSymbols_as', 'goog.i18n.CompactNumberFormatSymbols_as_IN', 'goog.i18n.CompactNumberFormatSymbols_asa', 'goog.i18n.CompactNumberFormatSymbols_asa_TZ', 'goog.i18n.CompactNumberFormatSymbols_ast', 'goog.i18n.CompactNumberFormatSymbols_ast_ES', 'goog.i18n.CompactNumberFormatSymbols_az_Cyrl', 'goog.i18n.CompactNumberFormatSymbols_az_Latn', 'goog.i18n.CompactNumberFormatSymbols_bas', 'goog.i18n.CompactNumberFormatSymbols_bas_CM', 'goog.i18n.CompactNumberFormatSymbols_be', 'goog.i18n.CompactNumberFormatSymbols_be_BY', 'goog.i18n.CompactNumberFormatSymbols_bem', 'goog.i18n.CompactNumberFormatSymbols_bem_ZM', 'goog.i18n.CompactNumberFormatSymbols_bez', 'goog.i18n.CompactNumberFormatSymbols_bez_TZ', 'goog.i18n.CompactNumberFormatSymbols_bm', 'goog.i18n.CompactNumberFormatSymbols_bm_ML', 'goog.i18n.CompactNumberFormatSymbols_bn_IN', 'goog.i18n.CompactNumberFormatSymbols_bo', 'goog.i18n.CompactNumberFormatSymbols_bo_CN', 'goog.i18n.CompactNumberFormatSymbols_bo_IN', 'goog.i18n.CompactNumberFormatSymbols_brx', 'goog.i18n.CompactNumberFormatSymbols_brx_IN', 'goog.i18n.CompactNumberFormatSymbols_bs', 'goog.i18n.CompactNumberFormatSymbols_bs_Cyrl', 'goog.i18n.CompactNumberFormatSymbols_bs_Cyrl_BA', 'goog.i18n.CompactNumberFormatSymbols_bs_Latn', 'goog.i18n.CompactNumberFormatSymbols_bs_Latn_BA', 'goog.i18n.CompactNumberFormatSymbols_byn', 'goog.i18n.CompactNumberFormatSymbols_byn_ER', 'goog.i18n.CompactNumberFormatSymbols_cgg', 'goog.i18n.CompactNumberFormatSymbols_cgg_UG', 'goog.i18n.CompactNumberFormatSymbols_ckb', 'goog.i18n.CompactNumberFormatSymbols_ckb_Arab', 'goog.i18n.CompactNumberFormatSymbols_ckb_Arab_IQ', 'goog.i18n.CompactNumberFormatSymbols_ckb_Arab_IR', 'goog.i18n.CompactNumberFormatSymbols_ckb_IQ', 'goog.i18n.CompactNumberFormatSymbols_ckb_IR', 'goog.i18n.CompactNumberFormatSymbols_ckb_Latn', 'goog.i18n.CompactNumberFormatSymbols_ckb_Latn_IQ', 'goog.i18n.CompactNumberFormatSymbols_dav', 'goog.i18n.CompactNumberFormatSymbols_dav_KE', 'goog.i18n.CompactNumberFormatSymbols_de_LI', 'goog.i18n.CompactNumberFormatSymbols_dje', 'goog.i18n.CompactNumberFormatSymbols_dje_NE', 'goog.i18n.CompactNumberFormatSymbols_dua', 'goog.i18n.CompactNumberFormatSymbols_dua_CM', 'goog.i18n.CompactNumberFormatSymbols_dyo', 'goog.i18n.CompactNumberFormatSymbols_dyo_SN', 'goog.i18n.CompactNumberFormatSymbols_dz', 'goog.i18n.CompactNumberFormatSymbols_dz_BT', 'goog.i18n.CompactNumberFormatSymbols_ebu', 'goog.i18n.CompactNumberFormatSymbols_ebu_KE', 'goog.i18n.CompactNumberFormatSymbols_ee', 'goog.i18n.CompactNumberFormatSymbols_ee_GH', 'goog.i18n.CompactNumberFormatSymbols_ee_TG', 'goog.i18n.CompactNumberFormatSymbols_el_CY', 'goog.i18n.CompactNumberFormatSymbols_en_150', 'goog.i18n.CompactNumberFormatSymbols_en_AG', 'goog.i18n.CompactNumberFormatSymbols_en_AI', 'goog.i18n.CompactNumberFormatSymbols_en_BB', 'goog.i18n.CompactNumberFormatSymbols_en_BE', 'goog.i18n.CompactNumberFormatSymbols_en_BM', 'goog.i18n.CompactNumberFormatSymbols_en_BS', 'goog.i18n.CompactNumberFormatSymbols_en_BW', 'goog.i18n.CompactNumberFormatSymbols_en_BZ', 'goog.i18n.CompactNumberFormatSymbols_en_CA', 'goog.i18n.CompactNumberFormatSymbols_en_CC', 'goog.i18n.CompactNumberFormatSymbols_en_CK', 'goog.i18n.CompactNumberFormatSymbols_en_CM', 'goog.i18n.CompactNumberFormatSymbols_en_CX', 'goog.i18n.CompactNumberFormatSymbols_en_DM', 'goog.i18n.CompactNumberFormatSymbols_en_ER', 'goog.i18n.CompactNumberFormatSymbols_en_FJ', 'goog.i18n.CompactNumberFormatSymbols_en_FK', 'goog.i18n.CompactNumberFormatSymbols_en_GD', 'goog.i18n.CompactNumberFormatSymbols_en_GG', 'goog.i18n.CompactNumberFormatSymbols_en_GH', 'goog.i18n.CompactNumberFormatSymbols_en_GI', 'goog.i18n.CompactNumberFormatSymbols_en_GM', 'goog.i18n.CompactNumberFormatSymbols_en_GY', 'goog.i18n.CompactNumberFormatSymbols_en_HK', 'goog.i18n.CompactNumberFormatSymbols_en_IM', 'goog.i18n.CompactNumberFormatSymbols_en_JE', 'goog.i18n.CompactNumberFormatSymbols_en_JM', 'goog.i18n.CompactNumberFormatSymbols_en_KE', 'goog.i18n.CompactNumberFormatSymbols_en_KI', 'goog.i18n.CompactNumberFormatSymbols_en_KN', 'goog.i18n.CompactNumberFormatSymbols_en_KY', 'goog.i18n.CompactNumberFormatSymbols_en_LC', 'goog.i18n.CompactNumberFormatSymbols_en_LR', 'goog.i18n.CompactNumberFormatSymbols_en_LS', 'goog.i18n.CompactNumberFormatSymbols_en_MG', 'goog.i18n.CompactNumberFormatSymbols_en_MO', 'goog.i18n.CompactNumberFormatSymbols_en_MS', 'goog.i18n.CompactNumberFormatSymbols_en_MT', 'goog.i18n.CompactNumberFormatSymbols_en_MU', 'goog.i18n.CompactNumberFormatSymbols_en_MW', 'goog.i18n.CompactNumberFormatSymbols_en_NA', 'goog.i18n.CompactNumberFormatSymbols_en_NF', 'goog.i18n.CompactNumberFormatSymbols_en_NG', 'goog.i18n.CompactNumberFormatSymbols_en_NR', 'goog.i18n.CompactNumberFormatSymbols_en_NU', 'goog.i18n.CompactNumberFormatSymbols_en_NZ', 'goog.i18n.CompactNumberFormatSymbols_en_PG', 'goog.i18n.CompactNumberFormatSymbols_en_PH', 'goog.i18n.CompactNumberFormatSymbols_en_PK', 'goog.i18n.CompactNumberFormatSymbols_en_PN', 'goog.i18n.CompactNumberFormatSymbols_en_RW', 'goog.i18n.CompactNumberFormatSymbols_en_SB', 'goog.i18n.CompactNumberFormatSymbols_en_SC', 'goog.i18n.CompactNumberFormatSymbols_en_SD', 'goog.i18n.CompactNumberFormatSymbols_en_SH', 'goog.i18n.CompactNumberFormatSymbols_en_SL', 'goog.i18n.CompactNumberFormatSymbols_en_SS', 'goog.i18n.CompactNumberFormatSymbols_en_SX', 'goog.i18n.CompactNumberFormatSymbols_en_SZ', 'goog.i18n.CompactNumberFormatSymbols_en_TK', 'goog.i18n.CompactNumberFormatSymbols_en_TO', 'goog.i18n.CompactNumberFormatSymbols_en_TT', 'goog.i18n.CompactNumberFormatSymbols_en_TV', 'goog.i18n.CompactNumberFormatSymbols_en_TZ', 'goog.i18n.CompactNumberFormatSymbols_en_UG', 'goog.i18n.CompactNumberFormatSymbols_en_VC', 'goog.i18n.CompactNumberFormatSymbols_en_VU', 'goog.i18n.CompactNumberFormatSymbols_en_WS', 'goog.i18n.CompactNumberFormatSymbols_en_ZM', 'goog.i18n.CompactNumberFormatSymbols_eo', 'goog.i18n.CompactNumberFormatSymbols_eo_001', 'goog.i18n.CompactNumberFormatSymbols_es_AR', 'goog.i18n.CompactNumberFormatSymbols_es_BO', 'goog.i18n.CompactNumberFormatSymbols_es_CL', 'goog.i18n.CompactNumberFormatSymbols_es_CO', 'goog.i18n.CompactNumberFormatSymbols_es_CR', 'goog.i18n.CompactNumberFormatSymbols_es_CU', 'goog.i18n.CompactNumberFormatSymbols_es_DO', 'goog.i18n.CompactNumberFormatSymbols_es_EC', 'goog.i18n.CompactNumberFormatSymbols_es_GQ', 'goog.i18n.CompactNumberFormatSymbols_es_GT', 'goog.i18n.CompactNumberFormatSymbols_es_HN', 'goog.i18n.CompactNumberFormatSymbols_es_MX', 'goog.i18n.CompactNumberFormatSymbols_es_NI', 'goog.i18n.CompactNumberFormatSymbols_es_PA', 'goog.i18n.CompactNumberFormatSymbols_es_PE', 'goog.i18n.CompactNumberFormatSymbols_es_PH', 'goog.i18n.CompactNumberFormatSymbols_es_PR', 'goog.i18n.CompactNumberFormatSymbols_es_PY', 'goog.i18n.CompactNumberFormatSymbols_es_SV', 'goog.i18n.CompactNumberFormatSymbols_es_US', 'goog.i18n.CompactNumberFormatSymbols_es_UY', 'goog.i18n.CompactNumberFormatSymbols_es_VE', 'goog.i18n.CompactNumberFormatSymbols_ewo', 'goog.i18n.CompactNumberFormatSymbols_ewo_CM', 'goog.i18n.CompactNumberFormatSymbols_fa_AF', 'goog.i18n.CompactNumberFormatSymbols_ff', 'goog.i18n.CompactNumberFormatSymbols_ff_CM', 'goog.i18n.CompactNumberFormatSymbols_ff_GN', 'goog.i18n.CompactNumberFormatSymbols_ff_MR', 'goog.i18n.CompactNumberFormatSymbols_ff_SN', 'goog.i18n.CompactNumberFormatSymbols_fo', 'goog.i18n.CompactNumberFormatSymbols_fo_FO', 'goog.i18n.CompactNumberFormatSymbols_fr_BE', 'goog.i18n.CompactNumberFormatSymbols_fr_BF', 'goog.i18n.CompactNumberFormatSymbols_fr_BI', 'goog.i18n.CompactNumberFormatSymbols_fr_BJ', 'goog.i18n.CompactNumberFormatSymbols_fr_CD', 'goog.i18n.CompactNumberFormatSymbols_fr_CF', 'goog.i18n.CompactNumberFormatSymbols_fr_CG', 'goog.i18n.CompactNumberFormatSymbols_fr_CH', 'goog.i18n.CompactNumberFormatSymbols_fr_CI', 'goog.i18n.CompactNumberFormatSymbols_fr_CM', 'goog.i18n.CompactNumberFormatSymbols_fr_DJ', 'goog.i18n.CompactNumberFormatSymbols_fr_DZ', 'goog.i18n.CompactNumberFormatSymbols_fr_GA', 'goog.i18n.CompactNumberFormatSymbols_fr_GN', 'goog.i18n.CompactNumberFormatSymbols_fr_GQ', 'goog.i18n.CompactNumberFormatSymbols_fr_HT', 'goog.i18n.CompactNumberFormatSymbols_fr_KM', 'goog.i18n.CompactNumberFormatSymbols_fr_LU', 'goog.i18n.CompactNumberFormatSymbols_fr_MA', 'goog.i18n.CompactNumberFormatSymbols_fr_MG', 'goog.i18n.CompactNumberFormatSymbols_fr_ML', 'goog.i18n.CompactNumberFormatSymbols_fr_MR', 'goog.i18n.CompactNumberFormatSymbols_fr_MU', 'goog.i18n.CompactNumberFormatSymbols_fr_NC', 'goog.i18n.CompactNumberFormatSymbols_fr_NE', 'goog.i18n.CompactNumberFormatSymbols_fr_PF', 'goog.i18n.CompactNumberFormatSymbols_fr_RW', 'goog.i18n.CompactNumberFormatSymbols_fr_SC', 'goog.i18n.CompactNumberFormatSymbols_fr_SN', 'goog.i18n.CompactNumberFormatSymbols_fr_SY', 'goog.i18n.CompactNumberFormatSymbols_fr_TD', 'goog.i18n.CompactNumberFormatSymbols_fr_TG', 'goog.i18n.CompactNumberFormatSymbols_fr_TN', 'goog.i18n.CompactNumberFormatSymbols_fr_VU', 'goog.i18n.CompactNumberFormatSymbols_fr_WF', 'goog.i18n.CompactNumberFormatSymbols_fur', 'goog.i18n.CompactNumberFormatSymbols_fur_IT', 'goog.i18n.CompactNumberFormatSymbols_fy', 'goog.i18n.CompactNumberFormatSymbols_fy_NL', 'goog.i18n.CompactNumberFormatSymbols_ga', 'goog.i18n.CompactNumberFormatSymbols_ga_IE', 'goog.i18n.CompactNumberFormatSymbols_gd', 'goog.i18n.CompactNumberFormatSymbols_gd_GB', 'goog.i18n.CompactNumberFormatSymbols_guz', 'goog.i18n.CompactNumberFormatSymbols_guz_KE', 'goog.i18n.CompactNumberFormatSymbols_gv', 'goog.i18n.CompactNumberFormatSymbols_gv_IM', 'goog.i18n.CompactNumberFormatSymbols_ha', 'goog.i18n.CompactNumberFormatSymbols_ha_Latn', 'goog.i18n.CompactNumberFormatSymbols_ha_Latn_GH', 'goog.i18n.CompactNumberFormatSymbols_ha_Latn_NE', 'goog.i18n.CompactNumberFormatSymbols_ha_Latn_NG', 'goog.i18n.CompactNumberFormatSymbols_hr_BA', 'goog.i18n.CompactNumberFormatSymbols_ia', 'goog.i18n.CompactNumberFormatSymbols_ia_FR', 'goog.i18n.CompactNumberFormatSymbols_ig', 'goog.i18n.CompactNumberFormatSymbols_ig_NG', 'goog.i18n.CompactNumberFormatSymbols_ii', 'goog.i18n.CompactNumberFormatSymbols_ii_CN', 'goog.i18n.CompactNumberFormatSymbols_it_CH', 'goog.i18n.CompactNumberFormatSymbols_jgo', 'goog.i18n.CompactNumberFormatSymbols_jgo_CM', 'goog.i18n.CompactNumberFormatSymbols_jmc', 'goog.i18n.CompactNumberFormatSymbols_jmc_TZ', 'goog.i18n.CompactNumberFormatSymbols_kab', 'goog.i18n.CompactNumberFormatSymbols_kab_DZ', 'goog.i18n.CompactNumberFormatSymbols_kam', 'goog.i18n.CompactNumberFormatSymbols_kam_KE', 'goog.i18n.CompactNumberFormatSymbols_kde', 'goog.i18n.CompactNumberFormatSymbols_kde_TZ', 'goog.i18n.CompactNumberFormatSymbols_kea', 'goog.i18n.CompactNumberFormatSymbols_kea_CV', 'goog.i18n.CompactNumberFormatSymbols_khq', 'goog.i18n.CompactNumberFormatSymbols_khq_ML', 'goog.i18n.CompactNumberFormatSymbols_ki', 'goog.i18n.CompactNumberFormatSymbols_ki_KE', 'goog.i18n.CompactNumberFormatSymbols_kk_Cyrl', 'goog.i18n.CompactNumberFormatSymbols_kkj', 'goog.i18n.CompactNumberFormatSymbols_kkj_CM', 'goog.i18n.CompactNumberFormatSymbols_kl', 'goog.i18n.CompactNumberFormatSymbols_kl_GL', 'goog.i18n.CompactNumberFormatSymbols_kln', 'goog.i18n.CompactNumberFormatSymbols_kln_KE', 'goog.i18n.CompactNumberFormatSymbols_ko_KP', 'goog.i18n.CompactNumberFormatSymbols_kok', 'goog.i18n.CompactNumberFormatSymbols_kok_IN', 'goog.i18n.CompactNumberFormatSymbols_ks', 'goog.i18n.CompactNumberFormatSymbols_ks_Arab', 'goog.i18n.CompactNumberFormatSymbols_ks_Arab_IN', 'goog.i18n.CompactNumberFormatSymbols_ksb', 'goog.i18n.CompactNumberFormatSymbols_ksb_TZ', 'goog.i18n.CompactNumberFormatSymbols_ksf', 'goog.i18n.CompactNumberFormatSymbols_ksf_CM', 'goog.i18n.CompactNumberFormatSymbols_ksh', 'goog.i18n.CompactNumberFormatSymbols_ksh_DE', 'goog.i18n.CompactNumberFormatSymbols_kw', 'goog.i18n.CompactNumberFormatSymbols_kw_GB', 'goog.i18n.CompactNumberFormatSymbols_ky_Cyrl', 'goog.i18n.CompactNumberFormatSymbols_lag', 'goog.i18n.CompactNumberFormatSymbols_lag_TZ', 'goog.i18n.CompactNumberFormatSymbols_lg', 'goog.i18n.CompactNumberFormatSymbols_lg_UG', 'goog.i18n.CompactNumberFormatSymbols_lkt', 'goog.i18n.CompactNumberFormatSymbols_lkt_US', 'goog.i18n.CompactNumberFormatSymbols_ln_AO', 'goog.i18n.CompactNumberFormatSymbols_ln_CF', 'goog.i18n.CompactNumberFormatSymbols_ln_CG', 'goog.i18n.CompactNumberFormatSymbols_lu', 'goog.i18n.CompactNumberFormatSymbols_lu_CD', 'goog.i18n.CompactNumberFormatSymbols_luo', 'goog.i18n.CompactNumberFormatSymbols_luo_KE', 'goog.i18n.CompactNumberFormatSymbols_luy', 'goog.i18n.CompactNumberFormatSymbols_luy_KE', 'goog.i18n.CompactNumberFormatSymbols_mas', 'goog.i18n.CompactNumberFormatSymbols_mas_KE', 'goog.i18n.CompactNumberFormatSymbols_mas_TZ', 'goog.i18n.CompactNumberFormatSymbols_mer', 'goog.i18n.CompactNumberFormatSymbols_mer_KE', 'goog.i18n.CompactNumberFormatSymbols_mfe', 'goog.i18n.CompactNumberFormatSymbols_mfe_MU', 'goog.i18n.CompactNumberFormatSymbols_mg', 'goog.i18n.CompactNumberFormatSymbols_mg_MG', 'goog.i18n.CompactNumberFormatSymbols_mgh', 'goog.i18n.CompactNumberFormatSymbols_mgh_MZ', 'goog.i18n.CompactNumberFormatSymbols_mgo', 'goog.i18n.CompactNumberFormatSymbols_mgo_CM', 'goog.i18n.CompactNumberFormatSymbols_mn_Cyrl', 'goog.i18n.CompactNumberFormatSymbols_ms_Latn', 'goog.i18n.CompactNumberFormatSymbols_ms_Latn_BN', 'goog.i18n.CompactNumberFormatSymbols_ms_Latn_SG', 'goog.i18n.CompactNumberFormatSymbols_mua', 'goog.i18n.CompactNumberFormatSymbols_mua_CM', 'goog.i18n.CompactNumberFormatSymbols_naq', 'goog.i18n.CompactNumberFormatSymbols_naq_NA', 'goog.i18n.CompactNumberFormatSymbols_nd', 'goog.i18n.CompactNumberFormatSymbols_nd_ZW', 'goog.i18n.CompactNumberFormatSymbols_ne_IN', 'goog.i18n.CompactNumberFormatSymbols_nl_AW', 'goog.i18n.CompactNumberFormatSymbols_nl_BE', 'goog.i18n.CompactNumberFormatSymbols_nl_BQ', 'goog.i18n.CompactNumberFormatSymbols_nl_CW', 'goog.i18n.CompactNumberFormatSymbols_nl_SR', 'goog.i18n.CompactNumberFormatSymbols_nl_SX', 'goog.i18n.CompactNumberFormatSymbols_nmg', 'goog.i18n.CompactNumberFormatSymbols_nmg_CM', 'goog.i18n.CompactNumberFormatSymbols_nn', 'goog.i18n.CompactNumberFormatSymbols_nn_NO', 'goog.i18n.CompactNumberFormatSymbols_nnh', 'goog.i18n.CompactNumberFormatSymbols_nnh_CM', 'goog.i18n.CompactNumberFormatSymbols_nr', 'goog.i18n.CompactNumberFormatSymbols_nr_ZA', 'goog.i18n.CompactNumberFormatSymbols_nso', 'goog.i18n.CompactNumberFormatSymbols_nso_ZA', 'goog.i18n.CompactNumberFormatSymbols_nus', 'goog.i18n.CompactNumberFormatSymbols_nus_SD', 'goog.i18n.CompactNumberFormatSymbols_nyn', 'goog.i18n.CompactNumberFormatSymbols_nyn_UG', 'goog.i18n.CompactNumberFormatSymbols_om', 'goog.i18n.CompactNumberFormatSymbols_om_ET', 'goog.i18n.CompactNumberFormatSymbols_om_KE', 'goog.i18n.CompactNumberFormatSymbols_os', 'goog.i18n.CompactNumberFormatSymbols_os_GE', 'goog.i18n.CompactNumberFormatSymbols_os_RU', 'goog.i18n.CompactNumberFormatSymbols_pa_Arab', 'goog.i18n.CompactNumberFormatSymbols_pa_Arab_PK', 'goog.i18n.CompactNumberFormatSymbols_pa_Guru', 'goog.i18n.CompactNumberFormatSymbols_ps', 'goog.i18n.CompactNumberFormatSymbols_ps_AF', 'goog.i18n.CompactNumberFormatSymbols_pt_AO', 'goog.i18n.CompactNumberFormatSymbols_pt_CV', 'goog.i18n.CompactNumberFormatSymbols_pt_GW', 'goog.i18n.CompactNumberFormatSymbols_pt_MO', 'goog.i18n.CompactNumberFormatSymbols_pt_MZ', 'goog.i18n.CompactNumberFormatSymbols_pt_ST', 'goog.i18n.CompactNumberFormatSymbols_pt_TL', 'goog.i18n.CompactNumberFormatSymbols_rm', 'goog.i18n.CompactNumberFormatSymbols_rm_CH', 'goog.i18n.CompactNumberFormatSymbols_rn', 'goog.i18n.CompactNumberFormatSymbols_rn_BI', 'goog.i18n.CompactNumberFormatSymbols_ro_MD', 'goog.i18n.CompactNumberFormatSymbols_rof', 'goog.i18n.CompactNumberFormatSymbols_rof_TZ', 'goog.i18n.CompactNumberFormatSymbols_ru_BY', 'goog.i18n.CompactNumberFormatSymbols_ru_KG', 'goog.i18n.CompactNumberFormatSymbols_ru_KZ', 'goog.i18n.CompactNumberFormatSymbols_ru_MD', 'goog.i18n.CompactNumberFormatSymbols_ru_UA', 'goog.i18n.CompactNumberFormatSymbols_rw', 'goog.i18n.CompactNumberFormatSymbols_rw_RW', 'goog.i18n.CompactNumberFormatSymbols_rwk', 'goog.i18n.CompactNumberFormatSymbols_rwk_TZ', 'goog.i18n.CompactNumberFormatSymbols_sah', 'goog.i18n.CompactNumberFormatSymbols_sah_RU', 'goog.i18n.CompactNumberFormatSymbols_saq', 'goog.i18n.CompactNumberFormatSymbols_saq_KE', 'goog.i18n.CompactNumberFormatSymbols_sbp', 'goog.i18n.CompactNumberFormatSymbols_sbp_TZ', 'goog.i18n.CompactNumberFormatSymbols_se', 'goog.i18n.CompactNumberFormatSymbols_se_FI', 'goog.i18n.CompactNumberFormatSymbols_se_NO', 'goog.i18n.CompactNumberFormatSymbols_seh', 'goog.i18n.CompactNumberFormatSymbols_seh_MZ', 'goog.i18n.CompactNumberFormatSymbols_ses', 'goog.i18n.CompactNumberFormatSymbols_ses_ML', 'goog.i18n.CompactNumberFormatSymbols_sg', 'goog.i18n.CompactNumberFormatSymbols_sg_CF', 'goog.i18n.CompactNumberFormatSymbols_shi', 'goog.i18n.CompactNumberFormatSymbols_shi_Latn', 'goog.i18n.CompactNumberFormatSymbols_shi_Latn_MA', 'goog.i18n.CompactNumberFormatSymbols_shi_Tfng', 'goog.i18n.CompactNumberFormatSymbols_shi_Tfng_MA', 'goog.i18n.CompactNumberFormatSymbols_sn', 'goog.i18n.CompactNumberFormatSymbols_sn_ZW', 'goog.i18n.CompactNumberFormatSymbols_so', 'goog.i18n.CompactNumberFormatSymbols_so_DJ', 'goog.i18n.CompactNumberFormatSymbols_so_ET', 'goog.i18n.CompactNumberFormatSymbols_so_KE', 'goog.i18n.CompactNumberFormatSymbols_so_SO', 'goog.i18n.CompactNumberFormatSymbols_sq_MK', 'goog.i18n.CompactNumberFormatSymbols_sq_XK', 'goog.i18n.CompactNumberFormatSymbols_sr_Cyrl', 'goog.i18n.CompactNumberFormatSymbols_sr_Cyrl_BA', 'goog.i18n.CompactNumberFormatSymbols_sr_Cyrl_ME', 'goog.i18n.CompactNumberFormatSymbols_sr_Cyrl_XK', 'goog.i18n.CompactNumberFormatSymbols_sr_Latn', 'goog.i18n.CompactNumberFormatSymbols_sr_Latn_BA', 'goog.i18n.CompactNumberFormatSymbols_sr_Latn_ME', 'goog.i18n.CompactNumberFormatSymbols_sr_Latn_RS', 'goog.i18n.CompactNumberFormatSymbols_sr_Latn_XK', 'goog.i18n.CompactNumberFormatSymbols_ss', 'goog.i18n.CompactNumberFormatSymbols_ss_SZ', 'goog.i18n.CompactNumberFormatSymbols_ss_ZA', 'goog.i18n.CompactNumberFormatSymbols_ssy', 'goog.i18n.CompactNumberFormatSymbols_ssy_ER', 'goog.i18n.CompactNumberFormatSymbols_st', 'goog.i18n.CompactNumberFormatSymbols_st_LS', 'goog.i18n.CompactNumberFormatSymbols_st_ZA', 'goog.i18n.CompactNumberFormatSymbols_sv_AX', 'goog.i18n.CompactNumberFormatSymbols_sv_FI', 'goog.i18n.CompactNumberFormatSymbols_sw_KE', 'goog.i18n.CompactNumberFormatSymbols_sw_UG', 'goog.i18n.CompactNumberFormatSymbols_swc', 'goog.i18n.CompactNumberFormatSymbols_swc_CD', 'goog.i18n.CompactNumberFormatSymbols_ta_LK', 'goog.i18n.CompactNumberFormatSymbols_ta_MY', 'goog.i18n.CompactNumberFormatSymbols_ta_SG', 'goog.i18n.CompactNumberFormatSymbols_teo', 'goog.i18n.CompactNumberFormatSymbols_teo_KE', 'goog.i18n.CompactNumberFormatSymbols_teo_UG', 'goog.i18n.CompactNumberFormatSymbols_tg', 'goog.i18n.CompactNumberFormatSymbols_tg_Cyrl', 'goog.i18n.CompactNumberFormatSymbols_tg_Cyrl_TJ', 'goog.i18n.CompactNumberFormatSymbols_ti', 'goog.i18n.CompactNumberFormatSymbols_ti_ER', 'goog.i18n.CompactNumberFormatSymbols_ti_ET', 'goog.i18n.CompactNumberFormatSymbols_tig', 'goog.i18n.CompactNumberFormatSymbols_tig_ER', 'goog.i18n.CompactNumberFormatSymbols_tn', 'goog.i18n.CompactNumberFormatSymbols_tn_BW', 'goog.i18n.CompactNumberFormatSymbols_tn_ZA', 'goog.i18n.CompactNumberFormatSymbols_to', 'goog.i18n.CompactNumberFormatSymbols_to_TO', 'goog.i18n.CompactNumberFormatSymbols_tr_CY', 'goog.i18n.CompactNumberFormatSymbols_ts', 'goog.i18n.CompactNumberFormatSymbols_ts_ZA', 'goog.i18n.CompactNumberFormatSymbols_twq', 'goog.i18n.CompactNumberFormatSymbols_twq_NE', 'goog.i18n.CompactNumberFormatSymbols_tzm', 'goog.i18n.CompactNumberFormatSymbols_tzm_Latn', 'goog.i18n.CompactNumberFormatSymbols_tzm_Latn_MA', 'goog.i18n.CompactNumberFormatSymbols_ug', 'goog.i18n.CompactNumberFormatSymbols_ug_Arab', 'goog.i18n.CompactNumberFormatSymbols_ug_Arab_CN', 'goog.i18n.CompactNumberFormatSymbols_ur_IN', 'goog.i18n.CompactNumberFormatSymbols_uz_Arab', 'goog.i18n.CompactNumberFormatSymbols_uz_Arab_AF', 'goog.i18n.CompactNumberFormatSymbols_uz_Cyrl', 'goog.i18n.CompactNumberFormatSymbols_uz_Cyrl_UZ', 'goog.i18n.CompactNumberFormatSymbols_uz_Latn', 'goog.i18n.CompactNumberFormatSymbols_vai', 'goog.i18n.CompactNumberFormatSymbols_vai_Latn', 'goog.i18n.CompactNumberFormatSymbols_vai_Latn_LR', 'goog.i18n.CompactNumberFormatSymbols_vai_Vaii', 'goog.i18n.CompactNumberFormatSymbols_vai_Vaii_LR', 'goog.i18n.CompactNumberFormatSymbols_ve', 'goog.i18n.CompactNumberFormatSymbols_ve_ZA', 'goog.i18n.CompactNumberFormatSymbols_vo', 'goog.i18n.CompactNumberFormatSymbols_vo_001', 'goog.i18n.CompactNumberFormatSymbols_vun', 'goog.i18n.CompactNumberFormatSymbols_vun_TZ', 'goog.i18n.CompactNumberFormatSymbols_wae', 'goog.i18n.CompactNumberFormatSymbols_wae_CH', 'goog.i18n.CompactNumberFormatSymbols_wal', 'goog.i18n.CompactNumberFormatSymbols_wal_ET', 'goog.i18n.CompactNumberFormatSymbols_xh', 'goog.i18n.CompactNumberFormatSymbols_xh_ZA', 'goog.i18n.CompactNumberFormatSymbols_xog', 'goog.i18n.CompactNumberFormatSymbols_xog_UG', 'goog.i18n.CompactNumberFormatSymbols_yav', 'goog.i18n.CompactNumberFormatSymbols_yav_CM', 'goog.i18n.CompactNumberFormatSymbols_yo', 'goog.i18n.CompactNumberFormatSymbols_yo_BJ', 'goog.i18n.CompactNumberFormatSymbols_yo_NG', 'goog.i18n.CompactNumberFormatSymbols_zgh', 'goog.i18n.CompactNumberFormatSymbols_zgh_MA', 'goog.i18n.CompactNumberFormatSymbols_zh_Hans', 'goog.i18n.CompactNumberFormatSymbols_zh_Hans_HK', 'goog.i18n.CompactNumberFormatSymbols_zh_Hans_MO', 'goog.i18n.CompactNumberFormatSymbols_zh_Hans_SG', 'goog.i18n.CompactNumberFormatSymbols_zh_Hant', 'goog.i18n.CompactNumberFormatSymbols_zh_Hant_HK', 'goog.i18n.CompactNumberFormatSymbols_zh_Hant_MO', 'goog.i18n.CompactNumberFormatSymbols_zh_Hant_TW'], []);
goog.addDependency('i18n/currency.js', ['goog.i18n.currency', 'goog.i18n.currency.CurrencyInfo', 'goog.i18n.currency.CurrencyInfoTier2'], []);
goog.addDependency('i18n/currency_test.js', ['goog.i18n.currencyTest'], ['goog.i18n.NumberFormat', 'goog.i18n.currency', 'goog.i18n.currency.CurrencyInfo', 'goog.object', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit']);
goog.addDependency('i18n/currencycodemap.js', ['goog.i18n.currencyCodeMap', 'goog.i18n.currencyCodeMapTier2'], []);
goog.addDependency('i18n/datetimeformat.js', ['goog.i18n.DateTimeFormat', 'goog.i18n.DateTimeFormat.Format'], ['goog.asserts', 'goog.date', 'goog.i18n.DateTimeSymbols', 'goog.i18n.TimeZone', 'goog.string']);
goog.addDependency('i18n/datetimeformat_test.js', ['goog.i18n.DateTimeFormatTest'], ['goog.date.Date', 'goog.date.DateTime', 'goog.i18n.DateTimeFormat', 'goog.i18n.DateTimePatterns', 'goog.i18n.DateTimePatterns_de', 'goog.i18n.DateTimePatterns_en', 'goog.i18n.DateTimePatterns_fa', 'goog.i18n.DateTimePatterns_fr', 'goog.i18n.DateTimePatterns_ja', 'goog.i18n.DateTimePatterns_sv', 'goog.i18n.DateTimeSymbols', 'goog.i18n.DateTimeSymbols_ar_AE', 'goog.i18n.DateTimeSymbols_ar_SA', 'goog.i18n.DateTimeSymbols_bn_BD', 'goog.i18n.DateTimeSymbols_de', 'goog.i18n.DateTimeSymbols_en', 'goog.i18n.DateTimeSymbols_en_GB', 'goog.i18n.DateTimeSymbols_en_IE', 'goog.i18n.DateTimeSymbols_en_IN', 'goog.i18n.DateTimeSymbols_en_US', 'goog.i18n.DateTimeSymbols_fa', 'goog.i18n.DateTimeSymbols_fr', 'goog.i18n.DateTimeSymbols_fr_DJ', 'goog.i18n.DateTimeSymbols_he_IL', 'goog.i18n.DateTimeSymbols_ja', 'goog.i18n.DateTimeSymbols_ro_RO', 'goog.i18n.DateTimeSymbols_sv', 'goog.i18n.TimeZone', 'goog.testing.jsunit']);
goog.addDependency('i18n/datetimeparse.js', ['goog.i18n.DateTimeParse'], ['goog.date', 'goog.i18n.DateTimeFormat', 'goog.i18n.DateTimeSymbols']);
goog.addDependency('i18n/datetimeparse_test.js', ['goog.i18n.DateTimeParseTest'], ['goog.date.Date', 'goog.i18n.DateTimeFormat', 'goog.i18n.DateTimeParse', 'goog.i18n.DateTimeSymbols', 'goog.i18n.DateTimeSymbols_en', 'goog.i18n.DateTimeSymbols_fa', 'goog.i18n.DateTimeSymbols_fr', 'goog.i18n.DateTimeSymbols_pl', 'goog.i18n.DateTimeSymbols_zh', 'goog.testing.ExpectedFailures', 'goog.testing.jsunit', 'goog.userAgent']);
goog.addDependency('i18n/datetimepatterns.js', ['goog.i18n.DateTimePatterns', 'goog.i18n.DateTimePatterns_af', 'goog.i18n.DateTimePatterns_am', 'goog.i18n.DateTimePatterns_ar', 'goog.i18n.DateTimePatterns_az', 'goog.i18n.DateTimePatterns_bg', 'goog.i18n.DateTimePatterns_bn', 'goog.i18n.DateTimePatterns_br', 'goog.i18n.DateTimePatterns_ca', 'goog.i18n.DateTimePatterns_chr', 'goog.i18n.DateTimePatterns_cs', 'goog.i18n.DateTimePatterns_cy', 'goog.i18n.DateTimePatterns_da', 'goog.i18n.DateTimePatterns_de', 'goog.i18n.DateTimePatterns_de_AT', 'goog.i18n.DateTimePatterns_de_CH', 'goog.i18n.DateTimePatterns_el', 'goog.i18n.DateTimePatterns_en', 'goog.i18n.DateTimePatterns_en_AU', 'goog.i18n.DateTimePatterns_en_GB', 'goog.i18n.DateTimePatterns_en_IE', 'goog.i18n.DateTimePatterns_en_IN', 'goog.i18n.DateTimePatterns_en_SG', 'goog.i18n.DateTimePatterns_en_US', 'goog.i18n.DateTimePatterns_en_ZA', 'goog.i18n.DateTimePatterns_es', 'goog.i18n.DateTimePatterns_es_419', 'goog.i18n.DateTimePatterns_es_ES', 'goog.i18n.DateTimePatterns_et', 'goog.i18n.DateTimePatterns_eu', 'goog.i18n.DateTimePatterns_fa', 'goog.i18n.DateTimePatterns_fi', 'goog.i18n.DateTimePatterns_fil', 'goog.i18n.DateTimePatterns_fr', 'goog.i18n.DateTimePatterns_fr_CA', 'goog.i18n.DateTimePatterns_gl', 'goog.i18n.DateTimePatterns_gsw', 'goog.i18n.DateTimePatterns_gu', 'goog.i18n.DateTimePatterns_haw', 'goog.i18n.DateTimePatterns_he', 'goog.i18n.DateTimePatterns_hi', 'goog.i18n.DateTimePatterns_hr', 'goog.i18n.DateTimePatterns_hu', 'goog.i18n.DateTimePatterns_hy', 'goog.i18n.DateTimePatterns_id', 'goog.i18n.DateTimePatterns_in', 'goog.i18n.DateTimePatterns_is', 'goog.i18n.DateTimePatterns_it', 'goog.i18n.DateTimePatterns_iw', 'goog.i18n.DateTimePatterns_ja', 'goog.i18n.DateTimePatterns_ka', 'goog.i18n.DateTimePatterns_kk', 'goog.i18n.DateTimePatterns_km', 'goog.i18n.DateTimePatterns_kn', 'goog.i18n.DateTimePatterns_ko', 'goog.i18n.DateTimePatterns_ky', 'goog.i18n.DateTimePatterns_ln', 'goog.i18n.DateTimePatterns_lo', 'goog.i18n.DateTimePatterns_lt', 'goog.i18n.DateTimePatterns_lv', 'goog.i18n.DateTimePatterns_mk', 'goog.i18n.DateTimePatterns_ml', 'goog.i18n.DateTimePatterns_mn', 'goog.i18n.DateTimePatterns_mo', 'goog.i18n.DateTimePatterns_mr', 'goog.i18n.DateTimePatterns_ms', 'goog.i18n.DateTimePatterns_mt', 'goog.i18n.DateTimePatterns_my', 'goog.i18n.DateTimePatterns_nb', 'goog.i18n.DateTimePatterns_ne', 'goog.i18n.DateTimePatterns_nl', 'goog.i18n.DateTimePatterns_no', 'goog.i18n.DateTimePatterns_no_NO', 'goog.i18n.DateTimePatterns_or', 'goog.i18n.DateTimePatterns_pa', 'goog.i18n.DateTimePatterns_pl', 'goog.i18n.DateTimePatterns_pt', 'goog.i18n.DateTimePatterns_pt_BR', 'goog.i18n.DateTimePatterns_pt_PT', 'goog.i18n.DateTimePatterns_ro', 'goog.i18n.DateTimePatterns_ru', 'goog.i18n.DateTimePatterns_sh', 'goog.i18n.DateTimePatterns_si', 'goog.i18n.DateTimePatterns_sk', 'goog.i18n.DateTimePatterns_sl', 'goog.i18n.DateTimePatterns_sq', 'goog.i18n.DateTimePatterns_sr', 'goog.i18n.DateTimePatterns_sv', 'goog.i18n.DateTimePatterns_sw', 'goog.i18n.DateTimePatterns_ta', 'goog.i18n.DateTimePatterns_te', 'goog.i18n.DateTimePatterns_th', 'goog.i18n.DateTimePatterns_tl', 'goog.i18n.DateTimePatterns_tr', 'goog.i18n.DateTimePatterns_uk', 'goog.i18n.DateTimePatterns_ur', 'goog.i18n.DateTimePatterns_uz', 'goog.i18n.DateTimePatterns_vi', 'goog.i18n.DateTimePatterns_zh', 'goog.i18n.DateTimePatterns_zh_CN', 'goog.i18n.DateTimePatterns_zh_HK', 'goog.i18n.DateTimePatterns_zh_TW', 'goog.i18n.DateTimePatterns_zu'], []);
goog.addDependency('i18n/datetimepatternsext.js', ['goog.i18n.DateTimePatternsExt', 'goog.i18n.DateTimePatterns_af_NA', 'goog.i18n.DateTimePatterns_af_ZA', 'goog.i18n.DateTimePatterns_agq', 'goog.i18n.DateTimePatterns_agq_CM', 'goog.i18n.DateTimePatterns_ak', 'goog.i18n.DateTimePatterns_ak_GH', 'goog.i18n.DateTimePatterns_am_ET', 'goog.i18n.DateTimePatterns_ar_001', 'goog.i18n.DateTimePatterns_ar_AE', 'goog.i18n.DateTimePatterns_ar_BH', 'goog.i18n.DateTimePatterns_ar_DJ', 'goog.i18n.DateTimePatterns_ar_DZ', 'goog.i18n.DateTimePatterns_ar_EG', 'goog.i18n.DateTimePatterns_ar_EH', 'goog.i18n.DateTimePatterns_ar_ER', 'goog.i18n.DateTimePatterns_ar_IL', 'goog.i18n.DateTimePatterns_ar_IQ', 'goog.i18n.DateTimePatterns_ar_JO', 'goog.i18n.DateTimePatterns_ar_KM', 'goog.i18n.DateTimePatterns_ar_KW', 'goog.i18n.DateTimePatterns_ar_LB', 'goog.i18n.DateTimePatterns_ar_LY', 'goog.i18n.DateTimePatterns_ar_MA', 'goog.i18n.DateTimePatterns_ar_MR', 'goog.i18n.DateTimePatterns_ar_OM', 'goog.i18n.DateTimePatterns_ar_PS', 'goog.i18n.DateTimePatterns_ar_QA', 'goog.i18n.DateTimePatterns_ar_SA', 'goog.i18n.DateTimePatterns_ar_SD', 'goog.i18n.DateTimePatterns_ar_SO', 'goog.i18n.DateTimePatterns_ar_SS', 'goog.i18n.DateTimePatterns_ar_SY', 'goog.i18n.DateTimePatterns_ar_TD', 'goog.i18n.DateTimePatterns_ar_TN', 'goog.i18n.DateTimePatterns_ar_YE', 'goog.i18n.DateTimePatterns_as', 'goog.i18n.DateTimePatterns_as_IN', 'goog.i18n.DateTimePatterns_asa', 'goog.i18n.DateTimePatterns_asa_TZ', 'goog.i18n.DateTimePatterns_az_Cyrl', 'goog.i18n.DateTimePatterns_az_Cyrl_AZ', 'goog.i18n.DateTimePatterns_az_Latn', 'goog.i18n.DateTimePatterns_az_Latn_AZ', 'goog.i18n.DateTimePatterns_bas', 'goog.i18n.DateTimePatterns_bas_CM', 'goog.i18n.DateTimePatterns_be', 'goog.i18n.DateTimePatterns_be_BY', 'goog.i18n.DateTimePatterns_bem', 'goog.i18n.DateTimePatterns_bem_ZM', 'goog.i18n.DateTimePatterns_bez', 'goog.i18n.DateTimePatterns_bez_TZ', 'goog.i18n.DateTimePatterns_bg_BG', 'goog.i18n.DateTimePatterns_bm', 'goog.i18n.DateTimePatterns_bm_ML', 'goog.i18n.DateTimePatterns_bn_BD', 'goog.i18n.DateTimePatterns_bn_IN', 'goog.i18n.DateTimePatterns_bo', 'goog.i18n.DateTimePatterns_bo_CN', 'goog.i18n.DateTimePatterns_bo_IN', 'goog.i18n.DateTimePatterns_br_FR', 'goog.i18n.DateTimePatterns_brx', 'goog.i18n.DateTimePatterns_brx_IN', 'goog.i18n.DateTimePatterns_bs', 'goog.i18n.DateTimePatterns_bs_Cyrl', 'goog.i18n.DateTimePatterns_bs_Cyrl_BA', 'goog.i18n.DateTimePatterns_bs_Latn', 'goog.i18n.DateTimePatterns_bs_Latn_BA', 'goog.i18n.DateTimePatterns_ca_AD', 'goog.i18n.DateTimePatterns_ca_ES', 'goog.i18n.DateTimePatterns_ca_FR', 'goog.i18n.DateTimePatterns_ca_IT', 'goog.i18n.DateTimePatterns_cgg', 'goog.i18n.DateTimePatterns_cgg_UG', 'goog.i18n.DateTimePatterns_chr_US', 'goog.i18n.DateTimePatterns_cs_CZ', 'goog.i18n.DateTimePatterns_cy_GB', 'goog.i18n.DateTimePatterns_da_DK', 'goog.i18n.DateTimePatterns_da_GL', 'goog.i18n.DateTimePatterns_dav', 'goog.i18n.DateTimePatterns_dav_KE', 'goog.i18n.DateTimePatterns_de_BE', 'goog.i18n.DateTimePatterns_de_DE', 'goog.i18n.DateTimePatterns_de_LI', 'goog.i18n.DateTimePatterns_de_LU', 'goog.i18n.DateTimePatterns_dje', 'goog.i18n.DateTimePatterns_dje_NE', 'goog.i18n.DateTimePatterns_dua', 'goog.i18n.DateTimePatterns_dua_CM', 'goog.i18n.DateTimePatterns_dyo', 'goog.i18n.DateTimePatterns_dyo_SN', 'goog.i18n.DateTimePatterns_dz', 'goog.i18n.DateTimePatterns_dz_BT', 'goog.i18n.DateTimePatterns_ebu', 'goog.i18n.DateTimePatterns_ebu_KE', 'goog.i18n.DateTimePatterns_ee', 'goog.i18n.DateTimePatterns_ee_GH', 'goog.i18n.DateTimePatterns_ee_TG', 'goog.i18n.DateTimePatterns_el_CY', 'goog.i18n.DateTimePatterns_el_GR', 'goog.i18n.DateTimePatterns_en_001', 'goog.i18n.DateTimePatterns_en_150', 'goog.i18n.DateTimePatterns_en_AG', 'goog.i18n.DateTimePatterns_en_AI', 'goog.i18n.DateTimePatterns_en_AS', 'goog.i18n.DateTimePatterns_en_BB', 'goog.i18n.DateTimePatterns_en_BE', 'goog.i18n.DateTimePatterns_en_BM', 'goog.i18n.DateTimePatterns_en_BS', 'goog.i18n.DateTimePatterns_en_BW', 'goog.i18n.DateTimePatterns_en_BZ', 'goog.i18n.DateTimePatterns_en_CA', 'goog.i18n.DateTimePatterns_en_CC', 'goog.i18n.DateTimePatterns_en_CK', 'goog.i18n.DateTimePatterns_en_CM', 'goog.i18n.DateTimePatterns_en_CX', 'goog.i18n.DateTimePatterns_en_DG', 'goog.i18n.DateTimePatterns_en_DM', 'goog.i18n.DateTimePatterns_en_ER', 'goog.i18n.DateTimePatterns_en_FJ', 'goog.i18n.DateTimePatterns_en_FK', 'goog.i18n.DateTimePatterns_en_FM', 'goog.i18n.DateTimePatterns_en_GD', 'goog.i18n.DateTimePatterns_en_GG', 'goog.i18n.DateTimePatterns_en_GH', 'goog.i18n.DateTimePatterns_en_GI', 'goog.i18n.DateTimePatterns_en_GM', 'goog.i18n.DateTimePatterns_en_GU', 'goog.i18n.DateTimePatterns_en_GY', 'goog.i18n.DateTimePatterns_en_HK', 'goog.i18n.DateTimePatterns_en_IM', 'goog.i18n.DateTimePatterns_en_IO', 'goog.i18n.DateTimePatterns_en_JE', 'goog.i18n.DateTimePatterns_en_JM', 'goog.i18n.DateTimePatterns_en_KE', 'goog.i18n.DateTimePatterns_en_KI', 'goog.i18n.DateTimePatterns_en_KN', 'goog.i18n.DateTimePatterns_en_KY', 'goog.i18n.DateTimePatterns_en_LC', 'goog.i18n.DateTimePatterns_en_LR', 'goog.i18n.DateTimePatterns_en_LS', 'goog.i18n.DateTimePatterns_en_MG', 'goog.i18n.DateTimePatterns_en_MH', 'goog.i18n.DateTimePatterns_en_MO', 'goog.i18n.DateTimePatterns_en_MP', 'goog.i18n.DateTimePatterns_en_MS', 'goog.i18n.DateTimePatterns_en_MT', 'goog.i18n.DateTimePatterns_en_MU', 'goog.i18n.DateTimePatterns_en_MW', 'goog.i18n.DateTimePatterns_en_NA', 'goog.i18n.DateTimePatterns_en_NF', 'goog.i18n.DateTimePatterns_en_NG', 'goog.i18n.DateTimePatterns_en_NR', 'goog.i18n.DateTimePatterns_en_NU', 'goog.i18n.DateTimePatterns_en_NZ', 'goog.i18n.DateTimePatterns_en_PG', 'goog.i18n.DateTimePatterns_en_PH', 'goog.i18n.DateTimePatterns_en_PK', 'goog.i18n.DateTimePatterns_en_PN', 'goog.i18n.DateTimePatterns_en_PR', 'goog.i18n.DateTimePatterns_en_PW', 'goog.i18n.DateTimePatterns_en_RW', 'goog.i18n.DateTimePatterns_en_SB', 'goog.i18n.DateTimePatterns_en_SC', 'goog.i18n.DateTimePatterns_en_SD', 'goog.i18n.DateTimePatterns_en_SH', 'goog.i18n.DateTimePatterns_en_SL', 'goog.i18n.DateTimePatterns_en_SS', 'goog.i18n.DateTimePatterns_en_SX', 'goog.i18n.DateTimePatterns_en_SZ', 'goog.i18n.DateTimePatterns_en_TC', 'goog.i18n.DateTimePatterns_en_TK', 'goog.i18n.DateTimePatterns_en_TO', 'goog.i18n.DateTimePatterns_en_TT', 'goog.i18n.DateTimePatterns_en_TV', 'goog.i18n.DateTimePatterns_en_TZ', 'goog.i18n.DateTimePatterns_en_UG', 'goog.i18n.DateTimePatterns_en_UM', 'goog.i18n.DateTimePatterns_en_US_POSIX', 'goog.i18n.DateTimePatterns_en_VC', 'goog.i18n.DateTimePatterns_en_VG', 'goog.i18n.DateTimePatterns_en_VI', 'goog.i18n.DateTimePatterns_en_VU', 'goog.i18n.DateTimePatterns_en_WS', 'goog.i18n.DateTimePatterns_en_ZM', 'goog.i18n.DateTimePatterns_en_ZW', 'goog.i18n.DateTimePatterns_eo', 'goog.i18n.DateTimePatterns_es_AR', 'goog.i18n.DateTimePatterns_es_BO', 'goog.i18n.DateTimePatterns_es_CL', 'goog.i18n.DateTimePatterns_es_CO', 'goog.i18n.DateTimePatterns_es_CR', 'goog.i18n.DateTimePatterns_es_CU', 'goog.i18n.DateTimePatterns_es_DO', 'goog.i18n.DateTimePatterns_es_EA', 'goog.i18n.DateTimePatterns_es_EC', 'goog.i18n.DateTimePatterns_es_GQ', 'goog.i18n.DateTimePatterns_es_GT', 'goog.i18n.DateTimePatterns_es_HN', 'goog.i18n.DateTimePatterns_es_IC', 'goog.i18n.DateTimePatterns_es_MX', 'goog.i18n.DateTimePatterns_es_NI', 'goog.i18n.DateTimePatterns_es_PA', 'goog.i18n.DateTimePatterns_es_PE', 'goog.i18n.DateTimePatterns_es_PH', 'goog.i18n.DateTimePatterns_es_PR', 'goog.i18n.DateTimePatterns_es_PY', 'goog.i18n.DateTimePatterns_es_SV', 'goog.i18n.DateTimePatterns_es_US', 'goog.i18n.DateTimePatterns_es_UY', 'goog.i18n.DateTimePatterns_es_VE', 'goog.i18n.DateTimePatterns_et_EE', 'goog.i18n.DateTimePatterns_eu_ES', 'goog.i18n.DateTimePatterns_ewo', 'goog.i18n.DateTimePatterns_ewo_CM', 'goog.i18n.DateTimePatterns_fa_AF', 'goog.i18n.DateTimePatterns_fa_IR', 'goog.i18n.DateTimePatterns_ff', 'goog.i18n.DateTimePatterns_ff_SN', 'goog.i18n.DateTimePatterns_fi_FI', 'goog.i18n.DateTimePatterns_fil_PH', 'goog.i18n.DateTimePatterns_fo', 'goog.i18n.DateTimePatterns_fo_FO', 'goog.i18n.DateTimePatterns_fr_BE', 'goog.i18n.DateTimePatterns_fr_BF', 'goog.i18n.DateTimePatterns_fr_BI', 'goog.i18n.DateTimePatterns_fr_BJ', 'goog.i18n.DateTimePatterns_fr_BL', 'goog.i18n.DateTimePatterns_fr_CD', 'goog.i18n.DateTimePatterns_fr_CF', 'goog.i18n.DateTimePatterns_fr_CG', 'goog.i18n.DateTimePatterns_fr_CH', 'goog.i18n.DateTimePatterns_fr_CI', 'goog.i18n.DateTimePatterns_fr_CM', 'goog.i18n.DateTimePatterns_fr_DJ', 'goog.i18n.DateTimePatterns_fr_DZ', 'goog.i18n.DateTimePatterns_fr_FR', 'goog.i18n.DateTimePatterns_fr_GA', 'goog.i18n.DateTimePatterns_fr_GF', 'goog.i18n.DateTimePatterns_fr_GN', 'goog.i18n.DateTimePatterns_fr_GP', 'goog.i18n.DateTimePatterns_fr_GQ', 'goog.i18n.DateTimePatterns_fr_HT', 'goog.i18n.DateTimePatterns_fr_KM', 'goog.i18n.DateTimePatterns_fr_LU', 'goog.i18n.DateTimePatterns_fr_MA', 'goog.i18n.DateTimePatterns_fr_MC', 'goog.i18n.DateTimePatterns_fr_MF', 'goog.i18n.DateTimePatterns_fr_MG', 'goog.i18n.DateTimePatterns_fr_ML', 'goog.i18n.DateTimePatterns_fr_MQ', 'goog.i18n.DateTimePatterns_fr_MR', 'goog.i18n.DateTimePatterns_fr_MU', 'goog.i18n.DateTimePatterns_fr_NC', 'goog.i18n.DateTimePatterns_fr_NE', 'goog.i18n.DateTimePatterns_fr_PF', 'goog.i18n.DateTimePatterns_fr_PM', 'goog.i18n.DateTimePatterns_fr_RE', 'goog.i18n.DateTimePatterns_fr_RW', 'goog.i18n.DateTimePatterns_fr_SC', 'goog.i18n.DateTimePatterns_fr_SN', 'goog.i18n.DateTimePatterns_fr_SY', 'goog.i18n.DateTimePatterns_fr_TD', 'goog.i18n.DateTimePatterns_fr_TG', 'goog.i18n.DateTimePatterns_fr_TN', 'goog.i18n.DateTimePatterns_fr_VU', 'goog.i18n.DateTimePatterns_fr_WF', 'goog.i18n.DateTimePatterns_fr_YT', 'goog.i18n.DateTimePatterns_ga', 'goog.i18n.DateTimePatterns_ga_IE', 'goog.i18n.DateTimePatterns_gl_ES', 'goog.i18n.DateTimePatterns_gsw_CH', 'goog.i18n.DateTimePatterns_gsw_LI', 'goog.i18n.DateTimePatterns_gu_IN', 'goog.i18n.DateTimePatterns_guz', 'goog.i18n.DateTimePatterns_guz_KE', 'goog.i18n.DateTimePatterns_gv', 'goog.i18n.DateTimePatterns_gv_IM', 'goog.i18n.DateTimePatterns_ha', 'goog.i18n.DateTimePatterns_ha_Latn', 'goog.i18n.DateTimePatterns_ha_Latn_GH', 'goog.i18n.DateTimePatterns_ha_Latn_NE', 'goog.i18n.DateTimePatterns_ha_Latn_NG', 'goog.i18n.DateTimePatterns_haw_US', 'goog.i18n.DateTimePatterns_he_IL', 'goog.i18n.DateTimePatterns_hi_IN', 'goog.i18n.DateTimePatterns_hr_BA', 'goog.i18n.DateTimePatterns_hr_HR', 'goog.i18n.DateTimePatterns_hu_HU', 'goog.i18n.DateTimePatterns_hy_AM', 'goog.i18n.DateTimePatterns_id_ID', 'goog.i18n.DateTimePatterns_ig', 'goog.i18n.DateTimePatterns_ig_NG', 'goog.i18n.DateTimePatterns_ii', 'goog.i18n.DateTimePatterns_ii_CN', 'goog.i18n.DateTimePatterns_is_IS', 'goog.i18n.DateTimePatterns_it_CH', 'goog.i18n.DateTimePatterns_it_IT', 'goog.i18n.DateTimePatterns_it_SM', 'goog.i18n.DateTimePatterns_ja_JP', 'goog.i18n.DateTimePatterns_jgo', 'goog.i18n.DateTimePatterns_jgo_CM', 'goog.i18n.DateTimePatterns_jmc', 'goog.i18n.DateTimePatterns_jmc_TZ', 'goog.i18n.DateTimePatterns_ka_GE', 'goog.i18n.DateTimePatterns_kab', 'goog.i18n.DateTimePatterns_kab_DZ', 'goog.i18n.DateTimePatterns_kam', 'goog.i18n.DateTimePatterns_kam_KE', 'goog.i18n.DateTimePatterns_kde', 'goog.i18n.DateTimePatterns_kde_TZ', 'goog.i18n.DateTimePatterns_kea', 'goog.i18n.DateTimePatterns_kea_CV', 'goog.i18n.DateTimePatterns_khq', 'goog.i18n.DateTimePatterns_khq_ML', 'goog.i18n.DateTimePatterns_ki', 'goog.i18n.DateTimePatterns_ki_KE', 'goog.i18n.DateTimePatterns_kk_Cyrl', 'goog.i18n.DateTimePatterns_kk_Cyrl_KZ', 'goog.i18n.DateTimePatterns_kkj', 'goog.i18n.DateTimePatterns_kkj_CM', 'goog.i18n.DateTimePatterns_kl', 'goog.i18n.DateTimePatterns_kl_GL', 'goog.i18n.DateTimePatterns_kln', 'goog.i18n.DateTimePatterns_kln_KE', 'goog.i18n.DateTimePatterns_km_KH', 'goog.i18n.DateTimePatterns_kn_IN', 'goog.i18n.DateTimePatterns_ko_KP', 'goog.i18n.DateTimePatterns_ko_KR', 'goog.i18n.DateTimePatterns_kok', 'goog.i18n.DateTimePatterns_kok_IN', 'goog.i18n.DateTimePatterns_ks', 'goog.i18n.DateTimePatterns_ks_Arab', 'goog.i18n.DateTimePatterns_ks_Arab_IN', 'goog.i18n.DateTimePatterns_ksb', 'goog.i18n.DateTimePatterns_ksb_TZ', 'goog.i18n.DateTimePatterns_ksf', 'goog.i18n.DateTimePatterns_ksf_CM', 'goog.i18n.DateTimePatterns_kw', 'goog.i18n.DateTimePatterns_kw_GB', 'goog.i18n.DateTimePatterns_ky_Cyrl', 'goog.i18n.DateTimePatterns_ky_Cyrl_KG', 'goog.i18n.DateTimePatterns_lag', 'goog.i18n.DateTimePatterns_lag_TZ', 'goog.i18n.DateTimePatterns_lg', 'goog.i18n.DateTimePatterns_lg_UG', 'goog.i18n.DateTimePatterns_lkt', 'goog.i18n.DateTimePatterns_lkt_US', 'goog.i18n.DateTimePatterns_ln_AO', 'goog.i18n.DateTimePatterns_ln_CD', 'goog.i18n.DateTimePatterns_ln_CF', 'goog.i18n.DateTimePatterns_ln_CG', 'goog.i18n.DateTimePatterns_lo_LA', 'goog.i18n.DateTimePatterns_lt_LT', 'goog.i18n.DateTimePatterns_lu', 'goog.i18n.DateTimePatterns_lu_CD', 'goog.i18n.DateTimePatterns_luo', 'goog.i18n.DateTimePatterns_luo_KE', 'goog.i18n.DateTimePatterns_luy', 'goog.i18n.DateTimePatterns_luy_KE', 'goog.i18n.DateTimePatterns_lv_LV', 'goog.i18n.DateTimePatterns_mas', 'goog.i18n.DateTimePatterns_mas_KE', 'goog.i18n.DateTimePatterns_mas_TZ', 'goog.i18n.DateTimePatterns_mer', 'goog.i18n.DateTimePatterns_mer_KE', 'goog.i18n.DateTimePatterns_mfe', 'goog.i18n.DateTimePatterns_mfe_MU', 'goog.i18n.DateTimePatterns_mg', 'goog.i18n.DateTimePatterns_mg_MG', 'goog.i18n.DateTimePatterns_mgh', 'goog.i18n.DateTimePatterns_mgh_MZ', 'goog.i18n.DateTimePatterns_mgo', 'goog.i18n.DateTimePatterns_mgo_CM', 'goog.i18n.DateTimePatterns_mk_MK', 'goog.i18n.DateTimePatterns_ml_IN', 'goog.i18n.DateTimePatterns_mn_Cyrl', 'goog.i18n.DateTimePatterns_mn_Cyrl_MN', 'goog.i18n.DateTimePatterns_mr_IN', 'goog.i18n.DateTimePatterns_ms_Latn', 'goog.i18n.DateTimePatterns_ms_Latn_BN', 'goog.i18n.DateTimePatterns_ms_Latn_MY', 'goog.i18n.DateTimePatterns_ms_Latn_SG', 'goog.i18n.DateTimePatterns_mt_MT', 'goog.i18n.DateTimePatterns_mua', 'goog.i18n.DateTimePatterns_mua_CM', 'goog.i18n.DateTimePatterns_my_MM', 'goog.i18n.DateTimePatterns_naq', 'goog.i18n.DateTimePatterns_naq_NA', 'goog.i18n.DateTimePatterns_nb_NO', 'goog.i18n.DateTimePatterns_nb_SJ', 'goog.i18n.DateTimePatterns_nd', 'goog.i18n.DateTimePatterns_nd_ZW', 'goog.i18n.DateTimePatterns_ne_IN', 'goog.i18n.DateTimePatterns_ne_NP', 'goog.i18n.DateTimePatterns_nl_AW', 'goog.i18n.DateTimePatterns_nl_BE', 'goog.i18n.DateTimePatterns_nl_BQ', 'goog.i18n.DateTimePatterns_nl_CW', 'goog.i18n.DateTimePatterns_nl_NL', 'goog.i18n.DateTimePatterns_nl_SR', 'goog.i18n.DateTimePatterns_nl_SX', 'goog.i18n.DateTimePatterns_nmg', 'goog.i18n.DateTimePatterns_nmg_CM', 'goog.i18n.DateTimePatterns_nn', 'goog.i18n.DateTimePatterns_nn_NO', 'goog.i18n.DateTimePatterns_nnh', 'goog.i18n.DateTimePatterns_nnh_CM', 'goog.i18n.DateTimePatterns_nus', 'goog.i18n.DateTimePatterns_nus_SD', 'goog.i18n.DateTimePatterns_nyn', 'goog.i18n.DateTimePatterns_nyn_UG', 'goog.i18n.DateTimePatterns_om', 'goog.i18n.DateTimePatterns_om_ET', 'goog.i18n.DateTimePatterns_om_KE', 'goog.i18n.DateTimePatterns_or_IN', 'goog.i18n.DateTimePatterns_pa_Arab', 'goog.i18n.DateTimePatterns_pa_Arab_PK', 'goog.i18n.DateTimePatterns_pa_Guru', 'goog.i18n.DateTimePatterns_pa_Guru_IN', 'goog.i18n.DateTimePatterns_pl_PL', 'goog.i18n.DateTimePatterns_ps', 'goog.i18n.DateTimePatterns_ps_AF', 'goog.i18n.DateTimePatterns_pt_AO', 'goog.i18n.DateTimePatterns_pt_CV', 'goog.i18n.DateTimePatterns_pt_GW', 'goog.i18n.DateTimePatterns_pt_MO', 'goog.i18n.DateTimePatterns_pt_MZ', 'goog.i18n.DateTimePatterns_pt_ST', 'goog.i18n.DateTimePatterns_pt_TL', 'goog.i18n.DateTimePatterns_rm', 'goog.i18n.DateTimePatterns_rm_CH', 'goog.i18n.DateTimePatterns_rn', 'goog.i18n.DateTimePatterns_rn_BI', 'goog.i18n.DateTimePatterns_ro_MD', 'goog.i18n.DateTimePatterns_ro_RO', 'goog.i18n.DateTimePatterns_rof', 'goog.i18n.DateTimePatterns_rof_TZ', 'goog.i18n.DateTimePatterns_ru_BY', 'goog.i18n.DateTimePatterns_ru_KG', 'goog.i18n.DateTimePatterns_ru_KZ', 'goog.i18n.DateTimePatterns_ru_MD', 'goog.i18n.DateTimePatterns_ru_RU', 'goog.i18n.DateTimePatterns_ru_UA', 'goog.i18n.DateTimePatterns_rw', 'goog.i18n.DateTimePatterns_rw_RW', 'goog.i18n.DateTimePatterns_rwk', 'goog.i18n.DateTimePatterns_rwk_TZ', 'goog.i18n.DateTimePatterns_saq', 'goog.i18n.DateTimePatterns_saq_KE', 'goog.i18n.DateTimePatterns_sbp', 'goog.i18n.DateTimePatterns_sbp_TZ', 'goog.i18n.DateTimePatterns_seh', 'goog.i18n.DateTimePatterns_seh_MZ', 'goog.i18n.DateTimePatterns_ses', 'goog.i18n.DateTimePatterns_ses_ML', 'goog.i18n.DateTimePatterns_sg', 'goog.i18n.DateTimePatterns_sg_CF', 'goog.i18n.DateTimePatterns_shi', 'goog.i18n.DateTimePatterns_shi_Latn', 'goog.i18n.DateTimePatterns_shi_Latn_MA', 'goog.i18n.DateTimePatterns_shi_Tfng', 'goog.i18n.DateTimePatterns_shi_Tfng_MA', 'goog.i18n.DateTimePatterns_si_LK', 'goog.i18n.DateTimePatterns_sk_SK', 'goog.i18n.DateTimePatterns_sl_SI', 'goog.i18n.DateTimePatterns_sn', 'goog.i18n.DateTimePatterns_sn_ZW', 'goog.i18n.DateTimePatterns_so', 'goog.i18n.DateTimePatterns_so_DJ', 'goog.i18n.DateTimePatterns_so_ET', 'goog.i18n.DateTimePatterns_so_KE', 'goog.i18n.DateTimePatterns_so_SO', 'goog.i18n.DateTimePatterns_sq_AL', 'goog.i18n.DateTimePatterns_sq_MK', 'goog.i18n.DateTimePatterns_sq_XK', 'goog.i18n.DateTimePatterns_sr_Cyrl', 'goog.i18n.DateTimePatterns_sr_Cyrl_BA', 'goog.i18n.DateTimePatterns_sr_Cyrl_ME', 'goog.i18n.DateTimePatterns_sr_Cyrl_RS', 'goog.i18n.DateTimePatterns_sr_Cyrl_XK', 'goog.i18n.DateTimePatterns_sr_Latn', 'goog.i18n.DateTimePatterns_sr_Latn_BA', 'goog.i18n.DateTimePatterns_sr_Latn_ME', 'goog.i18n.DateTimePatterns_sr_Latn_RS', 'goog.i18n.DateTimePatterns_sr_Latn_XK', 'goog.i18n.DateTimePatterns_sv_AX', 'goog.i18n.DateTimePatterns_sv_FI', 'goog.i18n.DateTimePatterns_sv_SE', 'goog.i18n.DateTimePatterns_sw_KE', 'goog.i18n.DateTimePatterns_sw_TZ', 'goog.i18n.DateTimePatterns_sw_UG', 'goog.i18n.DateTimePatterns_swc', 'goog.i18n.DateTimePatterns_swc_CD', 'goog.i18n.DateTimePatterns_ta_IN', 'goog.i18n.DateTimePatterns_ta_LK', 'goog.i18n.DateTimePatterns_ta_MY', 'goog.i18n.DateTimePatterns_ta_SG', 'goog.i18n.DateTimePatterns_te_IN', 'goog.i18n.DateTimePatterns_teo', 'goog.i18n.DateTimePatterns_teo_KE', 'goog.i18n.DateTimePatterns_teo_UG', 'goog.i18n.DateTimePatterns_th_TH', 'goog.i18n.DateTimePatterns_ti', 'goog.i18n.DateTimePatterns_ti_ER', 'goog.i18n.DateTimePatterns_ti_ET', 'goog.i18n.DateTimePatterns_to', 'goog.i18n.DateTimePatterns_to_TO', 'goog.i18n.DateTimePatterns_tr_CY', 'goog.i18n.DateTimePatterns_tr_TR', 'goog.i18n.DateTimePatterns_twq', 'goog.i18n.DateTimePatterns_twq_NE', 'goog.i18n.DateTimePatterns_tzm', 'goog.i18n.DateTimePatterns_tzm_Latn', 'goog.i18n.DateTimePatterns_tzm_Latn_MA', 'goog.i18n.DateTimePatterns_ug', 'goog.i18n.DateTimePatterns_ug_Arab', 'goog.i18n.DateTimePatterns_ug_Arab_CN', 'goog.i18n.DateTimePatterns_uk_UA', 'goog.i18n.DateTimePatterns_ur_IN', 'goog.i18n.DateTimePatterns_ur_PK', 'goog.i18n.DateTimePatterns_uz_Arab', 'goog.i18n.DateTimePatterns_uz_Arab_AF', 'goog.i18n.DateTimePatterns_uz_Cyrl', 'goog.i18n.DateTimePatterns_uz_Cyrl_UZ', 'goog.i18n.DateTimePatterns_uz_Latn', 'goog.i18n.DateTimePatterns_uz_Latn_UZ', 'goog.i18n.DateTimePatterns_vai', 'goog.i18n.DateTimePatterns_vai_Latn', 'goog.i18n.DateTimePatterns_vai_Latn_LR', 'goog.i18n.DateTimePatterns_vai_Vaii', 'goog.i18n.DateTimePatterns_vai_Vaii_LR', 'goog.i18n.DateTimePatterns_vi_VN', 'goog.i18n.DateTimePatterns_vun', 'goog.i18n.DateTimePatterns_vun_TZ', 'goog.i18n.DateTimePatterns_xog', 'goog.i18n.DateTimePatterns_xog_UG', 'goog.i18n.DateTimePatterns_yav', 'goog.i18n.DateTimePatterns_yav_CM', 'goog.i18n.DateTimePatterns_yo', 'goog.i18n.DateTimePatterns_yo_BJ', 'goog.i18n.DateTimePatterns_yo_NG', 'goog.i18n.DateTimePatterns_zgh', 'goog.i18n.DateTimePatterns_zgh_MA', 'goog.i18n.DateTimePatterns_zh_Hans', 'goog.i18n.DateTimePatterns_zh_Hans_CN', 'goog.i18n.DateTimePatterns_zh_Hans_HK', 'goog.i18n.DateTimePatterns_zh_Hans_MO', 'goog.i18n.DateTimePatterns_zh_Hans_SG', 'goog.i18n.DateTimePatterns_zh_Hant', 'goog.i18n.DateTimePatterns_zh_Hant_HK', 'goog.i18n.DateTimePatterns_zh_Hant_MO', 'goog.i18n.DateTimePatterns_zh_Hant_TW', 'goog.i18n.DateTimePatterns_zu_ZA'], ['goog.i18n.DateTimePatterns']);
goog.addDependency('i18n/datetimesymbols.js', ['goog.i18n.DateTimeSymbols', 'goog.i18n.DateTimeSymbols_af', 'goog.i18n.DateTimeSymbols_am', 'goog.i18n.DateTimeSymbols_ar', 'goog.i18n.DateTimeSymbols_az', 'goog.i18n.DateTimeSymbols_bg', 'goog.i18n.DateTimeSymbols_bn', 'goog.i18n.DateTimeSymbols_br', 'goog.i18n.DateTimeSymbols_ca', 'goog.i18n.DateTimeSymbols_chr', 'goog.i18n.DateTimeSymbols_cs', 'goog.i18n.DateTimeSymbols_cy', 'goog.i18n.DateTimeSymbols_da', 'goog.i18n.DateTimeSymbols_de', 'goog.i18n.DateTimeSymbols_de_AT', 'goog.i18n.DateTimeSymbols_de_CH', 'goog.i18n.DateTimeSymbols_el', 'goog.i18n.DateTimeSymbols_en', 'goog.i18n.DateTimeSymbols_en_AU', 'goog.i18n.DateTimeSymbols_en_GB', 'goog.i18n.DateTimeSymbols_en_IE', 'goog.i18n.DateTimeSymbols_en_IN', 'goog.i18n.DateTimeSymbols_en_ISO', 'goog.i18n.DateTimeSymbols_en_SG', 'goog.i18n.DateTimeSymbols_en_US', 'goog.i18n.DateTimeSymbols_en_ZA', 'goog.i18n.DateTimeSymbols_es', 'goog.i18n.DateTimeSymbols_es_419', 'goog.i18n.DateTimeSymbols_es_ES', 'goog.i18n.DateTimeSymbols_et', 'goog.i18n.DateTimeSymbols_eu', 'goog.i18n.DateTimeSymbols_fa', 'goog.i18n.DateTimeSymbols_fi', 'goog.i18n.DateTimeSymbols_fil', 'goog.i18n.DateTimeSymbols_fr', 'goog.i18n.DateTimeSymbols_fr_CA', 'goog.i18n.DateTimeSymbols_gl', 'goog.i18n.DateTimeSymbols_gsw', 'goog.i18n.DateTimeSymbols_gu', 'goog.i18n.DateTimeSymbols_haw', 'goog.i18n.DateTimeSymbols_he', 'goog.i18n.DateTimeSymbols_hi', 'goog.i18n.DateTimeSymbols_hr', 'goog.i18n.DateTimeSymbols_hu', 'goog.i18n.DateTimeSymbols_hy', 'goog.i18n.DateTimeSymbols_id', 'goog.i18n.DateTimeSymbols_in', 'goog.i18n.DateTimeSymbols_is', 'goog.i18n.DateTimeSymbols_it', 'goog.i18n.DateTimeSymbols_iw', 'goog.i18n.DateTimeSymbols_ja', 'goog.i18n.DateTimeSymbols_ka', 'goog.i18n.DateTimeSymbols_kk', 'goog.i18n.DateTimeSymbols_km', 'goog.i18n.DateTimeSymbols_kn', 'goog.i18n.DateTimeSymbols_ko', 'goog.i18n.DateTimeSymbols_ky', 'goog.i18n.DateTimeSymbols_ln', 'goog.i18n.DateTimeSymbols_lo', 'goog.i18n.DateTimeSymbols_lt', 'goog.i18n.DateTimeSymbols_lv', 'goog.i18n.DateTimeSymbols_mk', 'goog.i18n.DateTimeSymbols_ml', 'goog.i18n.DateTimeSymbols_mn', 'goog.i18n.DateTimeSymbols_mr', 'goog.i18n.DateTimeSymbols_ms', 'goog.i18n.DateTimeSymbols_mt', 'goog.i18n.DateTimeSymbols_my', 'goog.i18n.DateTimeSymbols_nb', 'goog.i18n.DateTimeSymbols_ne', 'goog.i18n.DateTimeSymbols_nl', 'goog.i18n.DateTimeSymbols_no', 'goog.i18n.DateTimeSymbols_no_NO', 'goog.i18n.DateTimeSymbols_or', 'goog.i18n.DateTimeSymbols_pa', 'goog.i18n.DateTimeSymbols_pl', 'goog.i18n.DateTimeSymbols_pt', 'goog.i18n.DateTimeSymbols_pt_BR', 'goog.i18n.DateTimeSymbols_pt_PT', 'goog.i18n.DateTimeSymbols_ro', 'goog.i18n.DateTimeSymbols_ru', 'goog.i18n.DateTimeSymbols_si', 'goog.i18n.DateTimeSymbols_sk', 'goog.i18n.DateTimeSymbols_sl', 'goog.i18n.DateTimeSymbols_sq', 'goog.i18n.DateTimeSymbols_sr', 'goog.i18n.DateTimeSymbols_sv', 'goog.i18n.DateTimeSymbols_sw', 'goog.i18n.DateTimeSymbols_ta', 'goog.i18n.DateTimeSymbols_te', 'goog.i18n.DateTimeSymbols_th', 'goog.i18n.DateTimeSymbols_tl', 'goog.i18n.DateTimeSymbols_tr', 'goog.i18n.DateTimeSymbols_uk', 'goog.i18n.DateTimeSymbols_ur', 'goog.i18n.DateTimeSymbols_uz', 'goog.i18n.DateTimeSymbols_vi', 'goog.i18n.DateTimeSymbols_zh', 'goog.i18n.DateTimeSymbols_zh_CN', 'goog.i18n.DateTimeSymbols_zh_HK', 'goog.i18n.DateTimeSymbols_zh_TW', 'goog.i18n.DateTimeSymbols_zu'], []);
goog.addDependency('i18n/datetimesymbolsext.js', ['goog.i18n.DateTimeSymbolsExt', 'goog.i18n.DateTimeSymbols_aa', 'goog.i18n.DateTimeSymbols_aa_DJ', 'goog.i18n.DateTimeSymbols_aa_ER', 'goog.i18n.DateTimeSymbols_aa_ET', 'goog.i18n.DateTimeSymbols_af_NA', 'goog.i18n.DateTimeSymbols_af_ZA', 'goog.i18n.DateTimeSymbols_agq', 'goog.i18n.DateTimeSymbols_agq_CM', 'goog.i18n.DateTimeSymbols_ak', 'goog.i18n.DateTimeSymbols_ak_GH', 'goog.i18n.DateTimeSymbols_am_ET', 'goog.i18n.DateTimeSymbols_ar_001', 'goog.i18n.DateTimeSymbols_ar_AE', 'goog.i18n.DateTimeSymbols_ar_BH', 'goog.i18n.DateTimeSymbols_ar_DJ', 'goog.i18n.DateTimeSymbols_ar_DZ', 'goog.i18n.DateTimeSymbols_ar_EG', 'goog.i18n.DateTimeSymbols_ar_EH', 'goog.i18n.DateTimeSymbols_ar_ER', 'goog.i18n.DateTimeSymbols_ar_IL', 'goog.i18n.DateTimeSymbols_ar_IQ', 'goog.i18n.DateTimeSymbols_ar_JO', 'goog.i18n.DateTimeSymbols_ar_KM', 'goog.i18n.DateTimeSymbols_ar_KW', 'goog.i18n.DateTimeSymbols_ar_LB', 'goog.i18n.DateTimeSymbols_ar_LY', 'goog.i18n.DateTimeSymbols_ar_MA', 'goog.i18n.DateTimeSymbols_ar_MR', 'goog.i18n.DateTimeSymbols_ar_OM', 'goog.i18n.DateTimeSymbols_ar_PS', 'goog.i18n.DateTimeSymbols_ar_QA', 'goog.i18n.DateTimeSymbols_ar_SA', 'goog.i18n.DateTimeSymbols_ar_SD', 'goog.i18n.DateTimeSymbols_ar_SO', 'goog.i18n.DateTimeSymbols_ar_SS', 'goog.i18n.DateTimeSymbols_ar_SY', 'goog.i18n.DateTimeSymbols_ar_TD', 'goog.i18n.DateTimeSymbols_ar_TN', 'goog.i18n.DateTimeSymbols_ar_YE', 'goog.i18n.DateTimeSymbols_as', 'goog.i18n.DateTimeSymbols_as_IN', 'goog.i18n.DateTimeSymbols_asa', 'goog.i18n.DateTimeSymbols_asa_TZ', 'goog.i18n.DateTimeSymbols_ast', 'goog.i18n.DateTimeSymbols_ast_ES', 'goog.i18n.DateTimeSymbols_az_Cyrl', 'goog.i18n.DateTimeSymbols_az_Cyrl_AZ', 'goog.i18n.DateTimeSymbols_az_Latn', 'goog.i18n.DateTimeSymbols_az_Latn_AZ', 'goog.i18n.DateTimeSymbols_bas', 'goog.i18n.DateTimeSymbols_bas_CM', 'goog.i18n.DateTimeSymbols_be', 'goog.i18n.DateTimeSymbols_be_BY', 'goog.i18n.DateTimeSymbols_bem', 'goog.i18n.DateTimeSymbols_bem_ZM', 'goog.i18n.DateTimeSymbols_bez', 'goog.i18n.DateTimeSymbols_bez_TZ', 'goog.i18n.DateTimeSymbols_bg_BG', 'goog.i18n.DateTimeSymbols_bm', 'goog.i18n.DateTimeSymbols_bm_ML', 'goog.i18n.DateTimeSymbols_bn_BD', 'goog.i18n.DateTimeSymbols_bn_IN', 'goog.i18n.DateTimeSymbols_bo', 'goog.i18n.DateTimeSymbols_bo_CN', 'goog.i18n.DateTimeSymbols_bo_IN', 'goog.i18n.DateTimeSymbols_br_FR', 'goog.i18n.DateTimeSymbols_brx', 'goog.i18n.DateTimeSymbols_brx_IN', 'goog.i18n.DateTimeSymbols_bs', 'goog.i18n.DateTimeSymbols_bs_Cyrl', 'goog.i18n.DateTimeSymbols_bs_Cyrl_BA', 'goog.i18n.DateTimeSymbols_bs_Latn', 'goog.i18n.DateTimeSymbols_bs_Latn_BA', 'goog.i18n.DateTimeSymbols_byn', 'goog.i18n.DateTimeSymbols_byn_ER', 'goog.i18n.DateTimeSymbols_ca_AD', 'goog.i18n.DateTimeSymbols_ca_ES', 'goog.i18n.DateTimeSymbols_ca_ES_VALENCIA', 'goog.i18n.DateTimeSymbols_ca_FR', 'goog.i18n.DateTimeSymbols_ca_IT', 'goog.i18n.DateTimeSymbols_cgg', 'goog.i18n.DateTimeSymbols_cgg_UG', 'goog.i18n.DateTimeSymbols_chr_US', 'goog.i18n.DateTimeSymbols_ckb', 'goog.i18n.DateTimeSymbols_ckb_Arab', 'goog.i18n.DateTimeSymbols_ckb_Arab_IQ', 'goog.i18n.DateTimeSymbols_ckb_Arab_IR', 'goog.i18n.DateTimeSymbols_ckb_IQ', 'goog.i18n.DateTimeSymbols_ckb_IR', 'goog.i18n.DateTimeSymbols_ckb_Latn', 'goog.i18n.DateTimeSymbols_ckb_Latn_IQ', 'goog.i18n.DateTimeSymbols_cs_CZ', 'goog.i18n.DateTimeSymbols_cy_GB', 'goog.i18n.DateTimeSymbols_da_DK', 'goog.i18n.DateTimeSymbols_da_GL', 'goog.i18n.DateTimeSymbols_dav', 'goog.i18n.DateTimeSymbols_dav_KE', 'goog.i18n.DateTimeSymbols_de_BE', 'goog.i18n.DateTimeSymbols_de_DE', 'goog.i18n.DateTimeSymbols_de_LI', 'goog.i18n.DateTimeSymbols_de_LU', 'goog.i18n.DateTimeSymbols_dje', 'goog.i18n.DateTimeSymbols_dje_NE', 'goog.i18n.DateTimeSymbols_dua', 'goog.i18n.DateTimeSymbols_dua_CM', 'goog.i18n.DateTimeSymbols_dyo', 'goog.i18n.DateTimeSymbols_dyo_SN', 'goog.i18n.DateTimeSymbols_dz', 'goog.i18n.DateTimeSymbols_dz_BT', 'goog.i18n.DateTimeSymbols_ebu', 'goog.i18n.DateTimeSymbols_ebu_KE', 'goog.i18n.DateTimeSymbols_ee', 'goog.i18n.DateTimeSymbols_ee_GH', 'goog.i18n.DateTimeSymbols_ee_TG', 'goog.i18n.DateTimeSymbols_el_CY', 'goog.i18n.DateTimeSymbols_el_GR', 'goog.i18n.DateTimeSymbols_en_001', 'goog.i18n.DateTimeSymbols_en_150', 'goog.i18n.DateTimeSymbols_en_AG', 'goog.i18n.DateTimeSymbols_en_AI', 'goog.i18n.DateTimeSymbols_en_AS', 'goog.i18n.DateTimeSymbols_en_BB', 'goog.i18n.DateTimeSymbols_en_BE', 'goog.i18n.DateTimeSymbols_en_BM', 'goog.i18n.DateTimeSymbols_en_BS', 'goog.i18n.DateTimeSymbols_en_BW', 'goog.i18n.DateTimeSymbols_en_BZ', 'goog.i18n.DateTimeSymbols_en_CA', 'goog.i18n.DateTimeSymbols_en_CC', 'goog.i18n.DateTimeSymbols_en_CK', 'goog.i18n.DateTimeSymbols_en_CM', 'goog.i18n.DateTimeSymbols_en_CX', 'goog.i18n.DateTimeSymbols_en_DG', 'goog.i18n.DateTimeSymbols_en_DM', 'goog.i18n.DateTimeSymbols_en_ER', 'goog.i18n.DateTimeSymbols_en_FJ', 'goog.i18n.DateTimeSymbols_en_FK', 'goog.i18n.DateTimeSymbols_en_FM', 'goog.i18n.DateTimeSymbols_en_GD', 'goog.i18n.DateTimeSymbols_en_GG', 'goog.i18n.DateTimeSymbols_en_GH', 'goog.i18n.DateTimeSymbols_en_GI', 'goog.i18n.DateTimeSymbols_en_GM', 'goog.i18n.DateTimeSymbols_en_GU', 'goog.i18n.DateTimeSymbols_en_GY', 'goog.i18n.DateTimeSymbols_en_HK', 'goog.i18n.DateTimeSymbols_en_IM', 'goog.i18n.DateTimeSymbols_en_IO', 'goog.i18n.DateTimeSymbols_en_JE', 'goog.i18n.DateTimeSymbols_en_JM', 'goog.i18n.DateTimeSymbols_en_KE', 'goog.i18n.DateTimeSymbols_en_KI', 'goog.i18n.DateTimeSymbols_en_KN', 'goog.i18n.DateTimeSymbols_en_KY', 'goog.i18n.DateTimeSymbols_en_LC', 'goog.i18n.DateTimeSymbols_en_LR', 'goog.i18n.DateTimeSymbols_en_LS', 'goog.i18n.DateTimeSymbols_en_MG', 'goog.i18n.DateTimeSymbols_en_MH', 'goog.i18n.DateTimeSymbols_en_MO', 'goog.i18n.DateTimeSymbols_en_MP', 'goog.i18n.DateTimeSymbols_en_MS', 'goog.i18n.DateTimeSymbols_en_MT', 'goog.i18n.DateTimeSymbols_en_MU', 'goog.i18n.DateTimeSymbols_en_MW', 'goog.i18n.DateTimeSymbols_en_NA', 'goog.i18n.DateTimeSymbols_en_NF', 'goog.i18n.DateTimeSymbols_en_NG', 'goog.i18n.DateTimeSymbols_en_NR', 'goog.i18n.DateTimeSymbols_en_NU', 'goog.i18n.DateTimeSymbols_en_NZ', 'goog.i18n.DateTimeSymbols_en_PG', 'goog.i18n.DateTimeSymbols_en_PH', 'goog.i18n.DateTimeSymbols_en_PK', 'goog.i18n.DateTimeSymbols_en_PN', 'goog.i18n.DateTimeSymbols_en_PR', 'goog.i18n.DateTimeSymbols_en_PW', 'goog.i18n.DateTimeSymbols_en_RW', 'goog.i18n.DateTimeSymbols_en_SB', 'goog.i18n.DateTimeSymbols_en_SC', 'goog.i18n.DateTimeSymbols_en_SD', 'goog.i18n.DateTimeSymbols_en_SH', 'goog.i18n.DateTimeSymbols_en_SL', 'goog.i18n.DateTimeSymbols_en_SS', 'goog.i18n.DateTimeSymbols_en_SX', 'goog.i18n.DateTimeSymbols_en_SZ', 'goog.i18n.DateTimeSymbols_en_TC', 'goog.i18n.DateTimeSymbols_en_TK', 'goog.i18n.DateTimeSymbols_en_TO', 'goog.i18n.DateTimeSymbols_en_TT', 'goog.i18n.DateTimeSymbols_en_TV', 'goog.i18n.DateTimeSymbols_en_TZ', 'goog.i18n.DateTimeSymbols_en_UG', 'goog.i18n.DateTimeSymbols_en_UM', 'goog.i18n.DateTimeSymbols_en_VC', 'goog.i18n.DateTimeSymbols_en_VG', 'goog.i18n.DateTimeSymbols_en_VI', 'goog.i18n.DateTimeSymbols_en_VU', 'goog.i18n.DateTimeSymbols_en_WS', 'goog.i18n.DateTimeSymbols_en_ZM', 'goog.i18n.DateTimeSymbols_en_ZW', 'goog.i18n.DateTimeSymbols_eo', 'goog.i18n.DateTimeSymbols_eo_001', 'goog.i18n.DateTimeSymbols_es_AR', 'goog.i18n.DateTimeSymbols_es_BO', 'goog.i18n.DateTimeSymbols_es_CL', 'goog.i18n.DateTimeSymbols_es_CO', 'goog.i18n.DateTimeSymbols_es_CR', 'goog.i18n.DateTimeSymbols_es_CU', 'goog.i18n.DateTimeSymbols_es_DO', 'goog.i18n.DateTimeSymbols_es_EA', 'goog.i18n.DateTimeSymbols_es_EC', 'goog.i18n.DateTimeSymbols_es_GQ', 'goog.i18n.DateTimeSymbols_es_GT', 'goog.i18n.DateTimeSymbols_es_HN', 'goog.i18n.DateTimeSymbols_es_IC', 'goog.i18n.DateTimeSymbols_es_MX', 'goog.i18n.DateTimeSymbols_es_NI', 'goog.i18n.DateTimeSymbols_es_PA', 'goog.i18n.DateTimeSymbols_es_PE', 'goog.i18n.DateTimeSymbols_es_PH', 'goog.i18n.DateTimeSymbols_es_PR', 'goog.i18n.DateTimeSymbols_es_PY', 'goog.i18n.DateTimeSymbols_es_SV', 'goog.i18n.DateTimeSymbols_es_US', 'goog.i18n.DateTimeSymbols_es_UY', 'goog.i18n.DateTimeSymbols_es_VE', 'goog.i18n.DateTimeSymbols_et_EE', 'goog.i18n.DateTimeSymbols_eu_ES', 'goog.i18n.DateTimeSymbols_ewo', 'goog.i18n.DateTimeSymbols_ewo_CM', 'goog.i18n.DateTimeSymbols_fa_AF', 'goog.i18n.DateTimeSymbols_fa_IR', 'goog.i18n.DateTimeSymbols_ff', 'goog.i18n.DateTimeSymbols_ff_CM', 'goog.i18n.DateTimeSymbols_ff_GN', 'goog.i18n.DateTimeSymbols_ff_MR', 'goog.i18n.DateTimeSymbols_ff_SN', 'goog.i18n.DateTimeSymbols_fi_FI', 'goog.i18n.DateTimeSymbols_fil_PH', 'goog.i18n.DateTimeSymbols_fo', 'goog.i18n.DateTimeSymbols_fo_FO', 'goog.i18n.DateTimeSymbols_fr_BE', 'goog.i18n.DateTimeSymbols_fr_BF', 'goog.i18n.DateTimeSymbols_fr_BI', 'goog.i18n.DateTimeSymbols_fr_BJ', 'goog.i18n.DateTimeSymbols_fr_BL', 'goog.i18n.DateTimeSymbols_fr_CD', 'goog.i18n.DateTimeSymbols_fr_CF', 'goog.i18n.DateTimeSymbols_fr_CG', 'goog.i18n.DateTimeSymbols_fr_CH', 'goog.i18n.DateTimeSymbols_fr_CI', 'goog.i18n.DateTimeSymbols_fr_CM', 'goog.i18n.DateTimeSymbols_fr_DJ', 'goog.i18n.DateTimeSymbols_fr_DZ', 'goog.i18n.DateTimeSymbols_fr_FR', 'goog.i18n.DateTimeSymbols_fr_GA', 'goog.i18n.DateTimeSymbols_fr_GF', 'goog.i18n.DateTimeSymbols_fr_GN', 'goog.i18n.DateTimeSymbols_fr_GP', 'goog.i18n.DateTimeSymbols_fr_GQ', 'goog.i18n.DateTimeSymbols_fr_HT', 'goog.i18n.DateTimeSymbols_fr_KM', 'goog.i18n.DateTimeSymbols_fr_LU', 'goog.i18n.DateTimeSymbols_fr_MA', 'goog.i18n.DateTimeSymbols_fr_MC', 'goog.i18n.DateTimeSymbols_fr_MF', 'goog.i18n.DateTimeSymbols_fr_MG', 'goog.i18n.DateTimeSymbols_fr_ML', 'goog.i18n.DateTimeSymbols_fr_MQ', 'goog.i18n.DateTimeSymbols_fr_MR', 'goog.i18n.DateTimeSymbols_fr_MU', 'goog.i18n.DateTimeSymbols_fr_NC', 'goog.i18n.DateTimeSymbols_fr_NE', 'goog.i18n.DateTimeSymbols_fr_PF', 'goog.i18n.DateTimeSymbols_fr_PM', 'goog.i18n.DateTimeSymbols_fr_RE', 'goog.i18n.DateTimeSymbols_fr_RW', 'goog.i18n.DateTimeSymbols_fr_SC', 'goog.i18n.DateTimeSymbols_fr_SN', 'goog.i18n.DateTimeSymbols_fr_SY', 'goog.i18n.DateTimeSymbols_fr_TD', 'goog.i18n.DateTimeSymbols_fr_TG', 'goog.i18n.DateTimeSymbols_fr_TN', 'goog.i18n.DateTimeSymbols_fr_VU', 'goog.i18n.DateTimeSymbols_fr_WF', 'goog.i18n.DateTimeSymbols_fr_YT', 'goog.i18n.DateTimeSymbols_fur', 'goog.i18n.DateTimeSymbols_fur_IT', 'goog.i18n.DateTimeSymbols_fy', 'goog.i18n.DateTimeSymbols_fy_NL', 'goog.i18n.DateTimeSymbols_ga', 'goog.i18n.DateTimeSymbols_ga_IE', 'goog.i18n.DateTimeSymbols_gd', 'goog.i18n.DateTimeSymbols_gd_GB', 'goog.i18n.DateTimeSymbols_gl_ES', 'goog.i18n.DateTimeSymbols_gsw_CH', 'goog.i18n.DateTimeSymbols_gsw_LI', 'goog.i18n.DateTimeSymbols_gu_IN', 'goog.i18n.DateTimeSymbols_guz', 'goog.i18n.DateTimeSymbols_guz_KE', 'goog.i18n.DateTimeSymbols_gv', 'goog.i18n.DateTimeSymbols_gv_IM', 'goog.i18n.DateTimeSymbols_ha', 'goog.i18n.DateTimeSymbols_ha_Latn', 'goog.i18n.DateTimeSymbols_ha_Latn_GH', 'goog.i18n.DateTimeSymbols_ha_Latn_NE', 'goog.i18n.DateTimeSymbols_ha_Latn_NG', 'goog.i18n.DateTimeSymbols_haw_US', 'goog.i18n.DateTimeSymbols_he_IL', 'goog.i18n.DateTimeSymbols_hi_IN', 'goog.i18n.DateTimeSymbols_hr_BA', 'goog.i18n.DateTimeSymbols_hr_HR', 'goog.i18n.DateTimeSymbols_hu_HU', 'goog.i18n.DateTimeSymbols_hy_AM', 'goog.i18n.DateTimeSymbols_ia', 'goog.i18n.DateTimeSymbols_ia_FR', 'goog.i18n.DateTimeSymbols_id_ID', 'goog.i18n.DateTimeSymbols_ig', 'goog.i18n.DateTimeSymbols_ig_NG', 'goog.i18n.DateTimeSymbols_ii', 'goog.i18n.DateTimeSymbols_ii_CN', 'goog.i18n.DateTimeSymbols_is_IS', 'goog.i18n.DateTimeSymbols_it_CH', 'goog.i18n.DateTimeSymbols_it_IT', 'goog.i18n.DateTimeSymbols_it_SM', 'goog.i18n.DateTimeSymbols_ja_JP', 'goog.i18n.DateTimeSymbols_jgo', 'goog.i18n.DateTimeSymbols_jgo_CM', 'goog.i18n.DateTimeSymbols_jmc', 'goog.i18n.DateTimeSymbols_jmc_TZ', 'goog.i18n.DateTimeSymbols_ka_GE', 'goog.i18n.DateTimeSymbols_kab', 'goog.i18n.DateTimeSymbols_kab_DZ', 'goog.i18n.DateTimeSymbols_kam', 'goog.i18n.DateTimeSymbols_kam_KE', 'goog.i18n.DateTimeSymbols_kde', 'goog.i18n.DateTimeSymbols_kde_TZ', 'goog.i18n.DateTimeSymbols_kea', 'goog.i18n.DateTimeSymbols_kea_CV', 'goog.i18n.DateTimeSymbols_khq', 'goog.i18n.DateTimeSymbols_khq_ML', 'goog.i18n.DateTimeSymbols_ki', 'goog.i18n.DateTimeSymbols_ki_KE', 'goog.i18n.DateTimeSymbols_kk_Cyrl', 'goog.i18n.DateTimeSymbols_kk_Cyrl_KZ', 'goog.i18n.DateTimeSymbols_kkj', 'goog.i18n.DateTimeSymbols_kkj_CM', 'goog.i18n.DateTimeSymbols_kl', 'goog.i18n.DateTimeSymbols_kl_GL', 'goog.i18n.DateTimeSymbols_kln', 'goog.i18n.DateTimeSymbols_kln_KE', 'goog.i18n.DateTimeSymbols_km_KH', 'goog.i18n.DateTimeSymbols_kn_IN', 'goog.i18n.DateTimeSymbols_ko_KP', 'goog.i18n.DateTimeSymbols_ko_KR', 'goog.i18n.DateTimeSymbols_kok', 'goog.i18n.DateTimeSymbols_kok_IN', 'goog.i18n.DateTimeSymbols_ks', 'goog.i18n.DateTimeSymbols_ks_Arab', 'goog.i18n.DateTimeSymbols_ks_Arab_IN', 'goog.i18n.DateTimeSymbols_ksb', 'goog.i18n.DateTimeSymbols_ksb_TZ', 'goog.i18n.DateTimeSymbols_ksf', 'goog.i18n.DateTimeSymbols_ksf_CM', 'goog.i18n.DateTimeSymbols_ksh', 'goog.i18n.DateTimeSymbols_ksh_DE', 'goog.i18n.DateTimeSymbols_kw', 'goog.i18n.DateTimeSymbols_kw_GB', 'goog.i18n.DateTimeSymbols_ky_Cyrl', 'goog.i18n.DateTimeSymbols_ky_Cyrl_KG', 'goog.i18n.DateTimeSymbols_lag', 'goog.i18n.DateTimeSymbols_lag_TZ', 'goog.i18n.DateTimeSymbols_lg', 'goog.i18n.DateTimeSymbols_lg_UG', 'goog.i18n.DateTimeSymbols_lkt', 'goog.i18n.DateTimeSymbols_lkt_US', 'goog.i18n.DateTimeSymbols_ln_AO', 'goog.i18n.DateTimeSymbols_ln_CD', 'goog.i18n.DateTimeSymbols_ln_CF', 'goog.i18n.DateTimeSymbols_ln_CG', 'goog.i18n.DateTimeSymbols_lo_LA', 'goog.i18n.DateTimeSymbols_lt_LT', 'goog.i18n.DateTimeSymbols_lu', 'goog.i18n.DateTimeSymbols_lu_CD', 'goog.i18n.DateTimeSymbols_luo', 'goog.i18n.DateTimeSymbols_luo_KE', 'goog.i18n.DateTimeSymbols_luy', 'goog.i18n.DateTimeSymbols_luy_KE', 'goog.i18n.DateTimeSymbols_lv_LV', 'goog.i18n.DateTimeSymbols_mas', 'goog.i18n.DateTimeSymbols_mas_KE', 'goog.i18n.DateTimeSymbols_mas_TZ', 'goog.i18n.DateTimeSymbols_mer', 'goog.i18n.DateTimeSymbols_mer_KE', 'goog.i18n.DateTimeSymbols_mfe', 'goog.i18n.DateTimeSymbols_mfe_MU', 'goog.i18n.DateTimeSymbols_mg', 'goog.i18n.DateTimeSymbols_mg_MG', 'goog.i18n.DateTimeSymbols_mgh', 'goog.i18n.DateTimeSymbols_mgh_MZ', 'goog.i18n.DateTimeSymbols_mgo', 'goog.i18n.DateTimeSymbols_mgo_CM', 'goog.i18n.DateTimeSymbols_mk_MK', 'goog.i18n.DateTimeSymbols_ml_IN', 'goog.i18n.DateTimeSymbols_mn_Cyrl', 'goog.i18n.DateTimeSymbols_mn_Cyrl_MN', 'goog.i18n.DateTimeSymbols_mr_IN', 'goog.i18n.DateTimeSymbols_ms_Latn', 'goog.i18n.DateTimeSymbols_ms_Latn_BN', 'goog.i18n.DateTimeSymbols_ms_Latn_MY', 'goog.i18n.DateTimeSymbols_ms_Latn_SG', 'goog.i18n.DateTimeSymbols_mt_MT', 'goog.i18n.DateTimeSymbols_mua', 'goog.i18n.DateTimeSymbols_mua_CM', 'goog.i18n.DateTimeSymbols_my_MM', 'goog.i18n.DateTimeSymbols_naq', 'goog.i18n.DateTimeSymbols_naq_NA', 'goog.i18n.DateTimeSymbols_nb_NO', 'goog.i18n.DateTimeSymbols_nb_SJ', 'goog.i18n.DateTimeSymbols_nd', 'goog.i18n.DateTimeSymbols_nd_ZW', 'goog.i18n.DateTimeSymbols_ne_IN', 'goog.i18n.DateTimeSymbols_ne_NP', 'goog.i18n.DateTimeSymbols_nl_AW', 'goog.i18n.DateTimeSymbols_nl_BE', 'goog.i18n.DateTimeSymbols_nl_BQ', 'goog.i18n.DateTimeSymbols_nl_CW', 'goog.i18n.DateTimeSymbols_nl_NL', 'goog.i18n.DateTimeSymbols_nl_SR', 'goog.i18n.DateTimeSymbols_nl_SX', 'goog.i18n.DateTimeSymbols_nmg', 'goog.i18n.DateTimeSymbols_nmg_CM', 'goog.i18n.DateTimeSymbols_nn', 'goog.i18n.DateTimeSymbols_nn_NO', 'goog.i18n.DateTimeSymbols_nnh', 'goog.i18n.DateTimeSymbols_nnh_CM', 'goog.i18n.DateTimeSymbols_nr', 'goog.i18n.DateTimeSymbols_nr_ZA', 'goog.i18n.DateTimeSymbols_nso', 'goog.i18n.DateTimeSymbols_nso_ZA', 'goog.i18n.DateTimeSymbols_nus', 'goog.i18n.DateTimeSymbols_nus_SD', 'goog.i18n.DateTimeSymbols_nyn', 'goog.i18n.DateTimeSymbols_nyn_UG', 'goog.i18n.DateTimeSymbols_om', 'goog.i18n.DateTimeSymbols_om_ET', 'goog.i18n.DateTimeSymbols_om_KE', 'goog.i18n.DateTimeSymbols_or_IN', 'goog.i18n.DateTimeSymbols_os', 'goog.i18n.DateTimeSymbols_os_GE', 'goog.i18n.DateTimeSymbols_os_RU', 'goog.i18n.DateTimeSymbols_pa_Arab', 'goog.i18n.DateTimeSymbols_pa_Arab_PK', 'goog.i18n.DateTimeSymbols_pa_Guru', 'goog.i18n.DateTimeSymbols_pa_Guru_IN', 'goog.i18n.DateTimeSymbols_pl_PL', 'goog.i18n.DateTimeSymbols_ps', 'goog.i18n.DateTimeSymbols_ps_AF', 'goog.i18n.DateTimeSymbols_pt_AO', 'goog.i18n.DateTimeSymbols_pt_CV', 'goog.i18n.DateTimeSymbols_pt_GW', 'goog.i18n.DateTimeSymbols_pt_MO', 'goog.i18n.DateTimeSymbols_pt_MZ', 'goog.i18n.DateTimeSymbols_pt_ST', 'goog.i18n.DateTimeSymbols_pt_TL', 'goog.i18n.DateTimeSymbols_rm', 'goog.i18n.DateTimeSymbols_rm_CH', 'goog.i18n.DateTimeSymbols_rn', 'goog.i18n.DateTimeSymbols_rn_BI', 'goog.i18n.DateTimeSymbols_ro_MD', 'goog.i18n.DateTimeSymbols_ro_RO', 'goog.i18n.DateTimeSymbols_rof', 'goog.i18n.DateTimeSymbols_rof_TZ', 'goog.i18n.DateTimeSymbols_ru_BY', 'goog.i18n.DateTimeSymbols_ru_KG', 'goog.i18n.DateTimeSymbols_ru_KZ', 'goog.i18n.DateTimeSymbols_ru_MD', 'goog.i18n.DateTimeSymbols_ru_RU', 'goog.i18n.DateTimeSymbols_ru_UA', 'goog.i18n.DateTimeSymbols_rw', 'goog.i18n.DateTimeSymbols_rw_RW', 'goog.i18n.DateTimeSymbols_rwk', 'goog.i18n.DateTimeSymbols_rwk_TZ', 'goog.i18n.DateTimeSymbols_sah', 'goog.i18n.DateTimeSymbols_sah_RU', 'goog.i18n.DateTimeSymbols_saq', 'goog.i18n.DateTimeSymbols_saq_KE', 'goog.i18n.DateTimeSymbols_sbp', 'goog.i18n.DateTimeSymbols_sbp_TZ', 'goog.i18n.DateTimeSymbols_se', 'goog.i18n.DateTimeSymbols_se_FI', 'goog.i18n.DateTimeSymbols_se_NO', 'goog.i18n.DateTimeSymbols_seh', 'goog.i18n.DateTimeSymbols_seh_MZ', 'goog.i18n.DateTimeSymbols_ses', 'goog.i18n.DateTimeSymbols_ses_ML', 'goog.i18n.DateTimeSymbols_sg', 'goog.i18n.DateTimeSymbols_sg_CF', 'goog.i18n.DateTimeSymbols_shi', 'goog.i18n.DateTimeSymbols_shi_Latn', 'goog.i18n.DateTimeSymbols_shi_Latn_MA', 'goog.i18n.DateTimeSymbols_shi_Tfng', 'goog.i18n.DateTimeSymbols_shi_Tfng_MA', 'goog.i18n.DateTimeSymbols_si_LK', 'goog.i18n.DateTimeSymbols_sk_SK', 'goog.i18n.DateTimeSymbols_sl_SI', 'goog.i18n.DateTimeSymbols_sn', 'goog.i18n.DateTimeSymbols_sn_ZW', 'goog.i18n.DateTimeSymbols_so', 'goog.i18n.DateTimeSymbols_so_DJ', 'goog.i18n.DateTimeSymbols_so_ET', 'goog.i18n.DateTimeSymbols_so_KE', 'goog.i18n.DateTimeSymbols_so_SO', 'goog.i18n.DateTimeSymbols_sq_AL', 'goog.i18n.DateTimeSymbols_sq_MK', 'goog.i18n.DateTimeSymbols_sq_XK', 'goog.i18n.DateTimeSymbols_sr_Cyrl', 'goog.i18n.DateTimeSymbols_sr_Cyrl_BA', 'goog.i18n.DateTimeSymbols_sr_Cyrl_ME', 'goog.i18n.DateTimeSymbols_sr_Cyrl_RS', 'goog.i18n.DateTimeSymbols_sr_Cyrl_XK', 'goog.i18n.DateTimeSymbols_sr_Latn', 'goog.i18n.DateTimeSymbols_sr_Latn_BA', 'goog.i18n.DateTimeSymbols_sr_Latn_ME', 'goog.i18n.DateTimeSymbols_sr_Latn_RS', 'goog.i18n.DateTimeSymbols_sr_Latn_XK', 'goog.i18n.DateTimeSymbols_ss', 'goog.i18n.DateTimeSymbols_ss_SZ', 'goog.i18n.DateTimeSymbols_ss_ZA', 'goog.i18n.DateTimeSymbols_ssy', 'goog.i18n.DateTimeSymbols_ssy_ER', 'goog.i18n.DateTimeSymbols_st', 'goog.i18n.DateTimeSymbols_st_LS', 'goog.i18n.DateTimeSymbols_st_ZA', 'goog.i18n.DateTimeSymbols_sv_AX', 'goog.i18n.DateTimeSymbols_sv_FI', 'goog.i18n.DateTimeSymbols_sv_SE', 'goog.i18n.DateTimeSymbols_sw_KE', 'goog.i18n.DateTimeSymbols_sw_TZ', 'goog.i18n.DateTimeSymbols_sw_UG', 'goog.i18n.DateTimeSymbols_swc', 'goog.i18n.DateTimeSymbols_swc_CD', 'goog.i18n.DateTimeSymbols_ta_IN', 'goog.i18n.DateTimeSymbols_ta_LK', 'goog.i18n.DateTimeSymbols_ta_MY', 'goog.i18n.DateTimeSymbols_ta_SG', 'goog.i18n.DateTimeSymbols_te_IN', 'goog.i18n.DateTimeSymbols_teo', 'goog.i18n.DateTimeSymbols_teo_KE', 'goog.i18n.DateTimeSymbols_teo_UG', 'goog.i18n.DateTimeSymbols_tg', 'goog.i18n.DateTimeSymbols_tg_Cyrl', 'goog.i18n.DateTimeSymbols_tg_Cyrl_TJ', 'goog.i18n.DateTimeSymbols_th_TH', 'goog.i18n.DateTimeSymbols_ti', 'goog.i18n.DateTimeSymbols_ti_ER', 'goog.i18n.DateTimeSymbols_ti_ET', 'goog.i18n.DateTimeSymbols_tig', 'goog.i18n.DateTimeSymbols_tig_ER', 'goog.i18n.DateTimeSymbols_tn', 'goog.i18n.DateTimeSymbols_tn_BW', 'goog.i18n.DateTimeSymbols_tn_ZA', 'goog.i18n.DateTimeSymbols_to', 'goog.i18n.DateTimeSymbols_to_TO', 'goog.i18n.DateTimeSymbols_tr_CY', 'goog.i18n.DateTimeSymbols_tr_TR', 'goog.i18n.DateTimeSymbols_ts', 'goog.i18n.DateTimeSymbols_ts_ZA', 'goog.i18n.DateTimeSymbols_twq', 'goog.i18n.DateTimeSymbols_twq_NE', 'goog.i18n.DateTimeSymbols_tzm', 'goog.i18n.DateTimeSymbols_tzm_Latn', 'goog.i18n.DateTimeSymbols_tzm_Latn_MA', 'goog.i18n.DateTimeSymbols_ug', 'goog.i18n.DateTimeSymbols_ug_Arab', 'goog.i18n.DateTimeSymbols_ug_Arab_CN', 'goog.i18n.DateTimeSymbols_uk_UA', 'goog.i18n.DateTimeSymbols_ur_IN', 'goog.i18n.DateTimeSymbols_ur_PK', 'goog.i18n.DateTimeSymbols_uz_Arab', 'goog.i18n.DateTimeSymbols_uz_Arab_AF', 'goog.i18n.DateTimeSymbols_uz_Cyrl', 'goog.i18n.DateTimeSymbols_uz_Cyrl_UZ', 'goog.i18n.DateTimeSymbols_uz_Latn', 'goog.i18n.DateTimeSymbols_uz_Latn_UZ', 'goog.i18n.DateTimeSymbols_vai', 'goog.i18n.DateTimeSymbols_vai_Latn', 'goog.i18n.DateTimeSymbols_vai_Latn_LR', 'goog.i18n.DateTimeSymbols_vai_Vaii', 'goog.i18n.DateTimeSymbols_vai_Vaii_LR', 'goog.i18n.DateTimeSymbols_ve', 'goog.i18n.DateTimeSymbols_ve_ZA', 'goog.i18n.DateTimeSymbols_vi_VN', 'goog.i18n.DateTimeSymbols_vo', 'goog.i18n.DateTimeSymbols_vo_001', 'goog.i18n.DateTimeSymbols_vun', 'goog.i18n.DateTimeSymbols_vun_TZ', 'goog.i18n.DateTimeSymbols_wae', 'goog.i18n.DateTimeSymbols_wae_CH', 'goog.i18n.DateTimeSymbols_wal', 'goog.i18n.DateTimeSymbols_wal_ET', 'goog.i18n.DateTimeSymbols_xh', 'goog.i18n.DateTimeSymbols_xh_ZA', 'goog.i18n.DateTimeSymbols_xog', 'goog.i18n.DateTimeSymbols_xog_UG', 'goog.i18n.DateTimeSymbols_yav', 'goog.i18n.DateTimeSymbols_yav_CM', 'goog.i18n.DateTimeSymbols_yo', 'goog.i18n.DateTimeSymbols_yo_BJ', 'goog.i18n.DateTimeSymbols_yo_NG', 'goog.i18n.DateTimeSymbols_zgh', 'goog.i18n.DateTimeSymbols_zgh_MA', 'goog.i18n.DateTimeSymbols_zh_Hans', 'goog.i18n.DateTimeSymbols_zh_Hans_CN', 'goog.i18n.DateTimeSymbols_zh_Hans_HK', 'goog.i18n.DateTimeSymbols_zh_Hans_MO', 'goog.i18n.DateTimeSymbols_zh_Hans_SG', 'goog.i18n.DateTimeSymbols_zh_Hant', 'goog.i18n.DateTimeSymbols_zh_Hant_HK', 'goog.i18n.DateTimeSymbols_zh_Hant_MO', 'goog.i18n.DateTimeSymbols_zh_Hant_TW', 'goog.i18n.DateTimeSymbols_zu_ZA'], ['goog.i18n.DateTimeSymbols']);
goog.addDependency('i18n/graphemebreak.js', ['goog.i18n.GraphemeBreak'], ['goog.structs.InversionMap']);
goog.addDependency('i18n/graphemebreak_test.js', ['goog.i18n.GraphemeBreakTest'], ['goog.i18n.GraphemeBreak', 'goog.testing.jsunit']);
goog.addDependency('i18n/messageformat.js', ['goog.i18n.MessageFormat'], ['goog.asserts', 'goog.i18n.NumberFormat', 'goog.i18n.ordinalRules', 'goog.i18n.pluralRules']);
goog.addDependency('i18n/messageformat_test.js', ['goog.i18n.MessageFormatTest'], ['goog.i18n.MessageFormat', 'goog.i18n.NumberFormatSymbols_hr', 'goog.i18n.pluralRules', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit']);
goog.addDependency('i18n/mime.js', ['goog.i18n.mime', 'goog.i18n.mime.encode'], ['goog.array']);
goog.addDependency('i18n/mime_test.js', ['goog.i18n.mime.encodeTest'], ['goog.i18n.mime.encode', 'goog.testing.jsunit']);
goog.addDependency('i18n/numberformat.js', ['goog.i18n.NumberFormat', 'goog.i18n.NumberFormat.CurrencyStyle', 'goog.i18n.NumberFormat.Format'], ['goog.asserts', 'goog.i18n.CompactNumberFormatSymbols', 'goog.i18n.NumberFormatSymbols', 'goog.i18n.currency', 'goog.math']);
goog.addDependency('i18n/numberformat_test.js', ['goog.i18n.NumberFormatTest'], ['goog.i18n.CompactNumberFormatSymbols', 'goog.i18n.CompactNumberFormatSymbols_de', 'goog.i18n.CompactNumberFormatSymbols_en', 'goog.i18n.CompactNumberFormatSymbols_fr', 'goog.i18n.NumberFormat', 'goog.i18n.NumberFormatSymbols', 'goog.i18n.NumberFormatSymbols_de', 'goog.i18n.NumberFormatSymbols_en', 'goog.i18n.NumberFormatSymbols_fr', 'goog.i18n.NumberFormatSymbols_pl', 'goog.i18n.NumberFormatSymbols_ro', 'goog.testing.ExpectedFailures', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit', 'goog.userAgent', 'goog.userAgent.product', 'goog.userAgent.product.isVersion']);
goog.addDependency('i18n/numberformatsymbols.js', ['goog.i18n.NumberFormatSymbols', 'goog.i18n.NumberFormatSymbols_af', 'goog.i18n.NumberFormatSymbols_af_ZA', 'goog.i18n.NumberFormatSymbols_am', 'goog.i18n.NumberFormatSymbols_am_ET', 'goog.i18n.NumberFormatSymbols_ar', 'goog.i18n.NumberFormatSymbols_ar_001', 'goog.i18n.NumberFormatSymbols_az', 'goog.i18n.NumberFormatSymbols_az_Cyrl_AZ', 'goog.i18n.NumberFormatSymbols_az_Latn_AZ', 'goog.i18n.NumberFormatSymbols_bg', 'goog.i18n.NumberFormatSymbols_bg_BG', 'goog.i18n.NumberFormatSymbols_bn', 'goog.i18n.NumberFormatSymbols_bn_BD', 'goog.i18n.NumberFormatSymbols_br', 'goog.i18n.NumberFormatSymbols_br_FR', 'goog.i18n.NumberFormatSymbols_ca', 'goog.i18n.NumberFormatSymbols_ca_AD', 'goog.i18n.NumberFormatSymbols_ca_ES', 'goog.i18n.NumberFormatSymbols_ca_ES_VALENCIA', 'goog.i18n.NumberFormatSymbols_ca_FR', 'goog.i18n.NumberFormatSymbols_ca_IT', 'goog.i18n.NumberFormatSymbols_chr', 'goog.i18n.NumberFormatSymbols_chr_US', 'goog.i18n.NumberFormatSymbols_cs', 'goog.i18n.NumberFormatSymbols_cs_CZ', 'goog.i18n.NumberFormatSymbols_cy', 'goog.i18n.NumberFormatSymbols_cy_GB', 'goog.i18n.NumberFormatSymbols_da', 'goog.i18n.NumberFormatSymbols_da_DK', 'goog.i18n.NumberFormatSymbols_da_GL', 'goog.i18n.NumberFormatSymbols_de', 'goog.i18n.NumberFormatSymbols_de_AT', 'goog.i18n.NumberFormatSymbols_de_BE', 'goog.i18n.NumberFormatSymbols_de_CH', 'goog.i18n.NumberFormatSymbols_de_DE', 'goog.i18n.NumberFormatSymbols_de_LU', 'goog.i18n.NumberFormatSymbols_el', 'goog.i18n.NumberFormatSymbols_el_GR', 'goog.i18n.NumberFormatSymbols_en', 'goog.i18n.NumberFormatSymbols_en_001', 'goog.i18n.NumberFormatSymbols_en_AS', 'goog.i18n.NumberFormatSymbols_en_AU', 'goog.i18n.NumberFormatSymbols_en_DG', 'goog.i18n.NumberFormatSymbols_en_FM', 'goog.i18n.NumberFormatSymbols_en_GB', 'goog.i18n.NumberFormatSymbols_en_GU', 'goog.i18n.NumberFormatSymbols_en_IE', 'goog.i18n.NumberFormatSymbols_en_IN', 'goog.i18n.NumberFormatSymbols_en_IO', 'goog.i18n.NumberFormatSymbols_en_MH', 'goog.i18n.NumberFormatSymbols_en_MP', 'goog.i18n.NumberFormatSymbols_en_PR', 'goog.i18n.NumberFormatSymbols_en_PW', 'goog.i18n.NumberFormatSymbols_en_SG', 'goog.i18n.NumberFormatSymbols_en_TC', 'goog.i18n.NumberFormatSymbols_en_UM', 'goog.i18n.NumberFormatSymbols_en_US', 'goog.i18n.NumberFormatSymbols_en_VG', 'goog.i18n.NumberFormatSymbols_en_VI', 'goog.i18n.NumberFormatSymbols_en_ZA', 'goog.i18n.NumberFormatSymbols_en_ZW', 'goog.i18n.NumberFormatSymbols_es', 'goog.i18n.NumberFormatSymbols_es_419', 'goog.i18n.NumberFormatSymbols_es_EA', 'goog.i18n.NumberFormatSymbols_es_ES', 'goog.i18n.NumberFormatSymbols_es_IC', 'goog.i18n.NumberFormatSymbols_et', 'goog.i18n.NumberFormatSymbols_et_EE', 'goog.i18n.NumberFormatSymbols_eu', 'goog.i18n.NumberFormatSymbols_eu_ES', 'goog.i18n.NumberFormatSymbols_fa', 'goog.i18n.NumberFormatSymbols_fa_IR', 'goog.i18n.NumberFormatSymbols_fi', 'goog.i18n.NumberFormatSymbols_fi_FI', 'goog.i18n.NumberFormatSymbols_fil', 'goog.i18n.NumberFormatSymbols_fil_PH', 'goog.i18n.NumberFormatSymbols_fr', 'goog.i18n.NumberFormatSymbols_fr_BL', 'goog.i18n.NumberFormatSymbols_fr_CA', 'goog.i18n.NumberFormatSymbols_fr_FR', 'goog.i18n.NumberFormatSymbols_fr_GF', 'goog.i18n.NumberFormatSymbols_fr_GP', 'goog.i18n.NumberFormatSymbols_fr_MC', 'goog.i18n.NumberFormatSymbols_fr_MF', 'goog.i18n.NumberFormatSymbols_fr_MQ', 'goog.i18n.NumberFormatSymbols_fr_PM', 'goog.i18n.NumberFormatSymbols_fr_RE', 'goog.i18n.NumberFormatSymbols_fr_YT', 'goog.i18n.NumberFormatSymbols_gl', 'goog.i18n.NumberFormatSymbols_gl_ES', 'goog.i18n.NumberFormatSymbols_gsw', 'goog.i18n.NumberFormatSymbols_gsw_CH', 'goog.i18n.NumberFormatSymbols_gsw_LI', 'goog.i18n.NumberFormatSymbols_gu', 'goog.i18n.NumberFormatSymbols_gu_IN', 'goog.i18n.NumberFormatSymbols_haw', 'goog.i18n.NumberFormatSymbols_haw_US', 'goog.i18n.NumberFormatSymbols_he', 'goog.i18n.NumberFormatSymbols_he_IL', 'goog.i18n.NumberFormatSymbols_hi', 'goog.i18n.NumberFormatSymbols_hi_IN', 'goog.i18n.NumberFormatSymbols_hr', 'goog.i18n.NumberFormatSymbols_hr_HR', 'goog.i18n.NumberFormatSymbols_hu', 'goog.i18n.NumberFormatSymbols_hu_HU', 'goog.i18n.NumberFormatSymbols_hy', 'goog.i18n.NumberFormatSymbols_hy_AM', 'goog.i18n.NumberFormatSymbols_id', 'goog.i18n.NumberFormatSymbols_id_ID', 'goog.i18n.NumberFormatSymbols_in', 'goog.i18n.NumberFormatSymbols_is', 'goog.i18n.NumberFormatSymbols_is_IS', 'goog.i18n.NumberFormatSymbols_it', 'goog.i18n.NumberFormatSymbols_it_IT', 'goog.i18n.NumberFormatSymbols_it_SM', 'goog.i18n.NumberFormatSymbols_iw', 'goog.i18n.NumberFormatSymbols_ja', 'goog.i18n.NumberFormatSymbols_ja_JP', 'goog.i18n.NumberFormatSymbols_ka', 'goog.i18n.NumberFormatSymbols_ka_GE', 'goog.i18n.NumberFormatSymbols_kk', 'goog.i18n.NumberFormatSymbols_kk_Cyrl_KZ', 'goog.i18n.NumberFormatSymbols_km', 'goog.i18n.NumberFormatSymbols_km_KH', 'goog.i18n.NumberFormatSymbols_kn', 'goog.i18n.NumberFormatSymbols_kn_IN', 'goog.i18n.NumberFormatSymbols_ko', 'goog.i18n.NumberFormatSymbols_ko_KR', 'goog.i18n.NumberFormatSymbols_ky', 'goog.i18n.NumberFormatSymbols_ky_Cyrl_KG', 'goog.i18n.NumberFormatSymbols_ln', 'goog.i18n.NumberFormatSymbols_ln_CD', 'goog.i18n.NumberFormatSymbols_lo', 'goog.i18n.NumberFormatSymbols_lo_LA', 'goog.i18n.NumberFormatSymbols_lt', 'goog.i18n.NumberFormatSymbols_lt_LT', 'goog.i18n.NumberFormatSymbols_lv', 'goog.i18n.NumberFormatSymbols_lv_LV', 'goog.i18n.NumberFormatSymbols_mk', 'goog.i18n.NumberFormatSymbols_mk_MK', 'goog.i18n.NumberFormatSymbols_ml', 'goog.i18n.NumberFormatSymbols_ml_IN', 'goog.i18n.NumberFormatSymbols_mn', 'goog.i18n.NumberFormatSymbols_mn_Cyrl_MN', 'goog.i18n.NumberFormatSymbols_mr', 'goog.i18n.NumberFormatSymbols_mr_IN', 'goog.i18n.NumberFormatSymbols_ms', 'goog.i18n.NumberFormatSymbols_ms_Latn_MY', 'goog.i18n.NumberFormatSymbols_mt', 'goog.i18n.NumberFormatSymbols_mt_MT', 'goog.i18n.NumberFormatSymbols_my', 'goog.i18n.NumberFormatSymbols_my_MM', 'goog.i18n.NumberFormatSymbols_nb', 'goog.i18n.NumberFormatSymbols_nb_NO', 'goog.i18n.NumberFormatSymbols_nb_SJ', 'goog.i18n.NumberFormatSymbols_ne', 'goog.i18n.NumberFormatSymbols_ne_NP', 'goog.i18n.NumberFormatSymbols_nl', 'goog.i18n.NumberFormatSymbols_nl_NL', 'goog.i18n.NumberFormatSymbols_no', 'goog.i18n.NumberFormatSymbols_no_NO', 'goog.i18n.NumberFormatSymbols_or', 'goog.i18n.NumberFormatSymbols_or_IN', 'goog.i18n.NumberFormatSymbols_pa', 'goog.i18n.NumberFormatSymbols_pa_Guru_IN', 'goog.i18n.NumberFormatSymbols_pl', 'goog.i18n.NumberFormatSymbols_pl_PL', 'goog.i18n.NumberFormatSymbols_pt', 'goog.i18n.NumberFormatSymbols_pt_BR', 'goog.i18n.NumberFormatSymbols_pt_PT', 'goog.i18n.NumberFormatSymbols_ro', 'goog.i18n.NumberFormatSymbols_ro_RO', 'goog.i18n.NumberFormatSymbols_ru', 'goog.i18n.NumberFormatSymbols_ru_RU', 'goog.i18n.NumberFormatSymbols_si', 'goog.i18n.NumberFormatSymbols_si_LK', 'goog.i18n.NumberFormatSymbols_sk', 'goog.i18n.NumberFormatSymbols_sk_SK', 'goog.i18n.NumberFormatSymbols_sl', 'goog.i18n.NumberFormatSymbols_sl_SI', 'goog.i18n.NumberFormatSymbols_sq', 'goog.i18n.NumberFormatSymbols_sq_AL', 'goog.i18n.NumberFormatSymbols_sr', 'goog.i18n.NumberFormatSymbols_sr_Cyrl_RS', 'goog.i18n.NumberFormatSymbols_sv', 'goog.i18n.NumberFormatSymbols_sv_SE', 'goog.i18n.NumberFormatSymbols_sw', 'goog.i18n.NumberFormatSymbols_sw_TZ', 'goog.i18n.NumberFormatSymbols_ta', 'goog.i18n.NumberFormatSymbols_ta_IN', 'goog.i18n.NumberFormatSymbols_te', 'goog.i18n.NumberFormatSymbols_te_IN', 'goog.i18n.NumberFormatSymbols_th', 'goog.i18n.NumberFormatSymbols_th_TH', 'goog.i18n.NumberFormatSymbols_tl', 'goog.i18n.NumberFormatSymbols_tr', 'goog.i18n.NumberFormatSymbols_tr_TR', 'goog.i18n.NumberFormatSymbols_uk', 'goog.i18n.NumberFormatSymbols_uk_UA', 'goog.i18n.NumberFormatSymbols_ur', 'goog.i18n.NumberFormatSymbols_ur_PK', 'goog.i18n.NumberFormatSymbols_uz', 'goog.i18n.NumberFormatSymbols_uz_Latn_UZ', 'goog.i18n.NumberFormatSymbols_vi', 'goog.i18n.NumberFormatSymbols_vi_VN', 'goog.i18n.NumberFormatSymbols_zh', 'goog.i18n.NumberFormatSymbols_zh_CN', 'goog.i18n.NumberFormatSymbols_zh_HK', 'goog.i18n.NumberFormatSymbols_zh_Hans_CN', 'goog.i18n.NumberFormatSymbols_zh_TW', 'goog.i18n.NumberFormatSymbols_zu', 'goog.i18n.NumberFormatSymbols_zu_ZA'], []);
goog.addDependency('i18n/numberformatsymbolsext.js', ['goog.i18n.NumberFormatSymbolsExt', 'goog.i18n.NumberFormatSymbols_aa', 'goog.i18n.NumberFormatSymbols_aa_DJ', 'goog.i18n.NumberFormatSymbols_aa_ER', 'goog.i18n.NumberFormatSymbols_aa_ET', 'goog.i18n.NumberFormatSymbols_af_NA', 'goog.i18n.NumberFormatSymbols_agq', 'goog.i18n.NumberFormatSymbols_agq_CM', 'goog.i18n.NumberFormatSymbols_ak', 'goog.i18n.NumberFormatSymbols_ak_GH', 'goog.i18n.NumberFormatSymbols_ar_AE', 'goog.i18n.NumberFormatSymbols_ar_BH', 'goog.i18n.NumberFormatSymbols_ar_DJ', 'goog.i18n.NumberFormatSymbols_ar_DZ', 'goog.i18n.NumberFormatSymbols_ar_EG', 'goog.i18n.NumberFormatSymbols_ar_EH', 'goog.i18n.NumberFormatSymbols_ar_ER', 'goog.i18n.NumberFormatSymbols_ar_IL', 'goog.i18n.NumberFormatSymbols_ar_IQ', 'goog.i18n.NumberFormatSymbols_ar_JO', 'goog.i18n.NumberFormatSymbols_ar_KM', 'goog.i18n.NumberFormatSymbols_ar_KW', 'goog.i18n.NumberFormatSymbols_ar_LB', 'goog.i18n.NumberFormatSymbols_ar_LY', 'goog.i18n.NumberFormatSymbols_ar_MA', 'goog.i18n.NumberFormatSymbols_ar_MR', 'goog.i18n.NumberFormatSymbols_ar_OM', 'goog.i18n.NumberFormatSymbols_ar_PS', 'goog.i18n.NumberFormatSymbols_ar_QA', 'goog.i18n.NumberFormatSymbols_ar_SA', 'goog.i18n.NumberFormatSymbols_ar_SD', 'goog.i18n.NumberFormatSymbols_ar_SO', 'goog.i18n.NumberFormatSymbols_ar_SS', 'goog.i18n.NumberFormatSymbols_ar_SY', 'goog.i18n.NumberFormatSymbols_ar_TD', 'goog.i18n.NumberFormatSymbols_ar_TN', 'goog.i18n.NumberFormatSymbols_ar_YE', 'goog.i18n.NumberFormatSymbols_as', 'goog.i18n.NumberFormatSymbols_as_IN', 'goog.i18n.NumberFormatSymbols_asa', 'goog.i18n.NumberFormatSymbols_asa_TZ', 'goog.i18n.NumberFormatSymbols_ast', 'goog.i18n.NumberFormatSymbols_ast_ES', 'goog.i18n.NumberFormatSymbols_az_Cyrl', 'goog.i18n.NumberFormatSymbols_az_Latn', 'goog.i18n.NumberFormatSymbols_bas', 'goog.i18n.NumberFormatSymbols_bas_CM', 'goog.i18n.NumberFormatSymbols_be', 'goog.i18n.NumberFormatSymbols_be_BY', 'goog.i18n.NumberFormatSymbols_bem', 'goog.i18n.NumberFormatSymbols_bem_ZM', 'goog.i18n.NumberFormatSymbols_bez', 'goog.i18n.NumberFormatSymbols_bez_TZ', 'goog.i18n.NumberFormatSymbols_bm', 'goog.i18n.NumberFormatSymbols_bm_ML', 'goog.i18n.NumberFormatSymbols_bn_IN', 'goog.i18n.NumberFormatSymbols_bo', 'goog.i18n.NumberFormatSymbols_bo_CN', 'goog.i18n.NumberFormatSymbols_bo_IN', 'goog.i18n.NumberFormatSymbols_brx', 'goog.i18n.NumberFormatSymbols_brx_IN', 'goog.i18n.NumberFormatSymbols_bs', 'goog.i18n.NumberFormatSymbols_bs_Cyrl', 'goog.i18n.NumberFormatSymbols_bs_Cyrl_BA', 'goog.i18n.NumberFormatSymbols_bs_Latn', 'goog.i18n.NumberFormatSymbols_bs_Latn_BA', 'goog.i18n.NumberFormatSymbols_byn', 'goog.i18n.NumberFormatSymbols_byn_ER', 'goog.i18n.NumberFormatSymbols_cgg', 'goog.i18n.NumberFormatSymbols_cgg_UG', 'goog.i18n.NumberFormatSymbols_ckb', 'goog.i18n.NumberFormatSymbols_ckb_Arab', 'goog.i18n.NumberFormatSymbols_ckb_Arab_IQ', 'goog.i18n.NumberFormatSymbols_ckb_Arab_IR', 'goog.i18n.NumberFormatSymbols_ckb_IQ', 'goog.i18n.NumberFormatSymbols_ckb_IR', 'goog.i18n.NumberFormatSymbols_ckb_Latn', 'goog.i18n.NumberFormatSymbols_ckb_Latn_IQ', 'goog.i18n.NumberFormatSymbols_dav', 'goog.i18n.NumberFormatSymbols_dav_KE', 'goog.i18n.NumberFormatSymbols_de_LI', 'goog.i18n.NumberFormatSymbols_dje', 'goog.i18n.NumberFormatSymbols_dje_NE', 'goog.i18n.NumberFormatSymbols_dua', 'goog.i18n.NumberFormatSymbols_dua_CM', 'goog.i18n.NumberFormatSymbols_dyo', 'goog.i18n.NumberFormatSymbols_dyo_SN', 'goog.i18n.NumberFormatSymbols_dz', 'goog.i18n.NumberFormatSymbols_dz_BT', 'goog.i18n.NumberFormatSymbols_ebu', 'goog.i18n.NumberFormatSymbols_ebu_KE', 'goog.i18n.NumberFormatSymbols_ee', 'goog.i18n.NumberFormatSymbols_ee_GH', 'goog.i18n.NumberFormatSymbols_ee_TG', 'goog.i18n.NumberFormatSymbols_el_CY', 'goog.i18n.NumberFormatSymbols_en_150', 'goog.i18n.NumberFormatSymbols_en_AG', 'goog.i18n.NumberFormatSymbols_en_AI', 'goog.i18n.NumberFormatSymbols_en_BB', 'goog.i18n.NumberFormatSymbols_en_BE', 'goog.i18n.NumberFormatSymbols_en_BM', 'goog.i18n.NumberFormatSymbols_en_BS', 'goog.i18n.NumberFormatSymbols_en_BW', 'goog.i18n.NumberFormatSymbols_en_BZ', 'goog.i18n.NumberFormatSymbols_en_CA', 'goog.i18n.NumberFormatSymbols_en_CC', 'goog.i18n.NumberFormatSymbols_en_CK', 'goog.i18n.NumberFormatSymbols_en_CM', 'goog.i18n.NumberFormatSymbols_en_CX', 'goog.i18n.NumberFormatSymbols_en_DM', 'goog.i18n.NumberFormatSymbols_en_ER', 'goog.i18n.NumberFormatSymbols_en_FJ', 'goog.i18n.NumberFormatSymbols_en_FK', 'goog.i18n.NumberFormatSymbols_en_GD', 'goog.i18n.NumberFormatSymbols_en_GG', 'goog.i18n.NumberFormatSymbols_en_GH', 'goog.i18n.NumberFormatSymbols_en_GI', 'goog.i18n.NumberFormatSymbols_en_GM', 'goog.i18n.NumberFormatSymbols_en_GY', 'goog.i18n.NumberFormatSymbols_en_HK', 'goog.i18n.NumberFormatSymbols_en_IM', 'goog.i18n.NumberFormatSymbols_en_JE', 'goog.i18n.NumberFormatSymbols_en_JM', 'goog.i18n.NumberFormatSymbols_en_KE', 'goog.i18n.NumberFormatSymbols_en_KI', 'goog.i18n.NumberFormatSymbols_en_KN', 'goog.i18n.NumberFormatSymbols_en_KY', 'goog.i18n.NumberFormatSymbols_en_LC', 'goog.i18n.NumberFormatSymbols_en_LR', 'goog.i18n.NumberFormatSymbols_en_LS', 'goog.i18n.NumberFormatSymbols_en_MG', 'goog.i18n.NumberFormatSymbols_en_MO', 'goog.i18n.NumberFormatSymbols_en_MS', 'goog.i18n.NumberFormatSymbols_en_MT', 'goog.i18n.NumberFormatSymbols_en_MU', 'goog.i18n.NumberFormatSymbols_en_MW', 'goog.i18n.NumberFormatSymbols_en_NA', 'goog.i18n.NumberFormatSymbols_en_NF', 'goog.i18n.NumberFormatSymbols_en_NG', 'goog.i18n.NumberFormatSymbols_en_NR', 'goog.i18n.NumberFormatSymbols_en_NU', 'goog.i18n.NumberFormatSymbols_en_NZ', 'goog.i18n.NumberFormatSymbols_en_PG', 'goog.i18n.NumberFormatSymbols_en_PH', 'goog.i18n.NumberFormatSymbols_en_PK', 'goog.i18n.NumberFormatSymbols_en_PN', 'goog.i18n.NumberFormatSymbols_en_RW', 'goog.i18n.NumberFormatSymbols_en_SB', 'goog.i18n.NumberFormatSymbols_en_SC', 'goog.i18n.NumberFormatSymbols_en_SD', 'goog.i18n.NumberFormatSymbols_en_SH', 'goog.i18n.NumberFormatSymbols_en_SL', 'goog.i18n.NumberFormatSymbols_en_SS', 'goog.i18n.NumberFormatSymbols_en_SX', 'goog.i18n.NumberFormatSymbols_en_SZ', 'goog.i18n.NumberFormatSymbols_en_TK', 'goog.i18n.NumberFormatSymbols_en_TO', 'goog.i18n.NumberFormatSymbols_en_TT', 'goog.i18n.NumberFormatSymbols_en_TV', 'goog.i18n.NumberFormatSymbols_en_TZ', 'goog.i18n.NumberFormatSymbols_en_UG', 'goog.i18n.NumberFormatSymbols_en_VC', 'goog.i18n.NumberFormatSymbols_en_VU', 'goog.i18n.NumberFormatSymbols_en_WS', 'goog.i18n.NumberFormatSymbols_en_ZM', 'goog.i18n.NumberFormatSymbols_eo', 'goog.i18n.NumberFormatSymbols_eo_001', 'goog.i18n.NumberFormatSymbols_es_AR', 'goog.i18n.NumberFormatSymbols_es_BO', 'goog.i18n.NumberFormatSymbols_es_CL', 'goog.i18n.NumberFormatSymbols_es_CO', 'goog.i18n.NumberFormatSymbols_es_CR', 'goog.i18n.NumberFormatSymbols_es_CU', 'goog.i18n.NumberFormatSymbols_es_DO', 'goog.i18n.NumberFormatSymbols_es_EC', 'goog.i18n.NumberFormatSymbols_es_GQ', 'goog.i18n.NumberFormatSymbols_es_GT', 'goog.i18n.NumberFormatSymbols_es_HN', 'goog.i18n.NumberFormatSymbols_es_MX', 'goog.i18n.NumberFormatSymbols_es_NI', 'goog.i18n.NumberFormatSymbols_es_PA', 'goog.i18n.NumberFormatSymbols_es_PE', 'goog.i18n.NumberFormatSymbols_es_PH', 'goog.i18n.NumberFormatSymbols_es_PR', 'goog.i18n.NumberFormatSymbols_es_PY', 'goog.i18n.NumberFormatSymbols_es_SV', 'goog.i18n.NumberFormatSymbols_es_US', 'goog.i18n.NumberFormatSymbols_es_UY', 'goog.i18n.NumberFormatSymbols_es_VE', 'goog.i18n.NumberFormatSymbols_ewo', 'goog.i18n.NumberFormatSymbols_ewo_CM', 'goog.i18n.NumberFormatSymbols_fa_AF', 'goog.i18n.NumberFormatSymbols_ff', 'goog.i18n.NumberFormatSymbols_ff_CM', 'goog.i18n.NumberFormatSymbols_ff_GN', 'goog.i18n.NumberFormatSymbols_ff_MR', 'goog.i18n.NumberFormatSymbols_ff_SN', 'goog.i18n.NumberFormatSymbols_fo', 'goog.i18n.NumberFormatSymbols_fo_FO', 'goog.i18n.NumberFormatSymbols_fr_BE', 'goog.i18n.NumberFormatSymbols_fr_BF', 'goog.i18n.NumberFormatSymbols_fr_BI', 'goog.i18n.NumberFormatSymbols_fr_BJ', 'goog.i18n.NumberFormatSymbols_fr_CD', 'goog.i18n.NumberFormatSymbols_fr_CF', 'goog.i18n.NumberFormatSymbols_fr_CG', 'goog.i18n.NumberFormatSymbols_fr_CH', 'goog.i18n.NumberFormatSymbols_fr_CI', 'goog.i18n.NumberFormatSymbols_fr_CM', 'goog.i18n.NumberFormatSymbols_fr_DJ', 'goog.i18n.NumberFormatSymbols_fr_DZ', 'goog.i18n.NumberFormatSymbols_fr_GA', 'goog.i18n.NumberFormatSymbols_fr_GN', 'goog.i18n.NumberFormatSymbols_fr_GQ', 'goog.i18n.NumberFormatSymbols_fr_HT', 'goog.i18n.NumberFormatSymbols_fr_KM', 'goog.i18n.NumberFormatSymbols_fr_LU', 'goog.i18n.NumberFormatSymbols_fr_MA', 'goog.i18n.NumberFormatSymbols_fr_MG', 'goog.i18n.NumberFormatSymbols_fr_ML', 'goog.i18n.NumberFormatSymbols_fr_MR', 'goog.i18n.NumberFormatSymbols_fr_MU', 'goog.i18n.NumberFormatSymbols_fr_NC', 'goog.i18n.NumberFormatSymbols_fr_NE', 'goog.i18n.NumberFormatSymbols_fr_PF', 'goog.i18n.NumberFormatSymbols_fr_RW', 'goog.i18n.NumberFormatSymbols_fr_SC', 'goog.i18n.NumberFormatSymbols_fr_SN', 'goog.i18n.NumberFormatSymbols_fr_SY', 'goog.i18n.NumberFormatSymbols_fr_TD', 'goog.i18n.NumberFormatSymbols_fr_TG', 'goog.i18n.NumberFormatSymbols_fr_TN', 'goog.i18n.NumberFormatSymbols_fr_VU', 'goog.i18n.NumberFormatSymbols_fr_WF', 'goog.i18n.NumberFormatSymbols_fur', 'goog.i18n.NumberFormatSymbols_fur_IT', 'goog.i18n.NumberFormatSymbols_fy', 'goog.i18n.NumberFormatSymbols_fy_NL', 'goog.i18n.NumberFormatSymbols_ga', 'goog.i18n.NumberFormatSymbols_ga_IE', 'goog.i18n.NumberFormatSymbols_gd', 'goog.i18n.NumberFormatSymbols_gd_GB', 'goog.i18n.NumberFormatSymbols_guz', 'goog.i18n.NumberFormatSymbols_guz_KE', 'goog.i18n.NumberFormatSymbols_gv', 'goog.i18n.NumberFormatSymbols_gv_IM', 'goog.i18n.NumberFormatSymbols_ha', 'goog.i18n.NumberFormatSymbols_ha_Latn', 'goog.i18n.NumberFormatSymbols_ha_Latn_GH', 'goog.i18n.NumberFormatSymbols_ha_Latn_NE', 'goog.i18n.NumberFormatSymbols_ha_Latn_NG', 'goog.i18n.NumberFormatSymbols_hr_BA', 'goog.i18n.NumberFormatSymbols_ia', 'goog.i18n.NumberFormatSymbols_ia_FR', 'goog.i18n.NumberFormatSymbols_ig', 'goog.i18n.NumberFormatSymbols_ig_NG', 'goog.i18n.NumberFormatSymbols_ii', 'goog.i18n.NumberFormatSymbols_ii_CN', 'goog.i18n.NumberFormatSymbols_it_CH', 'goog.i18n.NumberFormatSymbols_jgo', 'goog.i18n.NumberFormatSymbols_jgo_CM', 'goog.i18n.NumberFormatSymbols_jmc', 'goog.i18n.NumberFormatSymbols_jmc_TZ', 'goog.i18n.NumberFormatSymbols_kab', 'goog.i18n.NumberFormatSymbols_kab_DZ', 'goog.i18n.NumberFormatSymbols_kam', 'goog.i18n.NumberFormatSymbols_kam_KE', 'goog.i18n.NumberFormatSymbols_kde', 'goog.i18n.NumberFormatSymbols_kde_TZ', 'goog.i18n.NumberFormatSymbols_kea', 'goog.i18n.NumberFormatSymbols_kea_CV', 'goog.i18n.NumberFormatSymbols_khq', 'goog.i18n.NumberFormatSymbols_khq_ML', 'goog.i18n.NumberFormatSymbols_ki', 'goog.i18n.NumberFormatSymbols_ki_KE', 'goog.i18n.NumberFormatSymbols_kk_Cyrl', 'goog.i18n.NumberFormatSymbols_kkj', 'goog.i18n.NumberFormatSymbols_kkj_CM', 'goog.i18n.NumberFormatSymbols_kl', 'goog.i18n.NumberFormatSymbols_kl_GL', 'goog.i18n.NumberFormatSymbols_kln', 'goog.i18n.NumberFormatSymbols_kln_KE', 'goog.i18n.NumberFormatSymbols_ko_KP', 'goog.i18n.NumberFormatSymbols_kok', 'goog.i18n.NumberFormatSymbols_kok_IN', 'goog.i18n.NumberFormatSymbols_ks', 'goog.i18n.NumberFormatSymbols_ks_Arab', 'goog.i18n.NumberFormatSymbols_ks_Arab_IN', 'goog.i18n.NumberFormatSymbols_ksb', 'goog.i18n.NumberFormatSymbols_ksb_TZ', 'goog.i18n.NumberFormatSymbols_ksf', 'goog.i18n.NumberFormatSymbols_ksf_CM', 'goog.i18n.NumberFormatSymbols_ksh', 'goog.i18n.NumberFormatSymbols_ksh_DE', 'goog.i18n.NumberFormatSymbols_kw', 'goog.i18n.NumberFormatSymbols_kw_GB', 'goog.i18n.NumberFormatSymbols_ky_Cyrl', 'goog.i18n.NumberFormatSymbols_lag', 'goog.i18n.NumberFormatSymbols_lag_TZ', 'goog.i18n.NumberFormatSymbols_lg', 'goog.i18n.NumberFormatSymbols_lg_UG', 'goog.i18n.NumberFormatSymbols_lkt', 'goog.i18n.NumberFormatSymbols_lkt_US', 'goog.i18n.NumberFormatSymbols_ln_AO', 'goog.i18n.NumberFormatSymbols_ln_CF', 'goog.i18n.NumberFormatSymbols_ln_CG', 'goog.i18n.NumberFormatSymbols_lu', 'goog.i18n.NumberFormatSymbols_lu_CD', 'goog.i18n.NumberFormatSymbols_luo', 'goog.i18n.NumberFormatSymbols_luo_KE', 'goog.i18n.NumberFormatSymbols_luy', 'goog.i18n.NumberFormatSymbols_luy_KE', 'goog.i18n.NumberFormatSymbols_mas', 'goog.i18n.NumberFormatSymbols_mas_KE', 'goog.i18n.NumberFormatSymbols_mas_TZ', 'goog.i18n.NumberFormatSymbols_mer', 'goog.i18n.NumberFormatSymbols_mer_KE', 'goog.i18n.NumberFormatSymbols_mfe', 'goog.i18n.NumberFormatSymbols_mfe_MU', 'goog.i18n.NumberFormatSymbols_mg', 'goog.i18n.NumberFormatSymbols_mg_MG', 'goog.i18n.NumberFormatSymbols_mgh', 'goog.i18n.NumberFormatSymbols_mgh_MZ', 'goog.i18n.NumberFormatSymbols_mgo', 'goog.i18n.NumberFormatSymbols_mgo_CM', 'goog.i18n.NumberFormatSymbols_mn_Cyrl', 'goog.i18n.NumberFormatSymbols_ms_Latn', 'goog.i18n.NumberFormatSymbols_ms_Latn_BN', 'goog.i18n.NumberFormatSymbols_ms_Latn_SG', 'goog.i18n.NumberFormatSymbols_mua', 'goog.i18n.NumberFormatSymbols_mua_CM', 'goog.i18n.NumberFormatSymbols_naq', 'goog.i18n.NumberFormatSymbols_naq_NA', 'goog.i18n.NumberFormatSymbols_nd', 'goog.i18n.NumberFormatSymbols_nd_ZW', 'goog.i18n.NumberFormatSymbols_ne_IN', 'goog.i18n.NumberFormatSymbols_nl_AW', 'goog.i18n.NumberFormatSymbols_nl_BE', 'goog.i18n.NumberFormatSymbols_nl_BQ', 'goog.i18n.NumberFormatSymbols_nl_CW', 'goog.i18n.NumberFormatSymbols_nl_SR', 'goog.i18n.NumberFormatSymbols_nl_SX', 'goog.i18n.NumberFormatSymbols_nmg', 'goog.i18n.NumberFormatSymbols_nmg_CM', 'goog.i18n.NumberFormatSymbols_nn', 'goog.i18n.NumberFormatSymbols_nn_NO', 'goog.i18n.NumberFormatSymbols_nnh', 'goog.i18n.NumberFormatSymbols_nnh_CM', 'goog.i18n.NumberFormatSymbols_nr', 'goog.i18n.NumberFormatSymbols_nr_ZA', 'goog.i18n.NumberFormatSymbols_nso', 'goog.i18n.NumberFormatSymbols_nso_ZA', 'goog.i18n.NumberFormatSymbols_nus', 'goog.i18n.NumberFormatSymbols_nus_SD', 'goog.i18n.NumberFormatSymbols_nyn', 'goog.i18n.NumberFormatSymbols_nyn_UG', 'goog.i18n.NumberFormatSymbols_om', 'goog.i18n.NumberFormatSymbols_om_ET', 'goog.i18n.NumberFormatSymbols_om_KE', 'goog.i18n.NumberFormatSymbols_os', 'goog.i18n.NumberFormatSymbols_os_GE', 'goog.i18n.NumberFormatSymbols_os_RU', 'goog.i18n.NumberFormatSymbols_pa_Arab', 'goog.i18n.NumberFormatSymbols_pa_Arab_PK', 'goog.i18n.NumberFormatSymbols_pa_Guru', 'goog.i18n.NumberFormatSymbols_ps', 'goog.i18n.NumberFormatSymbols_ps_AF', 'goog.i18n.NumberFormatSymbols_pt_AO', 'goog.i18n.NumberFormatSymbols_pt_CV', 'goog.i18n.NumberFormatSymbols_pt_GW', 'goog.i18n.NumberFormatSymbols_pt_MO', 'goog.i18n.NumberFormatSymbols_pt_MZ', 'goog.i18n.NumberFormatSymbols_pt_ST', 'goog.i18n.NumberFormatSymbols_pt_TL', 'goog.i18n.NumberFormatSymbols_rm', 'goog.i18n.NumberFormatSymbols_rm_CH', 'goog.i18n.NumberFormatSymbols_rn', 'goog.i18n.NumberFormatSymbols_rn_BI', 'goog.i18n.NumberFormatSymbols_ro_MD', 'goog.i18n.NumberFormatSymbols_rof', 'goog.i18n.NumberFormatSymbols_rof_TZ', 'goog.i18n.NumberFormatSymbols_ru_BY', 'goog.i18n.NumberFormatSymbols_ru_KG', 'goog.i18n.NumberFormatSymbols_ru_KZ', 'goog.i18n.NumberFormatSymbols_ru_MD', 'goog.i18n.NumberFormatSymbols_ru_UA', 'goog.i18n.NumberFormatSymbols_rw', 'goog.i18n.NumberFormatSymbols_rw_RW', 'goog.i18n.NumberFormatSymbols_rwk', 'goog.i18n.NumberFormatSymbols_rwk_TZ', 'goog.i18n.NumberFormatSymbols_sah', 'goog.i18n.NumberFormatSymbols_sah_RU', 'goog.i18n.NumberFormatSymbols_saq', 'goog.i18n.NumberFormatSymbols_saq_KE', 'goog.i18n.NumberFormatSymbols_sbp', 'goog.i18n.NumberFormatSymbols_sbp_TZ', 'goog.i18n.NumberFormatSymbols_se', 'goog.i18n.NumberFormatSymbols_se_FI', 'goog.i18n.NumberFormatSymbols_se_NO', 'goog.i18n.NumberFormatSymbols_seh', 'goog.i18n.NumberFormatSymbols_seh_MZ', 'goog.i18n.NumberFormatSymbols_ses', 'goog.i18n.NumberFormatSymbols_ses_ML', 'goog.i18n.NumberFormatSymbols_sg', 'goog.i18n.NumberFormatSymbols_sg_CF', 'goog.i18n.NumberFormatSymbols_shi', 'goog.i18n.NumberFormatSymbols_shi_Latn', 'goog.i18n.NumberFormatSymbols_shi_Latn_MA', 'goog.i18n.NumberFormatSymbols_shi_Tfng', 'goog.i18n.NumberFormatSymbols_shi_Tfng_MA', 'goog.i18n.NumberFormatSymbols_sn', 'goog.i18n.NumberFormatSymbols_sn_ZW', 'goog.i18n.NumberFormatSymbols_so', 'goog.i18n.NumberFormatSymbols_so_DJ', 'goog.i18n.NumberFormatSymbols_so_ET', 'goog.i18n.NumberFormatSymbols_so_KE', 'goog.i18n.NumberFormatSymbols_so_SO', 'goog.i18n.NumberFormatSymbols_sq_MK', 'goog.i18n.NumberFormatSymbols_sq_XK', 'goog.i18n.NumberFormatSymbols_sr_Cyrl', 'goog.i18n.NumberFormatSymbols_sr_Cyrl_BA', 'goog.i18n.NumberFormatSymbols_sr_Cyrl_ME', 'goog.i18n.NumberFormatSymbols_sr_Cyrl_XK', 'goog.i18n.NumberFormatSymbols_sr_Latn', 'goog.i18n.NumberFormatSymbols_sr_Latn_BA', 'goog.i18n.NumberFormatSymbols_sr_Latn_ME', 'goog.i18n.NumberFormatSymbols_sr_Latn_RS', 'goog.i18n.NumberFormatSymbols_sr_Latn_XK', 'goog.i18n.NumberFormatSymbols_ss', 'goog.i18n.NumberFormatSymbols_ss_SZ', 'goog.i18n.NumberFormatSymbols_ss_ZA', 'goog.i18n.NumberFormatSymbols_ssy', 'goog.i18n.NumberFormatSymbols_ssy_ER', 'goog.i18n.NumberFormatSymbols_st', 'goog.i18n.NumberFormatSymbols_st_LS', 'goog.i18n.NumberFormatSymbols_st_ZA', 'goog.i18n.NumberFormatSymbols_sv_AX', 'goog.i18n.NumberFormatSymbols_sv_FI', 'goog.i18n.NumberFormatSymbols_sw_KE', 'goog.i18n.NumberFormatSymbols_sw_UG', 'goog.i18n.NumberFormatSymbols_swc', 'goog.i18n.NumberFormatSymbols_swc_CD', 'goog.i18n.NumberFormatSymbols_ta_LK', 'goog.i18n.NumberFormatSymbols_ta_MY', 'goog.i18n.NumberFormatSymbols_ta_SG', 'goog.i18n.NumberFormatSymbols_teo', 'goog.i18n.NumberFormatSymbols_teo_KE', 'goog.i18n.NumberFormatSymbols_teo_UG', 'goog.i18n.NumberFormatSymbols_tg', 'goog.i18n.NumberFormatSymbols_tg_Cyrl', 'goog.i18n.NumberFormatSymbols_tg_Cyrl_TJ', 'goog.i18n.NumberFormatSymbols_ti', 'goog.i18n.NumberFormatSymbols_ti_ER', 'goog.i18n.NumberFormatSymbols_ti_ET', 'goog.i18n.NumberFormatSymbols_tig', 'goog.i18n.NumberFormatSymbols_tig_ER', 'goog.i18n.NumberFormatSymbols_tn', 'goog.i18n.NumberFormatSymbols_tn_BW', 'goog.i18n.NumberFormatSymbols_tn_ZA', 'goog.i18n.NumberFormatSymbols_to', 'goog.i18n.NumberFormatSymbols_to_TO', 'goog.i18n.NumberFormatSymbols_tr_CY', 'goog.i18n.NumberFormatSymbols_ts', 'goog.i18n.NumberFormatSymbols_ts_ZA', 'goog.i18n.NumberFormatSymbols_twq', 'goog.i18n.NumberFormatSymbols_twq_NE', 'goog.i18n.NumberFormatSymbols_tzm', 'goog.i18n.NumberFormatSymbols_tzm_Latn', 'goog.i18n.NumberFormatSymbols_tzm_Latn_MA', 'goog.i18n.NumberFormatSymbols_ug', 'goog.i18n.NumberFormatSymbols_ug_Arab', 'goog.i18n.NumberFormatSymbols_ug_Arab_CN', 'goog.i18n.NumberFormatSymbols_ur_IN', 'goog.i18n.NumberFormatSymbols_uz_Arab', 'goog.i18n.NumberFormatSymbols_uz_Arab_AF', 'goog.i18n.NumberFormatSymbols_uz_Cyrl', 'goog.i18n.NumberFormatSymbols_uz_Cyrl_UZ', 'goog.i18n.NumberFormatSymbols_uz_Latn', 'goog.i18n.NumberFormatSymbols_vai', 'goog.i18n.NumberFormatSymbols_vai_Latn', 'goog.i18n.NumberFormatSymbols_vai_Latn_LR', 'goog.i18n.NumberFormatSymbols_vai_Vaii', 'goog.i18n.NumberFormatSymbols_vai_Vaii_LR', 'goog.i18n.NumberFormatSymbols_ve', 'goog.i18n.NumberFormatSymbols_ve_ZA', 'goog.i18n.NumberFormatSymbols_vo', 'goog.i18n.NumberFormatSymbols_vo_001', 'goog.i18n.NumberFormatSymbols_vun', 'goog.i18n.NumberFormatSymbols_vun_TZ', 'goog.i18n.NumberFormatSymbols_wae', 'goog.i18n.NumberFormatSymbols_wae_CH', 'goog.i18n.NumberFormatSymbols_wal', 'goog.i18n.NumberFormatSymbols_wal_ET', 'goog.i18n.NumberFormatSymbols_xh', 'goog.i18n.NumberFormatSymbols_xh_ZA', 'goog.i18n.NumberFormatSymbols_xog', 'goog.i18n.NumberFormatSymbols_xog_UG', 'goog.i18n.NumberFormatSymbols_yav', 'goog.i18n.NumberFormatSymbols_yav_CM', 'goog.i18n.NumberFormatSymbols_yo', 'goog.i18n.NumberFormatSymbols_yo_BJ', 'goog.i18n.NumberFormatSymbols_yo_NG', 'goog.i18n.NumberFormatSymbols_zgh', 'goog.i18n.NumberFormatSymbols_zgh_MA', 'goog.i18n.NumberFormatSymbols_zh_Hans', 'goog.i18n.NumberFormatSymbols_zh_Hans_HK', 'goog.i18n.NumberFormatSymbols_zh_Hans_MO', 'goog.i18n.NumberFormatSymbols_zh_Hans_SG', 'goog.i18n.NumberFormatSymbols_zh_Hant', 'goog.i18n.NumberFormatSymbols_zh_Hant_HK', 'goog.i18n.NumberFormatSymbols_zh_Hant_MO', 'goog.i18n.NumberFormatSymbols_zh_Hant_TW'], ['goog.i18n.NumberFormatSymbols']);
goog.addDependency('i18n/ordinalrules.js', ['goog.i18n.ordinalRules'], []);
goog.addDependency('i18n/pluralrules.js', ['goog.i18n.pluralRules'], []);
goog.addDependency('i18n/pluralrules_test.js', ['goog.i18n.pluralRulesTest'], ['goog.i18n.pluralRules', 'goog.testing.jsunit']);
goog.addDependency('i18n/timezone.js', ['goog.i18n.TimeZone'], ['goog.array', 'goog.date.DateLike', 'goog.string']);
goog.addDependency('i18n/timezone_test.js', ['goog.i18n.TimeZoneTest'], ['goog.i18n.TimeZone', 'goog.testing.jsunit']);
goog.addDependency('i18n/uchar.js', ['goog.i18n.uChar'], []);
goog.addDependency('i18n/uchar/localnamefetcher.js', ['goog.i18n.uChar.LocalNameFetcher'], ['goog.i18n.uChar', 'goog.i18n.uChar.NameFetcher', 'goog.log']);
goog.addDependency('i18n/uchar/localnamefetcher_test.js', ['goog.i18n.uChar.LocalNameFetcherTest'], ['goog.i18n.uChar.LocalNameFetcher', 'goog.testing.jsunit', 'goog.testing.recordFunction']);
goog.addDependency('i18n/uchar/namefetcher.js', ['goog.i18n.uChar.NameFetcher'], []);
goog.addDependency('i18n/uchar/remotenamefetcher.js', ['goog.i18n.uChar.RemoteNameFetcher'], ['goog.Disposable', 'goog.Uri', 'goog.i18n.uChar', 'goog.i18n.uChar.NameFetcher', 'goog.log', 'goog.net.XhrIo', 'goog.structs.Map']);
goog.addDependency('i18n/uchar/remotenamefetcher_test.js', ['goog.i18n.uChar.RemoteNameFetcherTest'], ['goog.i18n.uChar.RemoteNameFetcher', 'goog.net.XhrIo', 'goog.testing.jsunit', 'goog.testing.net.XhrIo', 'goog.testing.recordFunction']);
goog.addDependency('i18n/uchar_test.js', ['goog.i18n.uCharTest'], ['goog.i18n.uChar', 'goog.testing.jsunit']);
goog.addDependency('iter/iter.js', ['goog.iter', 'goog.iter.Iterable', 'goog.iter.Iterator', 'goog.iter.StopIteration'], ['goog.array', 'goog.asserts', 'goog.functions', 'goog.math']);
goog.addDependency('iter/iter_test.js', ['goog.iterTest'], ['goog.iter', 'goog.iter.Iterator', 'goog.iter.StopIteration', 'goog.testing.jsunit']);
goog.addDependency('json/evaljsonprocessor.js', ['goog.json.EvalJsonProcessor'], ['goog.json', 'goog.json.Processor', 'goog.json.Serializer']);
goog.addDependency('json/hybrid.js', ['goog.json.hybrid'], ['goog.asserts', 'goog.json']);
goog.addDependency('json/hybrid_test.js', ['goog.json.hybridTest'], ['goog.json', 'goog.json.hybrid', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit', 'goog.testing.recordFunction', 'goog.userAgent']);
goog.addDependency('json/hybridjsonprocessor.js', ['goog.json.HybridJsonProcessor'], ['goog.json.Processor', 'goog.json.hybrid']);
goog.addDependency('json/hybridjsonprocessor_test.js', ['goog.json.HybridJsonProcessorTest'], ['goog.json.HybridJsonProcessor', 'goog.json.hybrid', 'goog.testing.jsunit']);
goog.addDependency('json/json.js', ['goog.json', 'goog.json.Replacer', 'goog.json.Reviver', 'goog.json.Serializer'], []);
goog.addDependency('json/json_perf.js', ['goog.jsonPerf'], ['goog.dom', 'goog.json', 'goog.math', 'goog.string', 'goog.testing.PerformanceTable', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit']);
goog.addDependency('json/json_test.js', ['goog.jsonTest'], ['goog.functions', 'goog.json', 'goog.testing.jsunit', 'goog.userAgent']);
goog.addDependency('json/nativejsonprocessor.js', ['goog.json.NativeJsonProcessor'], ['goog.asserts', 'goog.json', 'goog.json.Processor']);
goog.addDependency('json/processor.js', ['goog.json.Processor'], ['goog.string.Parser', 'goog.string.Stringifier']);
goog.addDependency('json/processor_test.js', ['goog.json.processorTest'], ['goog.json.EvalJsonProcessor', 'goog.json.NativeJsonProcessor', 'goog.testing.jsunit', 'goog.userAgent']);
goog.addDependency('labs/dom/pagevisibilitymonitor.js', ['goog.labs.dom.PageVisibilityEvent', 'goog.labs.dom.PageVisibilityMonitor', 'goog.labs.dom.PageVisibilityState'], ['goog.dom', 'goog.dom.vendor', 'goog.events', 'goog.events.Event', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.memoize']);
goog.addDependency('labs/dom/pagevisibilitymonitor_test.js', ['goog.labs.dom.PageVisibilityMonitorTest'], ['goog.events', 'goog.functions', 'goog.labs.dom.PageVisibilityMonitor', 'goog.testing.PropertyReplacer', 'goog.testing.events', 'goog.testing.events.Event', 'goog.testing.jsunit', 'goog.testing.recordFunction']);
goog.addDependency('labs/events/nondisposableeventtarget.js', ['goog.labs.events.NonDisposableEventTarget'], ['goog.array', 'goog.asserts', 'goog.events.Event', 'goog.events.Listenable', 'goog.events.ListenerMap', 'goog.object']);
goog.addDependency('labs/events/nondisposableeventtarget_test.js', ['goog.labs.events.NonDisposableEventTargetTest'], ['goog.events.Listenable', 'goog.events.eventTargetTester', 'goog.events.eventTargetTester.KeyType', 'goog.events.eventTargetTester.UnlistenReturnType', 'goog.labs.events.NonDisposableEventTarget', 'goog.testing.jsunit']);
goog.addDependency('labs/events/nondisposableeventtarget_via_googevents_test.js', ['goog.labs.events.NonDisposableEventTargetGoogEventsTest'], ['goog.events', 'goog.events.eventTargetTester', 'goog.events.eventTargetTester.KeyType', 'goog.events.eventTargetTester.UnlistenReturnType', 'goog.labs.events.NonDisposableEventTarget', 'goog.object', 'goog.testing', 'goog.testing.jsunit']);
goog.addDependency('labs/events/touch.js', ['goog.labs.events.touch', 'goog.labs.events.touch.TouchData'], ['goog.array', 'goog.asserts', 'goog.events.EventType', 'goog.string']);
goog.addDependency('labs/events/touch_test.js', ['goog.labs.events.touchTest'], ['goog.labs.events.touch', 'goog.testing.jsunit']);
goog.addDependency('labs/format/csv.js', ['goog.labs.format.csv', 'goog.labs.format.csv.ParseError', 'goog.labs.format.csv.Token'], ['goog.array', 'goog.asserts', 'goog.debug.Error', 'goog.object', 'goog.string', 'goog.string.newlines']);
goog.addDependency('labs/format/csv_test.js', ['goog.labs.format.csvTest'], ['goog.labs.format.csv', 'goog.labs.format.csv.ParseError', 'goog.object', 'goog.testing.asserts', 'goog.testing.jsunit']);
goog.addDependency('labs/html/attribute_rewriter.js', ['goog.labs.html.AttributeRewriter', 'goog.labs.html.AttributeValue', 'goog.labs.html.attributeRewriterPresubmitWorkaround'], []);
goog.addDependency('labs/html/sanitizer.js', ['goog.labs.html.Sanitizer'], ['goog.asserts', 'goog.html.SafeUrl', 'goog.labs.html.attributeRewriterPresubmitWorkaround', 'goog.labs.html.scrubber', 'goog.object', 'goog.string']);
goog.addDependency('labs/html/sanitizer_test.js', ['goog.labs.html.SanitizerTest'], ['goog.html.SafeUrl', 'goog.labs.html.Sanitizer', 'goog.string', 'goog.string.Const', 'goog.testing.jsunit']);
goog.addDependency('labs/html/scrubber.js', ['goog.labs.html.scrubber'], ['goog.array', 'goog.dom.tags', 'goog.labs.html.attributeRewriterPresubmitWorkaround', 'goog.string']);
goog.addDependency('labs/html/scrubber_test.js', ['goog.html.ScrubberTest'], ['goog.labs.html.scrubber', 'goog.object', 'goog.string', 'goog.testing.jsunit']);
goog.addDependency('labs/i18n/listformat.js', ['goog.labs.i18n.GenderInfo', 'goog.labs.i18n.GenderInfo.Gender', 'goog.labs.i18n.ListFormat'], ['goog.asserts', 'goog.labs.i18n.ListFormatSymbols']);
goog.addDependency('labs/i18n/listformat_test.js', ['goog.labs.i18n.ListFormatTest'], ['goog.labs.i18n.GenderInfo', 'goog.labs.i18n.ListFormat', 'goog.labs.i18n.ListFormatSymbols', 'goog.labs.i18n.ListFormatSymbols_el', 'goog.labs.i18n.ListFormatSymbols_en', 'goog.labs.i18n.ListFormatSymbols_fr', 'goog.labs.i18n.ListFormatSymbols_ml', 'goog.labs.i18n.ListFormatSymbols_zu', 'goog.testing.jsunit']);
goog.addDependency('labs/i18n/listsymbols.js', ['goog.labs.i18n.ListFormatSymbols', 'goog.labs.i18n.ListFormatSymbols_af', 'goog.labs.i18n.ListFormatSymbols_am', 'goog.labs.i18n.ListFormatSymbols_ar', 'goog.labs.i18n.ListFormatSymbols_az', 'goog.labs.i18n.ListFormatSymbols_bg', 'goog.labs.i18n.ListFormatSymbols_bn', 'goog.labs.i18n.ListFormatSymbols_br', 'goog.labs.i18n.ListFormatSymbols_ca', 'goog.labs.i18n.ListFormatSymbols_chr', 'goog.labs.i18n.ListFormatSymbols_cs', 'goog.labs.i18n.ListFormatSymbols_cy', 'goog.labs.i18n.ListFormatSymbols_da', 'goog.labs.i18n.ListFormatSymbols_de', 'goog.labs.i18n.ListFormatSymbols_de_AT', 'goog.labs.i18n.ListFormatSymbols_de_CH', 'goog.labs.i18n.ListFormatSymbols_el', 'goog.labs.i18n.ListFormatSymbols_en', 'goog.labs.i18n.ListFormatSymbols_en_AU', 'goog.labs.i18n.ListFormatSymbols_en_GB', 'goog.labs.i18n.ListFormatSymbols_en_IE', 'goog.labs.i18n.ListFormatSymbols_en_IN', 'goog.labs.i18n.ListFormatSymbols_en_ISO', 'goog.labs.i18n.ListFormatSymbols_en_SG', 'goog.labs.i18n.ListFormatSymbols_en_US', 'goog.labs.i18n.ListFormatSymbols_en_ZA', 'goog.labs.i18n.ListFormatSymbols_es', 'goog.labs.i18n.ListFormatSymbols_es_419', 'goog.labs.i18n.ListFormatSymbols_es_ES', 'goog.labs.i18n.ListFormatSymbols_et', 'goog.labs.i18n.ListFormatSymbols_eu', 'goog.labs.i18n.ListFormatSymbols_fa', 'goog.labs.i18n.ListFormatSymbols_fi', 'goog.labs.i18n.ListFormatSymbols_fil', 'goog.labs.i18n.ListFormatSymbols_fr', 'goog.labs.i18n.ListFormatSymbols_fr_CA', 'goog.labs.i18n.ListFormatSymbols_gl', 'goog.labs.i18n.ListFormatSymbols_gsw', 'goog.labs.i18n.ListFormatSymbols_gu', 'goog.labs.i18n.ListFormatSymbols_haw', 'goog.labs.i18n.ListFormatSymbols_he', 'goog.labs.i18n.ListFormatSymbols_hi', 'goog.labs.i18n.ListFormatSymbols_hr', 'goog.labs.i18n.ListFormatSymbols_hu', 'goog.labs.i18n.ListFormatSymbols_hy', 'goog.labs.i18n.ListFormatSymbols_id', 'goog.labs.i18n.ListFormatSymbols_in', 'goog.labs.i18n.ListFormatSymbols_is', 'goog.labs.i18n.ListFormatSymbols_it', 'goog.labs.i18n.ListFormatSymbols_iw', 'goog.labs.i18n.ListFormatSymbols_ja', 'goog.labs.i18n.ListFormatSymbols_ka', 'goog.labs.i18n.ListFormatSymbols_kk', 'goog.labs.i18n.ListFormatSymbols_km', 'goog.labs.i18n.ListFormatSymbols_kn', 'goog.labs.i18n.ListFormatSymbols_ko', 'goog.labs.i18n.ListFormatSymbols_ky', 'goog.labs.i18n.ListFormatSymbols_ln', 'goog.labs.i18n.ListFormatSymbols_lo', 'goog.labs.i18n.ListFormatSymbols_lt', 'goog.labs.i18n.ListFormatSymbols_lv', 'goog.labs.i18n.ListFormatSymbols_mk', 'goog.labs.i18n.ListFormatSymbols_ml', 'goog.labs.i18n.ListFormatSymbols_mn', 'goog.labs.i18n.ListFormatSymbols_mo', 'goog.labs.i18n.ListFormatSymbols_mr', 'goog.labs.i18n.ListFormatSymbols_ms', 'goog.labs.i18n.ListFormatSymbols_mt', 'goog.labs.i18n.ListFormatSymbols_my', 'goog.labs.i18n.ListFormatSymbols_nb', 'goog.labs.i18n.ListFormatSymbols_ne', 'goog.labs.i18n.ListFormatSymbols_nl', 'goog.labs.i18n.ListFormatSymbols_no', 'goog.labs.i18n.ListFormatSymbols_no_NO', 'goog.labs.i18n.ListFormatSymbols_or', 'goog.labs.i18n.ListFormatSymbols_pa', 'goog.labs.i18n.ListFormatSymbols_pl', 'goog.labs.i18n.ListFormatSymbols_pt', 'goog.labs.i18n.ListFormatSymbols_pt_BR', 'goog.labs.i18n.ListFormatSymbols_pt_PT', 'goog.labs.i18n.ListFormatSymbols_ro', 'goog.labs.i18n.ListFormatSymbols_ru', 'goog.labs.i18n.ListFormatSymbols_sh', 'goog.labs.i18n.ListFormatSymbols_si', 'goog.labs.i18n.ListFormatSymbols_sk', 'goog.labs.i18n.ListFormatSymbols_sl', 'goog.labs.i18n.ListFormatSymbols_sq', 'goog.labs.i18n.ListFormatSymbols_sr', 'goog.labs.i18n.ListFormatSymbols_sv', 'goog.labs.i18n.ListFormatSymbols_sw', 'goog.labs.i18n.ListFormatSymbols_ta', 'goog.labs.i18n.ListFormatSymbols_te', 'goog.labs.i18n.ListFormatSymbols_th', 'goog.labs.i18n.ListFormatSymbols_tl', 'goog.labs.i18n.ListFormatSymbols_tr', 'goog.labs.i18n.ListFormatSymbols_uk', 'goog.labs.i18n.ListFormatSymbols_ur', 'goog.labs.i18n.ListFormatSymbols_uz', 'goog.labs.i18n.ListFormatSymbols_vi', 'goog.labs.i18n.ListFormatSymbols_zh', 'goog.labs.i18n.ListFormatSymbols_zh_CN', 'goog.labs.i18n.ListFormatSymbols_zh_HK', 'goog.labs.i18n.ListFormatSymbols_zh_TW', 'goog.labs.i18n.ListFormatSymbols_zu'], []);
goog.addDependency('labs/i18n/listsymbolsext.js', ['goog.labs.i18n.ListFormatSymbolsExt', 'goog.labs.i18n.ListFormatSymbols_af_NA', 'goog.labs.i18n.ListFormatSymbols_af_ZA', 'goog.labs.i18n.ListFormatSymbols_agq', 'goog.labs.i18n.ListFormatSymbols_agq_CM', 'goog.labs.i18n.ListFormatSymbols_ak', 'goog.labs.i18n.ListFormatSymbols_ak_GH', 'goog.labs.i18n.ListFormatSymbols_am_ET', 'goog.labs.i18n.ListFormatSymbols_ar_001', 'goog.labs.i18n.ListFormatSymbols_ar_AE', 'goog.labs.i18n.ListFormatSymbols_ar_BH', 'goog.labs.i18n.ListFormatSymbols_ar_DJ', 'goog.labs.i18n.ListFormatSymbols_ar_DZ', 'goog.labs.i18n.ListFormatSymbols_ar_EG', 'goog.labs.i18n.ListFormatSymbols_ar_EH', 'goog.labs.i18n.ListFormatSymbols_ar_ER', 'goog.labs.i18n.ListFormatSymbols_ar_IL', 'goog.labs.i18n.ListFormatSymbols_ar_IQ', 'goog.labs.i18n.ListFormatSymbols_ar_JO', 'goog.labs.i18n.ListFormatSymbols_ar_KM', 'goog.labs.i18n.ListFormatSymbols_ar_KW', 'goog.labs.i18n.ListFormatSymbols_ar_LB', 'goog.labs.i18n.ListFormatSymbols_ar_LY', 'goog.labs.i18n.ListFormatSymbols_ar_MA', 'goog.labs.i18n.ListFormatSymbols_ar_MR', 'goog.labs.i18n.ListFormatSymbols_ar_OM', 'goog.labs.i18n.ListFormatSymbols_ar_PS', 'goog.labs.i18n.ListFormatSymbols_ar_QA', 'goog.labs.i18n.ListFormatSymbols_ar_SA', 'goog.labs.i18n.ListFormatSymbols_ar_SD', 'goog.labs.i18n.ListFormatSymbols_ar_SO', 'goog.labs.i18n.ListFormatSymbols_ar_SS', 'goog.labs.i18n.ListFormatSymbols_ar_SY', 'goog.labs.i18n.ListFormatSymbols_ar_TD', 'goog.labs.i18n.ListFormatSymbols_ar_TN', 'goog.labs.i18n.ListFormatSymbols_ar_YE', 'goog.labs.i18n.ListFormatSymbols_as', 'goog.labs.i18n.ListFormatSymbols_as_IN', 'goog.labs.i18n.ListFormatSymbols_asa', 'goog.labs.i18n.ListFormatSymbols_asa_TZ', 'goog.labs.i18n.ListFormatSymbols_az_Cyrl', 'goog.labs.i18n.ListFormatSymbols_az_Cyrl_AZ', 'goog.labs.i18n.ListFormatSymbols_az_Latn', 'goog.labs.i18n.ListFormatSymbols_az_Latn_AZ', 'goog.labs.i18n.ListFormatSymbols_bas', 'goog.labs.i18n.ListFormatSymbols_bas_CM', 'goog.labs.i18n.ListFormatSymbols_be', 'goog.labs.i18n.ListFormatSymbols_be_BY', 'goog.labs.i18n.ListFormatSymbols_bem', 'goog.labs.i18n.ListFormatSymbols_bem_ZM', 'goog.labs.i18n.ListFormatSymbols_bez', 'goog.labs.i18n.ListFormatSymbols_bez_TZ', 'goog.labs.i18n.ListFormatSymbols_bg_BG', 'goog.labs.i18n.ListFormatSymbols_bm', 'goog.labs.i18n.ListFormatSymbols_bm_ML', 'goog.labs.i18n.ListFormatSymbols_bn_BD', 'goog.labs.i18n.ListFormatSymbols_bn_IN', 'goog.labs.i18n.ListFormatSymbols_bo', 'goog.labs.i18n.ListFormatSymbols_bo_CN', 'goog.labs.i18n.ListFormatSymbols_bo_IN', 'goog.labs.i18n.ListFormatSymbols_br_FR', 'goog.labs.i18n.ListFormatSymbols_brx', 'goog.labs.i18n.ListFormatSymbols_brx_IN', 'goog.labs.i18n.ListFormatSymbols_bs', 'goog.labs.i18n.ListFormatSymbols_bs_Cyrl', 'goog.labs.i18n.ListFormatSymbols_bs_Cyrl_BA', 'goog.labs.i18n.ListFormatSymbols_bs_Latn', 'goog.labs.i18n.ListFormatSymbols_bs_Latn_BA', 'goog.labs.i18n.ListFormatSymbols_ca_AD', 'goog.labs.i18n.ListFormatSymbols_ca_ES', 'goog.labs.i18n.ListFormatSymbols_ca_FR', 'goog.labs.i18n.ListFormatSymbols_ca_IT', 'goog.labs.i18n.ListFormatSymbols_cgg', 'goog.labs.i18n.ListFormatSymbols_cgg_UG', 'goog.labs.i18n.ListFormatSymbols_chr_US', 'goog.labs.i18n.ListFormatSymbols_cs_CZ', 'goog.labs.i18n.ListFormatSymbols_cy_GB', 'goog.labs.i18n.ListFormatSymbols_da_DK', 'goog.labs.i18n.ListFormatSymbols_da_GL', 'goog.labs.i18n.ListFormatSymbols_dav', 'goog.labs.i18n.ListFormatSymbols_dav_KE', 'goog.labs.i18n.ListFormatSymbols_de_BE', 'goog.labs.i18n.ListFormatSymbols_de_DE', 'goog.labs.i18n.ListFormatSymbols_de_LI', 'goog.labs.i18n.ListFormatSymbols_de_LU', 'goog.labs.i18n.ListFormatSymbols_dje', 'goog.labs.i18n.ListFormatSymbols_dje_NE', 'goog.labs.i18n.ListFormatSymbols_dua', 'goog.labs.i18n.ListFormatSymbols_dua_CM', 'goog.labs.i18n.ListFormatSymbols_dyo', 'goog.labs.i18n.ListFormatSymbols_dyo_SN', 'goog.labs.i18n.ListFormatSymbols_dz', 'goog.labs.i18n.ListFormatSymbols_dz_BT', 'goog.labs.i18n.ListFormatSymbols_ebu', 'goog.labs.i18n.ListFormatSymbols_ebu_KE', 'goog.labs.i18n.ListFormatSymbols_ee', 'goog.labs.i18n.ListFormatSymbols_ee_GH', 'goog.labs.i18n.ListFormatSymbols_ee_TG', 'goog.labs.i18n.ListFormatSymbols_el_CY', 'goog.labs.i18n.ListFormatSymbols_el_GR', 'goog.labs.i18n.ListFormatSymbols_en_001', 'goog.labs.i18n.ListFormatSymbols_en_150', 'goog.labs.i18n.ListFormatSymbols_en_AG', 'goog.labs.i18n.ListFormatSymbols_en_AI', 'goog.labs.i18n.ListFormatSymbols_en_AS', 'goog.labs.i18n.ListFormatSymbols_en_BB', 'goog.labs.i18n.ListFormatSymbols_en_BE', 'goog.labs.i18n.ListFormatSymbols_en_BM', 'goog.labs.i18n.ListFormatSymbols_en_BS', 'goog.labs.i18n.ListFormatSymbols_en_BW', 'goog.labs.i18n.ListFormatSymbols_en_BZ', 'goog.labs.i18n.ListFormatSymbols_en_CA', 'goog.labs.i18n.ListFormatSymbols_en_CC', 'goog.labs.i18n.ListFormatSymbols_en_CK', 'goog.labs.i18n.ListFormatSymbols_en_CM', 'goog.labs.i18n.ListFormatSymbols_en_CX', 'goog.labs.i18n.ListFormatSymbols_en_DG', 'goog.labs.i18n.ListFormatSymbols_en_DM', 'goog.labs.i18n.ListFormatSymbols_en_ER', 'goog.labs.i18n.ListFormatSymbols_en_FJ', 'goog.labs.i18n.ListFormatSymbols_en_FK', 'goog.labs.i18n.ListFormatSymbols_en_FM', 'goog.labs.i18n.ListFormatSymbols_en_GD', 'goog.labs.i18n.ListFormatSymbols_en_GG', 'goog.labs.i18n.ListFormatSymbols_en_GH', 'goog.labs.i18n.ListFormatSymbols_en_GI', 'goog.labs.i18n.ListFormatSymbols_en_GM', 'goog.labs.i18n.ListFormatSymbols_en_GU', 'goog.labs.i18n.ListFormatSymbols_en_GY', 'goog.labs.i18n.ListFormatSymbols_en_HK', 'goog.labs.i18n.ListFormatSymbols_en_IM', 'goog.labs.i18n.ListFormatSymbols_en_IO', 'goog.labs.i18n.ListFormatSymbols_en_JE', 'goog.labs.i18n.ListFormatSymbols_en_JM', 'goog.labs.i18n.ListFormatSymbols_en_KE', 'goog.labs.i18n.ListFormatSymbols_en_KI', 'goog.labs.i18n.ListFormatSymbols_en_KN', 'goog.labs.i18n.ListFormatSymbols_en_KY', 'goog.labs.i18n.ListFormatSymbols_en_LC', 'goog.labs.i18n.ListFormatSymbols_en_LR', 'goog.labs.i18n.ListFormatSymbols_en_LS', 'goog.labs.i18n.ListFormatSymbols_en_MG', 'goog.labs.i18n.ListFormatSymbols_en_MH', 'goog.labs.i18n.ListFormatSymbols_en_MO', 'goog.labs.i18n.ListFormatSymbols_en_MP', 'goog.labs.i18n.ListFormatSymbols_en_MS', 'goog.labs.i18n.ListFormatSymbols_en_MT', 'goog.labs.i18n.ListFormatSymbols_en_MU', 'goog.labs.i18n.ListFormatSymbols_en_MW', 'goog.labs.i18n.ListFormatSymbols_en_NA', 'goog.labs.i18n.ListFormatSymbols_en_NF', 'goog.labs.i18n.ListFormatSymbols_en_NG', 'goog.labs.i18n.ListFormatSymbols_en_NR', 'goog.labs.i18n.ListFormatSymbols_en_NU', 'goog.labs.i18n.ListFormatSymbols_en_NZ', 'goog.labs.i18n.ListFormatSymbols_en_PG', 'goog.labs.i18n.ListFormatSymbols_en_PH', 'goog.labs.i18n.ListFormatSymbols_en_PK', 'goog.labs.i18n.ListFormatSymbols_en_PN', 'goog.labs.i18n.ListFormatSymbols_en_PR', 'goog.labs.i18n.ListFormatSymbols_en_PW', 'goog.labs.i18n.ListFormatSymbols_en_RW', 'goog.labs.i18n.ListFormatSymbols_en_SB', 'goog.labs.i18n.ListFormatSymbols_en_SC', 'goog.labs.i18n.ListFormatSymbols_en_SD', 'goog.labs.i18n.ListFormatSymbols_en_SH', 'goog.labs.i18n.ListFormatSymbols_en_SL', 'goog.labs.i18n.ListFormatSymbols_en_SS', 'goog.labs.i18n.ListFormatSymbols_en_SX', 'goog.labs.i18n.ListFormatSymbols_en_SZ', 'goog.labs.i18n.ListFormatSymbols_en_TC', 'goog.labs.i18n.ListFormatSymbols_en_TK', 'goog.labs.i18n.ListFormatSymbols_en_TO', 'goog.labs.i18n.ListFormatSymbols_en_TT', 'goog.labs.i18n.ListFormatSymbols_en_TV', 'goog.labs.i18n.ListFormatSymbols_en_TZ', 'goog.labs.i18n.ListFormatSymbols_en_UG', 'goog.labs.i18n.ListFormatSymbols_en_UM', 'goog.labs.i18n.ListFormatSymbols_en_US_POSIX', 'goog.labs.i18n.ListFormatSymbols_en_VC', 'goog.labs.i18n.ListFormatSymbols_en_VG', 'goog.labs.i18n.ListFormatSymbols_en_VI', 'goog.labs.i18n.ListFormatSymbols_en_VU', 'goog.labs.i18n.ListFormatSymbols_en_WS', 'goog.labs.i18n.ListFormatSymbols_en_ZM', 'goog.labs.i18n.ListFormatSymbols_en_ZW', 'goog.labs.i18n.ListFormatSymbols_eo', 'goog.labs.i18n.ListFormatSymbols_es_AR', 'goog.labs.i18n.ListFormatSymbols_es_BO', 'goog.labs.i18n.ListFormatSymbols_es_CL', 'goog.labs.i18n.ListFormatSymbols_es_CO', 'goog.labs.i18n.ListFormatSymbols_es_CR', 'goog.labs.i18n.ListFormatSymbols_es_CU', 'goog.labs.i18n.ListFormatSymbols_es_DO', 'goog.labs.i18n.ListFormatSymbols_es_EA', 'goog.labs.i18n.ListFormatSymbols_es_EC', 'goog.labs.i18n.ListFormatSymbols_es_GQ', 'goog.labs.i18n.ListFormatSymbols_es_GT', 'goog.labs.i18n.ListFormatSymbols_es_HN', 'goog.labs.i18n.ListFormatSymbols_es_IC', 'goog.labs.i18n.ListFormatSymbols_es_MX', 'goog.labs.i18n.ListFormatSymbols_es_NI', 'goog.labs.i18n.ListFormatSymbols_es_PA', 'goog.labs.i18n.ListFormatSymbols_es_PE', 'goog.labs.i18n.ListFormatSymbols_es_PH', 'goog.labs.i18n.ListFormatSymbols_es_PR', 'goog.labs.i18n.ListFormatSymbols_es_PY', 'goog.labs.i18n.ListFormatSymbols_es_SV', 'goog.labs.i18n.ListFormatSymbols_es_US', 'goog.labs.i18n.ListFormatSymbols_es_UY', 'goog.labs.i18n.ListFormatSymbols_es_VE', 'goog.labs.i18n.ListFormatSymbols_et_EE', 'goog.labs.i18n.ListFormatSymbols_eu_ES', 'goog.labs.i18n.ListFormatSymbols_ewo', 'goog.labs.i18n.ListFormatSymbols_ewo_CM', 'goog.labs.i18n.ListFormatSymbols_fa_AF', 'goog.labs.i18n.ListFormatSymbols_fa_IR', 'goog.labs.i18n.ListFormatSymbols_ff', 'goog.labs.i18n.ListFormatSymbols_ff_SN', 'goog.labs.i18n.ListFormatSymbols_fi_FI', 'goog.labs.i18n.ListFormatSymbols_fil_PH', 'goog.labs.i18n.ListFormatSymbols_fo', 'goog.labs.i18n.ListFormatSymbols_fo_FO', 'goog.labs.i18n.ListFormatSymbols_fr_BE', 'goog.labs.i18n.ListFormatSymbols_fr_BF', 'goog.labs.i18n.ListFormatSymbols_fr_BI', 'goog.labs.i18n.ListFormatSymbols_fr_BJ', 'goog.labs.i18n.ListFormatSymbols_fr_BL', 'goog.labs.i18n.ListFormatSymbols_fr_CD', 'goog.labs.i18n.ListFormatSymbols_fr_CF', 'goog.labs.i18n.ListFormatSymbols_fr_CG', 'goog.labs.i18n.ListFormatSymbols_fr_CH', 'goog.labs.i18n.ListFormatSymbols_fr_CI', 'goog.labs.i18n.ListFormatSymbols_fr_CM', 'goog.labs.i18n.ListFormatSymbols_fr_DJ', 'goog.labs.i18n.ListFormatSymbols_fr_DZ', 'goog.labs.i18n.ListFormatSymbols_fr_FR', 'goog.labs.i18n.ListFormatSymbols_fr_GA', 'goog.labs.i18n.ListFormatSymbols_fr_GF', 'goog.labs.i18n.ListFormatSymbols_fr_GN', 'goog.labs.i18n.ListFormatSymbols_fr_GP', 'goog.labs.i18n.ListFormatSymbols_fr_GQ', 'goog.labs.i18n.ListFormatSymbols_fr_HT', 'goog.labs.i18n.ListFormatSymbols_fr_KM', 'goog.labs.i18n.ListFormatSymbols_fr_LU', 'goog.labs.i18n.ListFormatSymbols_fr_MA', 'goog.labs.i18n.ListFormatSymbols_fr_MC', 'goog.labs.i18n.ListFormatSymbols_fr_MF', 'goog.labs.i18n.ListFormatSymbols_fr_MG', 'goog.labs.i18n.ListFormatSymbols_fr_ML', 'goog.labs.i18n.ListFormatSymbols_fr_MQ', 'goog.labs.i18n.ListFormatSymbols_fr_MR', 'goog.labs.i18n.ListFormatSymbols_fr_MU', 'goog.labs.i18n.ListFormatSymbols_fr_NC', 'goog.labs.i18n.ListFormatSymbols_fr_NE', 'goog.labs.i18n.ListFormatSymbols_fr_PF', 'goog.labs.i18n.ListFormatSymbols_fr_PM', 'goog.labs.i18n.ListFormatSymbols_fr_RE', 'goog.labs.i18n.ListFormatSymbols_fr_RW', 'goog.labs.i18n.ListFormatSymbols_fr_SC', 'goog.labs.i18n.ListFormatSymbols_fr_SN', 'goog.labs.i18n.ListFormatSymbols_fr_SY', 'goog.labs.i18n.ListFormatSymbols_fr_TD', 'goog.labs.i18n.ListFormatSymbols_fr_TG', 'goog.labs.i18n.ListFormatSymbols_fr_TN', 'goog.labs.i18n.ListFormatSymbols_fr_VU', 'goog.labs.i18n.ListFormatSymbols_fr_WF', 'goog.labs.i18n.ListFormatSymbols_fr_YT', 'goog.labs.i18n.ListFormatSymbols_ga', 'goog.labs.i18n.ListFormatSymbols_ga_IE', 'goog.labs.i18n.ListFormatSymbols_gl_ES', 'goog.labs.i18n.ListFormatSymbols_gsw_CH', 'goog.labs.i18n.ListFormatSymbols_gsw_LI', 'goog.labs.i18n.ListFormatSymbols_gu_IN', 'goog.labs.i18n.ListFormatSymbols_guz', 'goog.labs.i18n.ListFormatSymbols_guz_KE', 'goog.labs.i18n.ListFormatSymbols_gv', 'goog.labs.i18n.ListFormatSymbols_gv_IM', 'goog.labs.i18n.ListFormatSymbols_ha', 'goog.labs.i18n.ListFormatSymbols_ha_Latn', 'goog.labs.i18n.ListFormatSymbols_ha_Latn_GH', 'goog.labs.i18n.ListFormatSymbols_ha_Latn_NE', 'goog.labs.i18n.ListFormatSymbols_ha_Latn_NG', 'goog.labs.i18n.ListFormatSymbols_haw_US', 'goog.labs.i18n.ListFormatSymbols_he_IL', 'goog.labs.i18n.ListFormatSymbols_hi_IN', 'goog.labs.i18n.ListFormatSymbols_hr_BA', 'goog.labs.i18n.ListFormatSymbols_hr_HR', 'goog.labs.i18n.ListFormatSymbols_hu_HU', 'goog.labs.i18n.ListFormatSymbols_hy_AM', 'goog.labs.i18n.ListFormatSymbols_id_ID', 'goog.labs.i18n.ListFormatSymbols_ig', 'goog.labs.i18n.ListFormatSymbols_ig_NG', 'goog.labs.i18n.ListFormatSymbols_ii', 'goog.labs.i18n.ListFormatSymbols_ii_CN', 'goog.labs.i18n.ListFormatSymbols_is_IS', 'goog.labs.i18n.ListFormatSymbols_it_CH', 'goog.labs.i18n.ListFormatSymbols_it_IT', 'goog.labs.i18n.ListFormatSymbols_it_SM', 'goog.labs.i18n.ListFormatSymbols_ja_JP', 'goog.labs.i18n.ListFormatSymbols_jgo', 'goog.labs.i18n.ListFormatSymbols_jgo_CM', 'goog.labs.i18n.ListFormatSymbols_jmc', 'goog.labs.i18n.ListFormatSymbols_jmc_TZ', 'goog.labs.i18n.ListFormatSymbols_ka_GE', 'goog.labs.i18n.ListFormatSymbols_kab', 'goog.labs.i18n.ListFormatSymbols_kab_DZ', 'goog.labs.i18n.ListFormatSymbols_kam', 'goog.labs.i18n.ListFormatSymbols_kam_KE', 'goog.labs.i18n.ListFormatSymbols_kde', 'goog.labs.i18n.ListFormatSymbols_kde_TZ', 'goog.labs.i18n.ListFormatSymbols_kea', 'goog.labs.i18n.ListFormatSymbols_kea_CV', 'goog.labs.i18n.ListFormatSymbols_khq', 'goog.labs.i18n.ListFormatSymbols_khq_ML', 'goog.labs.i18n.ListFormatSymbols_ki', 'goog.labs.i18n.ListFormatSymbols_ki_KE', 'goog.labs.i18n.ListFormatSymbols_kk_Cyrl', 'goog.labs.i18n.ListFormatSymbols_kk_Cyrl_KZ', 'goog.labs.i18n.ListFormatSymbols_kkj', 'goog.labs.i18n.ListFormatSymbols_kkj_CM', 'goog.labs.i18n.ListFormatSymbols_kl', 'goog.labs.i18n.ListFormatSymbols_kl_GL', 'goog.labs.i18n.ListFormatSymbols_kln', 'goog.labs.i18n.ListFormatSymbols_kln_KE', 'goog.labs.i18n.ListFormatSymbols_km_KH', 'goog.labs.i18n.ListFormatSymbols_kn_IN', 'goog.labs.i18n.ListFormatSymbols_ko_KP', 'goog.labs.i18n.ListFormatSymbols_ko_KR', 'goog.labs.i18n.ListFormatSymbols_kok', 'goog.labs.i18n.ListFormatSymbols_kok_IN', 'goog.labs.i18n.ListFormatSymbols_ks', 'goog.labs.i18n.ListFormatSymbols_ks_Arab', 'goog.labs.i18n.ListFormatSymbols_ks_Arab_IN', 'goog.labs.i18n.ListFormatSymbols_ksb', 'goog.labs.i18n.ListFormatSymbols_ksb_TZ', 'goog.labs.i18n.ListFormatSymbols_ksf', 'goog.labs.i18n.ListFormatSymbols_ksf_CM', 'goog.labs.i18n.ListFormatSymbols_kw', 'goog.labs.i18n.ListFormatSymbols_kw_GB', 'goog.labs.i18n.ListFormatSymbols_ky_Cyrl', 'goog.labs.i18n.ListFormatSymbols_ky_Cyrl_KG', 'goog.labs.i18n.ListFormatSymbols_lag', 'goog.labs.i18n.ListFormatSymbols_lag_TZ', 'goog.labs.i18n.ListFormatSymbols_lg', 'goog.labs.i18n.ListFormatSymbols_lg_UG', 'goog.labs.i18n.ListFormatSymbols_lkt', 'goog.labs.i18n.ListFormatSymbols_lkt_US', 'goog.labs.i18n.ListFormatSymbols_ln_AO', 'goog.labs.i18n.ListFormatSymbols_ln_CD', 'goog.labs.i18n.ListFormatSymbols_ln_CF', 'goog.labs.i18n.ListFormatSymbols_ln_CG', 'goog.labs.i18n.ListFormatSymbols_lo_LA', 'goog.labs.i18n.ListFormatSymbols_lt_LT', 'goog.labs.i18n.ListFormatSymbols_lu', 'goog.labs.i18n.ListFormatSymbols_lu_CD', 'goog.labs.i18n.ListFormatSymbols_luo', 'goog.labs.i18n.ListFormatSymbols_luo_KE', 'goog.labs.i18n.ListFormatSymbols_luy', 'goog.labs.i18n.ListFormatSymbols_luy_KE', 'goog.labs.i18n.ListFormatSymbols_lv_LV', 'goog.labs.i18n.ListFormatSymbols_mas', 'goog.labs.i18n.ListFormatSymbols_mas_KE', 'goog.labs.i18n.ListFormatSymbols_mas_TZ', 'goog.labs.i18n.ListFormatSymbols_mer', 'goog.labs.i18n.ListFormatSymbols_mer_KE', 'goog.labs.i18n.ListFormatSymbols_mfe', 'goog.labs.i18n.ListFormatSymbols_mfe_MU', 'goog.labs.i18n.ListFormatSymbols_mg', 'goog.labs.i18n.ListFormatSymbols_mg_MG', 'goog.labs.i18n.ListFormatSymbols_mgh', 'goog.labs.i18n.ListFormatSymbols_mgh_MZ', 'goog.labs.i18n.ListFormatSymbols_mgo', 'goog.labs.i18n.ListFormatSymbols_mgo_CM', 'goog.labs.i18n.ListFormatSymbols_mk_MK', 'goog.labs.i18n.ListFormatSymbols_ml_IN', 'goog.labs.i18n.ListFormatSymbols_mn_Cyrl', 'goog.labs.i18n.ListFormatSymbols_mn_Cyrl_MN', 'goog.labs.i18n.ListFormatSymbols_mr_IN', 'goog.labs.i18n.ListFormatSymbols_ms_Latn', 'goog.labs.i18n.ListFormatSymbols_ms_Latn_BN', 'goog.labs.i18n.ListFormatSymbols_ms_Latn_MY', 'goog.labs.i18n.ListFormatSymbols_ms_Latn_SG', 'goog.labs.i18n.ListFormatSymbols_mt_MT', 'goog.labs.i18n.ListFormatSymbols_mua', 'goog.labs.i18n.ListFormatSymbols_mua_CM', 'goog.labs.i18n.ListFormatSymbols_my_MM', 'goog.labs.i18n.ListFormatSymbols_naq', 'goog.labs.i18n.ListFormatSymbols_naq_NA', 'goog.labs.i18n.ListFormatSymbols_nb_NO', 'goog.labs.i18n.ListFormatSymbols_nb_SJ', 'goog.labs.i18n.ListFormatSymbols_nd', 'goog.labs.i18n.ListFormatSymbols_nd_ZW', 'goog.labs.i18n.ListFormatSymbols_ne_IN', 'goog.labs.i18n.ListFormatSymbols_ne_NP', 'goog.labs.i18n.ListFormatSymbols_nl_AW', 'goog.labs.i18n.ListFormatSymbols_nl_BE', 'goog.labs.i18n.ListFormatSymbols_nl_BQ', 'goog.labs.i18n.ListFormatSymbols_nl_CW', 'goog.labs.i18n.ListFormatSymbols_nl_NL', 'goog.labs.i18n.ListFormatSymbols_nl_SR', 'goog.labs.i18n.ListFormatSymbols_nl_SX', 'goog.labs.i18n.ListFormatSymbols_nmg', 'goog.labs.i18n.ListFormatSymbols_nmg_CM', 'goog.labs.i18n.ListFormatSymbols_nn', 'goog.labs.i18n.ListFormatSymbols_nn_NO', 'goog.labs.i18n.ListFormatSymbols_nnh', 'goog.labs.i18n.ListFormatSymbols_nnh_CM', 'goog.labs.i18n.ListFormatSymbols_nus', 'goog.labs.i18n.ListFormatSymbols_nus_SD', 'goog.labs.i18n.ListFormatSymbols_nyn', 'goog.labs.i18n.ListFormatSymbols_nyn_UG', 'goog.labs.i18n.ListFormatSymbols_om', 'goog.labs.i18n.ListFormatSymbols_om_ET', 'goog.labs.i18n.ListFormatSymbols_om_KE', 'goog.labs.i18n.ListFormatSymbols_or_IN', 'goog.labs.i18n.ListFormatSymbols_pa_Arab', 'goog.labs.i18n.ListFormatSymbols_pa_Arab_PK', 'goog.labs.i18n.ListFormatSymbols_pa_Guru', 'goog.labs.i18n.ListFormatSymbols_pa_Guru_IN', 'goog.labs.i18n.ListFormatSymbols_pl_PL', 'goog.labs.i18n.ListFormatSymbols_ps', 'goog.labs.i18n.ListFormatSymbols_ps_AF', 'goog.labs.i18n.ListFormatSymbols_pt_AO', 'goog.labs.i18n.ListFormatSymbols_pt_CV', 'goog.labs.i18n.ListFormatSymbols_pt_GW', 'goog.labs.i18n.ListFormatSymbols_pt_MO', 'goog.labs.i18n.ListFormatSymbols_pt_MZ', 'goog.labs.i18n.ListFormatSymbols_pt_ST', 'goog.labs.i18n.ListFormatSymbols_pt_TL', 'goog.labs.i18n.ListFormatSymbols_rm', 'goog.labs.i18n.ListFormatSymbols_rm_CH', 'goog.labs.i18n.ListFormatSymbols_rn', 'goog.labs.i18n.ListFormatSymbols_rn_BI', 'goog.labs.i18n.ListFormatSymbols_ro_MD', 'goog.labs.i18n.ListFormatSymbols_ro_RO', 'goog.labs.i18n.ListFormatSymbols_rof', 'goog.labs.i18n.ListFormatSymbols_rof_TZ', 'goog.labs.i18n.ListFormatSymbols_ru_BY', 'goog.labs.i18n.ListFormatSymbols_ru_KG', 'goog.labs.i18n.ListFormatSymbols_ru_KZ', 'goog.labs.i18n.ListFormatSymbols_ru_MD', 'goog.labs.i18n.ListFormatSymbols_ru_RU', 'goog.labs.i18n.ListFormatSymbols_ru_UA', 'goog.labs.i18n.ListFormatSymbols_rw', 'goog.labs.i18n.ListFormatSymbols_rw_RW', 'goog.labs.i18n.ListFormatSymbols_rwk', 'goog.labs.i18n.ListFormatSymbols_rwk_TZ', 'goog.labs.i18n.ListFormatSymbols_saq', 'goog.labs.i18n.ListFormatSymbols_saq_KE', 'goog.labs.i18n.ListFormatSymbols_sbp', 'goog.labs.i18n.ListFormatSymbols_sbp_TZ', 'goog.labs.i18n.ListFormatSymbols_seh', 'goog.labs.i18n.ListFormatSymbols_seh_MZ', 'goog.labs.i18n.ListFormatSymbols_ses', 'goog.labs.i18n.ListFormatSymbols_ses_ML', 'goog.labs.i18n.ListFormatSymbols_sg', 'goog.labs.i18n.ListFormatSymbols_sg_CF', 'goog.labs.i18n.ListFormatSymbols_shi', 'goog.labs.i18n.ListFormatSymbols_shi_Latn', 'goog.labs.i18n.ListFormatSymbols_shi_Latn_MA', 'goog.labs.i18n.ListFormatSymbols_shi_Tfng', 'goog.labs.i18n.ListFormatSymbols_shi_Tfng_MA', 'goog.labs.i18n.ListFormatSymbols_si_LK', 'goog.labs.i18n.ListFormatSymbols_sk_SK', 'goog.labs.i18n.ListFormatSymbols_sl_SI', 'goog.labs.i18n.ListFormatSymbols_sn', 'goog.labs.i18n.ListFormatSymbols_sn_ZW', 'goog.labs.i18n.ListFormatSymbols_so', 'goog.labs.i18n.ListFormatSymbols_so_DJ', 'goog.labs.i18n.ListFormatSymbols_so_ET', 'goog.labs.i18n.ListFormatSymbols_so_KE', 'goog.labs.i18n.ListFormatSymbols_so_SO', 'goog.labs.i18n.ListFormatSymbols_sq_AL', 'goog.labs.i18n.ListFormatSymbols_sq_MK', 'goog.labs.i18n.ListFormatSymbols_sq_XK', 'goog.labs.i18n.ListFormatSymbols_sr_Cyrl', 'goog.labs.i18n.ListFormatSymbols_sr_Cyrl_BA', 'goog.labs.i18n.ListFormatSymbols_sr_Cyrl_ME', 'goog.labs.i18n.ListFormatSymbols_sr_Cyrl_RS', 'goog.labs.i18n.ListFormatSymbols_sr_Cyrl_XK', 'goog.labs.i18n.ListFormatSymbols_sr_Latn', 'goog.labs.i18n.ListFormatSymbols_sr_Latn_BA', 'goog.labs.i18n.ListFormatSymbols_sr_Latn_ME', 'goog.labs.i18n.ListFormatSymbols_sr_Latn_RS', 'goog.labs.i18n.ListFormatSymbols_sr_Latn_XK', 'goog.labs.i18n.ListFormatSymbols_sv_AX', 'goog.labs.i18n.ListFormatSymbols_sv_FI', 'goog.labs.i18n.ListFormatSymbols_sv_SE', 'goog.labs.i18n.ListFormatSymbols_sw_KE', 'goog.labs.i18n.ListFormatSymbols_sw_TZ', 'goog.labs.i18n.ListFormatSymbols_sw_UG', 'goog.labs.i18n.ListFormatSymbols_swc', 'goog.labs.i18n.ListFormatSymbols_swc_CD', 'goog.labs.i18n.ListFormatSymbols_ta_IN', 'goog.labs.i18n.ListFormatSymbols_ta_LK', 'goog.labs.i18n.ListFormatSymbols_ta_MY', 'goog.labs.i18n.ListFormatSymbols_ta_SG', 'goog.labs.i18n.ListFormatSymbols_te_IN', 'goog.labs.i18n.ListFormatSymbols_teo', 'goog.labs.i18n.ListFormatSymbols_teo_KE', 'goog.labs.i18n.ListFormatSymbols_teo_UG', 'goog.labs.i18n.ListFormatSymbols_th_TH', 'goog.labs.i18n.ListFormatSymbols_ti', 'goog.labs.i18n.ListFormatSymbols_ti_ER', 'goog.labs.i18n.ListFormatSymbols_ti_ET', 'goog.labs.i18n.ListFormatSymbols_to', 'goog.labs.i18n.ListFormatSymbols_to_TO', 'goog.labs.i18n.ListFormatSymbols_tr_CY', 'goog.labs.i18n.ListFormatSymbols_tr_TR', 'goog.labs.i18n.ListFormatSymbols_twq', 'goog.labs.i18n.ListFormatSymbols_twq_NE', 'goog.labs.i18n.ListFormatSymbols_tzm', 'goog.labs.i18n.ListFormatSymbols_tzm_Latn', 'goog.labs.i18n.ListFormatSymbols_tzm_Latn_MA', 'goog.labs.i18n.ListFormatSymbols_ug', 'goog.labs.i18n.ListFormatSymbols_ug_Arab', 'goog.labs.i18n.ListFormatSymbols_ug_Arab_CN', 'goog.labs.i18n.ListFormatSymbols_uk_UA', 'goog.labs.i18n.ListFormatSymbols_ur_IN', 'goog.labs.i18n.ListFormatSymbols_ur_PK', 'goog.labs.i18n.ListFormatSymbols_uz_Arab', 'goog.labs.i18n.ListFormatSymbols_uz_Arab_AF', 'goog.labs.i18n.ListFormatSymbols_uz_Cyrl', 'goog.labs.i18n.ListFormatSymbols_uz_Cyrl_UZ', 'goog.labs.i18n.ListFormatSymbols_uz_Latn', 'goog.labs.i18n.ListFormatSymbols_uz_Latn_UZ', 'goog.labs.i18n.ListFormatSymbols_vai', 'goog.labs.i18n.ListFormatSymbols_vai_Latn', 'goog.labs.i18n.ListFormatSymbols_vai_Latn_LR', 'goog.labs.i18n.ListFormatSymbols_vai_Vaii', 'goog.labs.i18n.ListFormatSymbols_vai_Vaii_LR', 'goog.labs.i18n.ListFormatSymbols_vi_VN', 'goog.labs.i18n.ListFormatSymbols_vun', 'goog.labs.i18n.ListFormatSymbols_vun_TZ', 'goog.labs.i18n.ListFormatSymbols_xog', 'goog.labs.i18n.ListFormatSymbols_xog_UG', 'goog.labs.i18n.ListFormatSymbols_yav', 'goog.labs.i18n.ListFormatSymbols_yav_CM', 'goog.labs.i18n.ListFormatSymbols_yo', 'goog.labs.i18n.ListFormatSymbols_yo_BJ', 'goog.labs.i18n.ListFormatSymbols_yo_NG', 'goog.labs.i18n.ListFormatSymbols_zgh', 'goog.labs.i18n.ListFormatSymbols_zgh_MA', 'goog.labs.i18n.ListFormatSymbols_zh_Hans', 'goog.labs.i18n.ListFormatSymbols_zh_Hans_CN', 'goog.labs.i18n.ListFormatSymbols_zh_Hans_HK', 'goog.labs.i18n.ListFormatSymbols_zh_Hans_MO', 'goog.labs.i18n.ListFormatSymbols_zh_Hans_SG', 'goog.labs.i18n.ListFormatSymbols_zh_Hant', 'goog.labs.i18n.ListFormatSymbols_zh_Hant_HK', 'goog.labs.i18n.ListFormatSymbols_zh_Hant_MO', 'goog.labs.i18n.ListFormatSymbols_zh_Hant_TW', 'goog.labs.i18n.ListFormatSymbols_zu_ZA'], ['goog.labs.i18n.ListFormatSymbols']);
goog.addDependency('labs/mock/mock.js', ['goog.labs.mock', 'goog.labs.mock.VerificationError'], ['goog.array', 'goog.asserts', 'goog.debug', 'goog.debug.Error', 'goog.functions', 'goog.object']);
goog.addDependency('labs/mock/mock_test.js', ['goog.labs.mockTest'], ['goog.array', 'goog.labs.mock', 'goog.labs.mock.VerificationError', 'goog.labs.testing.AnythingMatcher', 'goog.labs.testing.GreaterThanMatcher', 'goog.string', 'goog.testing.jsunit']);
goog.addDependency('labs/net/image.js', ['goog.labs.net.image'], ['goog.Promise', 'goog.events.EventHandler', 'goog.events.EventType', 'goog.net.EventType', 'goog.userAgent']);
goog.addDependency('labs/net/image_test.js', ['goog.labs.net.imageTest'], ['goog.events', 'goog.labs.net.image', 'goog.string', 'goog.testing.AsyncTestCase', 'goog.testing.jsunit', 'goog.testing.recordFunction']);
goog.addDependency('labs/net/webchannel.js', ['goog.net.WebChannel'], ['goog.events', 'goog.events.Event']);
goog.addDependency('labs/net/webchannel/basetestchannel.js', ['goog.labs.net.webChannel.BaseTestChannel'], ['goog.labs.net.webChannel.Channel', 'goog.labs.net.webChannel.ChannelRequest', 'goog.labs.net.webChannel.requestStats', 'goog.labs.net.webChannel.requestStats.Stat']);
goog.addDependency('labs/net/webchannel/channel.js', ['goog.labs.net.webChannel.Channel'], []);
goog.addDependency('labs/net/webchannel/channelrequest.js', ['goog.labs.net.webChannel.ChannelRequest'], ['goog.Timer', 'goog.async.Throttle', 'goog.events.EventHandler', 'goog.labs.net.webChannel.requestStats', 'goog.labs.net.webChannel.requestStats.ServerReachability', 'goog.labs.net.webChannel.requestStats.Stat', 'goog.net.ErrorCode', 'goog.net.EventType', 'goog.net.XmlHttp', 'goog.object', 'goog.uri.utils.StandardQueryParam', 'goog.userAgent']);
goog.addDependency('labs/net/webchannel/channelrequest_test.js', ['goog.labs.net.webChannel.channelRequestTest'], ['goog.Uri', 'goog.functions', 'goog.labs.net.webChannel.ChannelRequest', 'goog.labs.net.webChannel.WebChannelDebug', 'goog.labs.net.webChannel.requestStats', 'goog.labs.net.webChannel.requestStats.ServerReachability', 'goog.testing.MockClock', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit', 'goog.testing.net.XhrIo', 'goog.testing.recordFunction']);
goog.addDependency('labs/net/webchannel/connectionstate.js', ['goog.labs.net.webChannel.ConnectionState'], []);
goog.addDependency('labs/net/webchannel/forwardchannelrequestpool.js', ['goog.labs.net.webChannel.ForwardChannelRequestPool'], ['goog.array', 'goog.string', 'goog.structs.Set']);
goog.addDependency('labs/net/webchannel/forwardchannelrequestpool_test.js', ['goog.labs.net.webChannel.forwardChannelRequestPoolTest'], ['goog.labs.net.webChannel.ChannelRequest', 'goog.labs.net.webChannel.ForwardChannelRequestPool', 'goog.testing.PropertyReplacer', 'goog.testing.asserts', 'goog.testing.jsunit']);
goog.addDependency('labs/net/webchannel/netutils.js', ['goog.labs.net.webChannel.netUtils'], ['goog.Uri', 'goog.labs.net.webChannel.WebChannelDebug']);
goog.addDependency('labs/net/webchannel/requeststats.js', ['goog.labs.net.webChannel.requestStats', 'goog.labs.net.webChannel.requestStats.Event', 'goog.labs.net.webChannel.requestStats.ServerReachability', 'goog.labs.net.webChannel.requestStats.ServerReachabilityEvent', 'goog.labs.net.webChannel.requestStats.Stat', 'goog.labs.net.webChannel.requestStats.StatEvent', 'goog.labs.net.webChannel.requestStats.TimingEvent'], ['goog.events.Event', 'goog.events.EventTarget']);
goog.addDependency('labs/net/webchannel/webchannelbase.js', ['goog.labs.net.webChannel.WebChannelBase'], ['goog.Uri', 'goog.array', 'goog.asserts', 'goog.debug.TextFormatter', 'goog.json', 'goog.labs.net.webChannel.BaseTestChannel', 'goog.labs.net.webChannel.Channel', 'goog.labs.net.webChannel.ChannelRequest', 'goog.labs.net.webChannel.ConnectionState', 'goog.labs.net.webChannel.ForwardChannelRequestPool', 'goog.labs.net.webChannel.WebChannelDebug', 'goog.labs.net.webChannel.Wire', 'goog.labs.net.webChannel.WireV8', 'goog.labs.net.webChannel.netUtils', 'goog.labs.net.webChannel.requestStats', 'goog.labs.net.webChannel.requestStats.Stat', 'goog.log', 'goog.net.XhrIo', 'goog.object', 'goog.string', 'goog.structs', 'goog.structs.CircularBuffer']);
goog.addDependency('labs/net/webchannel/webchannelbase_test.js', ['goog.labs.net.webChannel.webChannelBaseTest'], ['goog.Timer', 'goog.array', 'goog.dom', 'goog.functions', 'goog.json', 'goog.labs.net.webChannel.ChannelRequest', 'goog.labs.net.webChannel.ForwardChannelRequestPool', 'goog.labs.net.webChannel.WebChannelBase', 'goog.labs.net.webChannel.WebChannelBaseTransport', 'goog.labs.net.webChannel.WebChannelDebug', 'goog.labs.net.webChannel.Wire', 'goog.labs.net.webChannel.netUtils', 'goog.labs.net.webChannel.requestStats', 'goog.labs.net.webChannel.requestStats.Stat', 'goog.structs.Map', 'goog.testing.MockClock', 'goog.testing.PropertyReplacer', 'goog.testing.asserts', 'goog.testing.jsunit']);
goog.addDependency('labs/net/webchannel/webchannelbasetransport.js', ['goog.labs.net.webChannel.WebChannelBaseTransport'], ['goog.asserts', 'goog.events.EventTarget', 'goog.labs.net.webChannel.WebChannelBase', 'goog.log', 'goog.net.WebChannel', 'goog.net.WebChannelTransport', 'goog.string.path']);
goog.addDependency('labs/net/webchannel/webchannelbasetransport_test.js', ['goog.labs.net.webChannel.webChannelBaseTransportTest'], ['goog.events', 'goog.labs.net.webChannel.WebChannelBaseTransport', 'goog.net.WebChannel', 'goog.testing.jsunit']);
goog.addDependency('labs/net/webchannel/webchanneldebug.js', ['goog.labs.net.webChannel.WebChannelDebug'], ['goog.json', 'goog.log']);
goog.addDependency('labs/net/webchannel/wire.js', ['goog.labs.net.webChannel.Wire'], []);
goog.addDependency('labs/net/webchannel/wirev8.js', ['goog.labs.net.webChannel.WireV8'], ['goog.asserts', 'goog.json', 'goog.json.EvalJsonProcessor', 'goog.structs']);
goog.addDependency('labs/net/webchannel/wirev8_test.js', ['goog.labs.net.webChannel.WireV8Test'], ['goog.labs.net.webChannel.WireV8', 'goog.testing.jsunit']);
goog.addDependency('labs/net/webchanneltransport.js', ['goog.net.WebChannelTransport'], []);
goog.addDependency('labs/net/webchanneltransportfactory.js', ['goog.net.createWebChannelTransport'], ['goog.functions', 'goog.labs.net.webChannel.WebChannelBaseTransport']);
goog.addDependency('labs/net/xhr.js', ['goog.labs.net.xhr', 'goog.labs.net.xhr.Error', 'goog.labs.net.xhr.HttpError', 'goog.labs.net.xhr.Options', 'goog.labs.net.xhr.PostData', 'goog.labs.net.xhr.TimeoutError'], ['goog.Promise', 'goog.debug.Error', 'goog.json', 'goog.net.HttpStatus', 'goog.net.XmlHttp', 'goog.string', 'goog.uri.utils']);
goog.addDependency('labs/net/xhr_test.js', ['goog.labs.net.xhrTest'], ['goog.Promise', 'goog.labs.net.xhr', 'goog.net.XmlHttp', 'goog.string', 'goog.testing.AsyncTestCase', 'goog.testing.MockClock', 'goog.testing.jsunit', 'goog.userAgent']);
goog.addDependency('labs/object/object.js', ['goog.labs.object'], []);
goog.addDependency('labs/object/object_test.js', ['goog.labs.objectTest'], ['goog.labs.object', 'goog.testing.jsunit']);
goog.addDependency('labs/promise/promise.js', ['goog.labs.Promise', 'goog.labs.Resolver'], ['goog.Promise', 'goog.Thenable', 'goog.promise.Resolver']);
goog.addDependency('labs/storage/boundedcollectablestorage.js', ['goog.labs.storage.BoundedCollectableStorage'], ['goog.array', 'goog.asserts', 'goog.iter', 'goog.storage.CollectableStorage', 'goog.storage.ErrorCode', 'goog.storage.ExpiringStorage']);
goog.addDependency('labs/storage/boundedcollectablestorage_test.js', ['goog.labs.storage.BoundedCollectableStorageTest'], ['goog.labs.storage.BoundedCollectableStorage', 'goog.storage.collectableStorageTester', 'goog.storage.storage_test', 'goog.testing.MockClock', 'goog.testing.jsunit', 'goog.testing.storage.FakeMechanism']);
goog.addDependency('labs/structs/map.js', ['goog.labs.structs.Map'], ['goog.array', 'goog.asserts', 'goog.labs.object', 'goog.object']);
goog.addDependency('labs/structs/map_perf.js', ['goog.labs.structs.mapPerf'], ['goog.dom', 'goog.labs.structs.Map', 'goog.structs.Map', 'goog.testing.PerformanceTable', 'goog.testing.jsunit']);
goog.addDependency('labs/structs/map_test.js', ['goog.labs.structs.MapTest'], ['goog.labs.structs.Map', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit']);
goog.addDependency('labs/structs/multimap.js', ['goog.labs.structs.Multimap'], ['goog.array', 'goog.labs.object', 'goog.labs.structs.Map']);
goog.addDependency('labs/structs/multimap_test.js', ['goog.labs.structs.MultimapTest'], ['goog.labs.structs.Map', 'goog.labs.structs.Multimap', 'goog.testing.jsunit']);
goog.addDependency('labs/style/pixeldensitymonitor.js', ['goog.labs.style.PixelDensityMonitor', 'goog.labs.style.PixelDensityMonitor.Density', 'goog.labs.style.PixelDensityMonitor.EventType'], ['goog.events', 'goog.events.EventTarget']);
goog.addDependency('labs/style/pixeldensitymonitor_test.js', ['goog.labs.style.PixelDensityMonitorTest'], ['goog.array', 'goog.dom.DomHelper', 'goog.events', 'goog.labs.style.PixelDensityMonitor', 'goog.testing.MockControl', 'goog.testing.jsunit', 'goog.testing.recordFunction']);
goog.addDependency('labs/testing/assertthat.js', ['goog.labs.testing.MatcherError', 'goog.labs.testing.assertThat'], ['goog.asserts', 'goog.debug.Error', 'goog.labs.testing.Matcher']);
goog.addDependency('labs/testing/assertthat_test.js', ['goog.labs.testing.assertThatTest'], ['goog.labs.testing.MatcherError', 'goog.labs.testing.assertThat', 'goog.testing.jsunit', 'goog.testing.recordFunction']);
goog.addDependency('labs/testing/decoratormatcher.js', ['goog.labs.testing.AnythingMatcher'], ['goog.labs.testing.Matcher']);
goog.addDependency('labs/testing/decoratormatcher_test.js', ['goog.labs.testing.decoratorMatcherTest'], ['goog.labs.testing.AnythingMatcher', 'goog.labs.testing.GreaterThanMatcher', 'goog.labs.testing.MatcherError', 'goog.labs.testing.assertThat', 'goog.testing.jsunit']);
goog.addDependency('labs/testing/dictionarymatcher.js', ['goog.labs.testing.HasEntriesMatcher', 'goog.labs.testing.HasEntryMatcher', 'goog.labs.testing.HasKeyMatcher', 'goog.labs.testing.HasValueMatcher'], ['goog.array', 'goog.asserts', 'goog.labs.testing.Matcher', 'goog.string']);
goog.addDependency('labs/testing/dictionarymatcher_test.js', ['goog.labs.testing.dictionaryMatcherTest'], ['goog.labs.testing.HasEntryMatcher', 'goog.labs.testing.MatcherError', 'goog.labs.testing.assertThat', 'goog.testing.jsunit']);
goog.addDependency('labs/testing/environment.js', ['goog.labs.testing.Environment'], ['goog.array', 'goog.testing.TestCase', 'goog.testing.jsunit']);
goog.addDependency('labs/testing/environment_test.js', ['goog.labs.testing.environmentTest'], ['goog.labs.testing.Environment', 'goog.testing.MockControl', 'goog.testing.TestCase', 'goog.testing.jsunit']);
goog.addDependency('labs/testing/environment_usage_test.js', ['goog.labs.testing.environmentUsageTest'], ['goog.labs.testing.Environment']);
goog.addDependency('labs/testing/logicmatcher.js', ['goog.labs.testing.AllOfMatcher', 'goog.labs.testing.AnyOfMatcher', 'goog.labs.testing.IsNotMatcher'], ['goog.array', 'goog.labs.testing.Matcher']);
goog.addDependency('labs/testing/logicmatcher_test.js', ['goog.labs.testing.logicMatcherTest'], ['goog.labs.testing.AllOfMatcher', 'goog.labs.testing.GreaterThanMatcher', 'goog.labs.testing.MatcherError', 'goog.labs.testing.assertThat', 'goog.testing.jsunit']);
goog.addDependency('labs/testing/matcher.js', ['goog.labs.testing.Matcher'], []);
goog.addDependency('labs/testing/numbermatcher.js', ['goog.labs.testing.CloseToMatcher', 'goog.labs.testing.EqualToMatcher', 'goog.labs.testing.GreaterThanEqualToMatcher', 'goog.labs.testing.GreaterThanMatcher', 'goog.labs.testing.LessThanEqualToMatcher', 'goog.labs.testing.LessThanMatcher'], ['goog.asserts', 'goog.labs.testing.Matcher']);
goog.addDependency('labs/testing/numbermatcher_test.js', ['goog.labs.testing.numberMatcherTest'], ['goog.labs.testing.LessThanMatcher', 'goog.labs.testing.MatcherError', 'goog.labs.testing.assertThat', 'goog.testing.jsunit']);
goog.addDependency('labs/testing/objectmatcher.js', ['goog.labs.testing.HasPropertyMatcher', 'goog.labs.testing.InstanceOfMatcher', 'goog.labs.testing.IsNullMatcher', 'goog.labs.testing.IsNullOrUndefinedMatcher', 'goog.labs.testing.IsUndefinedMatcher', 'goog.labs.testing.ObjectEqualsMatcher'], ['goog.labs.testing.Matcher', 'goog.string']);
goog.addDependency('labs/testing/objectmatcher_test.js', ['goog.labs.testing.objectMatcherTest'], ['goog.labs.testing.MatcherError', 'goog.labs.testing.ObjectEqualsMatcher', 'goog.labs.testing.assertThat', 'goog.testing.jsunit']);
goog.addDependency('labs/testing/stringmatcher.js', ['goog.labs.testing.ContainsStringMatcher', 'goog.labs.testing.EndsWithMatcher', 'goog.labs.testing.EqualToIgnoringCaseMatcher', 'goog.labs.testing.EqualToIgnoringWhitespaceMatcher', 'goog.labs.testing.EqualsMatcher', 'goog.labs.testing.RegexMatcher', 'goog.labs.testing.StartsWithMatcher', 'goog.labs.testing.StringContainsInOrderMatcher'], ['goog.asserts', 'goog.labs.testing.Matcher', 'goog.string']);
goog.addDependency('labs/testing/stringmatcher_test.js', ['goog.labs.testing.stringMatcherTest'], ['goog.labs.testing.MatcherError', 'goog.labs.testing.StringContainsInOrderMatcher', 'goog.labs.testing.assertThat', 'goog.testing.jsunit']);
goog.addDependency('labs/useragent/browser.js', ['goog.labs.userAgent.browser'], ['goog.array', 'goog.asserts', 'goog.labs.userAgent.util', 'goog.string']);
goog.addDependency('labs/useragent/browser_test.js', ['goog.labs.userAgent.browserTest'], ['goog.labs.userAgent.browser', 'goog.labs.userAgent.testAgents', 'goog.labs.userAgent.util', 'goog.testing.jsunit']);
goog.addDependency('labs/useragent/device.js', ['goog.labs.userAgent.device'], ['goog.labs.userAgent.util']);
goog.addDependency('labs/useragent/device_test.js', ['goog.labs.userAgent.deviceTest'], ['goog.labs.userAgent.device', 'goog.labs.userAgent.testAgents', 'goog.labs.userAgent.util', 'goog.testing.jsunit']);
goog.addDependency('labs/useragent/engine.js', ['goog.labs.userAgent.engine'], ['goog.array', 'goog.labs.userAgent.util', 'goog.string']);
goog.addDependency('labs/useragent/engine_test.js', ['goog.labs.userAgent.engineTest'], ['goog.labs.userAgent.engine', 'goog.labs.userAgent.testAgents', 'goog.labs.userAgent.util', 'goog.testing.jsunit']);
goog.addDependency('labs/useragent/platform.js', ['goog.labs.userAgent.platform'], ['goog.labs.userAgent.util', 'goog.string']);
goog.addDependency('labs/useragent/platform_test.js', ['goog.labs.userAgent.platformTest'], ['goog.labs.userAgent.platform', 'goog.labs.userAgent.testAgents', 'goog.labs.userAgent.util', 'goog.testing.jsunit']);
goog.addDependency('labs/useragent/test_agents.js', ['goog.labs.userAgent.testAgents'], []);
goog.addDependency('labs/useragent/util.js', ['goog.labs.userAgent.util'], ['goog.string']);
goog.addDependency('labs/useragent/util_test.js', ['goog.labs.userAgent.utilTest'], ['goog.functions', 'goog.labs.userAgent.testAgents', 'goog.labs.userAgent.util', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit']);
goog.addDependency('locale/countries.js', ['goog.locale.countries'], []);
goog.addDependency('locale/countrylanguagenames_test.js', ['goog.locale.countryLanguageNamesTest'], ['goog.locale', 'goog.testing.jsunit']);
goog.addDependency('locale/defaultlocalenameconstants.js', ['goog.locale.defaultLocaleNameConstants'], []);
goog.addDependency('locale/genericfontnames.js', ['goog.locale.genericFontNames'], []);
goog.addDependency('locale/genericfontnames_test.js', ['goog.locale.genericFontNamesTest'], ['goog.locale.genericFontNames', 'goog.testing.jsunit']);
goog.addDependency('locale/genericfontnamesdata.js', ['goog.locale.genericFontNamesData'], []);
goog.addDependency('locale/locale.js', ['goog.locale'], ['goog.locale.nativeNameConstants']);
goog.addDependency('locale/nativenameconstants.js', ['goog.locale.nativeNameConstants'], []);
goog.addDependency('locale/scriptToLanguages.js', ['goog.locale.scriptToLanguages'], ['goog.locale']);
goog.addDependency('locale/timezonedetection.js', ['goog.locale.timeZoneDetection'], ['goog.locale', 'goog.locale.TimeZoneFingerprint']);
goog.addDependency('locale/timezonedetection_test.js', ['goog.locale.timeZoneDetectionTest'], ['goog.locale.timeZoneDetection', 'goog.testing.jsunit']);
goog.addDependency('locale/timezonefingerprint.js', ['goog.locale.TimeZoneFingerprint'], []);
goog.addDependency('locale/timezonelist.js', ['goog.locale.TimeZoneList'], ['goog.locale']);
goog.addDependency('locale/timezonelist_test.js', ['goog.locale.TimeZoneListTest'], ['goog.locale', 'goog.locale.TimeZoneList', 'goog.testing.jsunit']);
goog.addDependency('log/log.js', ['goog.log', 'goog.log.Level', 'goog.log.LogRecord', 'goog.log.Logger'], ['goog.debug', 'goog.debug.LogManager', 'goog.debug.LogRecord', 'goog.debug.Logger']);
goog.addDependency('log/log_test.js', ['goog.logTest'], ['goog.debug.LogManager', 'goog.log', 'goog.log.Level', 'goog.testing.jsunit']);
goog.addDependency('math/affinetransform.js', ['goog.math.AffineTransform'], ['goog.math']);
goog.addDependency('math/affinetransform_test.js', ['goog.math.AffineTransformTest'], ['goog.array', 'goog.math', 'goog.math.AffineTransform', 'goog.testing.jsunit']);
goog.addDependency('math/bezier.js', ['goog.math.Bezier'], ['goog.math', 'goog.math.Coordinate']);
goog.addDependency('math/bezier_test.js', ['goog.math.BezierTest'], ['goog.math', 'goog.math.Bezier', 'goog.math.Coordinate', 'goog.testing.jsunit']);
goog.addDependency('math/box.js', ['goog.math.Box'], ['goog.math.Coordinate']);
goog.addDependency('math/box_test.js', ['goog.math.BoxTest'], ['goog.math.Box', 'goog.math.Coordinate', 'goog.testing.jsunit']);
goog.addDependency('math/coordinate.js', ['goog.math.Coordinate'], ['goog.math']);
goog.addDependency('math/coordinate3.js', ['goog.math.Coordinate3'], []);
goog.addDependency('math/coordinate3_test.js', ['goog.math.Coordinate3Test'], ['goog.math.Coordinate3', 'goog.testing.jsunit']);
goog.addDependency('math/coordinate_test.js', ['goog.math.CoordinateTest'], ['goog.math.Coordinate', 'goog.testing.jsunit']);
goog.addDependency('math/exponentialbackoff.js', ['goog.math.ExponentialBackoff'], ['goog.asserts']);
goog.addDependency('math/exponentialbackoff_test.js', ['goog.math.ExponentialBackoffTest'], ['goog.math.ExponentialBackoff', 'goog.testing.jsunit']);
goog.addDependency('math/integer.js', ['goog.math.Integer'], []);
goog.addDependency('math/integer_test.js', ['goog.math.IntegerTest'], ['goog.math.Integer', 'goog.testing.jsunit']);
goog.addDependency('math/interpolator/interpolator1.js', ['goog.math.interpolator.Interpolator1'], []);
goog.addDependency('math/interpolator/linear1.js', ['goog.math.interpolator.Linear1'], ['goog.array', 'goog.math', 'goog.math.interpolator.Interpolator1']);
goog.addDependency('math/interpolator/linear1_test.js', ['goog.math.interpolator.Linear1Test'], ['goog.math.interpolator.Linear1', 'goog.testing.jsunit']);
goog.addDependency('math/interpolator/pchip1.js', ['goog.math.interpolator.Pchip1'], ['goog.math', 'goog.math.interpolator.Spline1']);
goog.addDependency('math/interpolator/pchip1_test.js', ['goog.math.interpolator.Pchip1Test'], ['goog.math.interpolator.Pchip1', 'goog.testing.jsunit']);
goog.addDependency('math/interpolator/spline1.js', ['goog.math.interpolator.Spline1'], ['goog.array', 'goog.math', 'goog.math.interpolator.Interpolator1', 'goog.math.tdma']);
goog.addDependency('math/interpolator/spline1_test.js', ['goog.math.interpolator.Spline1Test'], ['goog.math.interpolator.Spline1', 'goog.testing.jsunit']);
goog.addDependency('math/line.js', ['goog.math.Line'], ['goog.math', 'goog.math.Coordinate']);
goog.addDependency('math/line_test.js', ['goog.math.LineTest'], ['goog.math.Coordinate', 'goog.math.Line', 'goog.testing.jsunit']);
goog.addDependency('math/long.js', ['goog.math.Long'], []);
goog.addDependency('math/long_test.js', ['goog.math.LongTest'], ['goog.math.Long', 'goog.testing.jsunit']);
goog.addDependency('math/math.js', ['goog.math'], ['goog.array', 'goog.asserts']);
goog.addDependency('math/math_test.js', ['goog.mathTest'], ['goog.math', 'goog.testing.jsunit']);
goog.addDependency('math/matrix.js', ['goog.math.Matrix'], ['goog.array', 'goog.math', 'goog.math.Size', 'goog.string']);
goog.addDependency('math/matrix_test.js', ['goog.math.MatrixTest'], ['goog.math.Matrix', 'goog.testing.jsunit']);
goog.addDependency('math/path.js', ['goog.math.Path', 'goog.math.Path.Segment'], ['goog.array', 'goog.math']);
goog.addDependency('math/path_test.js', ['goog.math.PathTest'], ['goog.array', 'goog.math.AffineTransform', 'goog.math.Path', 'goog.testing.jsunit']);
goog.addDependency('math/paths.js', ['goog.math.paths'], ['goog.math.Coordinate', 'goog.math.Path']);
goog.addDependency('math/paths_test.js', ['goog.math.pathsTest'], ['goog.math.Coordinate', 'goog.math.paths', 'goog.testing.jsunit']);
goog.addDependency('math/range.js', ['goog.math.Range'], ['goog.asserts']);
goog.addDependency('math/range_test.js', ['goog.math.RangeTest'], ['goog.math.Range', 'goog.testing.jsunit']);
goog.addDependency('math/rangeset.js', ['goog.math.RangeSet'], ['goog.array', 'goog.iter.Iterator', 'goog.iter.StopIteration', 'goog.math.Range']);
goog.addDependency('math/rangeset_test.js', ['goog.math.RangeSetTest'], ['goog.iter', 'goog.math.Range', 'goog.math.RangeSet', 'goog.testing.jsunit']);
goog.addDependency('math/rect.js', ['goog.math.Rect'], ['goog.math.Box', 'goog.math.Coordinate', 'goog.math.Size']);
goog.addDependency('math/rect_test.js', ['goog.math.RectTest'], ['goog.math.Box', 'goog.math.Coordinate', 'goog.math.Rect', 'goog.math.Size', 'goog.testing.jsunit']);
goog.addDependency('math/size.js', ['goog.math.Size'], []);
goog.addDependency('math/size_test.js', ['goog.math.SizeTest'], ['goog.math.Size', 'goog.testing.jsunit']);
goog.addDependency('math/tdma.js', ['goog.math.tdma'], []);
goog.addDependency('math/tdma_test.js', ['goog.math.tdmaTest'], ['goog.math.tdma', 'goog.testing.jsunit']);
goog.addDependency('math/vec2.js', ['goog.math.Vec2'], ['goog.math', 'goog.math.Coordinate']);
goog.addDependency('math/vec2_test.js', ['goog.math.Vec2Test'], ['goog.math.Vec2', 'goog.testing.jsunit']);
goog.addDependency('math/vec3.js', ['goog.math.Vec3'], ['goog.math', 'goog.math.Coordinate3']);
goog.addDependency('math/vec3_test.js', ['goog.math.Vec3Test'], ['goog.math.Coordinate3', 'goog.math.Vec3', 'goog.testing.jsunit']);
goog.addDependency('memoize/memoize.js', ['goog.memoize'], []);
goog.addDependency('memoize/memoize_test.js', ['goog.memoizeTest'], ['goog.memoize', 'goog.testing.jsunit']);
goog.addDependency('messaging/abstractchannel.js', ['goog.messaging.AbstractChannel'], ['goog.Disposable', 'goog.debug', 'goog.json', 'goog.log', 'goog.messaging.MessageChannel']);
goog.addDependency('messaging/abstractchannel_test.js', ['goog.messaging.AbstractChannelTest'], ['goog.messaging.AbstractChannel', 'goog.testing.MockControl', 'goog.testing.async.MockControl', 'goog.testing.jsunit']);
goog.addDependency('messaging/bufferedchannel.js', ['goog.messaging.BufferedChannel'], ['goog.Timer', 'goog.Uri', 'goog.debug.Error', 'goog.events', 'goog.log', 'goog.messaging.MessageChannel', 'goog.messaging.MultiChannel']);
goog.addDependency('messaging/bufferedchannel_test.js', ['goog.messaging.BufferedChannelTest'], ['goog.debug.Console', 'goog.dom', 'goog.log', 'goog.log.Level', 'goog.messaging.BufferedChannel', 'goog.testing.MockClock', 'goog.testing.MockControl', 'goog.testing.async.MockControl', 'goog.testing.jsunit', 'goog.testing.messaging.MockMessageChannel']);
goog.addDependency('messaging/deferredchannel.js', ['goog.messaging.DeferredChannel'], ['goog.Disposable', 'goog.async.Deferred', 'goog.messaging.MessageChannel']);
goog.addDependency('messaging/deferredchannel_test.js', ['goog.messaging.DeferredChannelTest'], ['goog.async.Deferred', 'goog.messaging.DeferredChannel', 'goog.testing.MockControl', 'goog.testing.async.MockControl', 'goog.testing.jsunit', 'goog.testing.messaging.MockMessageChannel']);
goog.addDependency('messaging/loggerclient.js', ['goog.messaging.LoggerClient'], ['goog.Disposable', 'goog.debug', 'goog.debug.LogManager', 'goog.debug.Logger']);
goog.addDependency('messaging/loggerclient_test.js', ['goog.messaging.LoggerClientTest'], ['goog.debug', 'goog.debug.Logger', 'goog.messaging.LoggerClient', 'goog.testing.MockControl', 'goog.testing.jsunit', 'goog.testing.messaging.MockMessageChannel']);
goog.addDependency('messaging/loggerserver.js', ['goog.messaging.LoggerServer'], ['goog.Disposable', 'goog.log']);
goog.addDependency('messaging/loggerserver_test.js', ['goog.messaging.LoggerServerTest'], ['goog.debug.LogManager', 'goog.debug.Logger', 'goog.log', 'goog.log.Level', 'goog.messaging.LoggerServer', 'goog.testing.MockControl', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit', 'goog.testing.messaging.MockMessageChannel']);
goog.addDependency('messaging/messagechannel.js', ['goog.messaging.MessageChannel'], []);
goog.addDependency('messaging/messaging.js', ['goog.messaging'], ['goog.messaging.MessageChannel']);
goog.addDependency('messaging/messaging_test.js', ['goog.testing.messaging.MockMessageChannelTest'], ['goog.messaging', 'goog.testing.MockControl', 'goog.testing.jsunit', 'goog.testing.messaging.MockMessageChannel']);
goog.addDependency('messaging/multichannel.js', ['goog.messaging.MultiChannel', 'goog.messaging.MultiChannel.VirtualChannel'], ['goog.Disposable', 'goog.events.EventHandler', 'goog.log', 'goog.messaging.MessageChannel', 'goog.object']);
goog.addDependency('messaging/multichannel_test.js', ['goog.messaging.MultiChannelTest'], ['goog.messaging.MultiChannel', 'goog.testing.MockControl', 'goog.testing.jsunit', 'goog.testing.messaging.MockMessageChannel', 'goog.testing.mockmatchers.IgnoreArgument']);
goog.addDependency('messaging/portcaller.js', ['goog.messaging.PortCaller'], ['goog.Disposable', 'goog.async.Deferred', 'goog.messaging.DeferredChannel', 'goog.messaging.PortChannel', 'goog.messaging.PortNetwork', 'goog.object']);
goog.addDependency('messaging/portcaller_test.js', ['goog.messaging.PortCallerTest'], ['goog.events.EventTarget', 'goog.messaging.PortCaller', 'goog.messaging.PortNetwork', 'goog.testing.MockControl', 'goog.testing.jsunit', 'goog.testing.messaging.MockMessageChannel']);
goog.addDependency('messaging/portchannel.js', ['goog.messaging.PortChannel'], ['goog.Timer', 'goog.array', 'goog.async.Deferred', 'goog.debug', 'goog.dom', 'goog.dom.DomHelper', 'goog.events', 'goog.events.EventType', 'goog.json', 'goog.log', 'goog.messaging.AbstractChannel', 'goog.messaging.DeferredChannel', 'goog.object', 'goog.string']);
goog.addDependency('messaging/portnetwork.js', ['goog.messaging.PortNetwork'], []);
goog.addDependency('messaging/portoperator.js', ['goog.messaging.PortOperator'], ['goog.Disposable', 'goog.asserts', 'goog.log', 'goog.messaging.PortChannel', 'goog.messaging.PortNetwork', 'goog.object']);
goog.addDependency('messaging/portoperator_test.js', ['goog.messaging.PortOperatorTest'], ['goog.messaging.PortNetwork', 'goog.messaging.PortOperator', 'goog.testing.MockControl', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit', 'goog.testing.messaging.MockMessageChannel', 'goog.testing.messaging.MockMessagePort']);
goog.addDependency('messaging/respondingchannel.js', ['goog.messaging.RespondingChannel'], ['goog.Disposable', 'goog.log', 'goog.messaging.MessageChannel', 'goog.messaging.MultiChannel', 'goog.messaging.MultiChannel.VirtualChannel']);
goog.addDependency('messaging/respondingchannel_test.js', ['goog.messaging.RespondingChannelTest'], ['goog.messaging.RespondingChannel', 'goog.testing.MockControl', 'goog.testing.jsunit', 'goog.testing.messaging.MockMessageChannel']);
goog.addDependency('messaging/testdata/portchannel_worker.js', ['goog.messaging.testdata.portchannel_worker'], ['goog.messaging.PortChannel']);
goog.addDependency('messaging/testdata/portnetwork_worker1.js', ['goog.messaging.testdata.portnetwork_worker1'], ['goog.messaging.PortCaller', 'goog.messaging.PortChannel']);
goog.addDependency('messaging/testdata/portnetwork_worker2.js', ['goog.messaging.testdata.portnetwork_worker2'], ['goog.messaging.PortCaller', 'goog.messaging.PortChannel']);
goog.addDependency('module/abstractmoduleloader.js', ['goog.module.AbstractModuleLoader'], []);
goog.addDependency('module/basemodule.js', ['goog.module.BaseModule'], ['goog.Disposable']);
goog.addDependency('module/loader.js', ['goog.module.Loader'], ['goog.Timer', 'goog.array', 'goog.dom', 'goog.object']);
goog.addDependency('module/module.js', ['goog.module'], ['goog.array', 'goog.module.Loader']);
goog.addDependency('module/moduleinfo.js', ['goog.module.ModuleInfo'], ['goog.Disposable', 'goog.functions', 'goog.module.BaseModule', 'goog.module.ModuleLoadCallback']);
goog.addDependency('module/moduleinfo_test.js', ['goog.module.ModuleInfoTest'], ['goog.module.BaseModule', 'goog.module.ModuleInfo', 'goog.testing.jsunit']);
goog.addDependency('module/moduleloadcallback.js', ['goog.module.ModuleLoadCallback'], ['goog.debug.entryPointRegistry', 'goog.debug.errorHandlerWeakDep']);
goog.addDependency('module/moduleloadcallback_test.js', ['goog.module.ModuleLoadCallbackTest'], ['goog.debug.ErrorHandler', 'goog.debug.entryPointRegistry', 'goog.functions', 'goog.module.ModuleLoadCallback', 'goog.testing.jsunit', 'goog.testing.recordFunction']);
goog.addDependency('module/moduleloader.js', ['goog.module.ModuleLoader'], ['goog.Timer', 'goog.array', 'goog.events', 'goog.events.Event', 'goog.events.EventHandler', 'goog.events.EventTarget', 'goog.log', 'goog.module.AbstractModuleLoader', 'goog.net.BulkLoader', 'goog.net.EventType', 'goog.net.jsloader', 'goog.userAgent.product']);
goog.addDependency('module/moduleloader_test.js', ['goog.module.ModuleLoaderTest'], ['goog.array', 'goog.dom', 'goog.functions', 'goog.module.ModuleLoader', 'goog.module.ModuleManager', 'goog.module.ModuleManager.CallbackType', 'goog.object', 'goog.testing.AsyncTestCase', 'goog.testing.PropertyReplacer', 'goog.testing.events.EventObserver', 'goog.testing.jsunit', 'goog.testing.recordFunction', 'goog.userAgent.product']);
goog.addDependency('module/modulemanager.js', ['goog.module.ModuleManager', 'goog.module.ModuleManager.CallbackType', 'goog.module.ModuleManager.FailureType'], ['goog.Disposable', 'goog.array', 'goog.asserts', 'goog.async.Deferred', 'goog.debug.Trace', 'goog.dispose', 'goog.log', 'goog.module.ModuleInfo', 'goog.module.ModuleLoadCallback', 'goog.object']);
goog.addDependency('module/modulemanager_test.js', ['goog.module.ModuleManagerTest'], ['goog.array', 'goog.functions', 'goog.module.BaseModule', 'goog.module.ModuleManager', 'goog.testing', 'goog.testing.MockClock', 'goog.testing.jsunit', 'goog.testing.recordFunction', 'goog.userAgent']);
goog.addDependency('module/testdata/modA_1.js', ['goog.module.testdata.modA_1'], []);
goog.addDependency('module/testdata/modA_2.js', ['goog.module.testdata.modA_2'], ['goog.module.ModuleManager']);
goog.addDependency('module/testdata/modB_1.js', ['goog.module.testdata.modB_1'], ['goog.module.ModuleManager']);
goog.addDependency('net/browserchannel.js', ['goog.net.BrowserChannel', 'goog.net.BrowserChannel.Error', 'goog.net.BrowserChannel.Event', 'goog.net.BrowserChannel.Handler', 'goog.net.BrowserChannel.LogSaver', 'goog.net.BrowserChannel.QueuedMap', 'goog.net.BrowserChannel.ServerReachability', 'goog.net.BrowserChannel.ServerReachabilityEvent', 'goog.net.BrowserChannel.Stat', 'goog.net.BrowserChannel.StatEvent', 'goog.net.BrowserChannel.State', 'goog.net.BrowserChannel.TimingEvent'], ['goog.Uri', 'goog.array', 'goog.asserts', 'goog.debug.TextFormatter', 'goog.events.Event', 'goog.events.EventTarget', 'goog.json', 'goog.json.EvalJsonProcessor', 'goog.log', 'goog.net.BrowserTestChannel', 'goog.net.ChannelDebug', 'goog.net.ChannelRequest', 'goog.net.XhrIo', 'goog.net.tmpnetwork', 'goog.object', 'goog.string', 'goog.structs', 'goog.structs.CircularBuffer']);
goog.addDependency('net/browserchannel_test.js', ['goog.net.BrowserChannelTest'], ['goog.Timer', 'goog.array', 'goog.dom', 'goog.functions', 'goog.json', 'goog.net.BrowserChannel', 'goog.net.ChannelDebug', 'goog.net.ChannelRequest', 'goog.net.tmpnetwork', 'goog.structs.Map', 'goog.testing.MockClock', 'goog.testing.PropertyReplacer', 'goog.testing.asserts', 'goog.testing.jsunit', 'goog.testing.recordFunction']);
goog.addDependency('net/browsertestchannel.js', ['goog.net.BrowserTestChannel'], ['goog.json.EvalJsonProcessor', 'goog.net.ChannelRequest', 'goog.net.ChannelRequest.Error', 'goog.net.tmpnetwork', 'goog.string.Parser', 'goog.userAgent']);
goog.addDependency('net/bulkloader.js', ['goog.net.BulkLoader'], ['goog.events.EventHandler', 'goog.events.EventTarget', 'goog.log', 'goog.net.BulkLoaderHelper', 'goog.net.EventType', 'goog.net.XhrIo']);
goog.addDependency('net/bulkloader_test.js', ['goog.net.BulkLoaderTest'], ['goog.events.Event', 'goog.events.EventHandler', 'goog.net.BulkLoader', 'goog.net.EventType', 'goog.testing.MockClock', 'goog.testing.jsunit']);
goog.addDependency('net/bulkloaderhelper.js', ['goog.net.BulkLoaderHelper'], ['goog.Disposable', 'goog.log']);
goog.addDependency('net/channeldebug.js', ['goog.net.ChannelDebug'], ['goog.json', 'goog.log']);
goog.addDependency('net/channelrequest.js', ['goog.net.ChannelRequest', 'goog.net.ChannelRequest.Error'], ['goog.Timer', 'goog.async.Throttle', 'goog.events.EventHandler', 'goog.net.ErrorCode', 'goog.net.EventType', 'goog.net.XmlHttp', 'goog.object', 'goog.userAgent']);
goog.addDependency('net/channelrequest_test.js', ['goog.net.ChannelRequestTest'], ['goog.Uri', 'goog.functions', 'goog.net.BrowserChannel', 'goog.net.ChannelDebug', 'goog.net.ChannelRequest', 'goog.testing.MockClock', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit', 'goog.testing.net.XhrIo', 'goog.testing.recordFunction']);
goog.addDependency('net/cookies.js', ['goog.net.Cookies', 'goog.net.cookies'], []);
goog.addDependency('net/cookies_test.js', ['goog.net.cookiesTest'], ['goog.array', 'goog.net.cookies', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit']);
goog.addDependency('net/corsxmlhttpfactory.js', ['goog.net.CorsXmlHttpFactory', 'goog.net.IeCorsXhrAdapter'], ['goog.net.HttpStatus', 'goog.net.XhrLike', 'goog.net.XmlHttp', 'goog.net.XmlHttpFactory']);
goog.addDependency('net/corsxmlhttpfactory_test.js', ['goog.net.CorsXmlHttpFactoryTest'], ['goog.net.CorsXmlHttpFactory', 'goog.net.IeCorsXhrAdapter', 'goog.testing.jsunit', 'goog.userAgent']);
goog.addDependency('net/crossdomainrpc.js', ['goog.net.CrossDomainRpc'], ['goog.Uri', 'goog.dom', 'goog.events', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.json', 'goog.log', 'goog.net.EventType', 'goog.net.HttpStatus', 'goog.string', 'goog.userAgent']);
goog.addDependency('net/crossdomainrpc_test.js', ['goog.net.CrossDomainRpcTest'], ['goog.log', 'goog.log.Level', 'goog.net.CrossDomainRpc', 'goog.testing.jsunit']);
goog.addDependency('net/errorcode.js', ['goog.net.ErrorCode'], []);
goog.addDependency('net/eventtype.js', ['goog.net.EventType'], []);
goog.addDependency('net/filedownloader.js', ['goog.net.FileDownloader', 'goog.net.FileDownloader.Error'], ['goog.Disposable', 'goog.asserts', 'goog.async.Deferred', 'goog.crypt.hash32', 'goog.debug.Error', 'goog.events', 'goog.events.EventHandler', 'goog.fs', 'goog.fs.DirectoryEntry', 'goog.fs.Error', 'goog.fs.FileSaver', 'goog.net.EventType', 'goog.net.XhrIo', 'goog.net.XhrIoPool', 'goog.object']);
goog.addDependency('net/filedownloader_test.js', ['goog.net.FileDownloaderTest'], ['goog.fs.Error', 'goog.net.ErrorCode', 'goog.net.FileDownloader', 'goog.net.XhrIo', 'goog.testing.AsyncTestCase', 'goog.testing.PropertyReplacer', 'goog.testing.fs', 'goog.testing.fs.FileSystem', 'goog.testing.jsunit', 'goog.testing.net.XhrIoPool']);
goog.addDependency('net/httpstatus.js', ['goog.net.HttpStatus'], []);
goog.addDependency('net/iframe_xhr_test.js', ['goog.net.iframeXhrTest'], ['goog.Timer', 'goog.debug.Console', 'goog.debug.LogManager', 'goog.debug.Logger', 'goog.events', 'goog.net.IframeIo', 'goog.net.XhrIo', 'goog.testing.AsyncTestCase', 'goog.testing.jsunit', 'goog.userAgent']);
goog.addDependency('net/iframeio.js', ['goog.net.IframeIo', 'goog.net.IframeIo.IncrementalDataEvent'], ['goog.Timer', 'goog.Uri', 'goog.asserts', 'goog.debug', 'goog.dom', 'goog.events', 'goog.events.Event', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.json', 'goog.log', 'goog.log.Level', 'goog.net.ErrorCode', 'goog.net.EventType', 'goog.reflect', 'goog.string', 'goog.structs', 'goog.userAgent']);
goog.addDependency('net/iframeio_different_base_test.js', ['goog.net.iframeIoDifferentBaseTest'], ['goog.events', 'goog.net.EventType', 'goog.net.IframeIo', 'goog.testing.AsyncTestCase', 'goog.testing.jsunit']);
goog.addDependency('net/iframeio_test.js', ['goog.net.IframeIoTest'], ['goog.debug', 'goog.debug.DivConsole', 'goog.debug.LogManager', 'goog.dom', 'goog.events', 'goog.events.EventType', 'goog.log', 'goog.log.Level', 'goog.net.IframeIo', 'goog.testing.events', 'goog.testing.events.Event', 'goog.testing.jsunit', 'goog.userAgent']);
goog.addDependency('net/iframeloadmonitor.js', ['goog.net.IframeLoadMonitor'], ['goog.dom', 'goog.events', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.userAgent']);
goog.addDependency('net/iframeloadmonitor_test.js', ['goog.net.IframeLoadMonitorTest'], ['goog.dom', 'goog.events', 'goog.net.IframeLoadMonitor', 'goog.testing.AsyncTestCase', 'goog.testing.jsunit']);
goog.addDependency('net/imageloader.js', ['goog.net.ImageLoader'], ['goog.array', 'goog.dom', 'goog.events.EventHandler', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.net.EventType', 'goog.object', 'goog.userAgent']);
goog.addDependency('net/imageloader_test.js', ['goog.net.ImageLoaderTest'], ['goog.Timer', 'goog.array', 'goog.dispose', 'goog.events', 'goog.events.Event', 'goog.events.EventType', 'goog.net.EventType', 'goog.net.ImageLoader', 'goog.object', 'goog.string', 'goog.testing.AsyncTestCase', 'goog.testing.jsunit', 'goog.testing.recordFunction']);
goog.addDependency('net/ipaddress.js', ['goog.net.IpAddress', 'goog.net.Ipv4Address', 'goog.net.Ipv6Address'], ['goog.array', 'goog.math.Integer', 'goog.object', 'goog.string']);
goog.addDependency('net/ipaddress_test.js', ['goog.net.IpAddressTest'], ['goog.math.Integer', 'goog.net.IpAddress', 'goog.net.Ipv4Address', 'goog.net.Ipv6Address', 'goog.testing.jsunit']);
goog.addDependency('net/jsloader.js', ['goog.net.jsloader', 'goog.net.jsloader.Error', 'goog.net.jsloader.ErrorCode', 'goog.net.jsloader.Options'], ['goog.array', 'goog.async.Deferred', 'goog.debug.Error', 'goog.dom', 'goog.dom.TagName']);
goog.addDependency('net/jsloader_test.js', ['goog.net.jsloaderTest'], ['goog.array', 'goog.dom', 'goog.net.jsloader', 'goog.net.jsloader.ErrorCode', 'goog.testing.AsyncTestCase', 'goog.testing.jsunit']);
goog.addDependency('net/jsonp.js', ['goog.net.Jsonp'], ['goog.Uri', 'goog.net.jsloader']);
goog.addDependency('net/jsonp_test.js', ['goog.net.JsonpTest'], ['goog.net.Jsonp', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit', 'goog.testing.recordFunction', 'goog.userAgent']);
goog.addDependency('net/mockiframeio.js', ['goog.net.MockIFrameIo'], ['goog.events.EventTarget', 'goog.json', 'goog.net.ErrorCode', 'goog.net.EventType', 'goog.net.IframeIo']);
goog.addDependency('net/multiiframeloadmonitor.js', ['goog.net.MultiIframeLoadMonitor'], ['goog.events', 'goog.net.IframeLoadMonitor']);
goog.addDependency('net/multiiframeloadmonitor_test.js', ['goog.net.MultiIframeLoadMonitorTest'], ['goog.dom', 'goog.net.IframeLoadMonitor', 'goog.net.MultiIframeLoadMonitor', 'goog.testing.AsyncTestCase', 'goog.testing.jsunit']);
goog.addDependency('net/networkstatusmonitor.js', ['goog.net.NetworkStatusMonitor'], ['goog.events.Listenable']);
goog.addDependency('net/networktester.js', ['goog.net.NetworkTester'], ['goog.Timer', 'goog.Uri', 'goog.log']);
goog.addDependency('net/networktester_test.js', ['goog.net.NetworkTesterTest'], ['goog.Uri', 'goog.net.NetworkTester', 'goog.testing.MockClock', 'goog.testing.jsunit']);
goog.addDependency('net/testdata/jsloader_test1.js', ['goog.net.testdata.jsloader_test1'], []);
goog.addDependency('net/testdata/jsloader_test2.js', ['goog.net.testdata.jsloader_test2'], []);
goog.addDependency('net/testdata/jsloader_test3.js', ['goog.net.testdata.jsloader_test3'], []);
goog.addDependency('net/testdata/jsloader_test4.js', ['goog.net.testdata.jsloader_test4'], []);
goog.addDependency('net/tmpnetwork.js', ['goog.net.tmpnetwork'], ['goog.Uri', 'goog.net.ChannelDebug']);
goog.addDependency('net/websocket.js', ['goog.net.WebSocket', 'goog.net.WebSocket.ErrorEvent', 'goog.net.WebSocket.EventType', 'goog.net.WebSocket.MessageEvent'], ['goog.Timer', 'goog.asserts', 'goog.debug.entryPointRegistry', 'goog.events', 'goog.events.Event', 'goog.events.EventTarget', 'goog.log']);
goog.addDependency('net/websocket_test.js', ['goog.net.WebSocketTest'], ['goog.debug.EntryPointMonitor', 'goog.debug.ErrorHandler', 'goog.debug.entryPointRegistry', 'goog.events', 'goog.functions', 'goog.net.WebSocket', 'goog.testing.MockClock', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit', 'goog.testing.recordFunction']);
goog.addDependency('net/wrapperxmlhttpfactory.js', ['goog.net.WrapperXmlHttpFactory'], ['goog.net.XhrLike', 'goog.net.XmlHttpFactory']);
goog.addDependency('net/xhrio.js', ['goog.net.XhrIo', 'goog.net.XhrIo.ResponseType'], ['goog.Timer', 'goog.array', 'goog.debug.entryPointRegistry', 'goog.events.EventTarget', 'goog.json', 'goog.log', 'goog.net.ErrorCode', 'goog.net.EventType', 'goog.net.HttpStatus', 'goog.net.XmlHttp', 'goog.object', 'goog.string', 'goog.structs', 'goog.structs.Map', 'goog.uri.utils', 'goog.userAgent']);
goog.addDependency('net/xhrio_test.js', ['goog.net.XhrIoTest'], ['goog.Uri', 'goog.debug.EntryPointMonitor', 'goog.debug.ErrorHandler', 'goog.debug.entryPointRegistry', 'goog.events', 'goog.functions', 'goog.net.EventType', 'goog.net.WrapperXmlHttpFactory', 'goog.net.XhrIo', 'goog.net.XmlHttp', 'goog.object', 'goog.string', 'goog.testing.MockClock', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit', 'goog.testing.net.XhrIo', 'goog.testing.recordFunction']);
goog.addDependency('net/xhriopool.js', ['goog.net.XhrIoPool'], ['goog.net.XhrIo', 'goog.structs.PriorityPool']);
goog.addDependency('net/xhrlike.js', ['goog.net.XhrLike'], []);
goog.addDependency('net/xhrmanager.js', ['goog.net.XhrManager', 'goog.net.XhrManager.Event', 'goog.net.XhrManager.Request'], ['goog.events', 'goog.events.Event', 'goog.events.EventHandler', 'goog.events.EventTarget', 'goog.net.ErrorCode', 'goog.net.EventType', 'goog.net.XhrIo', 'goog.net.XhrIoPool', 'goog.structs.Map']);
goog.addDependency('net/xhrmanager_test.js', ['goog.net.XhrManagerTest'], ['goog.events', 'goog.net.EventType', 'goog.net.XhrIo', 'goog.net.XhrManager', 'goog.testing.jsunit', 'goog.testing.net.XhrIoPool', 'goog.testing.recordFunction']);
goog.addDependency('net/xmlhttp.js', ['goog.net.DefaultXmlHttpFactory', 'goog.net.XmlHttp', 'goog.net.XmlHttp.OptionType', 'goog.net.XmlHttp.ReadyState', 'goog.net.XmlHttpDefines'], ['goog.asserts', 'goog.net.WrapperXmlHttpFactory', 'goog.net.XmlHttpFactory']);
goog.addDependency('net/xmlhttpfactory.js', ['goog.net.XmlHttpFactory'], ['goog.net.XhrLike']);
goog.addDependency('net/xpc/crosspagechannel.js', ['goog.net.xpc.CrossPageChannel'], ['goog.Uri', 'goog.async.Deferred', 'goog.async.Delay', 'goog.dispose', 'goog.dom', 'goog.events', 'goog.events.EventHandler', 'goog.events.EventType', 'goog.json', 'goog.log', 'goog.messaging.AbstractChannel', 'goog.net.xpc', 'goog.net.xpc.CfgFields', 'goog.net.xpc.ChannelStates', 'goog.net.xpc.CrossPageChannelRole', 'goog.net.xpc.DirectTransport', 'goog.net.xpc.FrameElementMethodTransport', 'goog.net.xpc.IframePollingTransport', 'goog.net.xpc.IframeRelayTransport', 'goog.net.xpc.NativeMessagingTransport', 'goog.net.xpc.NixTransport', 'goog.net.xpc.TransportTypes', 'goog.net.xpc.UriCfgFields', 'goog.string', 'goog.uri.utils', 'goog.userAgent']);
goog.addDependency('net/xpc/crosspagechannel_test.js', ['goog.net.xpc.CrossPageChannelTest'], ['goog.Disposable', 'goog.Uri', 'goog.async.Deferred', 'goog.dom', 'goog.log', 'goog.log.Level', 'goog.net.xpc', 'goog.net.xpc.CfgFields', 'goog.net.xpc.CrossPageChannel', 'goog.net.xpc.CrossPageChannelRole', 'goog.net.xpc.TransportTypes', 'goog.object', 'goog.testing.AsyncTestCase', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit']);
goog.addDependency('net/xpc/crosspagechannelrole.js', ['goog.net.xpc.CrossPageChannelRole'], []);
goog.addDependency('net/xpc/directtransport.js', ['goog.net.xpc.DirectTransport'], ['goog.Timer', 'goog.async.Deferred', 'goog.events.EventHandler', 'goog.log', 'goog.net.xpc', 'goog.net.xpc.CfgFields', 'goog.net.xpc.CrossPageChannelRole', 'goog.net.xpc.Transport', 'goog.net.xpc.TransportTypes', 'goog.object']);
goog.addDependency('net/xpc/directtransport_test.js', ['goog.net.xpc.DirectTransportTest'], ['goog.dom', 'goog.log', 'goog.log.Level', 'goog.net.xpc', 'goog.net.xpc.CfgFields', 'goog.net.xpc.CrossPageChannel', 'goog.net.xpc.CrossPageChannelRole', 'goog.net.xpc.TransportTypes', 'goog.testing.AsyncTestCase', 'goog.testing.jsunit']);
goog.addDependency('net/xpc/frameelementmethodtransport.js', ['goog.net.xpc.FrameElementMethodTransport'], ['goog.log', 'goog.net.xpc', 'goog.net.xpc.CrossPageChannelRole', 'goog.net.xpc.Transport', 'goog.net.xpc.TransportTypes']);
goog.addDependency('net/xpc/iframepollingtransport.js', ['goog.net.xpc.IframePollingTransport', 'goog.net.xpc.IframePollingTransport.Receiver', 'goog.net.xpc.IframePollingTransport.Sender'], ['goog.array', 'goog.dom', 'goog.log', 'goog.log.Level', 'goog.net.xpc', 'goog.net.xpc.CfgFields', 'goog.net.xpc.CrossPageChannelRole', 'goog.net.xpc.Transport', 'goog.net.xpc.TransportTypes', 'goog.userAgent']);
goog.addDependency('net/xpc/iframepollingtransport_test.js', ['goog.net.xpc.IframePollingTransportTest'], ['goog.Timer', 'goog.dom', 'goog.dom.TagName', 'goog.functions', 'goog.net.xpc.CfgFields', 'goog.net.xpc.CrossPageChannel', 'goog.net.xpc.CrossPageChannelRole', 'goog.net.xpc.TransportTypes', 'goog.object', 'goog.testing.MockClock', 'goog.testing.jsunit', 'goog.testing.recordFunction']);
goog.addDependency('net/xpc/iframerelaytransport.js', ['goog.net.xpc.IframeRelayTransport'], ['goog.dom', 'goog.dom.safe', 'goog.events', 'goog.html.SafeHtml', 'goog.log', 'goog.log.Level', 'goog.net.xpc', 'goog.net.xpc.CfgFields', 'goog.net.xpc.Transport', 'goog.net.xpc.TransportTypes', 'goog.string', 'goog.string.Const', 'goog.userAgent']);
goog.addDependency('net/xpc/nativemessagingtransport.js', ['goog.net.xpc.NativeMessagingTransport'], ['goog.Timer', 'goog.asserts', 'goog.async.Deferred', 'goog.events', 'goog.events.EventHandler', 'goog.log', 'goog.net.xpc', 'goog.net.xpc.CrossPageChannelRole', 'goog.net.xpc.Transport', 'goog.net.xpc.TransportTypes']);
goog.addDependency('net/xpc/nativemessagingtransport_test.js', ['goog.net.xpc.NativeMessagingTransportTest'], ['goog.dom', 'goog.events', 'goog.net.xpc', 'goog.net.xpc.CfgFields', 'goog.net.xpc.CrossPageChannel', 'goog.net.xpc.CrossPageChannelRole', 'goog.net.xpc.NativeMessagingTransport', 'goog.testing.jsunit']);
goog.addDependency('net/xpc/nixtransport.js', ['goog.net.xpc.NixTransport'], ['goog.log', 'goog.net.xpc', 'goog.net.xpc.CfgFields', 'goog.net.xpc.CrossPageChannelRole', 'goog.net.xpc.Transport', 'goog.net.xpc.TransportTypes', 'goog.reflect']);
goog.addDependency('net/xpc/relay.js', ['goog.net.xpc.relay'], []);
goog.addDependency('net/xpc/transport.js', ['goog.net.xpc.Transport'], ['goog.Disposable', 'goog.dom', 'goog.net.xpc.TransportNames']);
goog.addDependency('net/xpc/xpc.js', ['goog.net.xpc', 'goog.net.xpc.CfgFields', 'goog.net.xpc.ChannelStates', 'goog.net.xpc.TransportNames', 'goog.net.xpc.TransportTypes', 'goog.net.xpc.UriCfgFields'], ['goog.log']);
goog.addDependency('object/object.js', ['goog.object'], []);
goog.addDependency('object/object_test.js', ['goog.objectTest'], ['goog.functions', 'goog.object', 'goog.testing.jsunit']);
goog.addDependency('positioning/absoluteposition.js', ['goog.positioning.AbsolutePosition'], ['goog.math.Box', 'goog.math.Coordinate', 'goog.math.Size', 'goog.positioning', 'goog.positioning.AbstractPosition']);
goog.addDependency('positioning/abstractposition.js', ['goog.positioning.AbstractPosition'], ['goog.math.Box', 'goog.math.Size', 'goog.positioning.Corner']);
goog.addDependency('positioning/anchoredposition.js', ['goog.positioning.AnchoredPosition'], ['goog.math.Box', 'goog.positioning', 'goog.positioning.AbstractPosition']);
goog.addDependency('positioning/anchoredposition_test.js', ['goog.positioning.AnchoredPositionTest'], ['goog.dom', 'goog.positioning.AnchoredPosition', 'goog.positioning.Corner', 'goog.positioning.Overflow', 'goog.style', 'goog.testing.jsunit']);
goog.addDependency('positioning/anchoredviewportposition.js', ['goog.positioning.AnchoredViewportPosition'], ['goog.math.Box', 'goog.positioning', 'goog.positioning.AnchoredPosition', 'goog.positioning.Corner', 'goog.positioning.Overflow', 'goog.positioning.OverflowStatus']);
goog.addDependency('positioning/anchoredviewportposition_test.js', ['goog.positioning.AnchoredViewportPositionTest'], ['goog.dom', 'goog.math.Box', 'goog.positioning.AnchoredViewportPosition', 'goog.positioning.Corner', 'goog.positioning.OverflowStatus', 'goog.style', 'goog.testing.jsunit']);
goog.addDependency('positioning/clientposition.js', ['goog.positioning.ClientPosition'], ['goog.asserts', 'goog.math.Box', 'goog.math.Coordinate', 'goog.math.Size', 'goog.positioning', 'goog.positioning.AbstractPosition', 'goog.style']);
goog.addDependency('positioning/clientposition_test.js', ['goog.positioning.clientPositionTest'], ['goog.dom', 'goog.positioning.ClientPosition', 'goog.style', 'goog.testing.jsunit']);
goog.addDependency('positioning/menuanchoredposition.js', ['goog.positioning.MenuAnchoredPosition'], ['goog.math.Box', 'goog.math.Size', 'goog.positioning', 'goog.positioning.AnchoredViewportPosition', 'goog.positioning.Corner', 'goog.positioning.Overflow']);
goog.addDependency('positioning/menuanchoredposition_test.js', ['goog.positioning.MenuAnchoredPositionTest'], ['goog.dom', 'goog.positioning.Corner', 'goog.positioning.MenuAnchoredPosition', 'goog.testing.jsunit']);
goog.addDependency('positioning/positioning.js', ['goog.positioning', 'goog.positioning.Corner', 'goog.positioning.CornerBit', 'goog.positioning.Overflow', 'goog.positioning.OverflowStatus'], ['goog.asserts', 'goog.dom', 'goog.dom.TagName', 'goog.math.Box', 'goog.math.Coordinate', 'goog.math.Size', 'goog.style', 'goog.style.bidi']);
goog.addDependency('positioning/positioning_test.js', ['goog.positioningTest'], ['goog.dom', 'goog.dom.DomHelper', 'goog.math.Box', 'goog.math.Coordinate', 'goog.math.Rect', 'goog.math.Size', 'goog.positioning', 'goog.positioning.Corner', 'goog.positioning.Overflow', 'goog.positioning.OverflowStatus', 'goog.style', 'goog.testing.ExpectedFailures', 'goog.testing.jsunit', 'goog.userAgent', 'goog.userAgent.product']);
goog.addDependency('positioning/viewportclientposition.js', ['goog.positioning.ViewportClientPosition'], ['goog.math.Box', 'goog.math.Coordinate', 'goog.math.Size', 'goog.positioning.ClientPosition']);
goog.addDependency('positioning/viewportclientposition_test.js', ['goog.positioning.ViewportClientPositionTest'], ['goog.dom', 'goog.positioning.Corner', 'goog.positioning.Overflow', 'goog.positioning.ViewportClientPosition', 'goog.style', 'goog.testing.jsunit', 'goog.userAgent']);
goog.addDependency('positioning/viewportposition.js', ['goog.positioning.ViewportPosition'], ['goog.math.Box', 'goog.math.Coordinate', 'goog.math.Size', 'goog.positioning.AbstractPosition']);
goog.addDependency('promise/promise.js', ['goog.Promise'], ['goog.Thenable', 'goog.asserts', 'goog.async.run', 'goog.async.throwException', 'goog.debug.Error', 'goog.promise.Resolver']);
goog.addDependency('promise/promise_test.js', ['goog.PromiseTest'], ['goog.Promise', 'goog.Thenable', 'goog.functions', 'goog.testing.AsyncTestCase', 'goog.testing.MockClock', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit', 'goog.testing.recordFunction']);
goog.addDependency('promise/resolver.js', ['goog.promise.Resolver'], []);
goog.addDependency('promise/testsuiteadapter.js', ['goog.promise.testSuiteAdapter'], ['goog.Promise']);
goog.addDependency('promise/thenable.js', ['goog.Thenable'], []);
goog.addDependency('proto/proto.js', ['goog.proto'], ['goog.proto.Serializer']);
goog.addDependency('proto/serializer.js', ['goog.proto.Serializer'], ['goog.json.Serializer', 'goog.string']);
goog.addDependency('proto/serializer_test.js', ['goog.protoTest'], ['goog.proto', 'goog.testing.jsunit']);
goog.addDependency('proto2/descriptor.js', ['goog.proto2.Descriptor', 'goog.proto2.Metadata'], ['goog.array', 'goog.asserts', 'goog.object', 'goog.string']);
goog.addDependency('proto2/descriptor_test.js', ['goog.proto2.DescriptorTest'], ['goog.proto2.Descriptor', 'goog.testing.jsunit']);
goog.addDependency('proto2/fielddescriptor.js', ['goog.proto2.FieldDescriptor'], ['goog.asserts', 'goog.string']);
goog.addDependency('proto2/fielddescriptor_test.js', ['goog.proto2.FieldDescriptorTest'], ['goog.proto2.FieldDescriptor', 'goog.proto2.Message', 'goog.testing.jsunit']);
goog.addDependency('proto2/lazydeserializer.js', ['goog.proto2.LazyDeserializer'], ['goog.asserts', 'goog.proto2.Message', 'goog.proto2.Serializer']);
goog.addDependency('proto2/message.js', ['goog.proto2.Message'], ['goog.asserts', 'goog.proto2.Descriptor', 'goog.proto2.FieldDescriptor']);
goog.addDependency('proto2/message_test.js', ['goog.proto2.MessageTest'], ['goog.testing.jsunit', 'proto2.TestAllTypes', 'proto2.TestAllTypes.NestedEnum', 'proto2.TestAllTypes.NestedMessage', 'proto2.TestAllTypes.OptionalGroup', 'proto2.TestAllTypes.RepeatedGroup']);
goog.addDependency('proto2/objectserializer.js', ['goog.proto2.ObjectSerializer'], ['goog.asserts', 'goog.proto2.Serializer', 'goog.string']);
goog.addDependency('proto2/objectserializer_test.js', ['goog.proto2.ObjectSerializerTest'], ['goog.proto2.ObjectSerializer', 'goog.proto2.Serializer', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit', 'proto2.TestAllTypes']);
goog.addDependency('proto2/package_test.pb.js', ['someprotopackage.TestPackageTypes'], ['goog.proto2.Message', 'proto2.TestAllTypes']);
goog.addDependency('proto2/pbliteserializer.js', ['goog.proto2.PbLiteSerializer'], ['goog.asserts', 'goog.proto2.FieldDescriptor', 'goog.proto2.LazyDeserializer', 'goog.proto2.Serializer']);
goog.addDependency('proto2/pbliteserializer_test.js', ['goog.proto2.PbLiteSerializerTest'], ['goog.proto2.PbLiteSerializer', 'goog.testing.jsunit', 'proto2.TestAllTypes']);
goog.addDependency('proto2/proto_test.js', ['goog.proto2.messageTest'], ['goog.proto2.FieldDescriptor', 'goog.testing.jsunit', 'proto2.TestAllTypes', 'someprotopackage.TestPackageTypes']);
goog.addDependency('proto2/serializer.js', ['goog.proto2.Serializer'], ['goog.asserts', 'goog.proto2.FieldDescriptor', 'goog.proto2.Message']);
goog.addDependency('proto2/test.pb.js', ['proto2.TestAllTypes', 'proto2.TestAllTypes.NestedEnum', 'proto2.TestAllTypes.NestedMessage', 'proto2.TestAllTypes.OptionalGroup', 'proto2.TestAllTypes.RepeatedGroup', 'proto2.TestDefaultChild', 'proto2.TestDefaultParent'], ['goog.proto2.Message']);
goog.addDependency('proto2/textformatserializer.js', ['goog.proto2.TextFormatSerializer'], ['goog.array', 'goog.asserts', 'goog.json', 'goog.math', 'goog.object', 'goog.proto2.FieldDescriptor', 'goog.proto2.Message', 'goog.proto2.Serializer', 'goog.string']);
goog.addDependency('proto2/textformatserializer_test.js', ['goog.proto2.TextFormatSerializerTest'], ['goog.proto2.ObjectSerializer', 'goog.proto2.TextFormatSerializer', 'goog.testing.jsunit', 'proto2.TestAllTypes']);
goog.addDependency('proto2/util.js', ['goog.proto2.Util'], ['goog.asserts']);
goog.addDependency('pubsub/pubsub.js', ['goog.pubsub.PubSub'], ['goog.Disposable', 'goog.array']);
goog.addDependency('pubsub/pubsub_test.js', ['goog.pubsub.PubSubTest'], ['goog.array', 'goog.pubsub.PubSub', 'goog.testing.jsunit']);
goog.addDependency('pubsub/topicid.js', ['goog.pubsub.TopicId'], []);
goog.addDependency('pubsub/typedpubsub.js', ['goog.pubsub.TypedPubSub'], ['goog.Disposable', 'goog.pubsub.PubSub']);
goog.addDependency('pubsub/typedpubsub_test.js', ['goog.pubsub.TypedPubSubTest'], ['goog.array', 'goog.pubsub.TopicId', 'goog.pubsub.TypedPubSub', 'goog.testing.jsunit']);
goog.addDependency('reflect/reflect.js', ['goog.reflect'], []);
goog.addDependency('result/deferredadaptor.js', ['goog.result.DeferredAdaptor'], ['goog.async.Deferred', 'goog.result', 'goog.result.Result']);
goog.addDependency('result/dependentresult.js', ['goog.result.DependentResult'], ['goog.result.Result']);
goog.addDependency('result/result_interface.js', ['goog.result.Result'], ['goog.Thenable']);
goog.addDependency('result/resultutil.js', ['goog.result'], ['goog.array', 'goog.result.DependentResult', 'goog.result.Result', 'goog.result.SimpleResult']);
goog.addDependency('result/simpleresult.js', ['goog.result.SimpleResult', 'goog.result.SimpleResult.StateError'], ['goog.Promise', 'goog.Thenable', 'goog.debug.Error', 'goog.result.Result']);
goog.addDependency('soy/data.js', ['goog.soy.data', 'goog.soy.data.SanitizedContent', 'goog.soy.data.SanitizedContentKind'], ['goog.html.SafeHtml', 'goog.html.uncheckedconversions', 'goog.string.Const']);
goog.addDependency('soy/data_test.js', ['goog.soy.dataTest'], ['goog.html.SafeHtml', 'goog.soy.testHelper', 'goog.testing.jsunit']);
goog.addDependency('soy/renderer.js', ['goog.soy.InjectedDataSupplier', 'goog.soy.Renderer'], ['goog.asserts', 'goog.dom', 'goog.soy', 'goog.soy.data.SanitizedContent', 'goog.soy.data.SanitizedContentKind']);
goog.addDependency('soy/renderer_test.js', ['goog.soy.RendererTest'], ['goog.dom', 'goog.dom.NodeType', 'goog.dom.TagName', 'goog.html.SafeHtml', 'goog.i18n.bidi.Dir', 'goog.soy.Renderer', 'goog.soy.data.SanitizedContentKind', 'goog.soy.testHelper', 'goog.testing.jsunit', 'goog.testing.recordFunction']);
goog.addDependency('soy/soy.js', ['goog.soy'], ['goog.asserts', 'goog.dom', 'goog.dom.NodeType', 'goog.dom.TagName', 'goog.soy.data.SanitizedContent', 'goog.soy.data.SanitizedContentKind', 'goog.string']);
goog.addDependency('soy/soy_test.js', ['goog.soyTest'], ['goog.dom', 'goog.dom.NodeType', 'goog.dom.TagName', 'goog.functions', 'goog.soy', 'goog.soy.testHelper', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit']);
goog.addDependency('soy/soy_testhelper.js', ['goog.soy.testHelper'], ['goog.dom', 'goog.dom.TagName', 'goog.i18n.bidi.Dir', 'goog.soy.data.SanitizedContent', 'goog.soy.data.SanitizedContentKind', 'goog.string', 'goog.userAgent']);
goog.addDependency('spell/spellcheck.js', ['goog.spell.SpellCheck', 'goog.spell.SpellCheck.WordChangedEvent'], ['goog.Timer', 'goog.events.EventTarget', 'goog.structs.Set']);
goog.addDependency('spell/spellcheck_test.js', ['goog.spell.SpellCheckTest'], ['goog.spell.SpellCheck', 'goog.testing.jsunit']);
goog.addDependency('stats/basicstat.js', ['goog.stats.BasicStat'], ['goog.array', 'goog.iter', 'goog.log', 'goog.object', 'goog.string.format', 'goog.structs.CircularBuffer']);
goog.addDependency('stats/basicstat_test.js', ['goog.stats.BasicStatTest'], ['goog.array', 'goog.stats.BasicStat', 'goog.string.format', 'goog.testing.PseudoRandom', 'goog.testing.jsunit', 'goog.userAgent']);
goog.addDependency('storage/collectablestorage.js', ['goog.storage.CollectableStorage'], ['goog.array', 'goog.iter', 'goog.storage.ErrorCode', 'goog.storage.ExpiringStorage', 'goog.storage.RichStorage']);
goog.addDependency('storage/collectablestorage_test.js', ['goog.storage.CollectableStorageTest'], ['goog.storage.CollectableStorage', 'goog.storage.collectableStorageTester', 'goog.storage.storage_test', 'goog.testing.MockClock', 'goog.testing.jsunit', 'goog.testing.storage.FakeMechanism']);
goog.addDependency('storage/collectablestoragetester.js', ['goog.storage.collectableStorageTester'], ['goog.testing.asserts']);
goog.addDependency('storage/encryptedstorage.js', ['goog.storage.EncryptedStorage'], ['goog.crypt', 'goog.crypt.Arc4', 'goog.crypt.Sha1', 'goog.crypt.base64', 'goog.json', 'goog.json.Serializer', 'goog.storage.CollectableStorage', 'goog.storage.ErrorCode', 'goog.storage.RichStorage', 'goog.storage.RichStorage.Wrapper', 'goog.storage.mechanism.IterableMechanism']);
goog.addDependency('storage/encryptedstorage_test.js', ['goog.storage.EncryptedStorageTest'], ['goog.json', 'goog.storage.EncryptedStorage', 'goog.storage.ErrorCode', 'goog.storage.RichStorage', 'goog.storage.collectableStorageTester', 'goog.storage.storage_test', 'goog.testing.MockClock', 'goog.testing.PseudoRandom', 'goog.testing.jsunit', 'goog.testing.storage.FakeMechanism']);
goog.addDependency('storage/errorcode.js', ['goog.storage.ErrorCode'], []);
goog.addDependency('storage/expiringstorage.js', ['goog.storage.ExpiringStorage'], ['goog.storage.RichStorage', 'goog.storage.RichStorage.Wrapper', 'goog.storage.mechanism.Mechanism']);
goog.addDependency('storage/expiringstorage_test.js', ['goog.storage.ExpiringStorageTest'], ['goog.storage.ExpiringStorage', 'goog.storage.storage_test', 'goog.testing.MockClock', 'goog.testing.jsunit', 'goog.testing.storage.FakeMechanism']);
goog.addDependency('storage/mechanism/errorcode.js', ['goog.storage.mechanism.ErrorCode'], []);
goog.addDependency('storage/mechanism/errorhandlingmechanism.js', ['goog.storage.mechanism.ErrorHandlingMechanism'], ['goog.storage.mechanism.Mechanism']);
goog.addDependency('storage/mechanism/errorhandlingmechanism_test.js', ['goog.storage.mechanism.ErrorHandlingMechanismTest'], ['goog.storage.mechanism.ErrorHandlingMechanism', 'goog.testing.jsunit', 'goog.testing.recordFunction']);
goog.addDependency('storage/mechanism/html5localstorage.js', ['goog.storage.mechanism.HTML5LocalStorage'], ['goog.storage.mechanism.HTML5WebStorage']);
goog.addDependency('storage/mechanism/html5localstorage_test.js', ['goog.storage.mechanism.HTML5LocalStorageTest'], ['goog.storage.mechanism.HTML5LocalStorage', 'goog.storage.mechanism.mechanismSeparationTester', 'goog.storage.mechanism.mechanismSharingTester', 'goog.testing.jsunit', 'goog.userAgent']);
goog.addDependency('storage/mechanism/html5sessionstorage.js', ['goog.storage.mechanism.HTML5SessionStorage'], ['goog.storage.mechanism.HTML5WebStorage']);
goog.addDependency('storage/mechanism/html5sessionstorage_test.js', ['goog.storage.mechanism.HTML5SessionStorageTest'], ['goog.storage.mechanism.HTML5SessionStorage', 'goog.storage.mechanism.mechanismSeparationTester', 'goog.storage.mechanism.mechanismSharingTester', 'goog.testing.jsunit', 'goog.userAgent']);
goog.addDependency('storage/mechanism/html5webstorage.js', ['goog.storage.mechanism.HTML5WebStorage'], ['goog.asserts', 'goog.iter.Iterator', 'goog.iter.StopIteration', 'goog.storage.mechanism.ErrorCode', 'goog.storage.mechanism.IterableMechanism']);
goog.addDependency('storage/mechanism/html5webstorage_test.js', ['goog.storage.mechanism.HTML5MockStorage', 'goog.storage.mechanism.HTML5WebStorageTest', 'goog.storage.mechanism.MockThrowableStorage'], ['goog.storage.mechanism.ErrorCode', 'goog.storage.mechanism.HTML5WebStorage', 'goog.testing.jsunit']);
goog.addDependency('storage/mechanism/ieuserdata.js', ['goog.storage.mechanism.IEUserData'], ['goog.asserts', 'goog.iter.Iterator', 'goog.iter.StopIteration', 'goog.storage.mechanism.ErrorCode', 'goog.storage.mechanism.IterableMechanism', 'goog.structs.Map', 'goog.userAgent']);
goog.addDependency('storage/mechanism/ieuserdata_test.js', ['goog.storage.mechanism.IEUserDataTest'], ['goog.storage.mechanism.IEUserData', 'goog.storage.mechanism.mechanismSeparationTester', 'goog.storage.mechanism.mechanismSharingTester', 'goog.testing.jsunit', 'goog.userAgent']);
goog.addDependency('storage/mechanism/iterablemechanism.js', ['goog.storage.mechanism.IterableMechanism'], ['goog.array', 'goog.asserts', 'goog.iter', 'goog.iter.Iterator', 'goog.storage.mechanism.Mechanism']);
goog.addDependency('storage/mechanism/iterablemechanismtester.js', ['goog.storage.mechanism.iterableMechanismTester'], ['goog.iter.Iterator', 'goog.storage.mechanism.IterableMechanism', 'goog.testing.asserts']);
goog.addDependency('storage/mechanism/mechanism.js', ['goog.storage.mechanism.Mechanism'], []);
goog.addDependency('storage/mechanism/mechanismfactory.js', ['goog.storage.mechanism.mechanismfactory'], ['goog.storage.mechanism.HTML5LocalStorage', 'goog.storage.mechanism.HTML5SessionStorage', 'goog.storage.mechanism.IEUserData', 'goog.storage.mechanism.IterableMechanism', 'goog.storage.mechanism.PrefixedMechanism']);
goog.addDependency('storage/mechanism/mechanismfactory_test.js', ['goog.storage.mechanism.mechanismfactoryTest'], ['goog.storage.mechanism.mechanismfactory', 'goog.testing.jsunit']);
goog.addDependency('storage/mechanism/mechanismseparationtester.js', ['goog.storage.mechanism.mechanismSeparationTester'], ['goog.iter.Iterator', 'goog.storage.mechanism.IterableMechanism', 'goog.testing.asserts']);
goog.addDependency('storage/mechanism/mechanismsharingtester.js', ['goog.storage.mechanism.mechanismSharingTester'], ['goog.iter.Iterator', 'goog.storage.mechanism.IterableMechanism', 'goog.testing.asserts']);
goog.addDependency('storage/mechanism/mechanismtester.js', ['goog.storage.mechanism.mechanismTester'], ['goog.storage.mechanism.ErrorCode', 'goog.storage.mechanism.HTML5LocalStorage', 'goog.storage.mechanism.Mechanism', 'goog.testing.asserts', 'goog.userAgent.product', 'goog.userAgent.product.isVersion']);
goog.addDependency('storage/mechanism/prefixedmechanism.js', ['goog.storage.mechanism.PrefixedMechanism'], ['goog.iter.Iterator', 'goog.storage.mechanism.IterableMechanism']);
goog.addDependency('storage/mechanism/prefixedmechanism_test.js', ['goog.storage.mechanism.PrefixedMechanismTest'], ['goog.storage.mechanism.HTML5LocalStorage', 'goog.storage.mechanism.PrefixedMechanism', 'goog.storage.mechanism.mechanismSeparationTester', 'goog.storage.mechanism.mechanismSharingTester', 'goog.testing.jsunit']);
goog.addDependency('storage/richstorage.js', ['goog.storage.RichStorage', 'goog.storage.RichStorage.Wrapper'], ['goog.storage.ErrorCode', 'goog.storage.Storage', 'goog.storage.mechanism.Mechanism']);
goog.addDependency('storage/richstorage_test.js', ['goog.storage.RichStorageTest'], ['goog.storage.ErrorCode', 'goog.storage.RichStorage', 'goog.storage.storage_test', 'goog.testing.jsunit', 'goog.testing.storage.FakeMechanism']);
goog.addDependency('storage/storage.js', ['goog.storage.Storage'], ['goog.json', 'goog.storage.ErrorCode']);
goog.addDependency('storage/storage_test.js', ['goog.storage.storage_test'], ['goog.storage.Storage', 'goog.structs.Map', 'goog.testing.asserts']);
goog.addDependency('string/const.js', ['goog.string.Const'], ['goog.asserts', 'goog.string.TypedString']);
goog.addDependency('string/const_test.js', ['goog.string.constTest'], ['goog.string.Const', 'goog.testing.jsunit']);
goog.addDependency('string/linkify.js', ['goog.string.linkify'], ['goog.string']);
goog.addDependency('string/linkify_test.js', ['goog.string.linkifyTest'], ['goog.string', 'goog.string.linkify', 'goog.testing.dom', 'goog.testing.jsunit']);
goog.addDependency('string/newlines.js', ['goog.string.newlines', 'goog.string.newlines.Line'], ['goog.array']);
goog.addDependency('string/newlines_test.js', ['goog.string.newlinesTest'], ['goog.string.newlines', 'goog.testing.jsunit']);
goog.addDependency('string/parser.js', ['goog.string.Parser'], []);
goog.addDependency('string/path.js', ['goog.string.path'], ['goog.array', 'goog.string']);
goog.addDependency('string/path_test.js', ['goog.string.pathTest'], ['goog.string.path', 'goog.testing.jsunit']);
goog.addDependency('string/string.js', ['goog.string', 'goog.string.Unicode'], []);
goog.addDependency('string/string_test.js', ['goog.stringTest'], ['goog.functions', 'goog.object', 'goog.string', 'goog.string.Unicode', 'goog.testing.MockControl', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit']);
goog.addDependency('string/stringbuffer.js', ['goog.string.StringBuffer'], []);
goog.addDependency('string/stringbuffer_test.js', ['goog.string.StringBufferTest'], ['goog.string.StringBuffer', 'goog.testing.jsunit']);
goog.addDependency('string/stringformat.js', ['goog.string.format'], ['goog.string']);
goog.addDependency('string/stringformat_test.js', ['goog.string.formatTest'], ['goog.string.format', 'goog.testing.jsunit']);
goog.addDependency('string/stringifier.js', ['goog.string.Stringifier'], []);
goog.addDependency('string/typedstring.js', ['goog.string.TypedString'], []);
goog.addDependency('structs/avltree.js', ['goog.structs.AvlTree', 'goog.structs.AvlTree.Node'], ['goog.structs.Collection']);
goog.addDependency('structs/avltree_test.js', ['goog.structs.AvlTreeTest'], ['goog.array', 'goog.structs.AvlTree', 'goog.testing.jsunit']);
goog.addDependency('structs/circularbuffer.js', ['goog.structs.CircularBuffer'], []);
goog.addDependency('structs/circularbuffer_test.js', ['goog.structs.CircularBufferTest'], ['goog.structs.CircularBuffer', 'goog.testing.jsunit']);
goog.addDependency('structs/collection.js', ['goog.structs.Collection'], []);
goog.addDependency('structs/collection_test.js', ['goog.structs.CollectionTest'], ['goog.structs.AvlTree', 'goog.structs.Set', 'goog.testing.jsunit']);
goog.addDependency('structs/heap.js', ['goog.structs.Heap'], ['goog.array', 'goog.object', 'goog.structs.Node']);
goog.addDependency('structs/heap_test.js', ['goog.structs.HeapTest'], ['goog.structs', 'goog.structs.Heap', 'goog.testing.jsunit']);
goog.addDependency('structs/inversionmap.js', ['goog.structs.InversionMap'], ['goog.array']);
goog.addDependency('structs/inversionmap_test.js', ['goog.structs.InversionMapTest'], ['goog.structs.InversionMap', 'goog.testing.jsunit']);
goog.addDependency('structs/linkedmap.js', ['goog.structs.LinkedMap'], ['goog.structs.Map']);
goog.addDependency('structs/linkedmap_test.js', ['goog.structs.LinkedMapTest'], ['goog.structs.LinkedMap', 'goog.testing.jsunit', 'goog.testing.recordFunction']);
goog.addDependency('structs/map.js', ['goog.structs.Map'], ['goog.iter.Iterator', 'goog.iter.StopIteration', 'goog.object']);
goog.addDependency('structs/map_test.js', ['goog.structs.MapTest'], ['goog.iter', 'goog.structs', 'goog.structs.Map', 'goog.testing.jsunit']);
goog.addDependency('structs/node.js', ['goog.structs.Node'], []);
goog.addDependency('structs/pool.js', ['goog.structs.Pool'], ['goog.Disposable', 'goog.structs.Queue', 'goog.structs.Set']);
goog.addDependency('structs/pool_test.js', ['goog.structs.PoolTest'], ['goog.structs.Pool', 'goog.testing.MockClock', 'goog.testing.jsunit']);
goog.addDependency('structs/prioritypool.js', ['goog.structs.PriorityPool'], ['goog.structs.Pool', 'goog.structs.PriorityQueue']);
goog.addDependency('structs/prioritypool_test.js', ['goog.structs.PriorityPoolTest'], ['goog.structs.PriorityPool', 'goog.testing.MockClock', 'goog.testing.jsunit']);
goog.addDependency('structs/priorityqueue.js', ['goog.structs.PriorityQueue'], ['goog.structs.Heap']);
goog.addDependency('structs/priorityqueue_test.js', ['goog.structs.PriorityQueueTest'], ['goog.structs', 'goog.structs.PriorityQueue', 'goog.testing.jsunit']);
goog.addDependency('structs/quadtree.js', ['goog.structs.QuadTree', 'goog.structs.QuadTree.Node', 'goog.structs.QuadTree.Point'], ['goog.math.Coordinate']);
goog.addDependency('structs/quadtree_test.js', ['goog.structs.QuadTreeTest'], ['goog.structs', 'goog.structs.QuadTree', 'goog.testing.jsunit']);
goog.addDependency('structs/queue.js', ['goog.structs.Queue'], ['goog.array']);
goog.addDependency('structs/queue_test.js', ['goog.structs.QueueTest'], ['goog.structs.Queue', 'goog.testing.jsunit']);
goog.addDependency('structs/set.js', ['goog.structs.Set'], ['goog.structs', 'goog.structs.Collection', 'goog.structs.Map']);
goog.addDependency('structs/set_test.js', ['goog.structs.SetTest'], ['goog.iter', 'goog.structs', 'goog.structs.Set', 'goog.testing.jsunit']);
goog.addDependency('structs/simplepool.js', ['goog.structs.SimplePool'], ['goog.Disposable']);
goog.addDependency('structs/stringset.js', ['goog.structs.StringSet'], ['goog.asserts', 'goog.iter']);
goog.addDependency('structs/stringset_test.js', ['goog.structs.StringSetTest'], ['goog.array', 'goog.iter', 'goog.structs.StringSet', 'goog.testing.asserts', 'goog.testing.jsunit']);
goog.addDependency('structs/structs.js', ['goog.structs'], ['goog.array', 'goog.object']);
goog.addDependency('structs/structs_test.js', ['goog.structsTest'], ['goog.array', 'goog.structs', 'goog.structs.Map', 'goog.structs.Set', 'goog.testing.jsunit']);
goog.addDependency('structs/treenode.js', ['goog.structs.TreeNode'], ['goog.array', 'goog.asserts', 'goog.structs.Node']);
goog.addDependency('structs/treenode_test.js', ['goog.structs.TreeNodeTest'], ['goog.structs.TreeNode', 'goog.testing.jsunit']);
goog.addDependency('structs/trie.js', ['goog.structs.Trie'], ['goog.object', 'goog.structs']);
goog.addDependency('structs/trie_test.js', ['goog.structs.TrieTest'], ['goog.object', 'goog.structs', 'goog.structs.Trie', 'goog.testing.jsunit']);
goog.addDependency('style/bidi.js', ['goog.style.bidi'], ['goog.dom', 'goog.style', 'goog.userAgent']);
goog.addDependency('style/bidi_test.js', ['goog.style.bidiTest'], ['goog.dom', 'goog.style', 'goog.style.bidi', 'goog.testing.jsunit', 'goog.userAgent']);
goog.addDependency('style/cursor.js', ['goog.style.cursor'], ['goog.userAgent']);
goog.addDependency('style/cursor_test.js', ['goog.style.cursorTest'], ['goog.style.cursor', 'goog.testing.jsunit', 'goog.userAgent']);
goog.addDependency('style/style.js', ['goog.style'], ['goog.array', 'goog.asserts', 'goog.dom', 'goog.dom.NodeType', 'goog.dom.vendor', 'goog.math.Box', 'goog.math.Coordinate', 'goog.math.Rect', 'goog.math.Size', 'goog.object', 'goog.string', 'goog.userAgent']);
goog.addDependency('style/style_test.js', ['goog.style_test'], ['goog.array', 'goog.color', 'goog.dom', 'goog.events.BrowserEvent', 'goog.labs.userAgent.util', 'goog.math.Box', 'goog.math.Coordinate', 'goog.math.Rect', 'goog.math.Size', 'goog.object', 'goog.string', 'goog.style', 'goog.testing.ExpectedFailures', 'goog.testing.MockUserAgent', 'goog.testing.asserts', 'goog.testing.jsunit', 'goog.userAgent', 'goog.userAgent.product', 'goog.userAgent.product.isVersion', 'goog.userAgentTestUtil', 'goog.userAgentTestUtil.UserAgents']);
goog.addDependency('style/style_webkit_scrollbars_test.js', ['goog.style.webkitScrollbarsTest'], ['goog.asserts', 'goog.style', 'goog.styleScrollbarTester', 'goog.testing.ExpectedFailures', 'goog.testing.jsunit', 'goog.userAgent']);
goog.addDependency('style/stylescrollbartester.js', ['goog.styleScrollbarTester'], ['goog.dom', 'goog.style', 'goog.testing.asserts']);
goog.addDependency('style/transform.js', ['goog.style.transform'], ['goog.functions', 'goog.math.Coordinate', 'goog.style', 'goog.userAgent', 'goog.userAgent.product.isVersion']);
goog.addDependency('style/transform_test.js', ['goog.style.transformTest'], ['goog.dom', 'goog.style.transform', 'goog.testing.jsunit', 'goog.userAgent', 'goog.userAgent.product.isVersion']);
goog.addDependency('style/transition.js', ['goog.style.transition', 'goog.style.transition.Css3Property'], ['goog.array', 'goog.asserts', 'goog.dom.safe', 'goog.dom.vendor', 'goog.functions', 'goog.html.SafeHtml', 'goog.style', 'goog.userAgent']);
goog.addDependency('style/transition_test.js', ['goog.style.transitionTest'], ['goog.style', 'goog.style.transition', 'goog.testing.jsunit', 'goog.userAgent']);
goog.addDependency('testing/asserts.js', ['goog.testing.JsUnitException', 'goog.testing.asserts'], ['goog.testing.stacktrace']);
goog.addDependency('testing/asserts_test.js', ['goog.testing.assertsTest'], ['goog.array', 'goog.dom', 'goog.iter.Iterator', 'goog.iter.StopIteration', 'goog.structs.Map', 'goog.structs.Set', 'goog.testing.asserts', 'goog.testing.jsunit', 'goog.userAgent']);
goog.addDependency('testing/async/mockcontrol.js', ['goog.testing.async.MockControl'], ['goog.asserts', 'goog.async.Deferred', 'goog.debug', 'goog.testing.asserts', 'goog.testing.mockmatchers.IgnoreArgument']);
goog.addDependency('testing/async/mockcontrol_test.js', ['goog.testing.async.MockControlTest'], ['goog.async.Deferred', 'goog.testing.MockControl', 'goog.testing.asserts', 'goog.testing.async.MockControl', 'goog.testing.jsunit']);
goog.addDependency('testing/asynctestcase.js', ['goog.testing.AsyncTestCase', 'goog.testing.AsyncTestCase.ControlBreakingException'], ['goog.testing.TestCase', 'goog.testing.TestCase.Test', 'goog.testing.asserts']);
goog.addDependency('testing/asynctestcase_async_test.js', ['goog.testing.AsyncTestCaseAsyncTest'], ['goog.testing.AsyncTestCase', 'goog.testing.jsunit']);
goog.addDependency('testing/asynctestcase_noasync_test.js', ['goog.testing.AsyncTestCaseSyncTest'], ['goog.testing.AsyncTestCase', 'goog.testing.jsunit']);
goog.addDependency('testing/asynctestcase_test.js', ['goog.testing.AsyncTestCaseTest'], ['goog.debug.Error', 'goog.testing.AsyncTestCase', 'goog.testing.asserts', 'goog.testing.jsunit']);
goog.addDependency('testing/benchmark.js', ['goog.testing.benchmark'], ['goog.dom', 'goog.dom.TagName', 'goog.testing.PerformanceTable', 'goog.testing.PerformanceTimer', 'goog.testing.TestCase']);
goog.addDependency('testing/continuationtestcase.js', ['goog.testing.ContinuationTestCase', 'goog.testing.ContinuationTestCase.Step', 'goog.testing.ContinuationTestCase.Test'], ['goog.array', 'goog.events.EventHandler', 'goog.testing.TestCase', 'goog.testing.TestCase.Test', 'goog.testing.asserts']);
goog.addDependency('testing/continuationtestcase_test.js', ['goog.testing.ContinuationTestCaseTest'], ['goog.events', 'goog.events.EventTarget', 'goog.testing.ContinuationTestCase', 'goog.testing.MockClock', 'goog.testing.PropertyReplacer', 'goog.testing.TestCase', 'goog.testing.jsunit']);
goog.addDependency('testing/deferredtestcase.js', ['goog.testing.DeferredTestCase'], ['goog.async.Deferred', 'goog.testing.AsyncTestCase', 'goog.testing.TestCase']);
goog.addDependency('testing/deferredtestcase_test.js', ['goog.testing.DeferredTestCaseTest'], ['goog.async.Deferred', 'goog.testing.DeferredTestCase', 'goog.testing.TestCase', 'goog.testing.TestRunner', 'goog.testing.jsunit', 'goog.testing.recordFunction']);
goog.addDependency('testing/dom.js', ['goog.testing.dom'], ['goog.array', 'goog.asserts', 'goog.dom', 'goog.dom.NodeIterator', 'goog.dom.NodeType', 'goog.dom.TagIterator', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.iter', 'goog.object', 'goog.string', 'goog.style', 'goog.testing.asserts', 'goog.userAgent']);
goog.addDependency('testing/dom_test.js', ['goog.testing.domTest'], ['goog.dom', 'goog.dom.TagName', 'goog.testing.dom', 'goog.testing.jsunit', 'goog.userAgent']);
goog.addDependency('testing/editor/dom.js', ['goog.testing.editor.dom'], ['goog.dom.NodeType', 'goog.dom.TagIterator', 'goog.dom.TagWalkType', 'goog.iter', 'goog.string', 'goog.testing.asserts']);
goog.addDependency('testing/editor/dom_test.js', ['goog.testing.editor.domTest'], ['goog.dom', 'goog.dom.TagName', 'goog.functions', 'goog.testing.editor.dom', 'goog.testing.jsunit']);
goog.addDependency('testing/editor/fieldmock.js', ['goog.testing.editor.FieldMock'], ['goog.dom', 'goog.dom.Range', 'goog.editor.Field', 'goog.testing.LooseMock', 'goog.testing.mockmatchers']);
goog.addDependency('testing/editor/testhelper.js', ['goog.testing.editor.TestHelper'], ['goog.Disposable', 'goog.dom', 'goog.dom.Range', 'goog.editor.BrowserFeature', 'goog.editor.node', 'goog.editor.plugins.AbstractBubblePlugin', 'goog.testing.dom']);
goog.addDependency('testing/editor/testhelper_test.js', ['goog.testing.editor.TestHelperTest'], ['goog.dom', 'goog.dom.TagName', 'goog.editor.node', 'goog.testing.editor.TestHelper', 'goog.testing.jsunit', 'goog.userAgent']);
goog.addDependency('testing/events/eventobserver.js', ['goog.testing.events.EventObserver'], ['goog.array']);
goog.addDependency('testing/events/eventobserver_test.js', ['goog.testing.events.EventObserverTest'], ['goog.array', 'goog.events', 'goog.events.Event', 'goog.events.EventTarget', 'goog.testing.events.EventObserver', 'goog.testing.jsunit']);
goog.addDependency('testing/events/events.js', ['goog.testing.events', 'goog.testing.events.Event'], ['goog.Disposable', 'goog.asserts', 'goog.dom.NodeType', 'goog.events', 'goog.events.BrowserEvent', 'goog.events.BrowserFeature', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.object', 'goog.style', 'goog.userAgent']);
goog.addDependency('testing/events/events_test.js', ['goog.testing.eventsTest'], ['goog.array', 'goog.dom', 'goog.events', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.math.Coordinate', 'goog.string', 'goog.style', 'goog.testing.PropertyReplacer', 'goog.testing.events', 'goog.testing.jsunit', 'goog.testing.recordFunction', 'goog.userAgent']);
goog.addDependency('testing/events/matchers.js', ['goog.testing.events.EventMatcher'], ['goog.events.Event', 'goog.testing.mockmatchers.ArgumentMatcher']);
goog.addDependency('testing/events/matchers_test.js', ['goog.testing.events.EventMatcherTest'], ['goog.events.Event', 'goog.testing.events.EventMatcher', 'goog.testing.jsunit']);
goog.addDependency('testing/events/onlinehandler.js', ['goog.testing.events.OnlineHandler'], ['goog.events.EventTarget', 'goog.net.NetworkStatusMonitor']);
goog.addDependency('testing/events/onlinehandler_test.js', ['goog.testing.events.OnlineHandlerTest'], ['goog.events', 'goog.net.NetworkStatusMonitor', 'goog.testing.events.EventObserver', 'goog.testing.events.OnlineHandler', 'goog.testing.jsunit']);
goog.addDependency('testing/expectedfailures.js', ['goog.testing.ExpectedFailures'], ['goog.debug.DivConsole', 'goog.dom', 'goog.dom.TagName', 'goog.events', 'goog.events.EventType', 'goog.log', 'goog.style', 'goog.testing.JsUnitException', 'goog.testing.TestCase', 'goog.testing.asserts']);
goog.addDependency('testing/expectedfailures_test.js', ['goog.testing.ExpectedFailuresTest'], ['goog.debug.Logger', 'goog.testing.ExpectedFailures', 'goog.testing.JsUnitException', 'goog.testing.jsunit']);
goog.addDependency('testing/fs/blob.js', ['goog.testing.fs.Blob'], ['goog.crypt.base64']);
goog.addDependency('testing/fs/blob_test.js', ['goog.testing.fs.BlobTest'], ['goog.testing.fs.Blob', 'goog.testing.jsunit']);
goog.addDependency('testing/fs/directoryentry_test.js', ['goog.testing.fs.DirectoryEntryTest'], ['goog.array', 'goog.fs.DirectoryEntry', 'goog.fs.Error', 'goog.testing.AsyncTestCase', 'goog.testing.MockClock', 'goog.testing.fs.FileSystem', 'goog.testing.jsunit']);
goog.addDependency('testing/fs/entry.js', ['goog.testing.fs.DirectoryEntry', 'goog.testing.fs.Entry', 'goog.testing.fs.FileEntry'], ['goog.Timer', 'goog.array', 'goog.asserts', 'goog.async.Deferred', 'goog.fs.DirectoryEntry', 'goog.fs.DirectoryEntryImpl', 'goog.fs.Entry', 'goog.fs.Error', 'goog.fs.FileEntry', 'goog.functions', 'goog.object', 'goog.string', 'goog.testing.fs.File', 'goog.testing.fs.FileWriter']);
goog.addDependency('testing/fs/entry_test.js', ['goog.testing.fs.EntryTest'], ['goog.fs.DirectoryEntry', 'goog.fs.Error', 'goog.testing.AsyncTestCase', 'goog.testing.MockClock', 'goog.testing.fs.FileSystem', 'goog.testing.jsunit']);
goog.addDependency('testing/fs/file.js', ['goog.testing.fs.File'], ['goog.testing.fs.Blob']);
goog.addDependency('testing/fs/fileentry_test.js', ['goog.testing.fs.FileEntryTest'], ['goog.testing.AsyncTestCase', 'goog.testing.MockClock', 'goog.testing.fs.FileEntry', 'goog.testing.fs.FileSystem', 'goog.testing.jsunit']);
goog.addDependency('testing/fs/filereader.js', ['goog.testing.fs.FileReader'], ['goog.Timer', 'goog.events.EventTarget', 'goog.fs.Error', 'goog.fs.FileReader', 'goog.testing.fs.ProgressEvent']);
goog.addDependency('testing/fs/filereader_test.js', ['goog.testing.fs.FileReaderTest'], ['goog.Timer', 'goog.async.Deferred', 'goog.events', 'goog.fs.Error', 'goog.fs.FileReader', 'goog.fs.FileSaver', 'goog.testing.AsyncTestCase', 'goog.testing.fs.FileReader', 'goog.testing.fs.FileSystem', 'goog.testing.jsunit']);
goog.addDependency('testing/fs/filesystem.js', ['goog.testing.fs.FileSystem'], ['goog.fs.FileSystem', 'goog.testing.fs.DirectoryEntry']);
goog.addDependency('testing/fs/filewriter.js', ['goog.testing.fs.FileWriter'], ['goog.Timer', 'goog.events.EventTarget', 'goog.fs.Error', 'goog.fs.FileSaver', 'goog.string', 'goog.testing.fs.ProgressEvent']);
goog.addDependency('testing/fs/filewriter_test.js', ['goog.testing.fs.FileWriterTest'], ['goog.async.Deferred', 'goog.events', 'goog.fs.Error', 'goog.fs.FileSaver', 'goog.testing.AsyncTestCase', 'goog.testing.MockClock', 'goog.testing.fs.Blob', 'goog.testing.fs.FileSystem', 'goog.testing.jsunit']);
goog.addDependency('testing/fs/fs.js', ['goog.testing.fs'], ['goog.Timer', 'goog.array', 'goog.async.Deferred', 'goog.fs', 'goog.testing.fs.Blob', 'goog.testing.fs.FileSystem']);
goog.addDependency('testing/fs/fs_test.js', ['goog.testing.fsTest'], ['goog.testing.AsyncTestCase', 'goog.testing.fs', 'goog.testing.fs.Blob', 'goog.testing.jsunit']);
goog.addDependency('testing/fs/integration_test.js', ['goog.testing.fs.integrationTest'], ['goog.async.Deferred', 'goog.async.DeferredList', 'goog.events', 'goog.fs', 'goog.fs.DirectoryEntry', 'goog.fs.Error', 'goog.fs.FileSaver', 'goog.testing.AsyncTestCase', 'goog.testing.PropertyReplacer', 'goog.testing.fs', 'goog.testing.jsunit']);
goog.addDependency('testing/fs/progressevent.js', ['goog.testing.fs.ProgressEvent'], ['goog.events.Event']);
goog.addDependency('testing/functionmock.js', ['goog.testing', 'goog.testing.FunctionMock', 'goog.testing.GlobalFunctionMock', 'goog.testing.MethodMock'], ['goog.object', 'goog.testing.LooseMock', 'goog.testing.Mock', 'goog.testing.MockInterface', 'goog.testing.PropertyReplacer', 'goog.testing.StrictMock']);
goog.addDependency('testing/functionmock_test.js', ['goog.testing.FunctionMockTest'], ['goog.array', 'goog.string', 'goog.testing', 'goog.testing.FunctionMock', 'goog.testing.Mock', 'goog.testing.StrictMock', 'goog.testing.asserts', 'goog.testing.jsunit', 'goog.testing.mockmatchers']);
goog.addDependency('testing/graphics.js', ['goog.testing.graphics'], ['goog.graphics.Path.Segment', 'goog.testing.asserts']);
goog.addDependency('testing/i18n/asserts.js', ['goog.testing.i18n.asserts'], ['goog.testing.jsunit']);
goog.addDependency('testing/i18n/asserts_test.js', ['goog.testing.i18n.assertsTest'], ['goog.testing.ExpectedFailures', 'goog.testing.i18n.asserts']);
goog.addDependency('testing/jsunit.js', ['goog.testing.jsunit'], ['goog.testing.TestCase', 'goog.testing.TestRunner']);
goog.addDependency('testing/loosemock.js', ['goog.testing.LooseExpectationCollection', 'goog.testing.LooseMock'], ['goog.array', 'goog.structs.Map', 'goog.testing.Mock']);
goog.addDependency('testing/loosemock_test.js', ['goog.testing.LooseMockTest'], ['goog.testing.LooseMock', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit', 'goog.testing.mockmatchers']);
goog.addDependency('testing/messaging/mockmessagechannel.js', ['goog.testing.messaging.MockMessageChannel'], ['goog.messaging.AbstractChannel', 'goog.testing.asserts']);
goog.addDependency('testing/messaging/mockmessageevent.js', ['goog.testing.messaging.MockMessageEvent'], ['goog.events.BrowserEvent', 'goog.events.EventType', 'goog.testing.events']);
goog.addDependency('testing/messaging/mockmessageport.js', ['goog.testing.messaging.MockMessagePort'], ['goog.events.EventTarget']);
goog.addDependency('testing/messaging/mockportnetwork.js', ['goog.testing.messaging.MockPortNetwork'], ['goog.messaging.PortNetwork', 'goog.testing.messaging.MockMessageChannel']);
goog.addDependency('testing/mock.js', ['goog.testing.Mock', 'goog.testing.MockExpectation'], ['goog.array', 'goog.object', 'goog.testing.JsUnitException', 'goog.testing.MockInterface', 'goog.testing.mockmatchers']);
goog.addDependency('testing/mock_test.js', ['goog.testing.MockTest'], ['goog.array', 'goog.testing', 'goog.testing.Mock', 'goog.testing.MockControl', 'goog.testing.MockExpectation', 'goog.testing.jsunit']);
goog.addDependency('testing/mockclassfactory.js', ['goog.testing.MockClassFactory', 'goog.testing.MockClassRecord'], ['goog.array', 'goog.object', 'goog.testing.LooseMock', 'goog.testing.StrictMock', 'goog.testing.TestCase', 'goog.testing.mockmatchers']);
goog.addDependency('testing/mockclassfactory_test.js', ['fake.BaseClass', 'fake.ChildClass', 'goog.testing.MockClassFactoryTest'], ['goog.testing', 'goog.testing.MockClassFactory', 'goog.testing.jsunit']);
goog.addDependency('testing/mockclock.js', ['goog.testing.MockClock'], ['goog.Disposable', 'goog.testing.PropertyReplacer', 'goog.testing.events', 'goog.testing.events.Event', 'goog.testing.watchers']);
goog.addDependency('testing/mockclock_test.js', ['goog.testing.MockClockTest'], ['goog.events', 'goog.functions', 'goog.testing.MockClock', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit', 'goog.testing.recordFunction']);
goog.addDependency('testing/mockcontrol.js', ['goog.testing.MockControl'], ['goog.array', 'goog.testing', 'goog.testing.LooseMock', 'goog.testing.StrictMock']);
goog.addDependency('testing/mockcontrol_test.js', ['goog.testing.MockControlTest'], ['goog.testing.Mock', 'goog.testing.MockControl', 'goog.testing.jsunit']);
goog.addDependency('testing/mockinterface.js', ['goog.testing.MockInterface'], []);
goog.addDependency('testing/mockmatchers.js', ['goog.testing.mockmatchers', 'goog.testing.mockmatchers.ArgumentMatcher', 'goog.testing.mockmatchers.IgnoreArgument', 'goog.testing.mockmatchers.InstanceOf', 'goog.testing.mockmatchers.ObjectEquals', 'goog.testing.mockmatchers.RegexpMatch', 'goog.testing.mockmatchers.SaveArgument', 'goog.testing.mockmatchers.TypeOf'], ['goog.array', 'goog.dom', 'goog.testing.asserts']);
goog.addDependency('testing/mockmatchers_test.js', ['goog.testing.mockmatchersTest'], ['goog.dom', 'goog.testing.jsunit', 'goog.testing.mockmatchers', 'goog.testing.mockmatchers.ArgumentMatcher']);
goog.addDependency('testing/mockrandom.js', ['goog.testing.MockRandom'], ['goog.Disposable']);
goog.addDependency('testing/mockrandom_test.js', ['goog.testing.MockRandomTest'], ['goog.testing.MockRandom', 'goog.testing.jsunit']);
goog.addDependency('testing/mockrange.js', ['goog.testing.MockRange'], ['goog.dom.AbstractRange', 'goog.testing.LooseMock']);
goog.addDependency('testing/mockrange_test.js', ['goog.testing.MockRangeTest'], ['goog.testing.MockRange', 'goog.testing.jsunit']);
goog.addDependency('testing/mockstorage.js', ['goog.testing.MockStorage'], ['goog.structs.Map']);
goog.addDependency('testing/mockstorage_test.js', ['goog.testing.MockStorageTest'], ['goog.testing.MockStorage', 'goog.testing.jsunit']);
goog.addDependency('testing/mockuseragent.js', ['goog.testing.MockUserAgent'], ['goog.Disposable', 'goog.labs.userAgent.util', 'goog.testing.PropertyReplacer', 'goog.userAgent']);
goog.addDependency('testing/mockuseragent_test.js', ['goog.testing.MockUserAgentTest'], ['goog.dispose', 'goog.testing.MockUserAgent', 'goog.testing.jsunit', 'goog.userAgent']);
goog.addDependency('testing/multitestrunner.js', ['goog.testing.MultiTestRunner', 'goog.testing.MultiTestRunner.TestFrame'], ['goog.Timer', 'goog.array', 'goog.asserts', 'goog.dom', 'goog.dom.classlist', 'goog.events.EventHandler', 'goog.functions', 'goog.string', 'goog.ui.Component', 'goog.ui.ServerChart', 'goog.ui.TableSorter']);
goog.addDependency('testing/net/xhrio.js', ['goog.testing.net.XhrIo'], ['goog.array', 'goog.dom.xml', 'goog.events', 'goog.events.EventTarget', 'goog.json', 'goog.net.ErrorCode', 'goog.net.EventType', 'goog.net.HttpStatus', 'goog.net.XhrIo', 'goog.net.XmlHttp', 'goog.object', 'goog.structs.Map']);
goog.addDependency('testing/net/xhrio_test.js', ['goog.testing.net.XhrIoTest'], ['goog.dom.xml', 'goog.events', 'goog.events.Event', 'goog.net.ErrorCode', 'goog.net.EventType', 'goog.net.XmlHttp', 'goog.object', 'goog.testing.MockControl', 'goog.testing.asserts', 'goog.testing.jsunit', 'goog.testing.mockmatchers.InstanceOf', 'goog.testing.net.XhrIo']);
goog.addDependency('testing/net/xhriopool.js', ['goog.testing.net.XhrIoPool'], ['goog.net.XhrIoPool', 'goog.testing.net.XhrIo']);
goog.addDependency('testing/objectpropertystring.js', ['goog.testing.ObjectPropertyString'], []);
goog.addDependency('testing/performancetable.js', ['goog.testing.PerformanceTable'], ['goog.dom', 'goog.testing.PerformanceTimer']);
goog.addDependency('testing/performancetimer.js', ['goog.testing.PerformanceTimer', 'goog.testing.PerformanceTimer.Task'], ['goog.array', 'goog.async.Deferred', 'goog.math']);
goog.addDependency('testing/performancetimer_test.js', ['goog.testing.PerformanceTimerTest'], ['goog.async.Deferred', 'goog.dom', 'goog.math', 'goog.testing.MockClock', 'goog.testing.PerformanceTimer', 'goog.testing.jsunit']);
goog.addDependency('testing/propertyreplacer.js', ['goog.testing.PropertyReplacer'], ['goog.testing.ObjectPropertyString', 'goog.userAgent']);
goog.addDependency('testing/propertyreplacer_test.js', ['goog.testing.PropertyReplacerTest'], ['goog.testing.PropertyReplacer', 'goog.testing.asserts', 'goog.testing.jsunit']);
goog.addDependency('testing/proto2/proto2.js', ['goog.testing.proto2'], ['goog.proto2.Message', 'goog.proto2.ObjectSerializer', 'goog.testing.asserts']);
goog.addDependency('testing/proto2/proto2_test.js', ['goog.testing.proto2Test'], ['goog.testing.jsunit', 'goog.testing.proto2', 'proto2.TestAllTypes']);
goog.addDependency('testing/pseudorandom.js', ['goog.testing.PseudoRandom'], ['goog.Disposable']);
goog.addDependency('testing/pseudorandom_test.js', ['goog.testing.PseudoRandomTest'], ['goog.testing.PseudoRandom', 'goog.testing.jsunit']);
goog.addDependency('testing/recordfunction.js', ['goog.testing.FunctionCall', 'goog.testing.recordConstructor', 'goog.testing.recordFunction'], ['goog.testing.asserts']);
goog.addDependency('testing/recordfunction_test.js', ['goog.testing.recordFunctionTest'], ['goog.functions', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit', 'goog.testing.recordConstructor', 'goog.testing.recordFunction']);
goog.addDependency('testing/shardingtestcase.js', ['goog.testing.ShardingTestCase'], ['goog.asserts', 'goog.testing.TestCase']);
goog.addDependency('testing/shardingtestcase_test.js', ['goog.testing.ShardingTestCaseTest'], ['goog.testing.ShardingTestCase', 'goog.testing.TestCase', 'goog.testing.asserts', 'goog.testing.jsunit']);
goog.addDependency('testing/singleton.js', ['goog.testing.singleton'], []);
goog.addDependency('testing/singleton_test.js', ['goog.testing.singletonTest'], ['goog.testing.asserts', 'goog.testing.jsunit', 'goog.testing.singleton']);
goog.addDependency('testing/stacktrace.js', ['goog.testing.stacktrace', 'goog.testing.stacktrace.Frame'], []);
goog.addDependency('testing/stacktrace_test.js', ['goog.testing.stacktraceTest'], ['goog.functions', 'goog.string', 'goog.testing.ExpectedFailures', 'goog.testing.PropertyReplacer', 'goog.testing.StrictMock', 'goog.testing.asserts', 'goog.testing.jsunit', 'goog.testing.stacktrace', 'goog.testing.stacktrace.Frame', 'goog.userAgent']);
goog.addDependency('testing/storage/fakemechanism.js', ['goog.testing.storage.FakeMechanism'], ['goog.storage.mechanism.IterableMechanism', 'goog.structs.Map']);
goog.addDependency('testing/strictmock.js', ['goog.testing.StrictMock'], ['goog.array', 'goog.testing.Mock']);
goog.addDependency('testing/strictmock_test.js', ['goog.testing.StrictMockTest'], ['goog.testing.StrictMock', 'goog.testing.jsunit']);
goog.addDependency('testing/style/layoutasserts.js', ['goog.testing.style.layoutasserts'], ['goog.style', 'goog.testing.asserts', 'goog.testing.style']);
goog.addDependency('testing/style/layoutasserts_test.js', ['goog.testing.style.layoutassertsTest'], ['goog.dom', 'goog.style', 'goog.testing.jsunit', 'goog.testing.style.layoutasserts']);
goog.addDependency('testing/style/style.js', ['goog.testing.style'], ['goog.dom', 'goog.math.Rect', 'goog.style']);
goog.addDependency('testing/style/style_test.js', ['goog.testing.styleTest'], ['goog.dom', 'goog.style', 'goog.testing.jsunit', 'goog.testing.style']);
goog.addDependency('testing/testcase.js', ['goog.testing.TestCase', 'goog.testing.TestCase.Error', 'goog.testing.TestCase.Order', 'goog.testing.TestCase.Result', 'goog.testing.TestCase.Test'], ['goog.object', 'goog.testing.asserts', 'goog.testing.stacktrace']);
goog.addDependency('testing/testqueue.js', ['goog.testing.TestQueue'], []);
goog.addDependency('testing/testrunner.js', ['goog.testing.TestRunner'], ['goog.testing.TestCase']);
goog.addDependency('testing/ui/rendererasserts.js', ['goog.testing.ui.rendererasserts'], ['goog.testing.asserts']);
goog.addDependency('testing/ui/rendererasserts_test.js', ['goog.testing.ui.rendererassertsTest'], ['goog.testing.asserts', 'goog.testing.jsunit', 'goog.testing.ui.rendererasserts', 'goog.ui.ControlRenderer']);
goog.addDependency('testing/ui/rendererharness.js', ['goog.testing.ui.RendererHarness'], ['goog.Disposable', 'goog.dom.NodeType', 'goog.testing.asserts', 'goog.testing.dom']);
goog.addDependency('testing/ui/style.js', ['goog.testing.ui.style'], ['goog.array', 'goog.asserts', 'goog.dom', 'goog.dom.classlist', 'goog.testing.asserts']);
goog.addDependency('testing/ui/style_test.js', ['goog.testing.ui.styleTest'], ['goog.dom', 'goog.testing.jsunit', 'goog.testing.ui.style']);
goog.addDependency('testing/watchers.js', ['goog.testing.watchers'], []);
goog.addDependency('timer/timer.js', ['goog.Timer'], ['goog.events.EventTarget']);
goog.addDependency('timer/timer_test.js', ['goog.TimerTest'], ['goog.Timer', 'goog.events', 'goog.testing.MockClock', 'goog.testing.jsunit']);
goog.addDependency('tweak/entries.js', ['goog.tweak.BaseEntry', 'goog.tweak.BasePrimitiveSetting', 'goog.tweak.BaseSetting', 'goog.tweak.BooleanGroup', 'goog.tweak.BooleanInGroupSetting', 'goog.tweak.BooleanSetting', 'goog.tweak.ButtonAction', 'goog.tweak.NumericSetting', 'goog.tweak.StringSetting'], ['goog.array', 'goog.asserts', 'goog.log', 'goog.object']);
goog.addDependency('tweak/entries_test.js', ['goog.tweak.BaseEntryTest'], ['goog.testing.MockControl', 'goog.testing.jsunit', 'goog.tweak.testhelpers']);
goog.addDependency('tweak/registry.js', ['goog.tweak.Registry'], ['goog.asserts', 'goog.log', 'goog.object', 'goog.string', 'goog.tweak.BaseEntry', 'goog.uri.utils']);
goog.addDependency('tweak/registry_test.js', ['goog.tweak.RegistryTest'], ['goog.asserts.AssertionError', 'goog.testing.jsunit', 'goog.tweak', 'goog.tweak.testhelpers']);
goog.addDependency('tweak/testhelpers.js', ['goog.tweak.testhelpers'], ['goog.tweak', 'goog.tweak.BooleanGroup', 'goog.tweak.BooleanInGroupSetting', 'goog.tweak.BooleanSetting', 'goog.tweak.ButtonAction', 'goog.tweak.NumericSetting', 'goog.tweak.Registry', 'goog.tweak.StringSetting']);
goog.addDependency('tweak/tweak.js', ['goog.tweak', 'goog.tweak.ConfigParams'], ['goog.asserts', 'goog.tweak.BaseSetting', 'goog.tweak.BooleanGroup', 'goog.tweak.BooleanInGroupSetting', 'goog.tweak.BooleanSetting', 'goog.tweak.ButtonAction', 'goog.tweak.NumericSetting', 'goog.tweak.Registry', 'goog.tweak.StringSetting']);
goog.addDependency('tweak/tweakui.js', ['goog.tweak.EntriesPanel', 'goog.tweak.TweakUi'], ['goog.array', 'goog.asserts', 'goog.dom.DomHelper', 'goog.object', 'goog.style', 'goog.tweak', 'goog.ui.Zippy', 'goog.userAgent']);
goog.addDependency('tweak/tweakui_test.js', ['goog.tweak.TweakUiTest'], ['goog.dom', 'goog.string', 'goog.testing.jsunit', 'goog.tweak', 'goog.tweak.TweakUi', 'goog.tweak.testhelpers']);
goog.addDependency('ui/abstractspellchecker.js', ['goog.ui.AbstractSpellChecker', 'goog.ui.AbstractSpellChecker.AsyncResult'], ['goog.a11y.aria', 'goog.array', 'goog.asserts', 'goog.dom', 'goog.dom.NodeType', 'goog.dom.classlist', 'goog.dom.selection', 'goog.events', 'goog.events.Event', 'goog.events.EventType', 'goog.math.Coordinate', 'goog.spell.SpellCheck', 'goog.structs.Set', 'goog.style', 'goog.ui.Component', 'goog.ui.MenuItem', 'goog.ui.MenuSeparator', 'goog.ui.PopupMenu']);
goog.addDependency('ui/ac/ac.js', ['goog.ui.ac'], ['goog.ui.ac.ArrayMatcher', 'goog.ui.ac.AutoComplete', 'goog.ui.ac.InputHandler', 'goog.ui.ac.Renderer']);
goog.addDependency('ui/ac/arraymatcher.js', ['goog.ui.ac.ArrayMatcher'], ['goog.string']);
goog.addDependency('ui/ac/autocomplete.js', ['goog.ui.ac.AutoComplete', 'goog.ui.ac.AutoComplete.EventType'], ['goog.array', 'goog.asserts', 'goog.events', 'goog.events.EventTarget', 'goog.object']);
goog.addDependency('ui/ac/cachingmatcher.js', ['goog.ui.ac.CachingMatcher'], ['goog.array', 'goog.async.Throttle', 'goog.ui.ac.ArrayMatcher', 'goog.ui.ac.RenderOptions']);
goog.addDependency('ui/ac/inputhandler.js', ['goog.ui.ac.InputHandler'], ['goog.Disposable', 'goog.Timer', 'goog.a11y.aria', 'goog.dom', 'goog.dom.selection', 'goog.events.EventHandler', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.events.KeyHandler', 'goog.string', 'goog.userAgent', 'goog.userAgent.product']);
goog.addDependency('ui/ac/remote.js', ['goog.ui.ac.Remote'], ['goog.ui.ac.AutoComplete', 'goog.ui.ac.InputHandler', 'goog.ui.ac.RemoteArrayMatcher', 'goog.ui.ac.Renderer']);
goog.addDependency('ui/ac/remotearraymatcher.js', ['goog.ui.ac.RemoteArrayMatcher'], ['goog.Disposable', 'goog.Uri', 'goog.events', 'goog.json', 'goog.net.EventType', 'goog.net.XhrIo']);
goog.addDependency('ui/ac/renderer.js', ['goog.ui.ac.Renderer', 'goog.ui.ac.Renderer.CustomRenderer'], ['goog.a11y.aria', 'goog.a11y.aria.Role', 'goog.a11y.aria.State', 'goog.array', 'goog.asserts', 'goog.dispose', 'goog.dom', 'goog.dom.NodeType', 'goog.dom.classlist', 'goog.events', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.fx.dom.FadeInAndShow', 'goog.fx.dom.FadeOutAndHide', 'goog.positioning', 'goog.positioning.Corner', 'goog.positioning.Overflow', 'goog.string', 'goog.style', 'goog.ui.IdGenerator', 'goog.ui.ac.AutoComplete']);
goog.addDependency('ui/ac/renderoptions.js', ['goog.ui.ac.RenderOptions'], []);
goog.addDependency('ui/ac/richinputhandler.js', ['goog.ui.ac.RichInputHandler'], ['goog.ui.ac.InputHandler']);
goog.addDependency('ui/ac/richremote.js', ['goog.ui.ac.RichRemote'], ['goog.ui.ac.AutoComplete', 'goog.ui.ac.Remote', 'goog.ui.ac.Renderer', 'goog.ui.ac.RichInputHandler', 'goog.ui.ac.RichRemoteArrayMatcher']);
goog.addDependency('ui/ac/richremotearraymatcher.js', ['goog.ui.ac.RichRemoteArrayMatcher'], ['goog.json', 'goog.ui.ac.RemoteArrayMatcher']);
goog.addDependency('ui/activitymonitor.js', ['goog.ui.ActivityMonitor'], ['goog.array', 'goog.asserts', 'goog.dom', 'goog.events.EventHandler', 'goog.events.EventTarget', 'goog.events.EventType']);
goog.addDependency('ui/advancedtooltip.js', ['goog.ui.AdvancedTooltip'], ['goog.events', 'goog.events.EventType', 'goog.math.Box', 'goog.math.Coordinate', 'goog.style', 'goog.ui.Tooltip', 'goog.userAgent']);
goog.addDependency('ui/animatedzippy.js', ['goog.ui.AnimatedZippy'], ['goog.dom', 'goog.events', 'goog.fx.Animation', 'goog.fx.Transition', 'goog.fx.easing', 'goog.ui.Zippy', 'goog.ui.ZippyEvent']);
goog.addDependency('ui/attachablemenu.js', ['goog.ui.AttachableMenu'], ['goog.a11y.aria', 'goog.a11y.aria.State', 'goog.array', 'goog.asserts', 'goog.dom', 'goog.dom.classlist', 'goog.events.Event', 'goog.events.KeyCodes', 'goog.string', 'goog.style', 'goog.ui.ItemEvent', 'goog.ui.MenuBase', 'goog.ui.PopupBase', 'goog.userAgent']);
goog.addDependency('ui/bidiinput.js', ['goog.ui.BidiInput'], ['goog.dom', 'goog.events', 'goog.events.InputHandler', 'goog.i18n.bidi', 'goog.ui.Component']);
goog.addDependency('ui/bubble.js', ['goog.ui.Bubble'], ['goog.Timer', 'goog.events', 'goog.events.EventType', 'goog.math.Box', 'goog.positioning', 'goog.positioning.AbsolutePosition', 'goog.positioning.AnchoredPosition', 'goog.positioning.Corner', 'goog.positioning.CornerBit', 'goog.style', 'goog.ui.Component', 'goog.ui.Popup']);
goog.addDependency('ui/button.js', ['goog.ui.Button', 'goog.ui.Button.Side'], ['goog.events.EventType', 'goog.events.KeyCodes', 'goog.events.KeyHandler', 'goog.ui.ButtonRenderer', 'goog.ui.ButtonSide', 'goog.ui.Component', 'goog.ui.Control', 'goog.ui.NativeButtonRenderer', 'goog.ui.registry']);
goog.addDependency('ui/buttonrenderer.js', ['goog.ui.ButtonRenderer'], ['goog.a11y.aria', 'goog.a11y.aria.Role', 'goog.a11y.aria.State', 'goog.asserts', 'goog.ui.ButtonSide', 'goog.ui.Component', 'goog.ui.ControlRenderer']);
goog.addDependency('ui/buttonside.js', ['goog.ui.ButtonSide'], []);
goog.addDependency('ui/charcounter.js', ['goog.ui.CharCounter', 'goog.ui.CharCounter.Display'], ['goog.dom', 'goog.events', 'goog.events.EventTarget', 'goog.events.InputHandler']);
goog.addDependency('ui/charpicker.js', ['goog.ui.CharPicker'], ['goog.a11y.aria', 'goog.a11y.aria.State', 'goog.array', 'goog.asserts', 'goog.dom', 'goog.dom.classlist', 'goog.events', 'goog.events.Event', 'goog.events.EventHandler', 'goog.events.EventType', 'goog.events.InputHandler', 'goog.events.KeyCodes', 'goog.events.KeyHandler', 'goog.i18n.CharListDecompressor', 'goog.i18n.uChar', 'goog.structs.Set', 'goog.style', 'goog.ui.Button', 'goog.ui.Component', 'goog.ui.ContainerScroller', 'goog.ui.FlatButtonRenderer', 'goog.ui.HoverCard', 'goog.ui.LabelInput', 'goog.ui.Menu', 'goog.ui.MenuButton', 'goog.ui.MenuItem', 'goog.ui.Tooltip']);
goog.addDependency('ui/checkbox.js', ['goog.ui.Checkbox', 'goog.ui.Checkbox.State'], ['goog.a11y.aria', 'goog.a11y.aria.State', 'goog.asserts', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.ui.CheckboxRenderer', 'goog.ui.Component.EventType', 'goog.ui.Component.State', 'goog.ui.Control', 'goog.ui.registry']);
goog.addDependency('ui/checkboxmenuitem.js', ['goog.ui.CheckBoxMenuItem'], ['goog.ui.MenuItem', 'goog.ui.registry']);
goog.addDependency('ui/checkboxrenderer.js', ['goog.ui.CheckboxRenderer'], ['goog.a11y.aria', 'goog.a11y.aria.Role', 'goog.a11y.aria.State', 'goog.array', 'goog.asserts', 'goog.dom.classlist', 'goog.object', 'goog.ui.ControlRenderer']);
goog.addDependency('ui/colorbutton.js', ['goog.ui.ColorButton'], ['goog.ui.Button', 'goog.ui.ColorButtonRenderer', 'goog.ui.registry']);
goog.addDependency('ui/colorbuttonrenderer.js', ['goog.ui.ColorButtonRenderer'], ['goog.asserts', 'goog.dom.classlist', 'goog.functions', 'goog.ui.ColorMenuButtonRenderer']);
goog.addDependency('ui/colormenubutton.js', ['goog.ui.ColorMenuButton'], ['goog.array', 'goog.object', 'goog.ui.ColorMenuButtonRenderer', 'goog.ui.ColorPalette', 'goog.ui.Component', 'goog.ui.Menu', 'goog.ui.MenuButton', 'goog.ui.registry']);
goog.addDependency('ui/colormenubuttonrenderer.js', ['goog.ui.ColorMenuButtonRenderer'], ['goog.asserts', 'goog.color', 'goog.dom.classlist', 'goog.ui.MenuButtonRenderer', 'goog.userAgent']);
goog.addDependency('ui/colorpalette.js', ['goog.ui.ColorPalette'], ['goog.array', 'goog.color', 'goog.style', 'goog.ui.Palette', 'goog.ui.PaletteRenderer']);
goog.addDependency('ui/colorpicker.js', ['goog.ui.ColorPicker', 'goog.ui.ColorPicker.EventType'], ['goog.ui.ColorPalette', 'goog.ui.Component']);
goog.addDependency('ui/colorsplitbehavior.js', ['goog.ui.ColorSplitBehavior'], ['goog.ui.ColorMenuButton', 'goog.ui.SplitBehavior']);
goog.addDependency('ui/combobox.js', ['goog.ui.ComboBox', 'goog.ui.ComboBoxItem'], ['goog.Timer', 'goog.asserts', 'goog.dom', 'goog.dom.classlist', 'goog.events.EventType', 'goog.events.InputHandler', 'goog.events.KeyCodes', 'goog.events.KeyHandler', 'goog.log', 'goog.positioning.Corner', 'goog.positioning.MenuAnchoredPosition', 'goog.string', 'goog.style', 'goog.ui.Component', 'goog.ui.ItemEvent', 'goog.ui.LabelInput', 'goog.ui.Menu', 'goog.ui.MenuItem', 'goog.ui.MenuSeparator', 'goog.ui.registry', 'goog.userAgent']);
goog.addDependency('ui/component.js', ['goog.ui.Component', 'goog.ui.Component.Error', 'goog.ui.Component.EventType', 'goog.ui.Component.State'], ['goog.array', 'goog.asserts', 'goog.dom', 'goog.dom.NodeType', 'goog.events.EventHandler', 'goog.events.EventTarget', 'goog.object', 'goog.style', 'goog.ui.IdGenerator']);
goog.addDependency('ui/container.js', ['goog.ui.Container', 'goog.ui.Container.EventType', 'goog.ui.Container.Orientation'], ['goog.a11y.aria', 'goog.a11y.aria.State', 'goog.asserts', 'goog.dom', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.events.KeyHandler', 'goog.object', 'goog.style', 'goog.ui.Component', 'goog.ui.ContainerRenderer', 'goog.ui.Control']);
goog.addDependency('ui/containerrenderer.js', ['goog.ui.ContainerRenderer'], ['goog.a11y.aria', 'goog.array', 'goog.asserts', 'goog.dom.NodeType', 'goog.dom.classlist', 'goog.string', 'goog.style', 'goog.ui.registry', 'goog.userAgent']);
goog.addDependency('ui/containerscroller.js', ['goog.ui.ContainerScroller'], ['goog.Disposable', 'goog.Timer', 'goog.events.EventHandler', 'goog.style', 'goog.ui.Component', 'goog.ui.Container']);
goog.addDependency('ui/control.js', ['goog.ui.Control'], ['goog.array', 'goog.dom', 'goog.events.Event', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.events.KeyHandler', 'goog.string', 'goog.ui.Component', 'goog.ui.ControlContent', 'goog.ui.ControlRenderer', 'goog.ui.decorate', 'goog.ui.registry', 'goog.userAgent']);
goog.addDependency('ui/controlcontent.js', ['goog.ui.ControlContent'], []);
goog.addDependency('ui/controlrenderer.js', ['goog.ui.ControlRenderer'], ['goog.a11y.aria', 'goog.a11y.aria.Role', 'goog.a11y.aria.State', 'goog.array', 'goog.asserts', 'goog.dom', 'goog.dom.classlist', 'goog.object', 'goog.string', 'goog.style', 'goog.ui.Component', 'goog.userAgent']);
goog.addDependency('ui/cookieeditor.js', ['goog.ui.CookieEditor'], ['goog.asserts', 'goog.dom', 'goog.dom.TagName', 'goog.events.EventType', 'goog.net.cookies', 'goog.string', 'goog.style', 'goog.ui.Component']);
goog.addDependency('ui/css3buttonrenderer.js', ['goog.ui.Css3ButtonRenderer'], ['goog.asserts', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.ui.Button', 'goog.ui.ButtonRenderer', 'goog.ui.Component', 'goog.ui.INLINE_BLOCK_CLASSNAME', 'goog.ui.registry']);
goog.addDependency('ui/css3menubuttonrenderer.js', ['goog.ui.Css3MenuButtonRenderer'], ['goog.dom', 'goog.dom.TagName', 'goog.ui.INLINE_BLOCK_CLASSNAME', 'goog.ui.MenuButton', 'goog.ui.MenuButtonRenderer', 'goog.ui.registry']);
goog.addDependency('ui/cssnames.js', ['goog.ui.INLINE_BLOCK_CLASSNAME'], []);
goog.addDependency('ui/custombutton.js', ['goog.ui.CustomButton'], ['goog.ui.Button', 'goog.ui.CustomButtonRenderer', 'goog.ui.registry']);
goog.addDependency('ui/custombuttonrenderer.js', ['goog.ui.CustomButtonRenderer'], ['goog.a11y.aria.Role', 'goog.asserts', 'goog.dom.NodeType', 'goog.dom.classlist', 'goog.string', 'goog.ui.ButtonRenderer', 'goog.ui.INLINE_BLOCK_CLASSNAME']);
goog.addDependency('ui/customcolorpalette.js', ['goog.ui.CustomColorPalette'], ['goog.color', 'goog.dom', 'goog.dom.classlist', 'goog.ui.ColorPalette', 'goog.ui.Component']);
goog.addDependency('ui/datepicker.js', ['goog.ui.DatePicker', 'goog.ui.DatePicker.Events', 'goog.ui.DatePickerEvent'], ['goog.a11y.aria', 'goog.asserts', 'goog.date.Date', 'goog.date.DateRange', 'goog.date.Interval', 'goog.dom', 'goog.dom.NodeType', 'goog.dom.classlist', 'goog.events.Event', 'goog.events.EventType', 'goog.events.KeyHandler', 'goog.i18n.DateTimeFormat', 'goog.i18n.DateTimePatterns', 'goog.i18n.DateTimeSymbols', 'goog.style', 'goog.ui.Component', 'goog.ui.DefaultDatePickerRenderer', 'goog.ui.IdGenerator']);
goog.addDependency('ui/datepickerrenderer.js', ['goog.ui.DatePickerRenderer'], []);
goog.addDependency('ui/decorate.js', ['goog.ui.decorate'], ['goog.ui.registry']);
goog.addDependency('ui/defaultdatepickerrenderer.js', ['goog.ui.DefaultDatePickerRenderer'], ['goog.dom', 'goog.dom.TagName', 'goog.ui.DatePickerRenderer']);
goog.addDependency('ui/dialog.js', ['goog.ui.Dialog', 'goog.ui.Dialog.ButtonSet', 'goog.ui.Dialog.ButtonSet.DefaultButtons', 'goog.ui.Dialog.DefaultButtonCaptions', 'goog.ui.Dialog.DefaultButtonKeys', 'goog.ui.Dialog.Event', 'goog.ui.Dialog.EventType'], ['goog.a11y.aria', 'goog.a11y.aria.Role', 'goog.a11y.aria.State', 'goog.asserts', 'goog.dom', 'goog.dom.NodeType', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.dom.safe', 'goog.events', 'goog.events.Event', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.fx.Dragger', 'goog.html.SafeHtml', 'goog.html.legacyconversions', 'goog.math.Rect', 'goog.string', 'goog.structs.Map', 'goog.style', 'goog.ui.ModalPopup']);
goog.addDependency('ui/dimensionpicker.js', ['goog.ui.DimensionPicker'], ['goog.events.EventType', 'goog.events.KeyCodes', 'goog.math.Size', 'goog.ui.Component', 'goog.ui.Control', 'goog.ui.DimensionPickerRenderer', 'goog.ui.registry']);
goog.addDependency('ui/dimensionpickerrenderer.js', ['goog.ui.DimensionPickerRenderer'], ['goog.a11y.aria.Announcer', 'goog.a11y.aria.LivePriority', 'goog.dom', 'goog.dom.TagName', 'goog.i18n.bidi', 'goog.style', 'goog.ui.ControlRenderer', 'goog.userAgent']);
goog.addDependency('ui/dragdropdetector.js', ['goog.ui.DragDropDetector', 'goog.ui.DragDropDetector.EventType', 'goog.ui.DragDropDetector.ImageDropEvent', 'goog.ui.DragDropDetector.LinkDropEvent'], ['goog.dom', 'goog.dom.TagName', 'goog.events.Event', 'goog.events.EventHandler', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.math.Coordinate', 'goog.string', 'goog.style', 'goog.userAgent']);
goog.addDependency('ui/drilldownrow.js', ['goog.ui.DrilldownRow'], ['goog.asserts', 'goog.dom', 'goog.dom.classlist', 'goog.ui.Component']);
goog.addDependency('ui/editor/abstractdialog.js', ['goog.ui.editor.AbstractDialog', 'goog.ui.editor.AbstractDialog.Builder', 'goog.ui.editor.AbstractDialog.EventType'], ['goog.asserts', 'goog.dom', 'goog.dom.classlist', 'goog.events.EventTarget', 'goog.string', 'goog.ui.Dialog']);
goog.addDependency('ui/editor/bubble.js', ['goog.ui.editor.Bubble'], ['goog.asserts', 'goog.dom', 'goog.dom.TagName', 'goog.dom.ViewportSizeMonitor', 'goog.dom.classlist', 'goog.editor.style', 'goog.events.EventHandler', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.functions', 'goog.log', 'goog.math.Box', 'goog.object', 'goog.positioning', 'goog.positioning.Corner', 'goog.positioning.Overflow', 'goog.positioning.OverflowStatus', 'goog.string', 'goog.style', 'goog.ui.Component', 'goog.ui.PopupBase', 'goog.userAgent']);
goog.addDependency('ui/editor/defaulttoolbar.js', ['goog.ui.editor.ButtonDescriptor', 'goog.ui.editor.DefaultToolbar'], ['goog.asserts', 'goog.dom', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.editor.Command', 'goog.style', 'goog.ui.editor.ToolbarFactory', 'goog.ui.editor.messages', 'goog.userAgent']);
goog.addDependency('ui/editor/equationeditordialog.js', ['goog.ui.editor.EquationEditorDialog'], ['goog.editor.Command', 'goog.ui.Dialog', 'goog.ui.editor.AbstractDialog', 'goog.ui.editor.EquationEditorOkEvent', 'goog.ui.equation.TexEditor']);
goog.addDependency('ui/editor/equationeditorokevent.js', ['goog.ui.editor.EquationEditorOkEvent'], ['goog.events.Event', 'goog.ui.editor.AbstractDialog']);
goog.addDependency('ui/editor/linkdialog.js', ['goog.ui.editor.LinkDialog', 'goog.ui.editor.LinkDialog.BeforeTestLinkEvent', 'goog.ui.editor.LinkDialog.EventType', 'goog.ui.editor.LinkDialog.OkEvent'], ['goog.dom', 'goog.dom.TagName', 'goog.dom.safe', 'goog.editor.BrowserFeature', 'goog.editor.Link', 'goog.editor.focus', 'goog.editor.node', 'goog.events.Event', 'goog.events.EventHandler', 'goog.events.EventType', 'goog.events.InputHandler', 'goog.html.SafeHtml', 'goog.string', 'goog.string.Unicode', 'goog.style', 'goog.ui.Button', 'goog.ui.Component', 'goog.ui.LinkButtonRenderer', 'goog.ui.editor.AbstractDialog', 'goog.ui.editor.TabPane', 'goog.ui.editor.messages', 'goog.userAgent', 'goog.window']);
goog.addDependency('ui/editor/messages.js', ['goog.ui.editor.messages'], ['goog.html.uncheckedconversions', 'goog.string.Const']);
goog.addDependency('ui/editor/tabpane.js', ['goog.ui.editor.TabPane'], ['goog.asserts', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.events.EventHandler', 'goog.events.EventType', 'goog.style', 'goog.ui.Component', 'goog.ui.Control', 'goog.ui.Tab', 'goog.ui.TabBar']);
goog.addDependency('ui/editor/toolbarcontroller.js', ['goog.ui.editor.ToolbarController'], ['goog.editor.Field', 'goog.events.EventHandler', 'goog.events.EventTarget', 'goog.ui.Component']);
goog.addDependency('ui/editor/toolbarfactory.js', ['goog.ui.editor.ToolbarFactory'], ['goog.array', 'goog.dom', 'goog.dom.TagName', 'goog.string', 'goog.string.Unicode', 'goog.style', 'goog.ui.Component', 'goog.ui.Container', 'goog.ui.Option', 'goog.ui.Toolbar', 'goog.ui.ToolbarButton', 'goog.ui.ToolbarColorMenuButton', 'goog.ui.ToolbarMenuButton', 'goog.ui.ToolbarRenderer', 'goog.ui.ToolbarSelect', 'goog.userAgent']);
goog.addDependency('ui/emoji/emoji.js', ['goog.ui.emoji.Emoji'], []);
goog.addDependency('ui/emoji/emojipalette.js', ['goog.ui.emoji.EmojiPalette'], ['goog.events.EventType', 'goog.net.ImageLoader', 'goog.ui.Palette', 'goog.ui.emoji.Emoji', 'goog.ui.emoji.EmojiPaletteRenderer']);
goog.addDependency('ui/emoji/emojipaletterenderer.js', ['goog.ui.emoji.EmojiPaletteRenderer'], ['goog.a11y.aria', 'goog.asserts', 'goog.dom.NodeType', 'goog.dom.classlist', 'goog.style', 'goog.ui.PaletteRenderer', 'goog.ui.emoji.Emoji']);
goog.addDependency('ui/emoji/emojipicker.js', ['goog.ui.emoji.EmojiPicker'], ['goog.log', 'goog.style', 'goog.ui.Component', 'goog.ui.TabPane', 'goog.ui.emoji.Emoji', 'goog.ui.emoji.EmojiPalette', 'goog.ui.emoji.EmojiPaletteRenderer', 'goog.ui.emoji.ProgressiveEmojiPaletteRenderer']);
goog.addDependency('ui/emoji/popupemojipicker.js', ['goog.ui.emoji.PopupEmojiPicker'], ['goog.events.EventType', 'goog.positioning.AnchoredPosition', 'goog.positioning.Corner', 'goog.ui.Component', 'goog.ui.Popup', 'goog.ui.emoji.EmojiPicker']);
goog.addDependency('ui/emoji/progressiveemojipaletterenderer.js', ['goog.ui.emoji.ProgressiveEmojiPaletteRenderer'], ['goog.style', 'goog.ui.emoji.EmojiPaletteRenderer']);
goog.addDependency('ui/emoji/spriteinfo.js', ['goog.ui.emoji.SpriteInfo'], []);
goog.addDependency('ui/equation/arrowpalette.js', ['goog.ui.equation.ArrowPalette'], ['goog.math.Size', 'goog.ui.equation.Palette']);
goog.addDependency('ui/equation/changeevent.js', ['goog.ui.equation.ChangeEvent'], ['goog.events.Event']);
goog.addDependency('ui/equation/comparisonpalette.js', ['goog.ui.equation.ComparisonPalette'], ['goog.math.Size', 'goog.ui.equation.Palette']);
goog.addDependency('ui/equation/editorpane.js', ['goog.ui.equation.EditorPane'], ['goog.style', 'goog.ui.Component']);
goog.addDependency('ui/equation/equationeditor.js', ['goog.ui.equation.EquationEditor'], ['goog.events', 'goog.ui.Component', 'goog.ui.TabBar', 'goog.ui.equation.ImageRenderer', 'goog.ui.equation.TexPane']);
goog.addDependency('ui/equation/equationeditordialog.js', ['goog.ui.equation.EquationEditorDialog'], ['goog.asserts', 'goog.dom', 'goog.dom.classlist', 'goog.ui.Dialog', 'goog.ui.equation.EquationEditor', 'goog.ui.equation.PaletteManager', 'goog.ui.equation.TexEditor']);
goog.addDependency('ui/equation/greekpalette.js', ['goog.ui.equation.GreekPalette'], ['goog.math.Size', 'goog.ui.equation.Palette']);
goog.addDependency('ui/equation/imagerenderer.js', ['goog.ui.equation.ImageRenderer'], ['goog.asserts', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.string', 'goog.uri.utils']);
goog.addDependency('ui/equation/mathpalette.js', ['goog.ui.equation.MathPalette'], ['goog.math.Size', 'goog.ui.equation.Palette']);
goog.addDependency('ui/equation/menupalette.js', ['goog.ui.equation.MenuPalette', 'goog.ui.equation.MenuPaletteRenderer'], ['goog.math.Size', 'goog.ui.PaletteRenderer', 'goog.ui.equation.Palette', 'goog.ui.equation.PaletteRenderer']);
goog.addDependency('ui/equation/palette.js', ['goog.ui.equation.Palette', 'goog.ui.equation.PaletteEvent', 'goog.ui.equation.PaletteRenderer'], ['goog.dom', 'goog.dom.TagName', 'goog.events.Event', 'goog.ui.Palette', 'goog.ui.PaletteRenderer']);
goog.addDependency('ui/equation/palettemanager.js', ['goog.ui.equation.PaletteManager'], ['goog.Timer', 'goog.events.EventHandler', 'goog.events.EventTarget', 'goog.ui.equation.ArrowPalette', 'goog.ui.equation.ComparisonPalette', 'goog.ui.equation.GreekPalette', 'goog.ui.equation.MathPalette', 'goog.ui.equation.MenuPalette', 'goog.ui.equation.Palette', 'goog.ui.equation.SymbolPalette']);
goog.addDependency('ui/equation/symbolpalette.js', ['goog.ui.equation.SymbolPalette'], ['goog.math.Size', 'goog.ui.equation.Palette']);
goog.addDependency('ui/equation/texeditor.js', ['goog.ui.equation.TexEditor'], ['goog.ui.Component', 'goog.ui.equation.ImageRenderer', 'goog.ui.equation.TexPane']);
goog.addDependency('ui/equation/texpane.js', ['goog.ui.equation.TexPane'], ['goog.Timer', 'goog.dom', 'goog.dom.TagName', 'goog.dom.selection', 'goog.events', 'goog.events.EventType', 'goog.events.InputHandler', 'goog.style', 'goog.ui.equation.ChangeEvent', 'goog.ui.equation.EditorPane', 'goog.ui.equation.ImageRenderer', 'goog.ui.equation.Palette', 'goog.ui.equation.PaletteEvent']);
goog.addDependency('ui/filteredmenu.js', ['goog.ui.FilteredMenu'], ['goog.a11y.aria', 'goog.a11y.aria.AutoCompleteValues', 'goog.a11y.aria.State', 'goog.dom', 'goog.events', 'goog.events.EventType', 'goog.events.InputHandler', 'goog.events.KeyCodes', 'goog.object', 'goog.string', 'goog.style', 'goog.ui.Component', 'goog.ui.FilterObservingMenuItem', 'goog.ui.Menu', 'goog.ui.MenuItem', 'goog.userAgent']);
goog.addDependency('ui/filterobservingmenuitem.js', ['goog.ui.FilterObservingMenuItem'], ['goog.ui.FilterObservingMenuItemRenderer', 'goog.ui.MenuItem', 'goog.ui.registry']);
goog.addDependency('ui/filterobservingmenuitemrenderer.js', ['goog.ui.FilterObservingMenuItemRenderer'], ['goog.ui.MenuItemRenderer']);
goog.addDependency('ui/flatbuttonrenderer.js', ['goog.ui.FlatButtonRenderer'], ['goog.a11y.aria.Role', 'goog.asserts', 'goog.dom.classlist', 'goog.ui.Button', 'goog.ui.ButtonRenderer', 'goog.ui.INLINE_BLOCK_CLASSNAME', 'goog.ui.registry']);
goog.addDependency('ui/flatmenubuttonrenderer.js', ['goog.ui.FlatMenuButtonRenderer'], ['goog.dom', 'goog.style', 'goog.ui.FlatButtonRenderer', 'goog.ui.INLINE_BLOCK_CLASSNAME', 'goog.ui.Menu', 'goog.ui.MenuButton', 'goog.ui.MenuRenderer', 'goog.ui.registry']);
goog.addDependency('ui/formpost.js', ['goog.ui.FormPost'], ['goog.array', 'goog.dom.TagName', 'goog.dom.safe', 'goog.html.SafeHtml', 'goog.ui.Component']);
goog.addDependency('ui/gauge.js', ['goog.ui.Gauge', 'goog.ui.GaugeColoredRange'], ['goog.a11y.aria', 'goog.asserts', 'goog.events', 'goog.fx.Animation', 'goog.fx.Transition', 'goog.fx.easing', 'goog.graphics', 'goog.graphics.Font', 'goog.graphics.Path', 'goog.graphics.SolidFill', 'goog.math', 'goog.ui.Component', 'goog.ui.GaugeTheme']);
goog.addDependency('ui/gaugetheme.js', ['goog.ui.GaugeTheme'], ['goog.graphics.LinearGradient', 'goog.graphics.SolidFill', 'goog.graphics.Stroke']);
goog.addDependency('ui/hovercard.js', ['goog.ui.HoverCard', 'goog.ui.HoverCard.EventType', 'goog.ui.HoverCard.TriggerEvent'], ['goog.array', 'goog.dom', 'goog.events', 'goog.events.Event', 'goog.events.EventType', 'goog.ui.AdvancedTooltip', 'goog.ui.PopupBase', 'goog.ui.Tooltip']);
goog.addDependency('ui/hsvapalette.js', ['goog.ui.HsvaPalette'], ['goog.array', 'goog.color.alpha', 'goog.dom.TagName', 'goog.events', 'goog.events.EventType', 'goog.style', 'goog.ui.Component', 'goog.ui.HsvPalette']);
goog.addDependency('ui/hsvpalette.js', ['goog.ui.HsvPalette'], ['goog.color', 'goog.dom.TagName', 'goog.events', 'goog.events.EventType', 'goog.events.InputHandler', 'goog.style', 'goog.style.bidi', 'goog.ui.Component', 'goog.userAgent']);
goog.addDependency('ui/idgenerator.js', ['goog.ui.IdGenerator'], []);
goog.addDependency('ui/idletimer.js', ['goog.ui.IdleTimer'], ['goog.Timer', 'goog.events', 'goog.events.EventTarget', 'goog.structs.Set', 'goog.ui.ActivityMonitor']);
goog.addDependency('ui/iframemask.js', ['goog.ui.IframeMask'], ['goog.Disposable', 'goog.Timer', 'goog.dom', 'goog.dom.iframe', 'goog.events.EventHandler', 'goog.style']);
goog.addDependency('ui/imagelessbuttonrenderer.js', ['goog.ui.ImagelessButtonRenderer'], ['goog.dom.classlist', 'goog.ui.Button', 'goog.ui.Component', 'goog.ui.CustomButtonRenderer', 'goog.ui.INLINE_BLOCK_CLASSNAME', 'goog.ui.registry']);
goog.addDependency('ui/imagelessmenubuttonrenderer.js', ['goog.ui.ImagelessMenuButtonRenderer'], ['goog.dom', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.ui.INLINE_BLOCK_CLASSNAME', 'goog.ui.MenuButton', 'goog.ui.MenuButtonRenderer', 'goog.ui.registry']);
goog.addDependency('ui/inputdatepicker.js', ['goog.ui.InputDatePicker'], ['goog.date.DateTime', 'goog.dom', 'goog.string', 'goog.ui.Component', 'goog.ui.DatePicker', 'goog.ui.PopupBase', 'goog.ui.PopupDatePicker']);
goog.addDependency('ui/itemevent.js', ['goog.ui.ItemEvent'], ['goog.events.Event']);
goog.addDependency('ui/keyboardshortcuthandler.js', ['goog.ui.KeyboardShortcutEvent', 'goog.ui.KeyboardShortcutHandler', 'goog.ui.KeyboardShortcutHandler.EventType'], ['goog.Timer', 'goog.events', 'goog.events.Event', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.events.KeyNames', 'goog.object', 'goog.userAgent']);
goog.addDependency('ui/labelinput.js', ['goog.ui.LabelInput'], ['goog.Timer', 'goog.a11y.aria', 'goog.a11y.aria.State', 'goog.asserts', 'goog.dom', 'goog.dom.classlist', 'goog.events.EventHandler', 'goog.events.EventType', 'goog.ui.Component', 'goog.userAgent']);
goog.addDependency('ui/linkbuttonrenderer.js', ['goog.ui.LinkButtonRenderer'], ['goog.ui.Button', 'goog.ui.FlatButtonRenderer', 'goog.ui.registry']);
goog.addDependency('ui/media/flashobject.js', ['goog.ui.media.FlashObject', 'goog.ui.media.FlashObject.ScriptAccessLevel', 'goog.ui.media.FlashObject.Wmodes'], ['goog.asserts', 'goog.events.Event', 'goog.events.EventHandler', 'goog.events.EventType', 'goog.log', 'goog.object', 'goog.string', 'goog.structs.Map', 'goog.style', 'goog.ui.Component', 'goog.userAgent', 'goog.userAgent.flash']);
goog.addDependency('ui/media/flickr.js', ['goog.ui.media.FlickrSet', 'goog.ui.media.FlickrSetModel'], ['goog.ui.media.FlashObject', 'goog.ui.media.Media', 'goog.ui.media.MediaModel', 'goog.ui.media.MediaRenderer']);
goog.addDependency('ui/media/googlevideo.js', ['goog.ui.media.GoogleVideo', 'goog.ui.media.GoogleVideoModel'], ['goog.string', 'goog.ui.media.FlashObject', 'goog.ui.media.Media', 'goog.ui.media.MediaModel', 'goog.ui.media.MediaRenderer']);
goog.addDependency('ui/media/media.js', ['goog.ui.media.Media', 'goog.ui.media.MediaRenderer'], ['goog.style', 'goog.ui.Component', 'goog.ui.Control', 'goog.ui.ControlRenderer']);
goog.addDependency('ui/media/mediamodel.js', ['goog.ui.media.MediaModel', 'goog.ui.media.MediaModel.Category', 'goog.ui.media.MediaModel.Credit', 'goog.ui.media.MediaModel.Credit.Role', 'goog.ui.media.MediaModel.Credit.Scheme', 'goog.ui.media.MediaModel.Medium', 'goog.ui.media.MediaModel.MimeType', 'goog.ui.media.MediaModel.Player', 'goog.ui.media.MediaModel.SubTitle', 'goog.ui.media.MediaModel.Thumbnail'], ['goog.array']);
goog.addDependency('ui/media/mp3.js', ['goog.ui.media.Mp3'], ['goog.string', 'goog.ui.media.FlashObject', 'goog.ui.media.Media', 'goog.ui.media.MediaRenderer']);
goog.addDependency('ui/media/photo.js', ['goog.ui.media.Photo'], ['goog.ui.media.Media', 'goog.ui.media.MediaRenderer']);
goog.addDependency('ui/media/picasa.js', ['goog.ui.media.PicasaAlbum', 'goog.ui.media.PicasaAlbumModel'], ['goog.ui.media.FlashObject', 'goog.ui.media.Media', 'goog.ui.media.MediaModel', 'goog.ui.media.MediaRenderer']);
goog.addDependency('ui/media/vimeo.js', ['goog.ui.media.Vimeo', 'goog.ui.media.VimeoModel'], ['goog.string', 'goog.ui.media.FlashObject', 'goog.ui.media.Media', 'goog.ui.media.MediaModel', 'goog.ui.media.MediaRenderer']);
goog.addDependency('ui/media/youtube.js', ['goog.ui.media.Youtube', 'goog.ui.media.YoutubeModel'], ['goog.string', 'goog.ui.Component', 'goog.ui.media.FlashObject', 'goog.ui.media.Media', 'goog.ui.media.MediaModel', 'goog.ui.media.MediaRenderer']);
goog.addDependency('ui/menu.js', ['goog.ui.Menu', 'goog.ui.Menu.EventType'], ['goog.math.Coordinate', 'goog.string', 'goog.style', 'goog.ui.Component.EventType', 'goog.ui.Component.State', 'goog.ui.Container', 'goog.ui.Container.Orientation', 'goog.ui.MenuHeader', 'goog.ui.MenuItem', 'goog.ui.MenuRenderer', 'goog.ui.MenuSeparator']);
goog.addDependency('ui/menubar.js', ['goog.ui.menuBar'], ['goog.ui.Container', 'goog.ui.MenuBarRenderer']);
goog.addDependency('ui/menubardecorator.js', ['goog.ui.menuBarDecorator'], ['goog.ui.MenuBarRenderer', 'goog.ui.menuBar', 'goog.ui.registry']);
goog.addDependency('ui/menubarrenderer.js', ['goog.ui.MenuBarRenderer'], ['goog.a11y.aria.Role', 'goog.ui.Container', 'goog.ui.ContainerRenderer']);
goog.addDependency('ui/menubase.js', ['goog.ui.MenuBase'], ['goog.events.EventHandler', 'goog.events.EventType', 'goog.events.KeyHandler', 'goog.ui.Popup']);
goog.addDependency('ui/menubutton.js', ['goog.ui.MenuButton'], ['goog.Timer', 'goog.a11y.aria', 'goog.a11y.aria.State', 'goog.asserts', 'goog.dom', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.events.KeyHandler', 'goog.math.Box', 'goog.math.Rect', 'goog.positioning', 'goog.positioning.Corner', 'goog.positioning.MenuAnchoredPosition', 'goog.positioning.Overflow', 'goog.style', 'goog.ui.Button', 'goog.ui.Component', 'goog.ui.IdGenerator', 'goog.ui.Menu', 'goog.ui.MenuButtonRenderer', 'goog.ui.MenuRenderer', 'goog.ui.registry', 'goog.userAgent', 'goog.userAgent.product']);
goog.addDependency('ui/menubuttonrenderer.js', ['goog.ui.MenuButtonRenderer'], ['goog.dom', 'goog.style', 'goog.ui.CustomButtonRenderer', 'goog.ui.INLINE_BLOCK_CLASSNAME', 'goog.ui.Menu', 'goog.ui.MenuRenderer']);
goog.addDependency('ui/menuheader.js', ['goog.ui.MenuHeader'], ['goog.ui.Component', 'goog.ui.Control', 'goog.ui.MenuHeaderRenderer', 'goog.ui.registry']);
goog.addDependency('ui/menuheaderrenderer.js', ['goog.ui.MenuHeaderRenderer'], ['goog.ui.ControlRenderer']);
goog.addDependency('ui/menuitem.js', ['goog.ui.MenuItem'], ['goog.a11y.aria.Role', 'goog.array', 'goog.dom', 'goog.dom.classlist', 'goog.math.Coordinate', 'goog.string', 'goog.ui.Component', 'goog.ui.Control', 'goog.ui.MenuItemRenderer', 'goog.ui.registry']);
goog.addDependency('ui/menuitemrenderer.js', ['goog.ui.MenuItemRenderer'], ['goog.a11y.aria.Role', 'goog.asserts', 'goog.dom', 'goog.dom.classlist', 'goog.ui.Component', 'goog.ui.ControlRenderer']);
goog.addDependency('ui/menurenderer.js', ['goog.ui.MenuRenderer'], ['goog.a11y.aria', 'goog.a11y.aria.Role', 'goog.a11y.aria.State', 'goog.asserts', 'goog.dom', 'goog.ui.ContainerRenderer', 'goog.ui.Separator']);
goog.addDependency('ui/menuseparator.js', ['goog.ui.MenuSeparator'], ['goog.ui.MenuSeparatorRenderer', 'goog.ui.Separator', 'goog.ui.registry']);
goog.addDependency('ui/menuseparatorrenderer.js', ['goog.ui.MenuSeparatorRenderer'], ['goog.dom', 'goog.dom.classlist', 'goog.ui.ControlContent', 'goog.ui.ControlRenderer']);
goog.addDependency('ui/mockactivitymonitor.js', ['goog.ui.MockActivityMonitor'], ['goog.events.EventType', 'goog.ui.ActivityMonitor']);
goog.addDependency('ui/mockactivitymonitor_test.js', ['goog.ui.MockActivityMonitorTest'], ['goog.events', 'goog.functions', 'goog.testing.jsunit', 'goog.testing.recordFunction', 'goog.ui.ActivityMonitor', 'goog.ui.MockActivityMonitor']);
goog.addDependency('ui/modalpopup.js', ['goog.ui.ModalPopup'], ['goog.Timer', 'goog.a11y.aria', 'goog.a11y.aria.State', 'goog.asserts', 'goog.dom', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.dom.iframe', 'goog.events', 'goog.events.EventType', 'goog.events.FocusHandler', 'goog.fx.Transition', 'goog.string', 'goog.style', 'goog.ui.Component', 'goog.ui.PopupBase', 'goog.userAgent']);
goog.addDependency('ui/nativebuttonrenderer.js', ['goog.ui.NativeButtonRenderer'], ['goog.asserts', 'goog.dom.classlist', 'goog.events.EventType', 'goog.ui.ButtonRenderer', 'goog.ui.Component']);
goog.addDependency('ui/option.js', ['goog.ui.Option'], ['goog.ui.Component', 'goog.ui.MenuItem', 'goog.ui.registry']);
goog.addDependency('ui/palette.js', ['goog.ui.Palette'], ['goog.array', 'goog.dom', 'goog.events', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.math.Size', 'goog.ui.Component', 'goog.ui.Control', 'goog.ui.PaletteRenderer', 'goog.ui.SelectionModel']);
goog.addDependency('ui/paletterenderer.js', ['goog.ui.PaletteRenderer'], ['goog.a11y.aria', 'goog.a11y.aria.Role', 'goog.a11y.aria.State', 'goog.array', 'goog.asserts', 'goog.dom', 'goog.dom.NodeIterator', 'goog.dom.NodeType', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.iter', 'goog.style', 'goog.ui.ControlRenderer', 'goog.userAgent']);
goog.addDependency('ui/plaintextspellchecker.js', ['goog.ui.PlainTextSpellChecker'], ['goog.Timer', 'goog.a11y.aria', 'goog.asserts', 'goog.dom', 'goog.events.EventHandler', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.events.KeyHandler', 'goog.spell.SpellCheck', 'goog.style', 'goog.ui.AbstractSpellChecker', 'goog.ui.Component', 'goog.userAgent']);
goog.addDependency('ui/popup.js', ['goog.ui.Popup', 'goog.ui.Popup.AbsolutePosition', 'goog.ui.Popup.AnchoredPosition', 'goog.ui.Popup.AnchoredViewPortPosition', 'goog.ui.Popup.ClientPosition', 'goog.ui.Popup.Corner', 'goog.ui.Popup.Overflow', 'goog.ui.Popup.ViewPortClientPosition', 'goog.ui.Popup.ViewPortPosition'], ['goog.math.Box', 'goog.positioning.AbsolutePosition', 'goog.positioning.AnchoredPosition', 'goog.positioning.AnchoredViewportPosition', 'goog.positioning.ClientPosition', 'goog.positioning.Corner', 'goog.positioning.Overflow', 'goog.positioning.ViewportClientPosition', 'goog.positioning.ViewportPosition', 'goog.style', 'goog.ui.PopupBase']);
goog.addDependency('ui/popupbase.js', ['goog.ui.PopupBase', 'goog.ui.PopupBase.EventType', 'goog.ui.PopupBase.Type'], ['goog.Timer', 'goog.array', 'goog.dom', 'goog.events', 'goog.events.EventHandler', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.fx.Transition', 'goog.style', 'goog.userAgent']);
goog.addDependency('ui/popupcolorpicker.js', ['goog.ui.PopupColorPicker'], ['goog.asserts', 'goog.dom.classlist', 'goog.events.EventType', 'goog.positioning.AnchoredPosition', 'goog.positioning.Corner', 'goog.ui.ColorPicker', 'goog.ui.Component', 'goog.ui.Popup']);
goog.addDependency('ui/popupdatepicker.js', ['goog.ui.PopupDatePicker'], ['goog.events.EventType', 'goog.positioning.AnchoredPosition', 'goog.positioning.Corner', 'goog.positioning.Overflow', 'goog.style', 'goog.ui.Component', 'goog.ui.DatePicker', 'goog.ui.Popup', 'goog.ui.PopupBase']);
goog.addDependency('ui/popupmenu.js', ['goog.ui.PopupMenu'], ['goog.events.EventType', 'goog.positioning.AnchoredViewportPosition', 'goog.positioning.Corner', 'goog.positioning.MenuAnchoredPosition', 'goog.positioning.Overflow', 'goog.positioning.ViewportClientPosition', 'goog.structs.Map', 'goog.style', 'goog.ui.Component', 'goog.ui.Menu', 'goog.ui.PopupBase', 'goog.userAgent']);
goog.addDependency('ui/progressbar.js', ['goog.ui.ProgressBar', 'goog.ui.ProgressBar.Orientation'], ['goog.a11y.aria', 'goog.asserts', 'goog.dom', 'goog.dom.classlist', 'goog.events', 'goog.events.EventType', 'goog.ui.Component', 'goog.ui.RangeModel', 'goog.userAgent']);
goog.addDependency('ui/prompt.js', ['goog.ui.Prompt'], ['goog.Timer', 'goog.dom', 'goog.events', 'goog.events.EventType', 'goog.functions', 'goog.html.SafeHtml', 'goog.html.legacyconversions', 'goog.ui.Component', 'goog.ui.Dialog', 'goog.userAgent']);
goog.addDependency('ui/rangemodel.js', ['goog.ui.RangeModel'], ['goog.events.EventTarget', 'goog.ui.Component']);
goog.addDependency('ui/ratings.js', ['goog.ui.Ratings', 'goog.ui.Ratings.EventType'], ['goog.a11y.aria', 'goog.a11y.aria.Role', 'goog.a11y.aria.State', 'goog.asserts', 'goog.dom.classlist', 'goog.events.EventType', 'goog.ui.Component']);
goog.addDependency('ui/registry.js', ['goog.ui.registry'], ['goog.asserts', 'goog.dom.classlist']);
goog.addDependency('ui/richtextspellchecker.js', ['goog.ui.RichTextSpellChecker'], ['goog.Timer', 'goog.asserts', 'goog.dom', 'goog.dom.NodeType', 'goog.dom.Range', 'goog.events.EventHandler', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.events.KeyHandler', 'goog.math.Coordinate', 'goog.spell.SpellCheck', 'goog.string.StringBuffer', 'goog.style', 'goog.ui.AbstractSpellChecker', 'goog.ui.Component', 'goog.ui.PopupMenu']);
goog.addDependency('ui/roundedpanel.js', ['goog.ui.BaseRoundedPanel', 'goog.ui.CssRoundedPanel', 'goog.ui.GraphicsRoundedPanel', 'goog.ui.RoundedPanel', 'goog.ui.RoundedPanel.Corner'], ['goog.asserts', 'goog.dom', 'goog.dom.classlist', 'goog.graphics', 'goog.graphics.Path', 'goog.graphics.SolidFill', 'goog.graphics.Stroke', 'goog.math', 'goog.math.Coordinate', 'goog.style', 'goog.ui.Component', 'goog.userAgent']);
goog.addDependency('ui/roundedtabrenderer.js', ['goog.ui.RoundedTabRenderer'], ['goog.dom', 'goog.ui.Tab', 'goog.ui.TabBar', 'goog.ui.TabRenderer', 'goog.ui.registry']);
goog.addDependency('ui/scrollfloater.js', ['goog.ui.ScrollFloater', 'goog.ui.ScrollFloater.EventType'], ['goog.array', 'goog.asserts', 'goog.dom', 'goog.dom.classlist', 'goog.events.EventType', 'goog.style', 'goog.ui.Component', 'goog.userAgent']);
goog.addDependency('ui/select.js', ['goog.ui.Select'], ['goog.a11y.aria', 'goog.a11y.aria.Role', 'goog.a11y.aria.State', 'goog.events.EventType', 'goog.ui.Component', 'goog.ui.IdGenerator', 'goog.ui.MenuButton', 'goog.ui.MenuItem', 'goog.ui.MenuRenderer', 'goog.ui.SelectionModel', 'goog.ui.registry']);
goog.addDependency('ui/selectionmenubutton.js', ['goog.ui.SelectionMenuButton', 'goog.ui.SelectionMenuButton.SelectionState'], ['goog.events.EventType', 'goog.style', 'goog.ui.Component', 'goog.ui.MenuButton', 'goog.ui.MenuItem', 'goog.ui.registry']);
goog.addDependency('ui/selectionmodel.js', ['goog.ui.SelectionModel'], ['goog.array', 'goog.events.EventTarget', 'goog.events.EventType']);
goog.addDependency('ui/separator.js', ['goog.ui.Separator'], ['goog.a11y.aria', 'goog.asserts', 'goog.ui.Component', 'goog.ui.Control', 'goog.ui.MenuSeparatorRenderer', 'goog.ui.registry']);
goog.addDependency('ui/serverchart.js', ['goog.ui.ServerChart', 'goog.ui.ServerChart.AxisDisplayType', 'goog.ui.ServerChart.ChartType', 'goog.ui.ServerChart.EncodingType', 'goog.ui.ServerChart.Event', 'goog.ui.ServerChart.LegendPosition', 'goog.ui.ServerChart.MaximumValue', 'goog.ui.ServerChart.MultiAxisAlignment', 'goog.ui.ServerChart.MultiAxisType', 'goog.ui.ServerChart.UriParam', 'goog.ui.ServerChart.UriTooLongEvent'], ['goog.Uri', 'goog.array', 'goog.asserts', 'goog.events.Event', 'goog.string', 'goog.ui.Component']);
goog.addDependency('ui/slider.js', ['goog.ui.Slider', 'goog.ui.Slider.Orientation'], ['goog.a11y.aria', 'goog.a11y.aria.Role', 'goog.dom', 'goog.ui.SliderBase']);
goog.addDependency('ui/sliderbase.js', ['goog.ui.SliderBase', 'goog.ui.SliderBase.AnimationFactory', 'goog.ui.SliderBase.Orientation'], ['goog.Timer', 'goog.a11y.aria', 'goog.a11y.aria.Role', 'goog.a11y.aria.State', 'goog.array', 'goog.asserts', 'goog.dom', 'goog.dom.classlist', 'goog.events', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.events.KeyHandler', 'goog.events.MouseWheelHandler', 'goog.functions', 'goog.fx.AnimationParallelQueue', 'goog.fx.Dragger', 'goog.fx.Transition', 'goog.fx.dom.ResizeHeight', 'goog.fx.dom.ResizeWidth', 'goog.fx.dom.Slide', 'goog.math', 'goog.math.Coordinate', 'goog.style', 'goog.style.bidi', 'goog.ui.Component', 'goog.ui.RangeModel']);
goog.addDependency('ui/splitbehavior.js', ['goog.ui.SplitBehavior', 'goog.ui.SplitBehavior.DefaultHandlers'], ['goog.Disposable', 'goog.asserts', 'goog.dispose', 'goog.dom', 'goog.dom.NodeType', 'goog.dom.classlist', 'goog.events.EventHandler', 'goog.ui.ButtonSide', 'goog.ui.Component', 'goog.ui.decorate', 'goog.ui.registry']);
goog.addDependency('ui/splitpane.js', ['goog.ui.SplitPane', 'goog.ui.SplitPane.Orientation'], ['goog.asserts', 'goog.dom', 'goog.dom.classlist', 'goog.events.EventType', 'goog.fx.Dragger', 'goog.math.Rect', 'goog.math.Size', 'goog.style', 'goog.ui.Component', 'goog.userAgent']);
goog.addDependency('ui/style/app/buttonrenderer.js', ['goog.ui.style.app.ButtonRenderer'], ['goog.dom.classlist', 'goog.ui.Button', 'goog.ui.CustomButtonRenderer', 'goog.ui.INLINE_BLOCK_CLASSNAME', 'goog.ui.registry']);
goog.addDependency('ui/style/app/menubuttonrenderer.js', ['goog.ui.style.app.MenuButtonRenderer'], ['goog.a11y.aria.Role', 'goog.array', 'goog.dom', 'goog.style', 'goog.ui.Menu', 'goog.ui.MenuRenderer', 'goog.ui.style.app.ButtonRenderer']);
goog.addDependency('ui/style/app/primaryactionbuttonrenderer.js', ['goog.ui.style.app.PrimaryActionButtonRenderer'], ['goog.ui.Button', 'goog.ui.registry', 'goog.ui.style.app.ButtonRenderer']);
goog.addDependency('ui/submenu.js', ['goog.ui.SubMenu'], ['goog.Timer', 'goog.asserts', 'goog.dom', 'goog.dom.classlist', 'goog.events.KeyCodes', 'goog.positioning.AnchoredViewportPosition', 'goog.positioning.Corner', 'goog.style', 'goog.ui.Component', 'goog.ui.Menu', 'goog.ui.MenuItem', 'goog.ui.SubMenuRenderer', 'goog.ui.registry']);
goog.addDependency('ui/submenurenderer.js', ['goog.ui.SubMenuRenderer'], ['goog.a11y.aria', 'goog.a11y.aria.State', 'goog.asserts', 'goog.dom', 'goog.dom.classlist', 'goog.style', 'goog.ui.Menu', 'goog.ui.MenuItemRenderer']);
goog.addDependency('ui/tab.js', ['goog.ui.Tab'], ['goog.ui.Component', 'goog.ui.Control', 'goog.ui.TabRenderer', 'goog.ui.registry']);
goog.addDependency('ui/tabbar.js', ['goog.ui.TabBar', 'goog.ui.TabBar.Location'], ['goog.ui.Component.EventType', 'goog.ui.Container', 'goog.ui.Container.Orientation', 'goog.ui.Tab', 'goog.ui.TabBarRenderer', 'goog.ui.registry']);
goog.addDependency('ui/tabbarrenderer.js', ['goog.ui.TabBarRenderer'], ['goog.a11y.aria.Role', 'goog.object', 'goog.ui.ContainerRenderer']);
goog.addDependency('ui/tablesorter.js', ['goog.ui.TableSorter', 'goog.ui.TableSorter.EventType'], ['goog.array', 'goog.dom', 'goog.dom.TagName', 'goog.dom.classlist', 'goog.events.EventType', 'goog.functions', 'goog.ui.Component']);
goog.addDependency('ui/tabpane.js', ['goog.ui.TabPane', 'goog.ui.TabPane.Events', 'goog.ui.TabPane.TabLocation', 'goog.ui.TabPane.TabPage', 'goog.ui.TabPaneEvent'], ['goog.asserts', 'goog.dom', 'goog.dom.classlist', 'goog.events', 'goog.events.Event', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.style']);
goog.addDependency('ui/tabrenderer.js', ['goog.ui.TabRenderer'], ['goog.a11y.aria.Role', 'goog.ui.Component', 'goog.ui.ControlRenderer']);
goog.addDependency('ui/textarea.js', ['goog.ui.Textarea', 'goog.ui.Textarea.EventType'], ['goog.asserts', 'goog.dom', 'goog.dom.classlist', 'goog.events.EventType', 'goog.style', 'goog.ui.Control', 'goog.ui.TextareaRenderer', 'goog.userAgent']);
goog.addDependency('ui/textarearenderer.js', ['goog.ui.TextareaRenderer'], ['goog.dom.TagName', 'goog.ui.Component', 'goog.ui.ControlRenderer']);
goog.addDependency('ui/togglebutton.js', ['goog.ui.ToggleButton'], ['goog.ui.Button', 'goog.ui.Component', 'goog.ui.CustomButtonRenderer', 'goog.ui.registry']);
goog.addDependency('ui/toolbar.js', ['goog.ui.Toolbar'], ['goog.ui.Container', 'goog.ui.ToolbarRenderer']);
goog.addDependency('ui/toolbarbutton.js', ['goog.ui.ToolbarButton'], ['goog.ui.Button', 'goog.ui.ToolbarButtonRenderer', 'goog.ui.registry']);
goog.addDependency('ui/toolbarbuttonrenderer.js', ['goog.ui.ToolbarButtonRenderer'], ['goog.ui.CustomButtonRenderer']);
goog.addDependency('ui/toolbarcolormenubutton.js', ['goog.ui.ToolbarColorMenuButton'], ['goog.ui.ColorMenuButton', 'goog.ui.ToolbarColorMenuButtonRenderer', 'goog.ui.registry']);
goog.addDependency('ui/toolbarcolormenubuttonrenderer.js', ['goog.ui.ToolbarColorMenuButtonRenderer'], ['goog.asserts', 'goog.dom.classlist', 'goog.ui.ColorMenuButtonRenderer', 'goog.ui.MenuButtonRenderer', 'goog.ui.ToolbarMenuButtonRenderer']);
goog.addDependency('ui/toolbarmenubutton.js', ['goog.ui.ToolbarMenuButton'], ['goog.ui.MenuButton', 'goog.ui.ToolbarMenuButtonRenderer', 'goog.ui.registry']);
goog.addDependency('ui/toolbarmenubuttonrenderer.js', ['goog.ui.ToolbarMenuButtonRenderer'], ['goog.ui.MenuButtonRenderer']);
goog.addDependency('ui/toolbarrenderer.js', ['goog.ui.ToolbarRenderer'], ['goog.a11y.aria.Role', 'goog.ui.Container', 'goog.ui.ContainerRenderer', 'goog.ui.Separator', 'goog.ui.ToolbarSeparatorRenderer']);
goog.addDependency('ui/toolbarselect.js', ['goog.ui.ToolbarSelect'], ['goog.ui.Select', 'goog.ui.ToolbarMenuButtonRenderer', 'goog.ui.registry']);
goog.addDependency('ui/toolbarseparator.js', ['goog.ui.ToolbarSeparator'], ['goog.ui.Separator', 'goog.ui.ToolbarSeparatorRenderer', 'goog.ui.registry']);
goog.addDependency('ui/toolbarseparatorrenderer.js', ['goog.ui.ToolbarSeparatorRenderer'], ['goog.asserts', 'goog.dom.classlist', 'goog.ui.INLINE_BLOCK_CLASSNAME', 'goog.ui.MenuSeparatorRenderer']);
goog.addDependency('ui/toolbartogglebutton.js', ['goog.ui.ToolbarToggleButton'], ['goog.ui.ToggleButton', 'goog.ui.ToolbarButtonRenderer', 'goog.ui.registry']);
goog.addDependency('ui/tooltip.js', ['goog.ui.Tooltip', 'goog.ui.Tooltip.CursorTooltipPosition', 'goog.ui.Tooltip.ElementTooltipPosition', 'goog.ui.Tooltip.State'], ['goog.Timer', 'goog.array', 'goog.dom', 'goog.dom.safe', 'goog.events', 'goog.events.EventType', 'goog.html.legacyconversions', 'goog.math.Box', 'goog.math.Coordinate', 'goog.positioning', 'goog.positioning.AnchoredPosition', 'goog.positioning.Corner', 'goog.positioning.Overflow', 'goog.positioning.OverflowStatus', 'goog.positioning.ViewportPosition', 'goog.structs.Set', 'goog.style', 'goog.ui.Popup', 'goog.ui.PopupBase']);
goog.addDependency('ui/tree/basenode.js', ['goog.ui.tree.BaseNode', 'goog.ui.tree.BaseNode.EventType'], ['goog.Timer', 'goog.a11y.aria', 'goog.asserts', 'goog.dom.safe', 'goog.events.Event', 'goog.events.KeyCodes', 'goog.html.SafeHtml', 'goog.html.SafeStyle', 'goog.html.legacyconversions', 'goog.string', 'goog.string.StringBuffer', 'goog.style', 'goog.ui.Component']);
goog.addDependency('ui/tree/treecontrol.js', ['goog.ui.tree.TreeControl'], ['goog.a11y.aria', 'goog.asserts', 'goog.dom.classlist', 'goog.events.EventType', 'goog.events.FocusHandler', 'goog.events.KeyHandler', 'goog.html.SafeHtml', 'goog.log', 'goog.ui.tree.BaseNode', 'goog.ui.tree.TreeNode', 'goog.ui.tree.TypeAhead', 'goog.userAgent']);
goog.addDependency('ui/tree/treenode.js', ['goog.ui.tree.TreeNode'], ['goog.ui.tree.BaseNode']);
goog.addDependency('ui/tree/typeahead.js', ['goog.ui.tree.TypeAhead', 'goog.ui.tree.TypeAhead.Offset'], ['goog.array', 'goog.events.KeyCodes', 'goog.string', 'goog.structs.Trie']);
goog.addDependency('ui/tristatemenuitem.js', ['goog.ui.TriStateMenuItem', 'goog.ui.TriStateMenuItem.State'], ['goog.dom.classlist', 'goog.ui.Component', 'goog.ui.MenuItem', 'goog.ui.TriStateMenuItemRenderer', 'goog.ui.registry']);
goog.addDependency('ui/tristatemenuitemrenderer.js', ['goog.ui.TriStateMenuItemRenderer'], ['goog.asserts', 'goog.dom.classlist', 'goog.ui.MenuItemRenderer']);
goog.addDependency('ui/twothumbslider.js', ['goog.ui.TwoThumbSlider'], ['goog.a11y.aria', 'goog.a11y.aria.Role', 'goog.dom', 'goog.ui.SliderBase']);
goog.addDependency('ui/zippy.js', ['goog.ui.Zippy', 'goog.ui.Zippy.Events', 'goog.ui.ZippyEvent'], ['goog.a11y.aria', 'goog.a11y.aria.Role', 'goog.a11y.aria.State', 'goog.dom', 'goog.dom.classlist', 'goog.events.Event', 'goog.events.EventHandler', 'goog.events.EventTarget', 'goog.events.EventType', 'goog.events.KeyCodes', 'goog.style']);
goog.addDependency('uri/uri.js', ['goog.Uri', 'goog.Uri.QueryData'], ['goog.array', 'goog.string', 'goog.structs', 'goog.structs.Map', 'goog.uri.utils', 'goog.uri.utils.ComponentIndex', 'goog.uri.utils.StandardQueryParam']);
goog.addDependency('uri/uri_test.js', ['goog.UriTest'], ['goog.Uri', 'goog.testing.jsunit']);
goog.addDependency('uri/utils.js', ['goog.uri.utils', 'goog.uri.utils.ComponentIndex', 'goog.uri.utils.QueryArray', 'goog.uri.utils.QueryValue', 'goog.uri.utils.StandardQueryParam'], ['goog.asserts', 'goog.string', 'goog.userAgent']);
goog.addDependency('uri/utils_test.js', ['goog.uri.utilsTest'], ['goog.functions', 'goog.string', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit', 'goog.uri.utils']);
goog.addDependency('useragent/adobereader.js', ['goog.userAgent.adobeReader'], ['goog.string', 'goog.userAgent']);
goog.addDependency('useragent/adobereader_test.js', ['goog.userAgent.adobeReaderTest'], ['goog.testing.jsunit', 'goog.userAgent.adobeReader']);
goog.addDependency('useragent/flash.js', ['goog.userAgent.flash'], ['goog.string']);
goog.addDependency('useragent/flash_test.js', ['goog.userAgent.flashTest'], ['goog.testing.jsunit', 'goog.userAgent.flash']);
goog.addDependency('useragent/iphoto.js', ['goog.userAgent.iphoto'], ['goog.string', 'goog.userAgent']);
goog.addDependency('useragent/jscript.js', ['goog.userAgent.jscript'], ['goog.string']);
goog.addDependency('useragent/jscript_test.js', ['goog.userAgent.jscriptTest'], ['goog.testing.jsunit', 'goog.userAgent.jscript']);
goog.addDependency('useragent/keyboard.js', ['goog.userAgent.keyboard'], ['goog.userAgent', 'goog.userAgent.product']);
goog.addDependency('useragent/keyboard_test.js', ['goog.userAgent.keyboardTest'], ['goog.labs.userAgent.testAgents', 'goog.labs.userAgent.util', 'goog.testing.MockUserAgent', 'goog.testing.jsunit', 'goog.userAgent.keyboard', 'goog.userAgentTestUtil']);
goog.addDependency('useragent/picasa.js', ['goog.userAgent.picasa'], ['goog.string', 'goog.userAgent']);
goog.addDependency('useragent/platform.js', ['goog.userAgent.platform'], ['goog.userAgent']);
goog.addDependency('useragent/platform_test.js', ['goog.userAgent.platformTest'], ['goog.testing.MockUserAgent', 'goog.testing.jsunit', 'goog.userAgent', 'goog.userAgent.platform']);
goog.addDependency('useragent/product.js', ['goog.userAgent.product'], ['goog.userAgent']);
goog.addDependency('useragent/product_isversion.js', ['goog.userAgent.product.isVersion'], ['goog.userAgent.product']);
goog.addDependency('useragent/product_test.js', ['goog.userAgent.productTest'], ['goog.array', 'goog.labs.userAgent.util', 'goog.testing.MockUserAgent', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit', 'goog.userAgent', 'goog.userAgent.product', 'goog.userAgent.product.isVersion', 'goog.userAgentTestUtil']);
goog.addDependency('useragent/useragent.js', ['goog.userAgent'], ['goog.labs.userAgent.browser', 'goog.labs.userAgent.engine', 'goog.labs.userAgent.util', 'goog.string']);
goog.addDependency('useragent/useragent_quirks_test.js', ['goog.userAgentQuirksTest'], ['goog.testing.jsunit', 'goog.userAgent']);
goog.addDependency('useragent/useragent_test.js', ['goog.userAgentTest'], ['goog.array', 'goog.labs.userAgent.testAgents', 'goog.labs.userAgent.util', 'goog.testing.PropertyReplacer', 'goog.testing.jsunit', 'goog.userAgent', 'goog.userAgentTestUtil']);
goog.addDependency('useragent/useragenttestutil.js', ['goog.userAgentTestUtil', 'goog.userAgentTestUtil.UserAgents'], ['goog.labs.userAgent.browser', 'goog.labs.userAgent.engine', 'goog.userAgent', 'goog.userAgent.keyboard', 'goog.userAgent.platform', 'goog.userAgent.product', 'goog.userAgent.product.isVersion']);
goog.addDependency('vec/float32array.js', ['goog.vec.Float32Array'], []);
goog.addDependency('vec/float64array.js', ['goog.vec.Float64Array'], []);
goog.addDependency('vec/mat3.js', ['goog.vec.Mat3'], ['goog.vec']);
goog.addDependency('vec/mat3d.js', ['goog.vec.mat3d', 'goog.vec.mat3d.Type'], ['goog.vec']);
goog.addDependency('vec/mat3f.js', ['goog.vec.mat3f', 'goog.vec.mat3f.Type'], ['goog.vec']);
goog.addDependency('vec/mat4.js', ['goog.vec.Mat4'], ['goog.vec', 'goog.vec.Vec3', 'goog.vec.Vec4']);
goog.addDependency('vec/mat4d.js', ['goog.vec.mat4d', 'goog.vec.mat4d.Type'], ['goog.vec', 'goog.vec.vec3d', 'goog.vec.vec4d']);
goog.addDependency('vec/mat4f.js', ['goog.vec.mat4f', 'goog.vec.mat4f.Type'], ['goog.vec', 'goog.vec.vec3f', 'goog.vec.vec4f']);
goog.addDependency('vec/matrix3.js', ['goog.vec.Matrix3'], []);
goog.addDependency('vec/matrix4.js', ['goog.vec.Matrix4'], ['goog.vec', 'goog.vec.Vec3', 'goog.vec.Vec4']);
goog.addDependency('vec/quaternion.js', ['goog.vec.Quaternion'], ['goog.vec', 'goog.vec.Vec3', 'goog.vec.Vec4']);
goog.addDependency('vec/ray.js', ['goog.vec.Ray'], ['goog.vec.Vec3']);
goog.addDependency('vec/vec.js', ['goog.vec', 'goog.vec.AnyType', 'goog.vec.ArrayType', 'goog.vec.Float32', 'goog.vec.Float64', 'goog.vec.Number'], ['goog.vec.Float32Array', 'goog.vec.Float64Array']);
goog.addDependency('vec/vec2.js', ['goog.vec.Vec2'], ['goog.vec']);
goog.addDependency('vec/vec2d.js', ['goog.vec.vec2d', 'goog.vec.vec2d.Type'], ['goog.vec']);
goog.addDependency('vec/vec2f.js', ['goog.vec.vec2f', 'goog.vec.vec2f.Type'], ['goog.vec']);
goog.addDependency('vec/vec3.js', ['goog.vec.Vec3'], ['goog.vec']);
goog.addDependency('vec/vec3d.js', ['goog.vec.vec3d', 'goog.vec.vec3d.Type'], ['goog.vec']);
goog.addDependency('vec/vec3f.js', ['goog.vec.vec3f', 'goog.vec.vec3f.Type'], ['goog.vec']);
goog.addDependency('vec/vec4.js', ['goog.vec.Vec4'], ['goog.vec']);
goog.addDependency('vec/vec4d.js', ['goog.vec.vec4d', 'goog.vec.vec4d.Type'], ['goog.vec']);
goog.addDependency('vec/vec4f.js', ['goog.vec.vec4f', 'goog.vec.vec4f.Type'], ['goog.vec']);
goog.addDependency('webgl/webgl.js', ['goog.webgl'], []);
goog.addDependency('window/window.js', ['goog.window'], ['goog.string', 'goog.userAgent']);
goog.addDependency('window/window_test.js', ['goog.windowTest'], ['goog.dom', 'goog.events', 'goog.string', 'goog.testing.AsyncTestCase', 'goog.testing.jsunit', 'goog.window']);

goog.require('olcs.AbstractSynchronizer');
goog.require('olcs.Camera');
goog.require('olcs.DragBox');
goog.require('olcs.DragBoxEventType');
goog.require('olcs.OLCesium');
goog.require('olcs.VectorSynchronizer');
goog.require('olcs.core');
goog.require('olcs.core.OlLayerPrimitive');


goog.exportSymbol(
    'olcs.AbstractSynchronizer',
    olcs.AbstractSynchronizer);

goog.exportProperty(
    olcs.AbstractSynchronizer.prototype,
    'synchronize',
    olcs.AbstractSynchronizer.prototype.synchronize);

goog.exportSymbol(
    'olcs.Camera',
    olcs.Camera);

goog.exportProperty(
    olcs.Camera.prototype,
    'setHeading',
    olcs.Camera.prototype.setHeading);

goog.exportProperty(
    olcs.Camera.prototype,
    'getHeading',
    olcs.Camera.prototype.getHeading);

goog.exportProperty(
    olcs.Camera.prototype,
    'setTilt',
    olcs.Camera.prototype.setTilt);

goog.exportProperty(
    olcs.Camera.prototype,
    'getTilt',
    olcs.Camera.prototype.getTilt);

goog.exportProperty(
    olcs.Camera.prototype,
    'setDistance',
    olcs.Camera.prototype.setDistance);

goog.exportProperty(
    olcs.Camera.prototype,
    'getDistance',
    olcs.Camera.prototype.getDistance);

goog.exportProperty(
    olcs.Camera.prototype,
    'setCenter',
    olcs.Camera.prototype.setCenter);

goog.exportProperty(
    olcs.Camera.prototype,
    'getCenter',
    olcs.Camera.prototype.getCenter);

goog.exportProperty(
    olcs.Camera.prototype,
    'setPosition',
    olcs.Camera.prototype.setPosition);

goog.exportProperty(
    olcs.Camera.prototype,
    'getPosition',
    olcs.Camera.prototype.getPosition);

goog.exportProperty(
    olcs.Camera.prototype,
    'setAltitude',
    olcs.Camera.prototype.setAltitude);

goog.exportProperty(
    olcs.Camera.prototype,
    'getAltitude',
    olcs.Camera.prototype.getAltitude);

goog.exportProperty(
    olcs.Camera.prototype,
    'lookAt',
    olcs.Camera.prototype.lookAt);

goog.exportProperty(
    olcs.Camera.prototype,
    'updateView',
    olcs.Camera.prototype.updateView);

goog.exportSymbol(
    'olcs.core.computePixelSizeAtCoordinate',
    olcs.core.computePixelSizeAtCoordinate);

goog.exportSymbol(
    'olcs.core.applyHeightOffsetToGeometry',
    olcs.core.applyHeightOffsetToGeometry);

goog.exportSymbol(
    'olcs.core.rotateAroundAxis',
    olcs.core.rotateAroundAxis);

goog.exportSymbol(
    'olcs.core.setHeadingUsingBottomCenter',
    olcs.core.setHeadingUsingBottomCenter);

goog.exportSymbol(
    'olcs.core.pickOnTerrainOrEllipsoid',
    olcs.core.pickOnTerrainOrEllipsoid);

goog.exportSymbol(
    'olcs.core.pickBottomPoint',
    olcs.core.pickBottomPoint);

goog.exportSymbol(
    'olcs.core.pickCenterPoint',
    olcs.core.pickCenterPoint);

goog.exportSymbol(
    'olcs.core.computeSignedTiltAngleOnGlobe',
    olcs.core.computeSignedTiltAngleOnGlobe);

goog.exportSymbol(
    'olcs.core.computeAngleToZenith',
    olcs.core.computeAngleToZenith);

goog.exportSymbol(
    'olcs.core.lookAt',
    olcs.core.lookAt);

goog.exportSymbol(
    'olcs.core.extentToRectangle',
    olcs.core.extentToRectangle);

goog.exportSymbol(
    'olcs.core.tileLayerToImageryLayer',
    olcs.core.tileLayerToImageryLayer);

goog.exportSymbol(
    'olcs.core.updateCesiumLayerProperties',
    olcs.core.updateCesiumLayerProperties);

goog.exportSymbol(
    'olcs.core.ol4326CoordinateToCesiumCartesian',
    olcs.core.ol4326CoordinateToCesiumCartesian);

goog.exportSymbol(
    'olcs.core.ol4326CoordinateArrayToCsCartesians',
    olcs.core.ol4326CoordinateArrayToCsCartesians);

goog.exportSymbol(
    'olcs.core.olCircleGeometryToCesium',
    olcs.core.olCircleGeometryToCesium);

goog.exportSymbol(
    'olcs.core.olLineStringGeometryToCesium',
    olcs.core.olLineStringGeometryToCesium);

goog.exportSymbol(
    'olcs.core.olPolygonGeometryToCesium',
    olcs.core.olPolygonGeometryToCesium);

goog.exportSymbol(
    'olcs.core.olPointGeometryToCesium',
    olcs.core.olPointGeometryToCesium);

goog.exportSymbol(
    'olcs.core.olMultiGeometryToCesium',
    olcs.core.olMultiGeometryToCesium);

goog.exportSymbol(
    'olcs.core.olGeometry4326TextPartToCesium',
    olcs.core.olGeometry4326TextPartToCesium);

goog.exportSymbol(
    'olcs.core.olStyleToCesium',
    olcs.core.olStyleToCesium);

goog.exportSymbol(
    'olcs.core.computePlainStyle',
    olcs.core.computePlainStyle);

goog.exportSymbol(
    'olcs.core.olFeatureToCesium',
    olcs.core.olFeatureToCesium);

goog.exportSymbol(
    'olcs.core.olVectorLayerToCesium',
    olcs.core.olVectorLayerToCesium);

goog.exportSymbol(
    'olcs.DragBox',
    olcs.DragBox);

goog.exportProperty(
    olcs.DragBox.prototype,
    'setScene',
    olcs.DragBox.prototype.setScene);

goog.exportProperty(
    olcs.DragBox.prototype,
    'listen',
    olcs.DragBox.prototype.listen);

goog.exportSymbol(
    'olcs.OLCesium',
    olcs.OLCesium);

goog.exportProperty(
    olcs.OLCesium.prototype,
    'getCamera',
    olcs.OLCesium.prototype.getCamera);

goog.exportProperty(
    olcs.OLCesium.prototype,
    'getOlMap',
    olcs.OLCesium.prototype.getOlMap);

goog.exportProperty(
    olcs.OLCesium.prototype,
    'getCesiumScene',
    olcs.OLCesium.prototype.getCesiumScene);

goog.exportProperty(
    olcs.OLCesium.prototype,
    'getEnabled',
    olcs.OLCesium.prototype.getEnabled);

goog.exportProperty(
    olcs.OLCesium.prototype,
    'setEnabled',
    olcs.OLCesium.prototype.setEnabled);

goog.exportProperty(
    olcs.OLCesium.prototype,
    'warmUp',
    olcs.OLCesium.prototype.warmUp);

goog.exportSymbol(
    'olcs.VectorSynchronizer',
    olcs.VectorSynchronizer);

goog.exportProperty(
    olcs.core.OlLayerPrimitive.prototype,
    'convert',
    olcs.core.OlLayerPrimitive.prototype.convert);
