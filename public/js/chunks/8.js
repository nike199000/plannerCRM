(window["webpackJsonp"] = window["webpackJsonp"] || []).push([[8],{

/***/ "./node_modules/@firebase/app/dist/index.cjs.js":
/*!******************************************************!*\
  !*** ./node_modules/@firebase/app/dist/index.cjs.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, '__esModule', { value: true });

var tslib_1 = __webpack_require__(/*! tslib */ "./node_modules/@firebase/app/node_modules/tslib/tslib.es6.js");
var util = __webpack_require__(/*! @firebase/util */ "./node_modules/@firebase/util/dist/index.cjs.js");
var logger$1 = __webpack_require__(/*! @firebase/logger */ "./node_modules/@firebase/logger/dist/index.esm.js");

/**
 * @license
 * Copyright 2019 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var _a;
var ERRORS = (_a = {},
    _a["no-app" /* NO_APP */] = "No Firebase App '{$appName}' has been created - " +
        'call Firebase App.initializeApp()',
    _a["bad-app-name" /* BAD_APP_NAME */] = "Illegal App name: '{$appName}",
    _a["duplicate-app" /* DUPLICATE_APP */] = "Firebase App named '{$appName}' already exists",
    _a["app-deleted" /* APP_DELETED */] = "Firebase App named '{$appName}' already deleted",
    _a["invalid-app-argument" /* INVALID_APP_ARGUMENT */] = 'firebase.{$appName}() takes either no argument or a ' +
        'Firebase App instance.',
    _a);
var ERROR_FACTORY = new util.ErrorFactory('app', 'Firebase', ERRORS);

/**
 * @license
 * Copyright 2019 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var DEFAULT_ENTRY_NAME = '[DEFAULT]';

/**
 * @license
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// An array to capture listeners before the true auth functions
// exist
var tokenListeners = [];
/**
 * Global context object for a collection of services using
 * a shared authentication state.
 */
var FirebaseAppImpl = /** @class */ (function () {
    function FirebaseAppImpl(options, config, firebase_) {
        this.firebase_ = firebase_;
        this.isDeleted_ = false;
        this.services_ = {};
        this.name_ = config.name;
        this.automaticDataCollectionEnabled_ =
            config.automaticDataCollectionEnabled || false;
        this.options_ = util.deepCopy(options);
        this.INTERNAL = {
            getUid: function () { return null; },
            getToken: function () { return Promise.resolve(null); },
            addAuthTokenListener: function (callback) {
                tokenListeners.push(callback);
                // Make sure callback is called, asynchronously, in the absence of the auth module
                setTimeout(function () { return callback(null); }, 0);
            },
            removeAuthTokenListener: function (callback) {
                tokenListeners = tokenListeners.filter(function (listener) { return listener !== callback; });
            }
        };
    }
    Object.defineProperty(FirebaseAppImpl.prototype, "automaticDataCollectionEnabled", {
        get: function () {
            this.checkDestroyed_();
            return this.automaticDataCollectionEnabled_;
        },
        set: function (val) {
            this.checkDestroyed_();
            this.automaticDataCollectionEnabled_ = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FirebaseAppImpl.prototype, "name", {
        get: function () {
            this.checkDestroyed_();
            return this.name_;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FirebaseAppImpl.prototype, "options", {
        get: function () {
            this.checkDestroyed_();
            return this.options_;
        },
        enumerable: true,
        configurable: true
    });
    FirebaseAppImpl.prototype.delete = function () {
        var _this = this;
        return new Promise(function (resolve) {
            _this.checkDestroyed_();
            resolve();
        })
            .then(function () {
            _this.firebase_.INTERNAL.removeApp(_this.name_);
            var services = [];
            for (var _i = 0, _a = Object.keys(_this.services_); _i < _a.length; _i++) {
                var serviceKey = _a[_i];
                for (var _b = 0, _c = Object.keys(_this.services_[serviceKey]); _b < _c.length; _b++) {
                    var instanceKey = _c[_b];
                    services.push(_this.services_[serviceKey][instanceKey]);
                }
            }
            return Promise.all(services
                .filter(function (service) { return 'INTERNAL' in service; })
                .map(function (service) { return service.INTERNAL.delete(); }));
        })
            .then(function () {
            _this.isDeleted_ = true;
            _this.services_ = {};
        });
    };
    /**
     * Return a service instance associated with this app (creating it
     * on demand), identified by the passed instanceIdentifier.
     *
     * NOTE: Currently storage and functions are the only ones that are leveraging this
     * functionality. They invoke it by calling:
     *
     * ```javascript
     * firebase.app().storage('STORAGE BUCKET ID')
     * ```
     *
     * The service name is passed to this already
     * @internal
     */
    FirebaseAppImpl.prototype._getService = function (name, instanceIdentifier) {
        if (instanceIdentifier === void 0) { instanceIdentifier = DEFAULT_ENTRY_NAME; }
        this.checkDestroyed_();
        if (!this.services_[name]) {
            this.services_[name] = {};
        }
        if (!this.services_[name][instanceIdentifier]) {
            /**
             * If a custom instance has been defined (i.e. not '[DEFAULT]')
             * then we will pass that instance on, otherwise we pass `null`
             */
            var instanceSpecifier = instanceIdentifier !== DEFAULT_ENTRY_NAME
                ? instanceIdentifier
                : undefined;
            var service = this.firebase_.INTERNAL.factories[name](this, this.extendApp.bind(this), instanceSpecifier);
            this.services_[name][instanceIdentifier] = service;
        }
        return this.services_[name][instanceIdentifier];
    };
    /**
     * Remove a service instance from the cache, so we will create a new instance for this service
     * when people try to get this service again.
     *
     * NOTE: currently only firestore is using this functionality to support firestore shutdown.
     *
     * @param name The service name
     * @param instanceIdentifier instance identifier in case multiple instances are allowed
     * @internal
     */
    FirebaseAppImpl.prototype._removeServiceInstance = function (name, instanceIdentifier) {
        if (instanceIdentifier === void 0) { instanceIdentifier = DEFAULT_ENTRY_NAME; }
        if (this.services_[name] && this.services_[name][instanceIdentifier]) {
            delete this.services_[name][instanceIdentifier];
        }
    };
    /**
     * Callback function used to extend an App instance at the time
     * of service instance creation.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    FirebaseAppImpl.prototype.extendApp = function (props) {
        var _this = this;
        // Copy the object onto the FirebaseAppImpl prototype
        util.deepExtend(this, props);
        /**
         * If the app has overwritten the addAuthTokenListener stub, forward
         * the active token listeners on to the true fxn.
         *
         * TODO: This function is required due to our current module
         * structure. Once we are able to rely strictly upon a single module
         * implementation, this code should be refactored and Auth should
         * provide these stubs and the upgrade logic
         */
        if (props.INTERNAL && props.INTERNAL.addAuthTokenListener) {
            tokenListeners.forEach(function (listener) {
                _this.INTERNAL.addAuthTokenListener(listener);
            });
            tokenListeners = [];
        }
    };
    /**
     * This function will throw an Error if the App has already been deleted -
     * use before performing API actions on the App.
     */
    FirebaseAppImpl.prototype.checkDestroyed_ = function () {
        if (this.isDeleted_) {
            throw ERROR_FACTORY.create("app-deleted" /* APP_DELETED */, { appName: this.name_ });
        }
    };
    return FirebaseAppImpl;
}());
// Prevent dead-code elimination of these methods w/o invalid property
// copying.
(FirebaseAppImpl.prototype.name && FirebaseAppImpl.prototype.options) ||
    FirebaseAppImpl.prototype.delete ||
    console.log('dc');

var version = "6.6.2";

/**
 * @license
 * Copyright 2019 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var logger = new logger$1.Logger('@firebase/app');

/**
 * @license
 * Copyright 2019 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Because auth can't share code with other components, we attach the utility functions
 * in an internal namespace to share code.
 * This function return a firebase namespace object without
 * any utility functions, so it can be shared between the regular firebaseNamespace and
 * the lite version.
 */
function createFirebaseNamespaceCore(firebaseAppImpl) {
    var apps = {};
    var factories = {};
    var appHooks = {};
    // A namespace is a plain JavaScript Object.
    var namespace = {
        // Hack to prevent Babel from modifying the object returned
        // as the firebase namespace.
        // @ts-ignore
        __esModule: true,
        initializeApp: initializeApp,
        // @ts-ignore
        app: app,
        // @ts-ignore
        apps: null,
        SDK_VERSION: version,
        INTERNAL: {
            registerService: registerService,
            removeApp: removeApp,
            factories: factories,
            useAsService: useAsService
        }
    };
    // Inject a circular default export to allow Babel users who were previously
    // using:
    //
    //   import firebase from 'firebase';
    //   which becomes: var firebase = require('firebase').default;
    //
    // instead of
    //
    //   import * as firebase from 'firebase';
    //   which becomes: var firebase = require('firebase');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    namespace['default'] = namespace;
    // firebase.apps is a read-only getter.
    Object.defineProperty(namespace, 'apps', {
        get: getApps
    });
    /**
     * Called by App.delete() - but before any services associated with the App
     * are deleted.
     */
    function removeApp(name) {
        var app = apps[name];
        callAppHooks(app, 'delete');
        delete apps[name];
    }
    /**
     * Get the App object for a given name (or DEFAULT).
     */
    function app(name) {
        name = name || DEFAULT_ENTRY_NAME;
        if (!util.contains(apps, name)) {
            throw ERROR_FACTORY.create("no-app" /* NO_APP */, { appName: name });
        }
        return apps[name];
    }
    // @ts-ignore
    app['App'] = firebaseAppImpl;
    function initializeApp(options, rawConfig) {
        if (rawConfig === void 0) { rawConfig = {}; }
        if (typeof rawConfig !== 'object' || rawConfig === null) {
            var name_1 = rawConfig;
            rawConfig = { name: name_1 };
        }
        var config = rawConfig;
        if (config.name === undefined) {
            config.name = DEFAULT_ENTRY_NAME;
        }
        var name = config.name;
        if (typeof name !== 'string' || !name) {
            throw ERROR_FACTORY.create("bad-app-name" /* BAD_APP_NAME */, {
                appName: String(name)
            });
        }
        if (util.contains(apps, name)) {
            throw ERROR_FACTORY.create("duplicate-app" /* DUPLICATE_APP */, { appName: name });
        }
        var app = new firebaseAppImpl(options, config, namespace);
        apps[name] = app;
        callAppHooks(app, 'create');
        return app;
    }
    /*
     * Return an array of all the non-deleted FirebaseApps.
     */
    function getApps() {
        // Make a copy so caller cannot mutate the apps list.
        return Object.keys(apps).map(function (name) { return apps[name]; });
    }
    /*
     * Register a Firebase Service.
     *
     * firebase.INTERNAL.registerService()
     *
     * TODO: Implement serviceProperties.
     */
    function registerService(name, createService, serviceProperties, appHook, allowMultipleInstances) {
        if (allowMultipleInstances === void 0) { allowMultipleInstances = false; }
        // If re-registering a service that already exists, return existing service
        if (factories[name]) {
            logger.debug("There were multiple attempts to register service " + name + ".");
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return namespace[name];
        }
        // Capture the service factory for later service instantiation
        factories[name] = createService;
        // Capture the appHook, if passed
        if (appHook) {
            appHooks[name] = appHook;
            // Run the **new** app hook on all existing apps
            getApps().forEach(function (app) {
                appHook('create', app);
            });
        }
        // The Service namespace is an accessor function ...
        function serviceNamespace(appArg) {
            if (appArg === void 0) { appArg = app(); }
            // @ts-ignore
            if (typeof appArg[name] !== 'function') {
                // Invalid argument.
                // This happens in the following case: firebase.storage('gs:/')
                throw ERROR_FACTORY.create("invalid-app-argument" /* INVALID_APP_ARGUMENT */, {
                    appName: name
                });
            }
            // Forward service instance lookup to the FirebaseApp.
            // @ts-ignore
            return appArg[name]();
        }
        // ... and a container for service-level properties.
        if (serviceProperties !== undefined) {
            util.deepExtend(serviceNamespace, serviceProperties);
        }
        // Monkey-patch the serviceNamespace onto the firebase namespace
        // @ts-ignore
        namespace[name] = serviceNamespace;
        // Patch the FirebaseAppImpl prototype
        // @ts-ignore
        firebaseAppImpl.prototype[name] =
            // TODO: The eslint disable can be removed and the 'ignoreRestArgs'
            // option added to the no-explicit-any rule when ESlint releases it.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var serviceFxn = this._getService.bind(this, name);
                return serviceFxn.apply(this, allowMultipleInstances ? args : []);
            };
        return serviceNamespace;
    }
    function callAppHooks(app, eventName) {
        for (var _i = 0, _a = Object.keys(factories); _i < _a.length; _i++) {
            var serviceName = _a[_i];
            // Ignore virtual services
            var factoryName = useAsService(app, serviceName);
            if (factoryName === null) {
                return;
            }
            if (appHooks[factoryName]) {
                appHooks[factoryName](eventName, app);
            }
        }
    }
    // Map the requested service to a registered service name
    // (used to map auth to serverAuth service when needed).
    function useAsService(app, name) {
        if (name === 'serverAuth') {
            return null;
        }
        var useService = name;
        return useService;
    }
    return namespace;
}

/**
 * @license
 * Copyright 2019 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Return a firebase namespace object.
 *
 * In production, this will be called exactly once and the result
 * assigned to the 'firebase' global.  It may be called multiple times
 * in unit tests.
 */
function createFirebaseNamespace() {
    var namespace = createFirebaseNamespaceCore(FirebaseAppImpl);
    namespace.INTERNAL = tslib_1.__assign({}, namespace.INTERNAL, { createFirebaseNamespace: createFirebaseNamespace,
        extendNamespace: extendNamespace,
        createSubscribe: util.createSubscribe,
        ErrorFactory: util.ErrorFactory,
        deepExtend: util.deepExtend });
    /**
     * Patch the top-level firebase namespace with additional properties.
     *
     * firebase.INTERNAL.extendNamespace()
     */
    function extendNamespace(props) {
        util.deepExtend(namespace, props);
    }
    return namespace;
}

/**
 * @license
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// Firebase Lite detection
// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (util.isBrowser() && self.firebase !== undefined) {
    logger.warn("\n    Warning: Firebase is already defined in the global scope. Please make sure\n    Firebase library is only loaded once.\n  ");
    // eslint-disable-next-line
    var sdkVersion = self.firebase.SDK_VERSION;
    if (sdkVersion && sdkVersion.indexOf('LITE') >= 0) {
        logger.warn("\n    Warning: You are trying to load Firebase while using Firebase Performance standalone script.\n    You should load Firebase Performance with this instance of Firebase to avoid loading duplicate code.\n    ");
    }
}
var firebaseNamespace = createFirebaseNamespace();
var initializeApp = firebaseNamespace.initializeApp;
// TODO: This disable can be removed and the 'ignoreRestArgs' option added to
// the no-explicit-any rule when ESlint releases it.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
firebaseNamespace.initializeApp = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    // Environment check before initializing app
    // Do the check in initializeApp, so people have a chance to disable it by setting logLevel
    // in @firebase/logger
    if (util.isNode()) {
        logger.warn("\n      Warning: This is a browser-targeted Firebase bundle but it appears it is being\n      run in a Node environment.  If running in a Node environment, make sure you\n      are using the bundle specified by the \"main\" field in package.json.\n      \n      If you are using Webpack, you can specify \"main\" as the first item in\n      \"resolve.mainFields\":\n      https://webpack.js.org/configuration/resolve/#resolvemainfields\n      \n      If using Rollup, use the rollup-plugin-node-resolve plugin and specify \"main\"\n      as the first item in \"mainFields\", e.g. ['main', 'module'].\n      https://github.com/rollup/rollup-plugin-node-resolve\n      ");
    }
    return initializeApp.apply(undefined, args);
};
var firebase = firebaseNamespace;

exports.default = firebase;
exports.firebase = firebase;
//# sourceMappingURL=index.cjs.js.map


/***/ }),

/***/ "./node_modules/@firebase/app/node_modules/tslib/tslib.es6.js":
/*!********************************************************************!*\
  !*** ./node_modules/@firebase/app/node_modules/tslib/tslib.es6.js ***!
  \********************************************************************/
/*! exports provided: __extends, __assign, __rest, __decorate, __param, __metadata, __awaiter, __generator, __exportStar, __values, __read, __spread, __spreadArrays, __await, __asyncGenerator, __asyncDelegator, __asyncValues, __makeTemplateObject, __importStar, __importDefault */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__extends", function() { return __extends; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__assign", function() { return __assign; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__rest", function() { return __rest; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__decorate", function() { return __decorate; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__param", function() { return __param; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__metadata", function() { return __metadata; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__awaiter", function() { return __awaiter; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__generator", function() { return __generator; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__exportStar", function() { return __exportStar; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__values", function() { return __values; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__read", function() { return __read; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__spread", function() { return __spread; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__spreadArrays", function() { return __spreadArrays; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__await", function() { return __await; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__asyncGenerator", function() { return __asyncGenerator; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__asyncDelegator", function() { return __asyncDelegator; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__asyncValues", function() { return __asyncValues; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__makeTemplateObject", function() { return __makeTemplateObject; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__importStar", function() { return __importStar; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__importDefault", function() { return __importDefault; });
/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    }
    return __assign.apply(this, arguments);
}

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __param(paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
}

function __metadata(metadataKey, metadataValue) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}

function __awaiter(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

function __exportStar(m, exports) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}

function __values(o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
}

function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
}

function __spread() {
    for (var ar = [], i = 0; i < arguments.length; i++)
        ar = ar.concat(__read(arguments[i]));
    return ar;
}

function __spreadArrays() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};

function __await(v) {
    return this instanceof __await ? (this.v = v, this) : new __await(v);
}

function __asyncGenerator(thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
}

function __asyncDelegator(o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
}

function __asyncValues(o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
}

function __makeTemplateObject(cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};

function __importStar(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result.default = mod;
    return result;
}

function __importDefault(mod) {
    return (mod && mod.__esModule) ? mod : { default: mod };
}


/***/ }),

/***/ "./node_modules/@firebase/auth/dist/auth.esm.js":
/*!******************************************************!*\
  !*** ./node_modules/@firebase/auth/dist/auth.esm.js ***!
  \******************************************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* WEBPACK VAR INJECTION */(function(global) {/* harmony import */ var _firebase_app__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @firebase/app */ "./node_modules/@firebase/app/dist/index.cjs.js");
/* harmony import */ var _firebase_app__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_firebase_app__WEBPACK_IMPORTED_MODULE_0__);
(function() {var k,aa="function"==typeof Object.defineProperties?Object.defineProperty:function(a,b,c){a!=Array.prototype&&a!=Object.prototype&&(a[b]=c.value)},ba="undefined"!=typeof window&&window===this?this:"undefined"!=typeof global&&null!=global?global:this;function ca(a,b){if(b){var c=ba;a=a.split(".");for(var d=0;d<a.length-1;d++){var e=a[d];e in c||(c[e]={});c=c[e]}a=a[a.length-1];d=c[a];b=b(d);b!=d&&null!=b&&aa(c,a,{configurable:!0,writable:!0,value:b})}}
function da(a){var b=0;return function(){return b<a.length?{done:!1,value:a[b++]}:{done:!0}}}function ea(a){var b="undefined"!=typeof Symbol&&Symbol.iterator&&a[Symbol.iterator];return b?b.call(a):{next:da(a)}}
ca("Promise",function(a){function b(g){this.b=0;this.c=void 0;this.a=[];var h=this.f();try{g(h.resolve,h.reject)}catch(m){h.reject(m)}}function c(){this.a=null}function d(g){return g instanceof b?g:new b(function(h){h(g)})}if(a)return a;c.prototype.b=function(g){if(null==this.a){this.a=[];var h=this;this.c(function(){h.g()})}this.a.push(g)};var e=ba.setTimeout;c.prototype.c=function(g){e(g,0)};c.prototype.g=function(){for(;this.a&&this.a.length;){var g=this.a;this.a=[];for(var h=0;h<g.length;++h){var m=
g[h];g[h]=null;try{m()}catch(p){this.f(p)}}}this.a=null};c.prototype.f=function(g){this.c(function(){throw g;})};b.prototype.f=function(){function g(p){return function(u){m||(m=!0,p.call(h,u))}}var h=this,m=!1;return{resolve:g(this.m),reject:g(this.g)}};b.prototype.m=function(g){if(g===this)this.g(new TypeError("A Promise cannot resolve to itself"));else if(g instanceof b)this.o(g);else{a:switch(typeof g){case "object":var h=null!=g;break a;case "function":h=!0;break a;default:h=!1}h?this.u(g):this.h(g)}};
b.prototype.u=function(g){var h=void 0;try{h=g.then}catch(m){this.g(m);return}"function"==typeof h?this.v(h,g):this.h(g)};b.prototype.g=function(g){this.i(2,g)};b.prototype.h=function(g){this.i(1,g)};b.prototype.i=function(g,h){if(0!=this.b)throw Error("Cannot settle("+g+", "+h+"): Promise already settled in state"+this.b);this.b=g;this.c=h;this.l()};b.prototype.l=function(){if(null!=this.a){for(var g=0;g<this.a.length;++g)f.b(this.a[g]);this.a=null}};var f=new c;b.prototype.o=function(g){var h=this.f();
g.Ja(h.resolve,h.reject)};b.prototype.v=function(g,h){var m=this.f();try{g.call(h,m.resolve,m.reject)}catch(p){m.reject(p)}};b.prototype.then=function(g,h){function m(C,N){return"function"==typeof C?function(wa){try{p(C(wa))}catch(ld){u(ld)}}:N}var p,u,A=new b(function(C,N){p=C;u=N});this.Ja(m(g,p),m(h,u));return A};b.prototype.catch=function(g){return this.then(void 0,g)};b.prototype.Ja=function(g,h){function m(){switch(p.b){case 1:g(p.c);break;case 2:h(p.c);break;default:throw Error("Unexpected state: "+
p.b);}}var p=this;null==this.a?f.b(m):this.a.push(m)};b.resolve=d;b.reject=function(g){return new b(function(h,m){m(g)})};b.race=function(g){return new b(function(h,m){for(var p=ea(g),u=p.next();!u.done;u=p.next())d(u.value).Ja(h,m)})};b.all=function(g){var h=ea(g),m=h.next();return m.done?d([]):new b(function(p,u){function A(wa){return function(ld){C[wa]=ld;N--;0==N&&p(C)}}var C=[],N=0;do C.push(void 0),N++,d(m.value).Ja(A(C.length-1),u),m=h.next();while(!m.done)})};return b});
var fa=fa||{},l=this||self;function n(a){return"string"==typeof a}function ha(a){return"boolean"==typeof a}var ia=/^[\w+/_-]+[=]{0,2}$/,ja=null;function ka(){}
function la(a){var b=typeof a;if("object"==b)if(a){if(a instanceof Array)return"array";if(a instanceof Object)return b;var c=Object.prototype.toString.call(a);if("[object Window]"==c)return"object";if("[object Array]"==c||"number"==typeof a.length&&"undefined"!=typeof a.splice&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("splice"))return"array";if("[object Function]"==c||"undefined"!=typeof a.call&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("call"))return"function"}else return"null";
else if("function"==b&&"undefined"==typeof a.call)return"object";return b}function ma(a){return null===a}function na(a){return"array"==la(a)}function oa(a){var b=la(a);return"array"==b||"object"==b&&"number"==typeof a.length}function q(a){return"function"==la(a)}function r(a){var b=typeof a;return"object"==b&&null!=a||"function"==b}var pa="closure_uid_"+(1E9*Math.random()>>>0),qa=0;function ra(a,b,c){return a.call.apply(a.bind,arguments)}
function sa(a,b,c){if(!a)throw Error();if(2<arguments.length){var d=Array.prototype.slice.call(arguments,2);return function(){var e=Array.prototype.slice.call(arguments);Array.prototype.unshift.apply(e,d);return a.apply(b,e)}}return function(){return a.apply(b,arguments)}}function t(a,b,c){Function.prototype.bind&&-1!=Function.prototype.bind.toString().indexOf("native code")?t=ra:t=sa;return t.apply(null,arguments)}
function ta(a,b){var c=Array.prototype.slice.call(arguments,1);return function(){var d=c.slice();d.push.apply(d,arguments);return a.apply(this,d)}}var ua=Date.now||function(){return+new Date};function v(a,b){function c(){}c.prototype=b.prototype;a.qb=b.prototype;a.prototype=new c;a.prototype.constructor=a;a.fd=function(d,e,f){for(var g=Array(arguments.length-2),h=2;h<arguments.length;h++)g[h-2]=arguments[h];return b.prototype[e].apply(d,g)}};function va(a){if(!a)return!1;try{return!!a.$goog_Thenable}catch(b){return!1}};function w(a){if(Error.captureStackTrace)Error.captureStackTrace(this,w);else{var b=Error().stack;b&&(this.stack=b)}a&&(this.message=String(a))}v(w,Error);w.prototype.name="CustomError";function xa(a,b){a=a.split("%s");for(var c="",d=a.length-1,e=0;e<d;e++)c+=a[e]+(e<b.length?b[e]:"%s");w.call(this,c+a[d])}v(xa,w);xa.prototype.name="AssertionError";function ya(a,b){throw new xa("Failure"+(a?": "+a:""),Array.prototype.slice.call(arguments,1));};function za(a,b){this.c=a;this.f=b;this.b=0;this.a=null}za.prototype.get=function(){if(0<this.b){this.b--;var a=this.a;this.a=a.next;a.next=null}else a=this.c();return a};function Aa(a,b){a.f(b);100>a.b&&(a.b++,b.next=a.a,a.a=b)};function Ba(){this.b=this.a=null}var Da=new za(function(){return new Ca},function(a){a.reset()});Ba.prototype.add=function(a,b){var c=Da.get();c.set(a,b);this.b?this.b.next=c:this.a=c;this.b=c};function Ea(){var a=Fa,b=null;a.a&&(b=a.a,a.a=a.a.next,a.a||(a.b=null),b.next=null);return b}function Ca(){this.next=this.b=this.a=null}Ca.prototype.set=function(a,b){this.a=a;this.b=b;this.next=null};Ca.prototype.reset=function(){this.next=this.b=this.a=null};function Ga(a,b){a:{try{var c=a&&a.ownerDocument,d=c&&(c.defaultView||c.parentWindow);d=d||l;if(d.Element&&d.Location){var e=d;break a}}catch(g){}e=null}if(e&&"undefined"!=typeof e[b]&&(!a||!(a instanceof e[b])&&(a instanceof e.Location||a instanceof e.Element))){if(r(a))try{var f=a.constructor.displayName||a.constructor.name||Object.prototype.toString.call(a)}catch(g){f="<object could not be stringified>"}else f=void 0===a?"undefined":null===a?"null":typeof a;ya("Argument is not a %s (or a non-Element, non-Location mock); got: %s",
b,f)}};var Ha=Array.prototype.indexOf?function(a,b){return Array.prototype.indexOf.call(a,b,void 0)}:function(a,b){if(n(a))return n(b)&&1==b.length?a.indexOf(b,0):-1;for(var c=0;c<a.length;c++)if(c in a&&a[c]===b)return c;return-1},x=Array.prototype.forEach?function(a,b,c){Array.prototype.forEach.call(a,b,c)}:function(a,b,c){for(var d=a.length,e=n(a)?a.split(""):a,f=0;f<d;f++)f in e&&b.call(c,e[f],f,a)};function Ia(a,b){for(var c=n(a)?a.split(""):a,d=a.length-1;0<=d;--d)d in c&&b.call(void 0,c[d],d,a)}
var Ja=Array.prototype.map?function(a,b){return Array.prototype.map.call(a,b,void 0)}:function(a,b){for(var c=a.length,d=Array(c),e=n(a)?a.split(""):a,f=0;f<c;f++)f in e&&(d[f]=b.call(void 0,e[f],f,a));return d},Ka=Array.prototype.some?function(a,b){return Array.prototype.some.call(a,b,void 0)}:function(a,b){for(var c=a.length,d=n(a)?a.split(""):a,e=0;e<c;e++)if(e in d&&b.call(void 0,d[e],e,a))return!0;return!1};
function La(a){a:{var b=Ma;for(var c=a.length,d=n(a)?a.split(""):a,e=0;e<c;e++)if(e in d&&b.call(void 0,d[e],e,a)){b=e;break a}b=-1}return 0>b?null:n(a)?a.charAt(b):a[b]}function Na(a,b){return 0<=Ha(a,b)}function Oa(a,b){b=Ha(a,b);var c;(c=0<=b)&&Array.prototype.splice.call(a,b,1);return c}function Pa(a,b){var c=0;Ia(a,function(d,e){b.call(void 0,d,e,a)&&1==Array.prototype.splice.call(a,e,1).length&&c++})}function Qa(a){return Array.prototype.concat.apply([],arguments)}
function Ra(a){var b=a.length;if(0<b){for(var c=Array(b),d=0;d<b;d++)c[d]=a[d];return c}return[]};function Sa(a,b){for(var c in a)b.call(void 0,a[c],c,a)}function Ta(a){for(var b in a)return!1;return!0}function Ua(a){var b={},c;for(c in a)b[c]=a[c];return b}var Va="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function Wa(a,b){for(var c,d,e=1;e<arguments.length;e++){d=arguments[e];for(c in d)a[c]=d[c];for(var f=0;f<Va.length;f++)c=Va[f],Object.prototype.hasOwnProperty.call(d,c)&&(a[c]=d[c])}};function Xa(a,b){this.a=a===Ya&&b||"";this.b=Za}Xa.prototype.qa=!0;Xa.prototype.pa=function(){return this.a};Xa.prototype.toString=function(){return"Const{"+this.a+"}"};function $a(a){if(a instanceof Xa&&a.constructor===Xa&&a.b===Za)return a.a;ya("expected object of type Const, got '"+a+"'");return"type_error:Const"}var Za={},Ya={},ab=new Xa(Ya,"");function bb(){this.a="";this.b=cb}bb.prototype.qa=!0;bb.prototype.pa=function(){return this.a.toString()};bb.prototype.toString=function(){return"TrustedResourceUrl{"+this.a+"}"};function db(a){if(a instanceof bb&&a.constructor===bb&&a.b===cb)return a.a;ya("expected object of type TrustedResourceUrl, got '"+a+"' of type "+la(a));return"type_error:TrustedResourceUrl"}
function eb(a,b){var c=$a(a);if(!fb.test(c))throw Error("Invalid TrustedResourceUrl format: "+c);a=c.replace(gb,function(d,e){if(!Object.prototype.hasOwnProperty.call(b,e))throw Error('Found marker, "'+e+'", in format string, "'+c+'", but no valid label mapping found in args: '+JSON.stringify(b));d=b[e];return d instanceof Xa?$a(d):encodeURIComponent(String(d))});return hb(a)}var gb=/%{(\w+)}/g,fb=/^((https:)?\/\/[0-9a-z.:[\]-]+\/|\/[^/\\]|[^:/\\%]+\/|[^:/\\%]*[?#]|about:blank#)/i,cb={};
function hb(a){var b=new bb;b.a=a;return b};var ib=String.prototype.trim?function(a){return a.trim()}:function(a){return/^[\s\xa0]*([\s\S]*?)[\s\xa0]*$/.exec(a)[1]},jb=/&/g,kb=/</g,lb=/>/g,mb=/"/g,nb=/'/g,ob=/\x00/g,pb=/[\x00&<>"']/;function y(a,b){return-1!=a.indexOf(b)}function qb(a,b){return a<b?-1:a>b?1:0};function rb(){this.a="";this.b=sb}rb.prototype.qa=!0;rb.prototype.pa=function(){return this.a.toString()};rb.prototype.toString=function(){return"SafeUrl{"+this.a+"}"};function tb(a){if(a instanceof rb&&a.constructor===rb&&a.b===sb)return a.a;ya("expected object of type SafeUrl, got '"+a+"' of type "+la(a));return"type_error:SafeUrl"}var ub=/^(?:(?:https?|mailto|ftp):|[^:/?#]*(?:[/?#]|$))/i;
function vb(a){if(a instanceof rb)return a;a="object"==typeof a&&a.qa?a.pa():String(a);ub.test(a)||(a="about:invalid#zClosurez");return wb(a)}var sb={};function wb(a){var b=new rb;b.a=a;return b}wb("about:blank");var xb;a:{var yb=l.navigator;if(yb){var zb=yb.userAgent;if(zb){xb=zb;break a}}xb=""}function z(a){return y(xb,a)};function Ab(){this.a="";this.b=Bb}Ab.prototype.qa=!0;Ab.prototype.pa=function(){return this.a.toString()};Ab.prototype.toString=function(){return"SafeHtml{"+this.a+"}"};function Cb(a){if(a instanceof Ab&&a.constructor===Ab&&a.b===Bb)return a.a;ya("expected object of type SafeHtml, got '"+a+"' of type "+la(a));return"type_error:SafeHtml"}var Bb={};function Db(a){var b=new Ab;b.a=a;return b}Db("<!DOCTYPE html>");var Eb=Db("");Db("<br>");function Fb(a){var b=hb($a(ab));Ga(a,"HTMLIFrameElement");a.src=db(b).toString()}function Gb(a,b){Ga(a,"HTMLScriptElement");a.src=db(b);if(null===ja)b:{b=l.document;if((b=b.querySelector&&b.querySelector("script[nonce]"))&&(b=b.nonce||b.getAttribute("nonce"))&&ia.test(b)){ja=b;break b}ja=""}b=ja;b&&a.setAttribute("nonce",b)};function Hb(a,b){for(var c=a.split("%s"),d="",e=Array.prototype.slice.call(arguments,1);e.length&&1<c.length;)d+=c.shift()+e.shift();return d+c.join("%s")}function Ib(a){pb.test(a)&&(-1!=a.indexOf("&")&&(a=a.replace(jb,"&amp;")),-1!=a.indexOf("<")&&(a=a.replace(kb,"&lt;")),-1!=a.indexOf(">")&&(a=a.replace(lb,"&gt;")),-1!=a.indexOf('"')&&(a=a.replace(mb,"&quot;")),-1!=a.indexOf("'")&&(a=a.replace(nb,"&#39;")),-1!=a.indexOf("\x00")&&(a=a.replace(ob,"&#0;")));return a};function Jb(a){l.setTimeout(function(){throw a;},0)}var Kb;
function Lb(){var a=l.MessageChannel;"undefined"===typeof a&&"undefined"!==typeof window&&window.postMessage&&window.addEventListener&&!z("Presto")&&(a=function(){var e=document.createElement("IFRAME");e.style.display="none";Fb(e);document.documentElement.appendChild(e);var f=e.contentWindow;e=f.document;e.open();e.write(Cb(Eb));e.close();var g="callImmediate"+Math.random(),h="file:"==f.location.protocol?"*":f.location.protocol+"//"+f.location.host;e=t(function(m){if(("*"==h||m.origin==h)&&m.data==
g)this.port1.onmessage()},this);f.addEventListener("message",e,!1);this.port1={};this.port2={postMessage:function(){f.postMessage(g,h)}}});if("undefined"!==typeof a&&!z("Trident")&&!z("MSIE")){var b=new a,c={},d=c;b.port1.onmessage=function(){if(void 0!==c.next){c=c.next;var e=c.yb;c.yb=null;e()}};return function(e){d.next={yb:e};d=d.next;b.port2.postMessage(0)}}return"undefined"!==typeof document&&"onreadystatechange"in document.createElement("SCRIPT")?function(e){var f=document.createElement("SCRIPT");
f.onreadystatechange=function(){f.onreadystatechange=null;f.parentNode.removeChild(f);f=null;e();e=null};document.documentElement.appendChild(f)}:function(e){l.setTimeout(e,0)}};function Mb(a,b){Nb||Ob();Pb||(Nb(),Pb=!0);Fa.add(a,b)}var Nb;function Ob(){if(l.Promise&&l.Promise.resolve){var a=l.Promise.resolve(void 0);Nb=function(){a.then(Qb)}}else Nb=function(){var b=Qb;!q(l.setImmediate)||l.Window&&l.Window.prototype&&!z("Edge")&&l.Window.prototype.setImmediate==l.setImmediate?(Kb||(Kb=Lb()),Kb(b)):l.setImmediate(b)}}var Pb=!1,Fa=new Ba;function Qb(){for(var a;a=Ea();){try{a.a.call(a.b)}catch(b){Jb(b)}Aa(Da,a)}Pb=!1};function B(a,b){this.a=Rb;this.i=void 0;this.f=this.b=this.c=null;this.g=this.h=!1;if(a!=ka)try{var c=this;a.call(b,function(d){Sb(c,Tb,d)},function(d){if(!(d instanceof Ub))try{if(d instanceof Error)throw d;throw Error("Promise rejected.");}catch(e){}Sb(c,Vb,d)})}catch(d){Sb(this,Vb,d)}}var Rb=0,Tb=2,Vb=3;function Wb(){this.next=this.f=this.b=this.g=this.a=null;this.c=!1}Wb.prototype.reset=function(){this.f=this.b=this.g=this.a=null;this.c=!1};var Xb=new za(function(){return new Wb},function(a){a.reset()});
function Yb(a,b,c){var d=Xb.get();d.g=a;d.b=b;d.f=c;return d}function D(a){if(a instanceof B)return a;var b=new B(ka);Sb(b,Tb,a);return b}function E(a){return new B(function(b,c){c(a)})}function Zb(a,b,c){$b(a,b,c,null)||Mb(ta(b,a))}function ac(a){return new B(function(b,c){var d=a.length,e=[];if(d)for(var f=function(p,u){d--;e[p]=u;0==d&&b(e)},g=function(p){c(p)},h=0,m;h<a.length;h++)m=a[h],Zb(m,ta(f,h),g);else b(e)})}
function bc(a){return new B(function(b){var c=a.length,d=[];if(c)for(var e=function(h,m,p){c--;d[h]=m?{Gb:!0,value:p}:{Gb:!1,reason:p};0==c&&b(d)},f=0,g;f<a.length;f++)g=a[f],Zb(g,ta(e,f,!0),ta(e,f,!1));else b(d)})}B.prototype.then=function(a,b,c){return cc(this,q(a)?a:null,q(b)?b:null,c)};B.prototype.$goog_Thenable=!0;k=B.prototype;k.ka=function(a,b){a=Yb(a,a,b);a.c=!0;dc(this,a);return this};k.s=function(a,b){return cc(this,null,a,b)};
k.cancel=function(a){this.a==Rb&&Mb(function(){var b=new Ub(a);ec(this,b)},this)};function ec(a,b){if(a.a==Rb)if(a.c){var c=a.c;if(c.b){for(var d=0,e=null,f=null,g=c.b;g&&(g.c||(d++,g.a==a&&(e=g),!(e&&1<d)));g=g.next)e||(f=g);e&&(c.a==Rb&&1==d?ec(c,b):(f?(d=f,d.next==c.f&&(c.f=d),d.next=d.next.next):fc(c),gc(c,e,Vb,b)))}a.c=null}else Sb(a,Vb,b)}function dc(a,b){a.b||a.a!=Tb&&a.a!=Vb||hc(a);a.f?a.f.next=b:a.b=b;a.f=b}
function cc(a,b,c,d){var e=Yb(null,null,null);e.a=new B(function(f,g){e.g=b?function(h){try{var m=b.call(d,h);f(m)}catch(p){g(p)}}:f;e.b=c?function(h){try{var m=c.call(d,h);void 0===m&&h instanceof Ub?g(h):f(m)}catch(p){g(p)}}:g});e.a.c=a;dc(a,e);return e.a}k.Oc=function(a){this.a=Rb;Sb(this,Tb,a)};k.Pc=function(a){this.a=Rb;Sb(this,Vb,a)};
function Sb(a,b,c){a.a==Rb&&(a===c&&(b=Vb,c=new TypeError("Promise cannot resolve to itself")),a.a=1,$b(c,a.Oc,a.Pc,a)||(a.i=c,a.a=b,a.c=null,hc(a),b!=Vb||c instanceof Ub||ic(a,c)))}function $b(a,b,c,d){if(a instanceof B)return dc(a,Yb(b||ka,c||null,d)),!0;if(va(a))return a.then(b,c,d),!0;if(r(a))try{var e=a.then;if(q(e))return jc(a,e,b,c,d),!0}catch(f){return c.call(d,f),!0}return!1}
function jc(a,b,c,d,e){function f(m){h||(h=!0,d.call(e,m))}function g(m){h||(h=!0,c.call(e,m))}var h=!1;try{b.call(a,g,f)}catch(m){f(m)}}function hc(a){a.h||(a.h=!0,Mb(a.Zb,a))}function fc(a){var b=null;a.b&&(b=a.b,a.b=b.next,b.next=null);a.b||(a.f=null);return b}k.Zb=function(){for(var a;a=fc(this);)gc(this,a,this.a,this.i);this.h=!1};
function gc(a,b,c,d){if(c==Vb&&b.b&&!b.c)for(;a&&a.g;a=a.c)a.g=!1;if(b.a)b.a.c=null,kc(b,c,d);else try{b.c?b.g.call(b.f):kc(b,c,d)}catch(e){lc.call(null,e)}Aa(Xb,b)}function kc(a,b,c){b==Tb?a.g.call(a.f,c):a.b&&a.b.call(a.f,c)}function ic(a,b){a.g=!0;Mb(function(){a.g&&lc.call(null,b)})}var lc=Jb;function Ub(a){w.call(this,a)}v(Ub,w);Ub.prototype.name="cancel";function mc(){0!=nc&&(oc[this[pa]||(this[pa]=++qa)]=this);this.ta=this.ta;this.la=this.la}var nc=0,oc={};mc.prototype.ta=!1;function pc(a){if(!a.ta&&(a.ta=!0,a.xa(),0!=nc)){var b=a[pa]||(a[pa]=++qa);if(0!=nc&&a.la&&0<a.la.length)throw Error(a+" did not empty its onDisposeCallbacks queue. This probably means it overrode dispose() or disposeInternal() without calling the superclass' method.");delete oc[b]}}mc.prototype.xa=function(){if(this.la)for(;this.la.length;)this.la.shift()()};function qc(a){qc[" "](a);return a}qc[" "]=ka;function rc(a,b){var c=sc;return Object.prototype.hasOwnProperty.call(c,a)?c[a]:c[a]=b(a)};var tc=z("Opera"),uc=z("Trident")||z("MSIE"),vc=z("Edge"),wc=vc||uc,xc=z("Gecko")&&!(y(xb.toLowerCase(),"webkit")&&!z("Edge"))&&!(z("Trident")||z("MSIE"))&&!z("Edge"),yc=y(xb.toLowerCase(),"webkit")&&!z("Edge");function zc(){var a=l.document;return a?a.documentMode:void 0}var Ac;
a:{var Bc="",Cc=function(){var a=xb;if(xc)return/rv:([^\);]+)(\)|;)/.exec(a);if(vc)return/Edge\/([\d\.]+)/.exec(a);if(uc)return/\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/.exec(a);if(yc)return/WebKit\/(\S+)/.exec(a);if(tc)return/(?:Version)[ \/]?(\S+)/.exec(a)}();Cc&&(Bc=Cc?Cc[1]:"");if(uc){var Dc=zc();if(null!=Dc&&Dc>parseFloat(Bc)){Ac=String(Dc);break a}}Ac=Bc}var sc={};
function Ec(a){return rc(a,function(){for(var b=0,c=ib(String(Ac)).split("."),d=ib(String(a)).split("."),e=Math.max(c.length,d.length),f=0;0==b&&f<e;f++){var g=c[f]||"",h=d[f]||"";do{g=/(\d*)(\D*)(.*)/.exec(g)||["","","",""];h=/(\d*)(\D*)(.*)/.exec(h)||["","","",""];if(0==g[0].length&&0==h[0].length)break;b=qb(0==g[1].length?0:parseInt(g[1],10),0==h[1].length?0:parseInt(h[1],10))||qb(0==g[2].length,0==h[2].length)||qb(g[2],h[2]);g=g[3];h=h[3]}while(0==b)}return 0<=b})}var Fc;
Fc=l.document&&uc?zc():void 0;var Gc=Object.freeze||function(a){return a};var Hc=!uc||9<=Number(Fc),Ic=uc&&!Ec("9"),Jc=function(){if(!l.addEventListener||!Object.defineProperty)return!1;var a=!1,b=Object.defineProperty({},"passive",{get:function(){a=!0}});try{l.addEventListener("test",ka,b),l.removeEventListener("test",ka,b)}catch(c){}return a}();function F(a,b){this.type=a;this.b=this.target=b;this.Mb=!0}F.prototype.preventDefault=function(){this.Mb=!1};function Kc(a,b){F.call(this,a?a.type:"");this.relatedTarget=this.b=this.target=null;this.button=this.screenY=this.screenX=this.clientY=this.clientX=0;this.key="";this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1;this.pointerId=0;this.pointerType="";this.a=null;if(a){var c=this.type=a.type,d=a.changedTouches&&a.changedTouches.length?a.changedTouches[0]:null;this.target=a.target||a.srcElement;this.b=b;if(b=a.relatedTarget){if(xc){a:{try{qc(b.nodeName);var e=!0;break a}catch(f){}e=!1}e||(b=null)}}else"mouseover"==
c?b=a.fromElement:"mouseout"==c&&(b=a.toElement);this.relatedTarget=b;d?(this.clientX=void 0!==d.clientX?d.clientX:d.pageX,this.clientY=void 0!==d.clientY?d.clientY:d.pageY,this.screenX=d.screenX||0,this.screenY=d.screenY||0):(this.clientX=void 0!==a.clientX?a.clientX:a.pageX,this.clientY=void 0!==a.clientY?a.clientY:a.pageY,this.screenX=a.screenX||0,this.screenY=a.screenY||0);this.button=a.button;this.key=a.key||"";this.ctrlKey=a.ctrlKey;this.altKey=a.altKey;this.shiftKey=a.shiftKey;this.metaKey=
a.metaKey;this.pointerId=a.pointerId||0;this.pointerType=n(a.pointerType)?a.pointerType:Lc[a.pointerType]||"";this.a=a;a.defaultPrevented&&this.preventDefault()}}v(Kc,F);var Lc=Gc({2:"touch",3:"pen",4:"mouse"});Kc.prototype.preventDefault=function(){Kc.qb.preventDefault.call(this);var a=this.a;if(a.preventDefault)a.preventDefault();else if(a.returnValue=!1,Ic)try{if(a.ctrlKey||112<=a.keyCode&&123>=a.keyCode)a.keyCode=-1}catch(b){}};Kc.prototype.f=function(){return this.a};var Mc="closure_listenable_"+(1E6*Math.random()|0),Nc=0;function Oc(a,b,c,d,e){this.listener=a;this.proxy=null;this.src=b;this.type=c;this.capture=!!d;this.Na=e;this.key=++Nc;this.ra=this.Ia=!1}function Pc(a){a.ra=!0;a.listener=null;a.proxy=null;a.src=null;a.Na=null};function Qc(a){this.src=a;this.a={};this.b=0}Qc.prototype.add=function(a,b,c,d,e){var f=a.toString();a=this.a[f];a||(a=this.a[f]=[],this.b++);var g=Rc(a,b,d,e);-1<g?(b=a[g],c||(b.Ia=!1)):(b=new Oc(b,this.src,f,!!d,e),b.Ia=c,a.push(b));return b};function Sc(a,b){var c=b.type;c in a.a&&Oa(a.a[c],b)&&(Pc(b),0==a.a[c].length&&(delete a.a[c],a.b--))}function Rc(a,b,c,d){for(var e=0;e<a.length;++e){var f=a[e];if(!f.ra&&f.listener==b&&f.capture==!!c&&f.Na==d)return e}return-1};var Tc="closure_lm_"+(1E6*Math.random()|0),Uc={},Vc=0;function Wc(a,b,c,d,e){if(d&&d.once)Xc(a,b,c,d,e);else if(na(b))for(var f=0;f<b.length;f++)Wc(a,b[f],c,d,e);else c=Yc(c),a&&a[Mc]?Zc(a,b,c,r(d)?!!d.capture:!!d,e):$c(a,b,c,!1,d,e)}
function $c(a,b,c,d,e,f){if(!b)throw Error("Invalid event type");var g=r(e)?!!e.capture:!!e,h=ad(a);h||(a[Tc]=h=new Qc(a));c=h.add(b,c,d,g,f);if(!c.proxy){d=bd();c.proxy=d;d.src=a;d.listener=c;if(a.addEventListener)Jc||(e=g),void 0===e&&(e=!1),a.addEventListener(b.toString(),d,e);else if(a.attachEvent)a.attachEvent(cd(b.toString()),d);else if(a.addListener&&a.removeListener)a.addListener(d);else throw Error("addEventListener and attachEvent are unavailable.");Vc++}}
function bd(){var a=dd,b=Hc?function(c){return a.call(b.src,b.listener,c)}:function(c){c=a.call(b.src,b.listener,c);if(!c)return c};return b}function Xc(a,b,c,d,e){if(na(b))for(var f=0;f<b.length;f++)Xc(a,b[f],c,d,e);else c=Yc(c),a&&a[Mc]?ed(a,b,c,r(d)?!!d.capture:!!d,e):$c(a,b,c,!0,d,e)}
function fd(a,b,c,d,e){if(na(b))for(var f=0;f<b.length;f++)fd(a,b[f],c,d,e);else(d=r(d)?!!d.capture:!!d,c=Yc(c),a&&a[Mc])?(a=a.u,b=String(b).toString(),b in a.a&&(f=a.a[b],c=Rc(f,c,d,e),-1<c&&(Pc(f[c]),Array.prototype.splice.call(f,c,1),0==f.length&&(delete a.a[b],a.b--)))):a&&(a=ad(a))&&(b=a.a[b.toString()],a=-1,b&&(a=Rc(b,c,d,e)),(c=-1<a?b[a]:null)&&gd(c))}
function gd(a){if("number"!=typeof a&&a&&!a.ra){var b=a.src;if(b&&b[Mc])Sc(b.u,a);else{var c=a.type,d=a.proxy;b.removeEventListener?b.removeEventListener(c,d,a.capture):b.detachEvent?b.detachEvent(cd(c),d):b.addListener&&b.removeListener&&b.removeListener(d);Vc--;(c=ad(b))?(Sc(c,a),0==c.b&&(c.src=null,b[Tc]=null)):Pc(a)}}}function cd(a){return a in Uc?Uc[a]:Uc[a]="on"+a}
function hd(a,b,c,d){var e=!0;if(a=ad(a))if(b=a.a[b.toString()])for(b=b.concat(),a=0;a<b.length;a++){var f=b[a];f&&f.capture==c&&!f.ra&&(f=id(f,d),e=e&&!1!==f)}return e}function id(a,b){var c=a.listener,d=a.Na||a.src;a.Ia&&gd(a);return c.call(d,b)}
function dd(a,b){if(a.ra)return!0;if(!Hc){if(!b)a:{b=["window","event"];for(var c=l,d=0;d<b.length;d++)if(c=c[b[d]],null==c){b=null;break a}b=c}d=b;b=new Kc(d,this);c=!0;if(!(0>d.keyCode||void 0!=d.returnValue)){a:{var e=!1;if(0==d.keyCode)try{d.keyCode=-1;break a}catch(g){e=!0}if(e||void 0==d.returnValue)d.returnValue=!0}d=[];for(e=b.b;e;e=e.parentNode)d.push(e);a=a.type;for(e=d.length-1;0<=e;e--){b.b=d[e];var f=hd(d[e],a,!0,b);c=c&&f}for(e=0;e<d.length;e++)b.b=d[e],f=hd(d[e],a,!1,b),c=c&&f}return c}return id(a,
new Kc(b,this))}function ad(a){a=a[Tc];return a instanceof Qc?a:null}var jd="__closure_events_fn_"+(1E9*Math.random()>>>0);function Yc(a){if(q(a))return a;a[jd]||(a[jd]=function(b){return a.handleEvent(b)});return a[jd]};function G(){mc.call(this);this.u=new Qc(this);this.Sb=this;this.Wa=null}v(G,mc);G.prototype[Mc]=!0;G.prototype.addEventListener=function(a,b,c,d){Wc(this,a,b,c,d)};G.prototype.removeEventListener=function(a,b,c,d){fd(this,a,b,c,d)};
G.prototype.dispatchEvent=function(a){var b,c=this.Wa;if(c)for(b=[];c;c=c.Wa)b.push(c);c=this.Sb;var d=a.type||a;if(n(a))a=new F(a,c);else if(a instanceof F)a.target=a.target||c;else{var e=a;a=new F(d,c);Wa(a,e)}e=!0;if(b)for(var f=b.length-1;0<=f;f--){var g=a.b=b[f];e=kd(g,d,!0,a)&&e}g=a.b=c;e=kd(g,d,!0,a)&&e;e=kd(g,d,!1,a)&&e;if(b)for(f=0;f<b.length;f++)g=a.b=b[f],e=kd(g,d,!1,a)&&e;return e};
G.prototype.xa=function(){G.qb.xa.call(this);if(this.u){var a=this.u,b=0,c;for(c in a.a){for(var d=a.a[c],e=0;e<d.length;e++)++b,Pc(d[e]);delete a.a[c];a.b--}}this.Wa=null};function Zc(a,b,c,d,e){a.u.add(String(b),c,!1,d,e)}function ed(a,b,c,d,e){a.u.add(String(b),c,!0,d,e)}
function kd(a,b,c,d){b=a.u.a[String(b)];if(!b)return!0;b=b.concat();for(var e=!0,f=0;f<b.length;++f){var g=b[f];if(g&&!g.ra&&g.capture==c){var h=g.listener,m=g.Na||g.src;g.Ia&&Sc(a.u,g);e=!1!==h.call(m,d)&&e}}return e&&0!=d.Mb};function md(a,b,c){if(q(a))c&&(a=t(a,c));else if(a&&"function"==typeof a.handleEvent)a=t(a.handleEvent,a);else throw Error("Invalid listener argument");return 2147483647<Number(b)?-1:l.setTimeout(a,b||0)}function nd(a){var b=null;return(new B(function(c,d){b=md(function(){c(void 0)},a);-1==b&&d(Error("Failed to schedule timer."))})).s(function(c){l.clearTimeout(b);throw c;})};function od(a){if(a.U&&"function"==typeof a.U)return a.U();if(n(a))return a.split("");if(oa(a)){for(var b=[],c=a.length,d=0;d<c;d++)b.push(a[d]);return b}b=[];c=0;for(d in a)b[c++]=a[d];return b}function pd(a){if(a.X&&"function"==typeof a.X)return a.X();if(!a.U||"function"!=typeof a.U){if(oa(a)||n(a)){var b=[];a=a.length;for(var c=0;c<a;c++)b.push(c);return b}b=[];c=0;for(var d in a)b[c++]=d;return b}}
function qd(a,b){if(a.forEach&&"function"==typeof a.forEach)a.forEach(b,void 0);else if(oa(a)||n(a))x(a,b,void 0);else for(var c=pd(a),d=od(a),e=d.length,f=0;f<e;f++)b.call(void 0,d[f],c&&c[f],a)};function rd(a,b){this.b={};this.a=[];this.c=0;var c=arguments.length;if(1<c){if(c%2)throw Error("Uneven number of arguments");for(var d=0;d<c;d+=2)this.set(arguments[d],arguments[d+1])}else if(a)if(a instanceof rd)for(c=a.X(),d=0;d<c.length;d++)this.set(c[d],a.get(c[d]));else for(d in a)this.set(d,a[d])}k=rd.prototype;k.U=function(){sd(this);for(var a=[],b=0;b<this.a.length;b++)a.push(this.b[this.a[b]]);return a};k.X=function(){sd(this);return this.a.concat()};
k.clear=function(){this.b={};this.c=this.a.length=0};function sd(a){if(a.c!=a.a.length){for(var b=0,c=0;b<a.a.length;){var d=a.a[b];td(a.b,d)&&(a.a[c++]=d);b++}a.a.length=c}if(a.c!=a.a.length){var e={};for(c=b=0;b<a.a.length;)d=a.a[b],td(e,d)||(a.a[c++]=d,e[d]=1),b++;a.a.length=c}}k.get=function(a,b){return td(this.b,a)?this.b[a]:b};k.set=function(a,b){td(this.b,a)||(this.c++,this.a.push(a));this.b[a]=b};
k.forEach=function(a,b){for(var c=this.X(),d=0;d<c.length;d++){var e=c[d],f=this.get(e);a.call(b,f,e,this)}};function td(a,b){return Object.prototype.hasOwnProperty.call(a,b)};var ud=/^(?:([^:/?#.]+):)?(?:\/\/(?:([^/?#]*)@)?([^/#?]*?)(?::([0-9]+))?(?=[/#?]|$))?([^?#]+)?(?:\?([^#]*))?(?:#([\s\S]*))?$/;function vd(a,b){if(a){a=a.split("&");for(var c=0;c<a.length;c++){var d=a[c].indexOf("="),e=null;if(0<=d){var f=a[c].substring(0,d);e=a[c].substring(d+1)}else f=a[c];b(f,e?decodeURIComponent(e.replace(/\+/g," ")):"")}}};function wd(a,b){this.b=this.i=this.f="";this.l=null;this.g=this.c="";this.h=!1;var c;a instanceof wd?(this.h=void 0!==b?b:a.h,xd(this,a.f),this.i=a.i,this.b=a.b,yd(this,a.l),this.c=a.c,zd(this,Ad(a.a)),this.g=a.g):a&&(c=String(a).match(ud))?(this.h=!!b,xd(this,c[1]||"",!0),this.i=Bd(c[2]||""),this.b=Bd(c[3]||"",!0),yd(this,c[4]),this.c=Bd(c[5]||"",!0),zd(this,c[6]||"",!0),this.g=Bd(c[7]||"")):(this.h=!!b,this.a=new Cd(null,this.h))}
wd.prototype.toString=function(){var a=[],b=this.f;b&&a.push(Dd(b,Ed,!0),":");var c=this.b;if(c||"file"==b)a.push("//"),(b=this.i)&&a.push(Dd(b,Ed,!0),"@"),a.push(encodeURIComponent(String(c)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),c=this.l,null!=c&&a.push(":",String(c));if(c=this.c)this.b&&"/"!=c.charAt(0)&&a.push("/"),a.push(Dd(c,"/"==c.charAt(0)?Fd:Gd,!0));(c=this.a.toString())&&a.push("?",c);(c=this.g)&&a.push("#",Dd(c,Hd));return a.join("")};
wd.prototype.resolve=function(a){var b=new wd(this),c=!!a.f;c?xd(b,a.f):c=!!a.i;c?b.i=a.i:c=!!a.b;c?b.b=a.b:c=null!=a.l;var d=a.c;if(c)yd(b,a.l);else if(c=!!a.c){if("/"!=d.charAt(0))if(this.b&&!this.c)d="/"+d;else{var e=b.c.lastIndexOf("/");-1!=e&&(d=b.c.substr(0,e+1)+d)}e=d;if(".."==e||"."==e)d="";else if(y(e,"./")||y(e,"/.")){d=0==e.lastIndexOf("/",0);e=e.split("/");for(var f=[],g=0;g<e.length;){var h=e[g++];"."==h?d&&g==e.length&&f.push(""):".."==h?((1<f.length||1==f.length&&""!=f[0])&&f.pop(),
d&&g==e.length&&f.push("")):(f.push(h),d=!0)}d=f.join("/")}else d=e}c?b.c=d:c=""!==a.a.toString();c?zd(b,Ad(a.a)):c=!!a.g;c&&(b.g=a.g);return b};function xd(a,b,c){a.f=c?Bd(b,!0):b;a.f&&(a.f=a.f.replace(/:$/,""))}function yd(a,b){if(b){b=Number(b);if(isNaN(b)||0>b)throw Error("Bad port number "+b);a.l=b}else a.l=null}function zd(a,b,c){b instanceof Cd?(a.a=b,Id(a.a,a.h)):(c||(b=Dd(b,Jd)),a.a=new Cd(b,a.h))}function H(a,b,c){a.a.set(b,c)}function Kd(a,b){return a.a.get(b)}
function Ld(a){return a instanceof wd?new wd(a):new wd(a,void 0)}function Md(a,b){var c=new wd(null,void 0);xd(c,"https");a&&(c.b=a);b&&(c.c=b);return c}function Bd(a,b){return a?b?decodeURI(a.replace(/%25/g,"%2525")):decodeURIComponent(a):""}function Dd(a,b,c){return n(a)?(a=encodeURI(a).replace(b,Nd),c&&(a=a.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),a):null}function Nd(a){a=a.charCodeAt(0);return"%"+(a>>4&15).toString(16)+(a&15).toString(16)}
var Ed=/[#\/\?@]/g,Gd=/[#\?:]/g,Fd=/[#\?]/g,Jd=/[#\?@]/g,Hd=/#/g;function Cd(a,b){this.b=this.a=null;this.c=a||null;this.f=!!b}function Od(a){a.a||(a.a=new rd,a.b=0,a.c&&vd(a.c,function(b,c){a.add(decodeURIComponent(b.replace(/\+/g," ")),c)}))}function Pd(a){var b=pd(a);if("undefined"==typeof b)throw Error("Keys are undefined");var c=new Cd(null,void 0);a=od(a);for(var d=0;d<b.length;d++){var e=b[d],f=a[d];na(f)?Qd(c,e,f):c.add(e,f)}return c}k=Cd.prototype;
k.add=function(a,b){Od(this);this.c=null;a=Rd(this,a);var c=this.a.get(a);c||this.a.set(a,c=[]);c.push(b);this.b+=1;return this};function Sd(a,b){Od(a);b=Rd(a,b);td(a.a.b,b)&&(a.c=null,a.b-=a.a.get(b).length,a=a.a,td(a.b,b)&&(delete a.b[b],a.c--,a.a.length>2*a.c&&sd(a)))}k.clear=function(){this.a=this.c=null;this.b=0};function Td(a,b){Od(a);b=Rd(a,b);return td(a.a.b,b)}k.forEach=function(a,b){Od(this);this.a.forEach(function(c,d){x(c,function(e){a.call(b,e,d,this)},this)},this)};
k.X=function(){Od(this);for(var a=this.a.U(),b=this.a.X(),c=[],d=0;d<b.length;d++)for(var e=a[d],f=0;f<e.length;f++)c.push(b[d]);return c};k.U=function(a){Od(this);var b=[];if(n(a))Td(this,a)&&(b=Qa(b,this.a.get(Rd(this,a))));else{a=this.a.U();for(var c=0;c<a.length;c++)b=Qa(b,a[c])}return b};k.set=function(a,b){Od(this);this.c=null;a=Rd(this,a);Td(this,a)&&(this.b-=this.a.get(a).length);this.a.set(a,[b]);this.b+=1;return this};
k.get=function(a,b){if(!a)return b;a=this.U(a);return 0<a.length?String(a[0]):b};function Qd(a,b,c){Sd(a,b);0<c.length&&(a.c=null,a.a.set(Rd(a,b),Ra(c)),a.b+=c.length)}k.toString=function(){if(this.c)return this.c;if(!this.a)return"";for(var a=[],b=this.a.X(),c=0;c<b.length;c++){var d=b[c],e=encodeURIComponent(String(d));d=this.U(d);for(var f=0;f<d.length;f++){var g=e;""!==d[f]&&(g+="="+encodeURIComponent(String(d[f])));a.push(g)}}return this.c=a.join("&")};
function Ad(a){var b=new Cd;b.c=a.c;a.a&&(b.a=new rd(a.a),b.b=a.b);return b}function Rd(a,b){b=String(b);a.f&&(b=b.toLowerCase());return b}function Id(a,b){b&&!a.f&&(Od(a),a.c=null,a.a.forEach(function(c,d){var e=d.toLowerCase();d!=e&&(Sd(this,d),Qd(this,e,c))},a));a.f=b};var Ud=!uc||9<=Number(Fc);function Vd(a){var b=document;return n(a)?b.getElementById(a):a}function Wd(a,b){Sa(b,function(c,d){c&&"object"==typeof c&&c.qa&&(c=c.pa());"style"==d?a.style.cssText=c:"class"==d?a.className=c:"for"==d?a.htmlFor=c:Xd.hasOwnProperty(d)?a.setAttribute(Xd[d],c):0==d.lastIndexOf("aria-",0)||0==d.lastIndexOf("data-",0)?a.setAttribute(d,c):a[d]=c})}
var Xd={cellpadding:"cellPadding",cellspacing:"cellSpacing",colspan:"colSpan",frameborder:"frameBorder",height:"height",maxlength:"maxLength",nonce:"nonce",role:"role",rowspan:"rowSpan",type:"type",usemap:"useMap",valign:"vAlign",width:"width"};
function Yd(a,b,c){var d=arguments,e=document,f=String(d[0]),g=d[1];if(!Ud&&g&&(g.name||g.type)){f=["<",f];g.name&&f.push(' name="',Ib(g.name),'"');if(g.type){f.push(' type="',Ib(g.type),'"');var h={};Wa(h,g);delete h.type;g=h}f.push(">");f=f.join("")}f=e.createElement(f);g&&(n(g)?f.className=g:na(g)?f.className=g.join(" "):Wd(f,g));2<d.length&&Zd(e,f,d);return f}
function Zd(a,b,c){function d(g){g&&b.appendChild(n(g)?a.createTextNode(g):g)}for(var e=2;e<c.length;e++){var f=c[e];!oa(f)||r(f)&&0<f.nodeType?d(f):x($d(f)?Ra(f):f,d)}}function $d(a){if(a&&"number"==typeof a.length){if(r(a))return"function"==typeof a.item||"string"==typeof a.item;if(q(a))return"function"==typeof a.item}return!1};function ae(a){var b=[];be(new ce,a,b);return b.join("")}function ce(){}
function be(a,b,c){if(null==b)c.push("null");else{if("object"==typeof b){if(na(b)){var d=b;b=d.length;c.push("[");for(var e="",f=0;f<b;f++)c.push(e),be(a,d[f],c),e=",";c.push("]");return}if(b instanceof String||b instanceof Number||b instanceof Boolean)b=b.valueOf();else{c.push("{");e="";for(d in b)Object.prototype.hasOwnProperty.call(b,d)&&(f=b[d],"function"!=typeof f&&(c.push(e),de(d,c),c.push(":"),be(a,f,c),e=","));c.push("}");return}}switch(typeof b){case "string":de(b,c);break;case "number":c.push(isFinite(b)&&
!isNaN(b)?String(b):"null");break;case "boolean":c.push(String(b));break;case "function":c.push("null");break;default:throw Error("Unknown type: "+typeof b);}}}var ee={'"':'\\"',"\\":"\\\\","/":"\\/","\b":"\\b","\f":"\\f","\n":"\\n","\r":"\\r","\t":"\\t","\x0B":"\\u000b"},fe=/\uffff/.test("\uffff")?/[\\"\x00-\x1f\x7f-\uffff]/g:/[\\"\x00-\x1f\x7f-\xff]/g;
function de(a,b){b.push('"',a.replace(fe,function(c){var d=ee[c];d||(d="\\u"+(c.charCodeAt(0)|65536).toString(16).substr(1),ee[c]=d);return d}),'"')};/*

 Copyright 2017 Google Inc.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/
function ge(){var a=I();return uc&&!!Fc&&11==Fc||/Edge\/\d+/.test(a)}function he(){return l.window&&l.window.location.href||self&&self.location&&self.location.href||""}function ie(a,b){b=b||l.window;var c="about:blank";a&&(c=tb(vb(a)).toString());b.location.href=c}function je(a,b){var c=[],d;for(d in a)d in b?typeof a[d]!=typeof b[d]?c.push(d):"object"==typeof a[d]&&null!=a[d]&&null!=b[d]?0<je(a[d],b[d]).length&&c.push(d):a[d]!==b[d]&&c.push(d):c.push(d);for(d in b)d in a||c.push(d);return c}
function ke(){var a=I();a=le(a)!=me?null:(a=a.match(/\sChrome\/(\d+)/i))&&2==a.length?parseInt(a[1],10):null;return a&&30>a?!1:!uc||!Fc||9<Fc}function ne(a){a=(a||I()).toLowerCase();return a.match(/android/)||a.match(/webos/)||a.match(/iphone|ipad|ipod/)||a.match(/blackberry/)||a.match(/windows phone/)||a.match(/iemobile/)?!0:!1}function oe(a){a=a||l.window;try{a.close()}catch(b){}}
function pe(a,b,c){var d=Math.floor(1E9*Math.random()).toString();b=b||500;c=c||600;var e=(window.screen.availHeight-c)/2,f=(window.screen.availWidth-b)/2;b={width:b,height:c,top:0<e?e:0,left:0<f?f:0,location:!0,resizable:!0,statusbar:!0,toolbar:!1};c=I().toLowerCase();d&&(b.target=d,y(c,"crios/")&&(b.target="_blank"));le(I())==qe&&(a=a||"http://localhost",b.scrollbars=!0);c=a||"";(a=b)||(a={});d=window;b=c instanceof rb?c:vb("undefined"!=typeof c.href?c.href:String(c));c=a.target||c.target;e=[];
for(g in a)switch(g){case "width":case "height":case "top":case "left":e.push(g+"="+a[g]);break;case "target":case "noopener":case "noreferrer":break;default:e.push(g+"="+(a[g]?1:0))}var g=e.join(",");(z("iPhone")&&!z("iPod")&&!z("iPad")||z("iPad")||z("iPod"))&&d.navigator&&d.navigator.standalone&&c&&"_self"!=c?(g=d.document.createElement("A"),Ga(g,"HTMLAnchorElement"),b instanceof rb||b instanceof rb||(b="object"==typeof b&&b.qa?b.pa():String(b),ub.test(b)||(b="about:invalid#zClosurez"),b=wb(b)),
g.href=tb(b),g.setAttribute("target",c),a.noreferrer&&g.setAttribute("rel","noreferrer"),a=document.createEvent("MouseEvent"),a.initMouseEvent("click",!0,!0,d,1),g.dispatchEvent(a),g={}):a.noreferrer?(g=d.open("",c,g),a=tb(b).toString(),g&&(wc&&y(a,";")&&(a="'"+a.replace(/'/g,"%27")+"'"),g.opener=null,a=Db('<meta name="referrer" content="no-referrer"><meta http-equiv="refresh" content="0; url='+Ib(a)+'">'),g.document.write(Cb(a)),g.document.close())):(g=d.open(tb(b).toString(),c,g))&&a.noopener&&
(g.opener=null);if(g)try{g.focus()}catch(h){}return g}function re(a){return new B(function(b){function c(){nd(2E3).then(function(){if(!a||a.closed)b();else return c()})}return c()})}var se=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,te=/^[^@]+@[^@]+$/;function ue(){var a=null;return(new B(function(b){"complete"==l.document.readyState?b():(a=function(){b()},Xc(window,"load",a))})).s(function(b){fd(window,"load",a);throw b;})}
function ve(){return we(void 0)?ue().then(function(){return new B(function(a,b){var c=l.document,d=setTimeout(function(){b(Error("Cordova framework is not ready."))},1E3);c.addEventListener("deviceready",function(){clearTimeout(d);a()},!1)})}):E(Error("Cordova must run in an Android or iOS file scheme."))}function we(a){a=a||I();return!("file:"!==xe()||!a.toLowerCase().match(/iphone|ipad|ipod|android/))}function ye(){var a=l.window;try{return!(!a||a==a.top)}catch(b){return!1}}
function ze(){return"undefined"!==typeof l.WorkerGlobalScope&&"function"===typeof l.importScripts}function Ae(){return _firebase_app__WEBPACK_IMPORTED_MODULE_0___default.a.INTERNAL.hasOwnProperty("reactNative")?"ReactNative":_firebase_app__WEBPACK_IMPORTED_MODULE_0___default.a.INTERNAL.hasOwnProperty("node")?"Node":ze()?"Worker":"Browser"}function Be(){var a=Ae();return"ReactNative"===a||"Node"===a}function Ce(){for(var a=50,b=[];0<a;)b.push("1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(Math.floor(62*Math.random()))),a--;return b.join("")}
var qe="Firefox",me="Chrome";
function le(a){var b=a.toLowerCase();if(y(b,"opera/")||y(b,"opr/")||y(b,"opios/"))return"Opera";if(y(b,"iemobile"))return"IEMobile";if(y(b,"msie")||y(b,"trident/"))return"IE";if(y(b,"edge/"))return"Edge";if(y(b,"firefox/"))return qe;if(y(b,"silk/"))return"Silk";if(y(b,"blackberry"))return"Blackberry";if(y(b,"webos"))return"Webos";if(!y(b,"safari/")||y(b,"chrome/")||y(b,"crios/")||y(b,"android"))if(!y(b,"chrome/")&&!y(b,"crios/")||y(b,"edge/")){if(y(b,"android"))return"Android";if((a=a.match(/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/))&&
2==a.length)return a[1]}else return me;else return"Safari";return"Other"}var De={Vc:"FirebaseCore-web",Xc:"FirebaseUI-web"};function Ee(a,b){b=b||[];var c=[],d={},e;for(e in De)d[De[e]]=!0;for(e=0;e<b.length;e++)"undefined"!==typeof d[b[e]]&&(delete d[b[e]],c.push(b[e]));c.sort();b=c;b.length||(b=["FirebaseCore-web"]);c=Ae();"Browser"===c?(d=I(),c=le(d)):"Worker"===c&&(d=I(),c=le(d)+"-"+c);return c+"/JsCore/"+a+"/"+b.join(",")}function I(){return l.navigator&&l.navigator.userAgent||""}
function J(a,b){a=a.split(".");b=b||l;for(var c=0;c<a.length&&"object"==typeof b&&null!=b;c++)b=b[a[c]];c!=a.length&&(b=void 0);return b}function Fe(){try{var a=l.localStorage,b=Ge();if(a)return a.setItem(b,"1"),a.removeItem(b),ge()?!!l.indexedDB:!0}catch(c){return ze()&&!!l.indexedDB}return!1}function He(){return(Ie()||"chrome-extension:"===xe()||we())&&!Be()&&Fe()&&!ze()}function Ie(){return"http:"===xe()||"https:"===xe()}function xe(){return l.location&&l.location.protocol||null}
function Je(a){a=a||I();return ne(a)||le(a)==qe?!1:!0}function Ke(a){return"undefined"===typeof a?null:ae(a)}function Le(a){var b={},c;for(c in a)a.hasOwnProperty(c)&&null!==a[c]&&void 0!==a[c]&&(b[c]=a[c]);return b}function Me(a){if(null!==a)return JSON.parse(a)}function Ge(a){return a?a:Math.floor(1E9*Math.random()).toString()}function Ne(a){a=a||I();return"Safari"==le(a)||a.toLowerCase().match(/iphone|ipad|ipod/)?!1:!0}
function Oe(){var a=l.___jsl;if(a&&a.H)for(var b in a.H)if(a.H[b].r=a.H[b].r||[],a.H[b].L=a.H[b].L||[],a.H[b].r=a.H[b].L.concat(),a.CP)for(var c=0;c<a.CP.length;c++)a.CP[c]=null}function Pe(a,b){if(a>b)throw Error("Short delay should be less than long delay!");this.a=a;this.c=b;a=I();b=Ae();this.b=ne(a)||"ReactNative"===b}
Pe.prototype.get=function(){var a=l.navigator;return(a&&"boolean"===typeof a.onLine&&(Ie()||"chrome-extension:"===xe()||"undefined"!==typeof a.connection)?a.onLine:1)?this.b?this.c:this.a:Math.min(5E3,this.a)};function Qe(){var a=l.document;return a&&"undefined"!==typeof a.visibilityState?"visible"==a.visibilityState:!0}
function Re(){var a=l.document,b=null;return Qe()||!a?D():(new B(function(c){b=function(){Qe()&&(a.removeEventListener("visibilitychange",b,!1),c())};a.addEventListener("visibilitychange",b,!1)})).s(function(c){a.removeEventListener("visibilitychange",b,!1);throw c;})}function Se(a){try{var b=new Date(parseInt(a,10));if(!isNaN(b.getTime())&&!/[^0-9]/.test(a))return b.toUTCString()}catch(c){}return null}function Te(){return!(!J("fireauth.oauthhelper",l)&&!J("fireauth.iframe",l))}
function Ue(){var a=l.navigator;return a&&a.serviceWorker&&a.serviceWorker.controller||null}function Ve(){var a=l.navigator;return a&&a.serviceWorker?D().then(function(){return a.serviceWorker.ready}).then(function(b){return b.active||null}).s(function(){return null}):D(null)};var We={};function Xe(a){We[a]||(We[a]=!0,"undefined"!==typeof console&&"function"===typeof console.warn&&console.warn(a))};var Ye;try{var Ze={};Object.defineProperty(Ze,"abcd",{configurable:!0,enumerable:!0,value:1});Object.defineProperty(Ze,"abcd",{configurable:!0,enumerable:!0,value:2});Ye=2==Ze.abcd}catch(a){Ye=!1}function K(a,b,c){Ye?Object.defineProperty(a,b,{configurable:!0,enumerable:!0,value:c}):a[b]=c}function L(a,b){if(b)for(var c in b)b.hasOwnProperty(c)&&K(a,c,b[c])}function $e(a){var b={};L(b,a);return b}function af(a){var b={},c;for(c in a)a.hasOwnProperty(c)&&(b[c]=a[c]);return b}
function bf(a,b){if(!b||!b.length)return!0;if(!a)return!1;for(var c=0;c<b.length;c++){var d=a[b[c]];if(void 0===d||null===d||""===d)return!1}return!0}function cf(a){var b=a;if("object"==typeof a&&null!=a){b="length"in a?[]:{};for(var c in a)K(b,c,cf(a[c]))}return b};function df(a){var b={},c=a[ef],d=a[ff];a=a[gf];if(!a||a!=hf&&!c)throw Error("Invalid provider user info!");b[jf]=d||null;b[kf]=c||null;K(this,lf,a);K(this,mf,cf(b))}var hf="EMAIL_SIGNIN",ef="email",ff="newEmail",gf="requestType",kf="email",jf="fromEmail",mf="data",lf="operation";function M(a,b){this.code=nf+a;this.message=b||of[a]||""}v(M,Error);M.prototype.A=function(){return{code:this.code,message:this.message}};M.prototype.toJSON=function(){return this.A()};function pf(a){var b=a&&a.code;return b?new M(b.substring(nf.length),a.message):null}
var nf="auth/",of={"admin-restricted-operation":"This operation is restricted to administrators only.","argument-error":"","app-not-authorized":"This app, identified by the domain where it's hosted, is not authorized to use Firebase Authentication with the provided API key. Review your key configuration in the Google API console.","app-not-installed":"The requested mobile application corresponding to the identifier (Android package name or iOS bundle ID) provided is not installed on this device.",
"captcha-check-failed":"The reCAPTCHA response token provided is either invalid, expired, already used or the domain associated with it does not match the list of whitelisted domains.","code-expired":"The SMS code has expired. Please re-send the verification code to try again.","cordova-not-ready":"Cordova framework is not ready.","cors-unsupported":"This browser is not supported.","credential-already-in-use":"This credential is already associated with a different user account.","custom-token-mismatch":"The custom token corresponds to a different audience.",
"requires-recent-login":"This operation is sensitive and requires recent authentication. Log in again before retrying this request.","dynamic-link-not-activated":"Please activate Dynamic Links in the Firebase Console and agree to the terms and conditions.","email-already-in-use":"The email address is already in use by another account.","expired-action-code":"The action code has expired. ","cancelled-popup-request":"This operation has been cancelled due to another conflicting popup being opened.",
"internal-error":"An internal error has occurred.","invalid-app-credential":"The phone verification request contains an invalid application verifier. The reCAPTCHA token response is either invalid or expired.","invalid-app-id":"The mobile app identifier is not registed for the current project.","invalid-user-token":"This user's credential isn't valid for this project. This can happen if the user's token has been tampered with, or if the user isn't for the project associated with this API key.","invalid-auth-event":"An internal error has occurred.",
"invalid-verification-code":"The SMS verification code used to create the phone auth credential is invalid. Please resend the verification code sms and be sure use the verification code provided by the user.","invalid-continue-uri":"The continue URL provided in the request is invalid.","invalid-cordova-configuration":"The following Cordova plugins must be installed to enable OAuth sign-in: cordova-plugin-buildinfo, cordova-universal-links-plugin, cordova-plugin-browsertab, cordova-plugin-inappbrowser and cordova-plugin-customurlscheme.",
"invalid-custom-token":"The custom token format is incorrect. Please check the documentation.","invalid-dynamic-link-domain":"The provided dynamic link domain is not configured or authorized for the current project.","invalid-email":"The email address is badly formatted.","invalid-api-key":"Your API key is invalid, please check you have copied it correctly.","invalid-cert-hash":"The SHA-1 certificate hash provided is invalid.","invalid-credential":"The supplied auth credential is malformed or has expired.",
"invalid-message-payload":"The email template corresponding to this action contains invalid characters in its message. Please fix by going to the Auth email templates section in the Firebase Console.","invalid-oauth-provider":"EmailAuthProvider is not supported for this operation. This operation only supports OAuth providers.","invalid-oauth-client-id":"The OAuth client ID provided is either invalid or does not match the specified API key.","unauthorized-domain":"This domain is not authorized for OAuth operations for your Firebase project. Edit the list of authorized domains from the Firebase console.",
"invalid-action-code":"The action code is invalid. This can happen if the code is malformed, expired, or has already been used.","wrong-password":"The password is invalid or the user does not have a password.","invalid-persistence-type":"The specified persistence type is invalid. It can only be local, session or none.","invalid-phone-number":"The format of the phone number provided is incorrect. Please enter the phone number in a format that can be parsed into E.164 format. E.164 phone numbers are written in the format [+][country code][subscriber number including area code].",
"invalid-provider-id":"The specified provider ID is invalid.","invalid-recipient-email":"The email corresponding to this action failed to send as the provided recipient email address is invalid.","invalid-sender":"The email template corresponding to this action contains an invalid sender email or name. Please fix by going to the Auth email templates section in the Firebase Console.","invalid-verification-id":"The verification ID used to create the phone auth credential is invalid.","invalid-tenant-id":"The Auth instance's tenant ID is invalid.",
"missing-android-pkg-name":"An Android Package Name must be provided if the Android App is required to be installed.","auth-domain-config-required":"Be sure to include authDomain when calling firebase.initializeApp(), by following the instructions in the Firebase console.","missing-app-credential":"The phone verification request is missing an application verifier assertion. A reCAPTCHA response token needs to be provided.","missing-verification-code":"The phone auth credential was created with an empty SMS verification code.",
"missing-continue-uri":"A continue URL must be provided in the request.","missing-iframe-start":"An internal error has occurred.","missing-ios-bundle-id":"An iOS Bundle ID must be provided if an App Store ID is provided.","missing-or-invalid-nonce":"The OIDC ID token requires a valid unhashed nonce.","missing-phone-number":"To send verification codes, provide a phone number for the recipient.","missing-verification-id":"The phone auth credential was created with an empty verification ID.","app-deleted":"This instance of FirebaseApp has been deleted.",
"account-exists-with-different-credential":"An account already exists with the same email address but different sign-in credentials. Sign in using a provider associated with this email address.","network-request-failed":"A network error (such as timeout, interrupted connection or unreachable host) has occurred.","no-auth-event":"An internal error has occurred.","no-such-provider":"User was not linked to an account with the given provider.","null-user":"A null user object was provided as the argument for an operation which requires a non-null user object.",
"operation-not-allowed":"The given sign-in provider is disabled for this Firebase project. Enable it in the Firebase console, under the sign-in method tab of the Auth section.","operation-not-supported-in-this-environment":'This operation is not supported in the environment this application is running on. "location.protocol" must be http, https or chrome-extension and web storage must be enabled.',"popup-blocked":"Unable to establish a connection with the popup. It may have been blocked by the browser.",
"popup-closed-by-user":"The popup has been closed by the user before finalizing the operation.","provider-already-linked":"User can only be linked to one identity for the given provider.","quota-exceeded":"The project's quota for this operation has been exceeded.","redirect-cancelled-by-user":"The redirect operation has been cancelled by the user before finalizing.","redirect-operation-pending":"A redirect sign-in operation is already pending.","rejected-credential":"The request contains malformed or mismatching credentials.",
"tenant-id-mismatch":"The provided tenant ID does not match the Auth instance's tenant ID",timeout:"The operation has timed out.","user-token-expired":"The user's credential is no longer valid. The user must sign in again.","too-many-requests":"We have blocked all requests from this device due to unusual activity. Try again later.","unauthorized-continue-uri":"The domain of the continue URL is not whitelisted.  Please whitelist the domain in the Firebase console.","unsupported-persistence-type":"The current environment does not support the specified persistence type.",
"unsupported-tenant-operation":"This operation is not supported in a multi-tenant context.","user-cancelled":"User did not grant your application the permissions it requested.","user-not-found":"There is no user record corresponding to this identifier. The user may have been deleted.","user-disabled":"The user account has been disabled by an administrator.","user-mismatch":"The supplied credentials do not correspond to the previously signed in user.","user-signed-out":"","weak-password":"The password must be 6 characters long or more.",
"web-storage-unsupported":"This browser is not supported or 3rd party cookies and data may be disabled."};function qf(a){a=Ld(a);var b=Kd(a,rf)||null,c=Kd(a,sf)||null,d=Kd(a,tf)||null;d=d?uf[d]||null:null;if(!b||!c||!d)throw new M("argument-error",rf+", "+sf+"and "+tf+" are required in a valid action code URL.");L(this,{apiKey:b,operation:d,code:c,continueUrl:Kd(a,vf)||null,languageCode:Kd(a,wf)||null,tenantId:Kd(a,xf)||null})}var rf="apiKey",sf="oobCode",vf="continueUrl",wf="languageCode",tf="mode",xf="tenantId",uf={recoverEmail:"RECOVER_EMAIL",resetPassword:"PASSWORD_RESET",signIn:hf,verifyEmail:"VERIFY_EMAIL"};
function yf(a){try{return new qf(a)}catch(b){return null}};function zf(a){var b=a[Af];if("undefined"===typeof b)throw new M("missing-continue-uri");if("string"!==typeof b||"string"===typeof b&&!b.length)throw new M("invalid-continue-uri");this.h=b;this.b=this.a=null;this.g=!1;var c=a[Bf];if(c&&"object"===typeof c){b=c[Cf];var d=c[Df];c=c[Ef];if("string"===typeof b&&b.length){this.a=b;if("undefined"!==typeof d&&"boolean"!==typeof d)throw new M("argument-error",Df+" property must be a boolean when specified.");this.g=!!d;if("undefined"!==typeof c&&("string"!==
typeof c||"string"===typeof c&&!c.length))throw new M("argument-error",Ef+" property must be a non empty string when specified.");this.b=c||null}else{if("undefined"!==typeof b)throw new M("argument-error",Cf+" property must be a non empty string when specified.");if("undefined"!==typeof d||"undefined"!==typeof c)throw new M("missing-android-pkg-name");}}else if("undefined"!==typeof c)throw new M("argument-error",Bf+" property must be a non null object when specified.");this.f=null;if((b=a[Ff])&&"object"===
typeof b)if(b=b[Gf],"string"===typeof b&&b.length)this.f=b;else{if("undefined"!==typeof b)throw new M("argument-error",Gf+" property must be a non empty string when specified.");}else if("undefined"!==typeof b)throw new M("argument-error",Ff+" property must be a non null object when specified.");b=a[Hf];if("undefined"!==typeof b&&"boolean"!==typeof b)throw new M("argument-error",Hf+" property must be a boolean when specified.");this.c=!!b;a=a[If];if("undefined"!==typeof a&&("string"!==typeof a||"string"===
typeof a&&!a.length))throw new M("argument-error",If+" property must be a non empty string when specified.");this.i=a||null}var Bf="android",If="dynamicLinkDomain",Hf="handleCodeInApp",Ff="iOS",Af="url",Df="installApp",Ef="minimumVersion",Cf="packageName",Gf="bundleId";
function Jf(a){var b={};b.continueUrl=a.h;b.canHandleCodeInApp=a.c;if(b.androidPackageName=a.a)b.androidMinimumVersion=a.b,b.androidInstallApp=a.g;b.iOSBundleId=a.f;b.dynamicLinkDomain=a.i;for(var c in b)null===b[c]&&delete b[c];return b};function Kf(a){return Ja(a,function(b){b=b.toString(16);return 1<b.length?b:"0"+b}).join("")};var Lf=null,Mf=null;function Nf(a){var b="";Of(a,function(c){b+=String.fromCharCode(c)});return b}function Of(a,b){function c(m){for(;d<a.length;){var p=a.charAt(d++),u=Mf[p];if(null!=u)return u;if(!/^[\s\xa0]*$/.test(p))throw Error("Unknown base64 encoding at char: "+p);}return m}Pf();for(var d=0;;){var e=c(-1),f=c(0),g=c(64),h=c(64);if(64===h&&-1===e)break;b(e<<2|f>>4);64!=g&&(b(f<<4&240|g>>2),64!=h&&b(g<<6&192|h))}}
function Pf(){if(!Lf){Lf={};Mf={};for(var a=0;65>a;a++)Lf[a]="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(a),Mf[Lf[a]]=a,62<=a&&(Mf["ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.".charAt(a)]=a)}};function Qf(a){this.f=a.sub;ua();this.a=a.provider_id||a.firebase&&a.firebase.sign_in_provider||null;this.c=a.firebase&&a.firebase.tenant||null;this.b=!!a.is_anonymous||"anonymous"==this.a}Qf.prototype.R=function(){return this.c};Qf.prototype.g=function(){return this.b};function Rf(a){return(a=Sf(a))&&a.sub&&a.iss&&a.aud&&a.exp?new Qf(a):null}
function Sf(a){if(!a)return null;a=a.split(".");if(3!=a.length)return null;a=a[1];for(var b=(4-a.length%4)%4,c=0;c<b;c++)a+=".";try{return JSON.parse(Nf(a))}catch(d){}return null};var Tf={ad:{bb:"https://www.googleapis.com/identitytoolkit/v3/relyingparty/",ib:"https://securetoken.googleapis.com/v1/token",id:"p"},cd:{bb:"https://staging-www.sandbox.googleapis.com/identitytoolkit/v3/relyingparty/",ib:"https://staging-securetoken.sandbox.googleapis.com/v1/token",id:"s"},dd:{bb:"https://www-googleapis-test.sandbox.google.com/identitytoolkit/v3/relyingparty/",ib:"https://test-securetoken.sandbox.googleapis.com/v1/token",id:"t"}};
function Uf(a){for(var b in Tf)if(Tf[b].id===a)return a=Tf[b],{firebaseEndpoint:a.bb,secureTokenEndpoint:a.ib};return null}var Vf;Vf=Uf("__EID__")?"__EID__":void 0;var Wf="oauth_consumer_key oauth_nonce oauth_signature oauth_signature_method oauth_timestamp oauth_token oauth_version".split(" "),Xf=["client_id","response_type","scope","redirect_uri","state"],Yf={Wc:{Oa:"locale",Da:500,Ca:600,Pa:"facebook.com",hb:Xf},Yc:{Oa:null,Da:500,Ca:620,Pa:"github.com",hb:Xf},Zc:{Oa:"hl",Da:515,Ca:680,Pa:"google.com",hb:Xf},ed:{Oa:"lang",Da:485,Ca:705,Pa:"twitter.com",hb:Wf}};function Zf(a){for(var b in Yf)if(Yf[b].Pa==a)return Yf[b];return null};function $f(a){var b={};b["facebook.com"]=ag;b["google.com"]=bg;b["github.com"]=cg;b["twitter.com"]=dg;var c=a&&a[eg];try{if(c)return b[c]?new b[c](a):new fg(a);if("undefined"!==typeof a[gg])return new hg(a)}catch(d){}return null}var gg="idToken",eg="providerId";
function hg(a){var b=a[eg];if(!b&&a[gg]){var c=Rf(a[gg]);c&&c.a&&(b=c.a)}if(!b)throw Error("Invalid additional user info!");if("anonymous"==b||"custom"==b)b=null;c=!1;"undefined"!==typeof a.isNewUser?c=!!a.isNewUser:"identitytoolkit#SignupNewUserResponse"===a.kind&&(c=!0);K(this,"providerId",b);K(this,"isNewUser",c)}function fg(a){hg.call(this,a);a=Me(a.rawUserInfo||"{}");K(this,"profile",cf(a||{}))}v(fg,hg);
function ag(a){fg.call(this,a);if("facebook.com"!=this.providerId)throw Error("Invalid provider ID!");}v(ag,fg);function cg(a){fg.call(this,a);if("github.com"!=this.providerId)throw Error("Invalid provider ID!");K(this,"username",this.profile&&this.profile.login||null)}v(cg,fg);function bg(a){fg.call(this,a);if("google.com"!=this.providerId)throw Error("Invalid provider ID!");}v(bg,fg);
function dg(a){fg.call(this,a);if("twitter.com"!=this.providerId)throw Error("Invalid provider ID!");K(this,"username",a.screenName||null)}v(dg,fg);function ig(a){var b=Ld(a),c=Kd(b,"link"),d=Kd(Ld(c),"link");b=Kd(b,"deep_link_id");return Kd(Ld(b),"link")||b||d||c||a};function jg(){}function kg(a,b){return a.then(function(c){if(c[lg]){var d=Rf(c[lg]);if(!d||b!=d.f)throw new M("user-mismatch");return c}throw new M("user-mismatch");}).s(function(c){throw c&&c.code&&c.code==nf+"user-not-found"?new M("user-mismatch"):c;})}function mg(a,b){if(b)this.a=b;else throw new M("internal-error","failed to construct a credential");K(this,"providerId",a);K(this,"signInMethod",a)}mg.prototype.na=function(a){return ng(a,og(this))};
mg.prototype.b=function(a,b){var c=og(this);c.idToken=b;return pg(a,c)};mg.prototype.f=function(a,b){return kg(qg(a,og(this)),b)};function og(a){return{pendingToken:a.a,requestUri:"http://localhost"}}mg.prototype.A=function(){return{providerId:this.providerId,signInMethod:this.signInMethod,pendingToken:this.a}};function rg(a){if(a&&a.providerId&&a.signInMethod&&0==a.providerId.indexOf("saml.")&&a.pendingToken)try{return new mg(a.providerId,a.pendingToken)}catch(b){}return null}
function sg(a,b,c){this.a=null;if(b.idToken||b.accessToken)b.idToken&&K(this,"idToken",b.idToken),b.accessToken&&K(this,"accessToken",b.accessToken),b.nonce&&!b.pendingToken&&K(this,"nonce",b.nonce),b.pendingToken&&(this.a=b.pendingToken);else if(b.oauthToken&&b.oauthTokenSecret)K(this,"accessToken",b.oauthToken),K(this,"secret",b.oauthTokenSecret);else throw new M("internal-error","failed to construct a credential");K(this,"providerId",a);K(this,"signInMethod",c)}
sg.prototype.na=function(a){return ng(a,tg(this))};sg.prototype.b=function(a,b){var c=tg(this);c.idToken=b;return pg(a,c)};sg.prototype.f=function(a,b){var c=tg(this);return kg(qg(a,c),b)};
function tg(a){var b={};a.idToken&&(b.id_token=a.idToken);a.accessToken&&(b.access_token=a.accessToken);a.secret&&(b.oauth_token_secret=a.secret);b.providerId=a.providerId;a.nonce&&!a.a&&(b.nonce=a.nonce);b={postBody:Pd(b).toString(),requestUri:"http://localhost"};a.a&&(delete b.postBody,b.pendingToken=a.a);return b}
sg.prototype.A=function(){var a={providerId:this.providerId,signInMethod:this.signInMethod};this.idToken&&(a.oauthIdToken=this.idToken);this.accessToken&&(a.oauthAccessToken=this.accessToken);this.secret&&(a.oauthTokenSecret=this.secret);this.nonce&&(a.nonce=this.nonce);this.a&&(a.pendingToken=this.a);return a};
function ug(a){if(a&&a.providerId&&a.signInMethod){var b={idToken:a.oauthIdToken,accessToken:a.oauthTokenSecret?null:a.oauthAccessToken,oauthTokenSecret:a.oauthTokenSecret,oauthToken:a.oauthTokenSecret&&a.oauthAccessToken,nonce:a.nonce,pendingToken:a.pendingToken};try{return new sg(a.providerId,b,a.signInMethod)}catch(c){}}return null}function vg(a,b){this.Fc=b||[];L(this,{providerId:a,isOAuthProvider:!0});this.zb={};this.cb=(Zf(a)||{}).Oa||null;this.ab=null}
vg.prototype.Ea=function(a){this.zb=Ua(a);return this};function wg(a){if("string"!==typeof a||0!=a.indexOf("saml."))throw new M("argument-error",'SAML provider IDs must be prefixed with "saml."');vg.call(this,a,[])}v(wg,vg);function O(a){vg.call(this,a,Xf);this.a=[]}v(O,vg);O.prototype.wa=function(a){Na(this.a,a)||this.a.push(a);return this};O.prototype.Hb=function(){return Ra(this.a)};
O.prototype.credential=function(a,b){var c;r(a)?c={idToken:a.idToken||null,accessToken:a.accessToken||null,nonce:a.rawNonce||null}:c={idToken:a||null,accessToken:b||null};if(!c.idToken&&!c.accessToken)throw new M("argument-error","credential failed: must provide the ID token and/or the access token.");return new sg(this.providerId,c,this.providerId)};function xg(){O.call(this,"facebook.com")}v(xg,O);K(xg,"PROVIDER_ID","facebook.com");K(xg,"FACEBOOK_SIGN_IN_METHOD","facebook.com");
function yg(a){if(!a)throw new M("argument-error","credential failed: expected 1 argument (the OAuth access token).");var b=a;r(a)&&(b=a.accessToken);return(new xg).credential({accessToken:b})}function zg(){O.call(this,"github.com")}v(zg,O);K(zg,"PROVIDER_ID","github.com");K(zg,"GITHUB_SIGN_IN_METHOD","github.com");
function Ag(a){if(!a)throw new M("argument-error","credential failed: expected 1 argument (the OAuth access token).");var b=a;r(a)&&(b=a.accessToken);return(new zg).credential({accessToken:b})}function Bg(){O.call(this,"google.com");this.wa("profile")}v(Bg,O);K(Bg,"PROVIDER_ID","google.com");K(Bg,"GOOGLE_SIGN_IN_METHOD","google.com");function Cg(a,b){var c=a;r(a)&&(c=a.idToken,b=a.accessToken);return(new Bg).credential({idToken:c,accessToken:b})}function Dg(){vg.call(this,"twitter.com",Wf)}v(Dg,vg);
K(Dg,"PROVIDER_ID","twitter.com");K(Dg,"TWITTER_SIGN_IN_METHOD","twitter.com");function Eg(a,b){var c=a;r(c)||(c={oauthToken:a,oauthTokenSecret:b});if(!c.oauthToken||!c.oauthTokenSecret)throw new M("argument-error","credential failed: expected 2 arguments (the OAuth access token and secret).");return new sg("twitter.com",c,"twitter.com")}
function Fg(a,b,c){this.a=a;this.c=b;K(this,"providerId","password");K(this,"signInMethod",c===Gg.EMAIL_LINK_SIGN_IN_METHOD?Gg.EMAIL_LINK_SIGN_IN_METHOD:Gg.EMAIL_PASSWORD_SIGN_IN_METHOD)}Fg.prototype.na=function(a){return this.signInMethod==Gg.EMAIL_LINK_SIGN_IN_METHOD?P(a,Hg,{email:this.a,oobCode:this.c}):P(a,Ig,{email:this.a,password:this.c})};
Fg.prototype.b=function(a,b){return this.signInMethod==Gg.EMAIL_LINK_SIGN_IN_METHOD?P(a,Jg,{idToken:b,email:this.a,oobCode:this.c}):P(a,Kg,{idToken:b,email:this.a,password:this.c})};Fg.prototype.f=function(a,b){return kg(this.na(a),b)};Fg.prototype.A=function(){return{email:this.a,password:this.c,signInMethod:this.signInMethod}};function Lg(a){return a&&a.email&&a.password?new Fg(a.email,a.password,a.signInMethod):null}function Gg(){L(this,{providerId:"password",isOAuthProvider:!1})}
function Mg(a,b){b=Ng(b);if(!b)throw new M("argument-error","Invalid email link!");return new Fg(a,b.code,Gg.EMAIL_LINK_SIGN_IN_METHOD)}function Ng(a){a=ig(a);return(a=yf(a))&&a.operation===hf?a:null}L(Gg,{PROVIDER_ID:"password"});L(Gg,{EMAIL_LINK_SIGN_IN_METHOD:"emailLink"});L(Gg,{EMAIL_PASSWORD_SIGN_IN_METHOD:"password"});function Og(a){if(!(a.Ua&&a.Ta||a.Fa&&a.ba))throw new M("internal-error");this.a=a;K(this,"providerId","phone");K(this,"signInMethod","phone")}Og.prototype.na=function(a){return a.Va(Pg(this))};
Og.prototype.b=function(a,b){var c=Pg(this);c.idToken=b;return P(a,Qg,c)};Og.prototype.f=function(a,b){var c=Pg(this);c.operation="REAUTH";a=P(a,Rg,c);return kg(a,b)};Og.prototype.A=function(){var a={providerId:"phone"};this.a.Ua&&(a.verificationId=this.a.Ua);this.a.Ta&&(a.verificationCode=this.a.Ta);this.a.Fa&&(a.temporaryProof=this.a.Fa);this.a.ba&&(a.phoneNumber=this.a.ba);return a};
function Sg(a){if(a&&"phone"===a.providerId&&(a.verificationId&&a.verificationCode||a.temporaryProof&&a.phoneNumber)){var b={};x(["verificationId","verificationCode","temporaryProof","phoneNumber"],function(c){a[c]&&(b[c]=a[c])});return new Og(b)}return null}function Pg(a){return a.a.Fa&&a.a.ba?{temporaryProof:a.a.Fa,phoneNumber:a.a.ba}:{sessionInfo:a.a.Ua,code:a.a.Ta}}
function Tg(a){try{this.a=a||_firebase_app__WEBPACK_IMPORTED_MODULE_0___default.a.auth()}catch(b){throw new M("argument-error","Either an instance of firebase.auth.Auth must be passed as an argument to the firebase.auth.PhoneAuthProvider constructor, or the default firebase App instance must be initialized via firebase.initializeApp().");}L(this,{providerId:"phone",isOAuthProvider:!1})}
Tg.prototype.Va=function(a,b){var c=this.a.b;return D(b.verify()).then(function(d){if(!n(d))throw new M("argument-error","An implementation of firebase.auth.ApplicationVerifier.prototype.verify() must return a firebase.Promise that resolves with a string.");switch(b.type){case "recaptcha":return Ug(c,{phoneNumber:a,recaptchaToken:d}).then(function(e){"function"===typeof b.reset&&b.reset();return e},function(e){"function"===typeof b.reset&&b.reset();throw e;});default:throw new M("argument-error",
'Only firebase.auth.ApplicationVerifiers with type="recaptcha" are currently supported.');}})};function Vg(a,b){if(!a)throw new M("missing-verification-id");if(!b)throw new M("missing-verification-code");return new Og({Ua:a,Ta:b})}L(Tg,{PROVIDER_ID:"phone"});L(Tg,{PHONE_SIGN_IN_METHOD:"phone"});
function Wg(a){if(a.temporaryProof&&a.phoneNumber)return new Og({Fa:a.temporaryProof,ba:a.phoneNumber});var b=a&&a.providerId;if(!b||"password"===b)return null;var c=a&&a.oauthAccessToken,d=a&&a.oauthTokenSecret,e=a&&a.nonce,f=a&&a.oauthIdToken,g=a&&a.pendingToken;try{switch(b){case "google.com":return Cg(f,c);case "facebook.com":return yg(c);case "github.com":return Ag(c);case "twitter.com":return Eg(c,d);default:return c||d||f||g?g?0==b.indexOf("saml.")?new mg(b,g):new sg(b,{pendingToken:g,idToken:a.oauthIdToken,
accessToken:a.oauthAccessToken},b):(new O(b)).credential({idToken:f,accessToken:c,rawNonce:e}):null}}catch(h){return null}}function Xg(a){if(!a.isOAuthProvider)throw new M("invalid-oauth-provider");};function Yg(a,b,c,d,e,f,g){this.c=a;this.b=b||null;this.g=c||null;this.f=d||null;this.i=f||null;this.h=g||null;this.a=e||null;if(this.g||this.a){if(this.g&&this.a)throw new M("invalid-auth-event");if(this.g&&!this.f)throw new M("invalid-auth-event");}else throw new M("invalid-auth-event");}Yg.prototype.getUid=function(){var a=[];a.push(this.c);this.b&&a.push(this.b);this.f&&a.push(this.f);this.h&&a.push(this.h);return a.join("-")};Yg.prototype.R=function(){return this.h};
Yg.prototype.A=function(){return{type:this.c,eventId:this.b,urlResponse:this.g,sessionId:this.f,postBody:this.i,tenantId:this.h,error:this.a&&this.a.A()}};function Zg(a){a=a||{};return a.type?new Yg(a.type,a.eventId,a.urlResponse,a.sessionId,a.error&&pf(a.error),a.postBody,a.tenantId):null};/*

 Copyright 2018 Google Inc.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/
function $g(){this.b=null;this.a=[]}var ah=null;function bh(a){var b=ah;b.a.push(a);b.b||(b.b=function(c){for(var d=0;d<b.a.length;d++)b.a[d](c)},a=J("universalLinks.subscribe",l),"function"===typeof a&&a(null,b.b))};function ch(a){var b="unauthorized-domain",c=void 0,d=Ld(a);a=d.b;d=d.f;"chrome-extension"==d?c=Hb("This chrome extension ID (chrome-extension://%s) is not authorized to run this operation. Add it to the OAuth redirect domains list in the Firebase console -> Auth section -> Sign in method tab.",a):"http"==d||"https"==d?c=Hb("This domain (%s) is not authorized to run this operation. Add it to the OAuth redirect domains list in the Firebase console -> Auth section -> Sign in method tab.",a):b="operation-not-supported-in-this-environment";
M.call(this,b,c)}v(ch,M);function dh(a,b,c){M.call(this,a,c);a=b||{};a.Ab&&K(this,"email",a.Ab);a.ba&&K(this,"phoneNumber",a.ba);a.credential&&K(this,"credential",a.credential);a.Qb&&K(this,"tenantId",a.Qb)}v(dh,M);dh.prototype.A=function(){var a={code:this.code,message:this.message};this.email&&(a.email=this.email);this.phoneNumber&&(a.phoneNumber=this.phoneNumber);this.tenantId&&(a.tenantId=this.tenantId);var b=this.credential&&this.credential.A();b&&Wa(a,b);return a};dh.prototype.toJSON=function(){return this.A()};
function eh(a){if(a.code){var b=a.code||"";0==b.indexOf(nf)&&(b=b.substring(nf.length));var c={credential:Wg(a),Qb:a.tenantId};if(a.email)c.Ab=a.email;else if(a.phoneNumber)c.ba=a.phoneNumber;else if(!c.credential)return new M(b,a.message||void 0);return new dh(b,c,a.message)}return null};function fh(){}fh.prototype.c=null;function gh(a){return a.c||(a.c=a.b())};var hh;function ih(){}v(ih,fh);ih.prototype.a=function(){var a=jh(this);return a?new ActiveXObject(a):new XMLHttpRequest};ih.prototype.b=function(){var a={};jh(this)&&(a[0]=!0,a[1]=!0);return a};
function jh(a){if(!a.f&&"undefined"==typeof XMLHttpRequest&&"undefined"!=typeof ActiveXObject){for(var b=["MSXML2.XMLHTTP.6.0","MSXML2.XMLHTTP.3.0","MSXML2.XMLHTTP","Microsoft.XMLHTTP"],c=0;c<b.length;c++){var d=b[c];try{return new ActiveXObject(d),a.f=d}catch(e){}}throw Error("Could not create ActiveXObject. ActiveX might be disabled, or MSXML might not be installed");}return a.f}hh=new ih;function kh(){}v(kh,fh);kh.prototype.a=function(){var a=new XMLHttpRequest;if("withCredentials"in a)return a;if("undefined"!=typeof XDomainRequest)return new lh;throw Error("Unsupported browser");};kh.prototype.b=function(){return{}};
function lh(){this.a=new XDomainRequest;this.readyState=0;this.onreadystatechange=null;this.responseType=this.responseText=this.response="";this.status=-1;this.statusText="";this.a.onload=t(this.fc,this);this.a.onerror=t(this.Ib,this);this.a.onprogress=t(this.gc,this);this.a.ontimeout=t(this.kc,this)}k=lh.prototype;k.open=function(a,b,c){if(null!=c&&!c)throw Error("Only async requests are supported.");this.a.open(a,b)};
k.send=function(a){if(a)if("string"==typeof a)this.a.send(a);else throw Error("Only string data is supported");else this.a.send()};k.abort=function(){this.a.abort()};k.setRequestHeader=function(){};k.getResponseHeader=function(a){return"content-type"==a.toLowerCase()?this.a.contentType:""};k.fc=function(){this.status=200;this.response=this.responseText=this.a.responseText;mh(this,4)};k.Ib=function(){this.status=500;this.response=this.responseText="";mh(this,4)};k.kc=function(){this.Ib()};
k.gc=function(){this.status=200;mh(this,1)};function mh(a,b){a.readyState=b;if(a.onreadystatechange)a.onreadystatechange()}k.getAllResponseHeaders=function(){return"content-type: "+this.a.contentType};function nh(a,b,c){this.reset(a,b,c,void 0,void 0)}nh.prototype.a=null;var oh=0;nh.prototype.reset=function(a,b,c,d,e){"number"==typeof e||oh++;d||ua();delete this.a};function ph(a){this.f=a;this.b=this.c=this.a=null}function qh(a,b){this.name=a;this.value=b}qh.prototype.toString=function(){return this.name};var rh=new qh("SEVERE",1E3),sh=new qh("WARNING",900),th=new qh("CONFIG",700),uh=new qh("FINE",500);function vh(a){if(a.c)return a.c;if(a.a)return vh(a.a);ya("Root logger has no level set.");return null}ph.prototype.log=function(a,b,c){if(a.value>=vh(this).value)for(q(b)&&(b=b()),a=new nh(a,String(b),this.f),c&&(a.a=c),c=this;c;)c=c.a};var wh={},xh=null;
function yh(a){xh||(xh=new ph(""),wh[""]=xh,xh.c=th);var b;if(!(b=wh[a])){b=new ph(a);var c=a.lastIndexOf("."),d=a.substr(c+1);c=yh(a.substr(0,c));c.b||(c.b={});c.b[d]=b;b.a=c;wh[a]=b}return b};function zh(a,b){a&&a.log(uh,b,void 0)};function Ah(a){this.f=a}v(Ah,fh);Ah.prototype.a=function(){return new Bh(this.f)};Ah.prototype.b=function(a){return function(){return a}}({});function Bh(a){G.call(this);this.o=a;this.readyState=Ch;this.status=0;this.responseType=this.responseText=this.response=this.statusText="";this.onreadystatechange=null;this.i=new Headers;this.b=null;this.m="GET";this.g="";this.a=!1;this.h=yh("goog.net.FetchXmlHttp");this.l=this.c=this.f=null}v(Bh,G);var Ch=0;k=Bh.prototype;
k.open=function(a,b){if(this.readyState!=Ch)throw this.abort(),Error("Error reopening a connection");this.m=a;this.g=b;this.readyState=1;Dh(this)};k.send=function(a){if(1!=this.readyState)throw this.abort(),Error("need to call open() first. ");this.a=!0;var b={headers:this.i,method:this.m,credentials:void 0,cache:void 0};a&&(b.body=a);this.o.fetch(new Request(this.g,b)).then(this.jc.bind(this),this.Ma.bind(this))};
k.abort=function(){this.response=this.responseText="";this.i=new Headers;this.status=0;this.c&&this.c.cancel("Request was aborted.");1<=this.readyState&&this.a&&4!=this.readyState&&(this.a=!1,Eh(this,!1));this.readyState=Ch};
k.jc=function(a){this.a&&(this.f=a,this.b||(this.b=a.headers,this.readyState=2,Dh(this)),this.a&&(this.readyState=3,Dh(this),this.a&&("arraybuffer"===this.responseType?a.arrayBuffer().then(this.hc.bind(this),this.Ma.bind(this)):"undefined"!==typeof l.ReadableStream&&"body"in a?(this.response=this.responseText="",this.c=a.body.getReader(),this.l=new TextDecoder,Fh(this)):a.text().then(this.ic.bind(this),this.Ma.bind(this)))))};function Fh(a){a.c.read().then(a.ec.bind(a)).catch(a.Ma.bind(a))}
k.ec=function(a){if(this.a){var b=this.l.decode(a.value?a.value:new Uint8Array(0),{stream:!a.done});b&&(this.response=this.responseText+=b);a.done?Eh(this,!0):Dh(this);3==this.readyState&&Fh(this)}};k.ic=function(a){this.a&&(this.response=this.responseText=a,Eh(this,!0))};k.hc=function(a){this.a&&(this.response=a,Eh(this,!0))};k.Ma=function(a){var b=this.h;b&&b.log(sh,"Failed to fetch url "+this.g,a instanceof Error?a:Error(a));this.a&&Eh(this,!0)};
function Eh(a,b){b&&a.f&&(a.status=a.f.status,a.statusText=a.f.statusText);a.readyState=4;a.f=null;a.c=null;a.l=null;Dh(a)}k.setRequestHeader=function(a,b){this.i.append(a,b)};k.getResponseHeader=function(a){return this.b?this.b.get(a.toLowerCase())||"":((a=this.h)&&a.log(sh,"Attempting to get response header but no headers have been received for url: "+this.g,void 0),"")};
k.getAllResponseHeaders=function(){if(!this.b){var a=this.h;a&&a.log(sh,"Attempting to get all response headers but no headers have been received for url: "+this.g,void 0);return""}a=[];for(var b=this.b.entries(),c=b.next();!c.done;)c=c.value,a.push(c[0]+": "+c[1]),c=b.next();return a.join("\r\n")};function Dh(a){a.onreadystatechange&&a.onreadystatechange.call(a)};function Gh(a){G.call(this);this.headers=new rd;this.B=a||null;this.c=!1;this.w=this.a=null;this.h=this.O=this.l="";this.f=this.J=this.i=this.I=!1;this.g=0;this.o=null;this.m=Hh;this.v=this.P=!1}v(Gh,G);var Hh="";Gh.prototype.b=yh("goog.net.XhrIo");var Ih=/^https?$/i,Jh=["POST","PUT"];
function Kh(a,b,c,d,e){if(a.a)throw Error("[goog.net.XhrIo] Object is active with another request="+a.l+"; newUri="+b);c=c?c.toUpperCase():"GET";a.l=b;a.h="";a.O=c;a.I=!1;a.c=!0;a.a=a.B?a.B.a():hh.a();a.w=a.B?gh(a.B):gh(hh);a.a.onreadystatechange=t(a.Lb,a);try{zh(a.b,Lh(a,"Opening Xhr")),a.J=!0,a.a.open(c,String(b),!0),a.J=!1}catch(g){zh(a.b,Lh(a,"Error opening Xhr: "+g.message));Mh(a,g);return}b=d||"";var f=new rd(a.headers);e&&qd(e,function(g,h){f.set(h,g)});e=La(f.X());d=l.FormData&&b instanceof
l.FormData;!Na(Jh,c)||e||d||f.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");f.forEach(function(g,h){this.a.setRequestHeader(h,g)},a);a.m&&(a.a.responseType=a.m);"withCredentials"in a.a&&a.a.withCredentials!==a.P&&(a.a.withCredentials=a.P);try{Nh(a),0<a.g&&(a.v=Oh(a.a),zh(a.b,Lh(a,"Will abort after "+a.g+"ms if incomplete, xhr2 "+a.v)),a.v?(a.a.timeout=a.g,a.a.ontimeout=t(a.Ga,a)):a.o=md(a.Ga,a.g,a)),zh(a.b,Lh(a,"Sending request")),a.i=!0,a.a.send(b),a.i=!1}catch(g){zh(a.b,
Lh(a,"Send error: "+g.message)),Mh(a,g)}}function Oh(a){return uc&&Ec(9)&&"number"==typeof a.timeout&&void 0!==a.ontimeout}function Ma(a){return"content-type"==a.toLowerCase()}k=Gh.prototype;k.Ga=function(){"undefined"!=typeof fa&&this.a&&(this.h="Timed out after "+this.g+"ms, aborting",zh(this.b,Lh(this,this.h)),this.dispatchEvent("timeout"),this.abort(8))};function Mh(a,b){a.c=!1;a.a&&(a.f=!0,a.a.abort(),a.f=!1);a.h=b;Ph(a);Qh(a)}
function Ph(a){a.I||(a.I=!0,a.dispatchEvent("complete"),a.dispatchEvent("error"))}k.abort=function(){this.a&&this.c&&(zh(this.b,Lh(this,"Aborting")),this.c=!1,this.f=!0,this.a.abort(),this.f=!1,this.dispatchEvent("complete"),this.dispatchEvent("abort"),Qh(this))};k.xa=function(){this.a&&(this.c&&(this.c=!1,this.f=!0,this.a.abort(),this.f=!1),Qh(this,!0));Gh.qb.xa.call(this)};k.Lb=function(){this.ta||(this.J||this.i||this.f?Rh(this):this.yc())};k.yc=function(){Rh(this)};
function Rh(a){if(a.c&&"undefined"!=typeof fa)if(a.w[1]&&4==Sh(a)&&2==Th(a))zh(a.b,Lh(a,"Local request error detected and ignored"));else if(a.i&&4==Sh(a))md(a.Lb,0,a);else if(a.dispatchEvent("readystatechange"),4==Sh(a)){zh(a.b,Lh(a,"Request complete"));a.c=!1;try{var b=Th(a);a:switch(b){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var c=!0;break a;default:c=!1}var d;if(!(d=c)){var e;if(e=0===b){var f=String(a.l).match(ud)[1]||null;if(!f&&l.self&&l.self.location){var g=l.self.location.protocol;
f=g.substr(0,g.length-1)}e=!Ih.test(f?f.toLowerCase():"")}d=e}if(d)a.dispatchEvent("complete"),a.dispatchEvent("success");else{try{var h=2<Sh(a)?a.a.statusText:""}catch(m){zh(a.b,"Can not get status: "+m.message),h=""}a.h=h+" ["+Th(a)+"]";Ph(a)}}finally{Qh(a)}}}function Qh(a,b){if(a.a){Nh(a);var c=a.a,d=a.w[0]?ka:null;a.a=null;a.w=null;b||a.dispatchEvent("ready");try{c.onreadystatechange=d}catch(e){(a=a.b)&&a.log(rh,"Problem encountered resetting onreadystatechange: "+e.message,void 0)}}}
function Nh(a){a.a&&a.v&&(a.a.ontimeout=null);a.o&&(l.clearTimeout(a.o),a.o=null)}function Sh(a){return a.a?a.a.readyState:0}function Th(a){try{return 2<Sh(a)?a.a.status:-1}catch(b){return-1}}function Uh(a){try{return a.a?a.a.responseText:""}catch(b){return zh(a.b,"Can not get responseText: "+b.message),""}}
k.getResponse=function(){try{if(!this.a)return null;if("response"in this.a)return this.a.response;switch(this.m){case Hh:case "text":return this.a.responseText;case "arraybuffer":if("mozResponseArrayBuffer"in this.a)return this.a.mozResponseArrayBuffer}var a=this.b;a&&a.log(rh,"Response type "+this.m+" is not supported on this browser",void 0);return null}catch(b){return zh(this.b,"Can not get response: "+b.message),null}};function Lh(a,b){return b+" ["+a.O+" "+a.l+" "+Th(a)+"]"};/*
 Portions of this code are from MochiKit, received by
 The Closure Authors under the MIT license. All other code is Copyright
 2005-2009 The Closure Authors. All Rights Reserved.
*/
function Vh(a){var b=Wh;this.g=[];this.v=b;this.o=a||null;this.f=this.a=!1;this.c=void 0;this.u=this.w=this.i=!1;this.h=0;this.b=null;this.l=0}Vh.prototype.cancel=function(a){if(this.a)this.c instanceof Vh&&this.c.cancel();else{if(this.b){var b=this.b;delete this.b;a?b.cancel(a):(b.l--,0>=b.l&&b.cancel())}this.v?this.v.call(this.o,this):this.u=!0;this.a||(a=new Xh(this),Yh(this),Zh(this,!1,a))}};Vh.prototype.m=function(a,b){this.i=!1;Zh(this,a,b)};function Zh(a,b,c){a.a=!0;a.c=c;a.f=!b;$h(a)}
function Yh(a){if(a.a){if(!a.u)throw new ai(a);a.u=!1}}function bi(a,b){ci(a,null,b,void 0)}function ci(a,b,c,d){a.g.push([b,c,d]);a.a&&$h(a)}Vh.prototype.then=function(a,b,c){var d,e,f=new B(function(g,h){d=g;e=h});ci(this,d,function(g){g instanceof Xh?f.cancel():e(g)});return f.then(a,b,c)};Vh.prototype.$goog_Thenable=!0;function di(a){return Ka(a.g,function(b){return q(b[1])})}
function $h(a){if(a.h&&a.a&&di(a)){var b=a.h,c=ei[b];c&&(l.clearTimeout(c.a),delete ei[b]);a.h=0}a.b&&(a.b.l--,delete a.b);b=a.c;for(var d=c=!1;a.g.length&&!a.i;){var e=a.g.shift(),f=e[0],g=e[1];e=e[2];if(f=a.f?g:f)try{var h=f.call(e||a.o,b);void 0!==h&&(a.f=a.f&&(h==b||h instanceof Error),a.c=b=h);if(va(b)||"function"===typeof l.Promise&&b instanceof l.Promise)d=!0,a.i=!0}catch(m){b=m,a.f=!0,di(a)||(c=!0)}}a.c=b;d&&(h=t(a.m,a,!0),d=t(a.m,a,!1),b instanceof Vh?(ci(b,h,d),b.w=!0):b.then(h,d));c&&(b=
new fi(b),ei[b.a]=b,a.h=b.a)}function ai(){w.call(this)}v(ai,w);ai.prototype.message="Deferred has already fired";ai.prototype.name="AlreadyCalledError";function Xh(){w.call(this)}v(Xh,w);Xh.prototype.message="Deferred was canceled";Xh.prototype.name="CanceledError";function fi(a){this.a=l.setTimeout(t(this.c,this),0);this.b=a}fi.prototype.c=function(){delete ei[this.a];throw this.b;};var ei={};function gi(a){var b={},c=b.document||document,d=db(a).toString(),e=document.createElement("SCRIPT"),f={Nb:e,Ga:void 0},g=new Vh(f),h=null,m=null!=b.timeout?b.timeout:5E3;0<m&&(h=window.setTimeout(function(){hi(e,!0);var p=new ii(ji,"Timeout reached for loading script "+d);Yh(g);Zh(g,!1,p)},m),f.Ga=h);e.onload=e.onreadystatechange=function(){e.readyState&&"loaded"!=e.readyState&&"complete"!=e.readyState||(hi(e,b.gd||!1,h),Yh(g),Zh(g,!0,null))};e.onerror=function(){hi(e,!0,h);var p=new ii(ki,"Error while loading script "+
d);Yh(g);Zh(g,!1,p)};f=b.attributes||{};Wa(f,{type:"text/javascript",charset:"UTF-8"});Wd(e,f);Gb(e,a);li(c).appendChild(e);return g}function li(a){var b;return(b=(a||document).getElementsByTagName("HEAD"))&&0!=b.length?b[0]:a.documentElement}function Wh(){if(this&&this.Nb){var a=this.Nb;a&&"SCRIPT"==a.tagName&&hi(a,!0,this.Ga)}}
function hi(a,b,c){null!=c&&l.clearTimeout(c);a.onload=ka;a.onerror=ka;a.onreadystatechange=ka;b&&window.setTimeout(function(){a&&a.parentNode&&a.parentNode.removeChild(a)},0)}var ki=0,ji=1;function ii(a,b){var c="Jsloader error (code #"+a+")";b&&(c+=": "+b);w.call(this,c);this.code=a}v(ii,w);function mi(a){this.f=a}v(mi,fh);mi.prototype.a=function(){return new this.f};mi.prototype.b=function(){return{}};
function ni(a,b,c){this.c=a;a=b||{};this.l=a.secureTokenEndpoint||"https://securetoken.googleapis.com/v1/token";this.u=a.secureTokenTimeout||oi;this.g=Ua(a.secureTokenHeaders||pi);this.h=a.firebaseEndpoint||"https://www.googleapis.com/identitytoolkit/v3/relyingparty/";this.i=a.firebaseTimeout||qi;this.a=Ua(a.firebaseHeaders||ri);c&&(this.a["X-Client-Version"]=c,this.g["X-Client-Version"]=c);c="Node"==Ae();c=l.XMLHttpRequest||c&&_firebase_app__WEBPACK_IMPORTED_MODULE_0___default.a.INTERNAL.node&&_firebase_app__WEBPACK_IMPORTED_MODULE_0___default.a.INTERNAL.node.XMLHttpRequest;if(!c&&
!ze())throw new M("internal-error","The XMLHttpRequest compatibility library was not found.");this.f=void 0;ze()?this.f=new Ah(self):Be()?this.f=new mi(c):this.f=new kh;this.b=null}var si,lg="idToken",oi=new Pe(3E4,6E4),pi={"Content-Type":"application/x-www-form-urlencoded"},qi=new Pe(3E4,6E4),ri={"Content-Type":"application/json"};function ti(a,b){b?a.a["X-Firebase-Locale"]=b:delete a.a["X-Firebase-Locale"]}
function ui(a,b){b?(a.a["X-Client-Version"]=b,a.g["X-Client-Version"]=b):(delete a.a["X-Client-Version"],delete a.g["X-Client-Version"])}ni.prototype.R=function(){return this.b};function vi(a,b,c,d,e,f,g){ke()||ze()?a=t(a.o,a):(si||(si=new B(function(h,m){wi(h,m)})),a=t(a.m,a));a(b,c,d,e,f,g)}
ni.prototype.o=function(a,b,c,d,e,f){if(ze()&&("undefined"===typeof l.fetch||"undefined"===typeof l.Headers||"undefined"===typeof l.Request))throw new M("operation-not-supported-in-this-environment","fetch, Headers and Request native APIs or equivalent Polyfills must be available to support HTTP requests from a Worker environment.");var g=new Gh(this.f);if(f){g.g=Math.max(0,f);var h=setTimeout(function(){g.dispatchEvent("timeout")},f)}Zc(g,"complete",function(){h&&clearTimeout(h);var m=null;try{m=
JSON.parse(Uh(this))||null}catch(p){m=null}b&&b(m)});ed(g,"ready",function(){h&&clearTimeout(h);pc(this)});ed(g,"timeout",function(){h&&clearTimeout(h);pc(this);b&&b(null)});Kh(g,a,c,d,e)};var xi=new Xa(Ya,"https://apis.google.com/js/client.js?onload=%{onload}"),yi="__fcb"+Math.floor(1E6*Math.random()).toString();
function wi(a,b){if(((window.gapi||{}).client||{}).request)a();else{l[yi]=function(){((window.gapi||{}).client||{}).request?a():b(Error("CORS_UNSUPPORTED"))};var c=eb(xi,{onload:yi});bi(gi(c),function(){b(Error("CORS_UNSUPPORTED"))})}}
ni.prototype.m=function(a,b,c,d,e){var f=this;si.then(function(){window.gapi.client.setApiKey(f.c);var g=window.gapi.auth.getToken();window.gapi.auth.setToken(null);window.gapi.client.request({path:a,method:c,body:d,headers:e,authType:"none",callback:function(h){window.gapi.auth.setToken(g);b&&b(h)}})}).s(function(g){b&&b({error:{message:g&&g.message||"CORS_UNSUPPORTED"}})})};
function zi(a,b){return new B(function(c,d){"refresh_token"==b.grant_type&&b.refresh_token||"authorization_code"==b.grant_type&&b.code?vi(a,a.l+"?key="+encodeURIComponent(a.c),function(e){e?e.error?d(Ai(e)):e.access_token&&e.refresh_token?c(e):d(new M("internal-error")):d(new M("network-request-failed"))},"POST",Pd(b).toString(),a.g,a.u.get()):d(new M("internal-error"))})}
function Bi(a,b,c,d,e,f){var g=Ld(a.h+b);H(g,"key",a.c);f&&H(g,"cb",ua().toString());var h="GET"==c;if(h)for(var m in d)d.hasOwnProperty(m)&&H(g,m,d[m]);return new B(function(p,u){vi(a,g.toString(),function(A){A?A.error?u(Ai(A,e||{})):p(A):u(new M("network-request-failed"))},c,h?void 0:ae(Le(d)),a.a,a.i.get())})}function Ci(a){a=a.email;if(!n(a)||!te.test(a))throw new M("invalid-email");}function Di(a){"email"in a&&Ci(a)}
function Ei(a,b){return P(a,Fi,{identifier:b,continueUri:Ie()?he():"http://localhost"}).then(function(c){return c.signinMethods||[]})}function Gi(a){return P(a,Hi,{}).then(function(b){return b.authorizedDomains||[]})}function Ii(a){if(!a[lg])throw new M("internal-error");}
function Ji(a){if(a.phoneNumber||a.temporaryProof){if(!a.phoneNumber||!a.temporaryProof)throw new M("internal-error");}else{if(!a.sessionInfo)throw new M("missing-verification-id");if(!a.code)throw new M("missing-verification-code");}}ni.prototype.ob=function(){return P(this,Ki,{})};ni.prototype.rb=function(a,b){return P(this,Li,{idToken:a,email:b})};ni.prototype.sb=function(a,b){return P(this,Kg,{idToken:a,password:b})};var Mi={displayName:"DISPLAY_NAME",photoUrl:"PHOTO_URL"};k=ni.prototype;
k.tb=function(a,b){var c={idToken:a},d=[];Sa(Mi,function(e,f){var g=b[f];null===g?d.push(e):f in b&&(c[f]=g)});d.length&&(c.deleteAttribute=d);return P(this,Li,c)};k.kb=function(a,b){a={requestType:"PASSWORD_RESET",email:a};Wa(a,b);return P(this,Ni,a)};k.lb=function(a,b){a={requestType:"EMAIL_SIGNIN",email:a};Wa(a,b);return P(this,Oi,a)};k.jb=function(a,b){a={requestType:"VERIFY_EMAIL",idToken:a};Wa(a,b);return P(this,Pi,a)};function Ug(a,b){return P(a,Qi,b)}k.Va=function(a){return P(this,Ri,a)};
function Si(a,b,c){return P(a,Ti,{idToken:b,deleteProvider:c})}function Ui(a){if(!a.requestUri||!a.sessionId&&!a.postBody&&!a.pendingToken)throw new M("internal-error");}function Vi(a,b){b.oauthIdToken&&b.providerId&&0==b.providerId.indexOf("oidc.")&&!b.pendingToken&&(a.sessionId?b.nonce=a.sessionId:a.postBody&&(a=new Cd(a.postBody),Td(a,"nonce")&&(b.nonce=a.get("nonce"))));return b}
function Wi(a){var b=null;a.needConfirmation?(a.code="account-exists-with-different-credential",b=eh(a)):"FEDERATED_USER_ID_ALREADY_LINKED"==a.errorMessage?(a.code="credential-already-in-use",b=eh(a)):"EMAIL_EXISTS"==a.errorMessage?(a.code="email-already-in-use",b=eh(a)):a.errorMessage&&(b=Xi(a.errorMessage));if(b)throw b;if(!a[lg])throw new M("internal-error");}function ng(a,b){b.returnIdpCredential=!0;return P(a,Yi,b)}function pg(a,b){b.returnIdpCredential=!0;return P(a,Zi,b)}
function qg(a,b){b.returnIdpCredential=!0;b.autoCreate=!1;return P(a,$i,b)}function aj(a){if(!a.oobCode)throw new M("invalid-action-code");}k.$a=function(a,b){return P(this,bj,{oobCode:a,newPassword:b})};k.Ka=function(a){return P(this,cj,{oobCode:a})};k.Xa=function(a){return P(this,dj,{oobCode:a})};
var dj={endpoint:"setAccountInfo",D:aj,fa:"email",F:!0},cj={endpoint:"resetPassword",D:aj,K:function(a){var b=a.requestType;if(!b||!a.email&&"EMAIL_SIGNIN"!=b)throw new M("internal-error");},F:!0},ej={endpoint:"signupNewUser",D:function(a){Ci(a);if(!a.password)throw new M("weak-password");},K:Ii,T:!0,F:!0},Fi={endpoint:"createAuthUri",F:!0},fj={endpoint:"deleteAccount",V:["idToken"]},Ti={endpoint:"setAccountInfo",V:["idToken","deleteProvider"],D:function(a){if(!na(a.deleteProvider))throw new M("internal-error");
}},Hg={endpoint:"emailLinkSignin",V:["email","oobCode"],D:Ci,K:Ii,T:!0,F:!0},Jg={endpoint:"emailLinkSignin",V:["idToken","email","oobCode"],D:Ci,K:Ii,T:!0},gj={endpoint:"getAccountInfo"},Oi={endpoint:"getOobConfirmationCode",V:["requestType"],D:function(a){if("EMAIL_SIGNIN"!=a.requestType)throw new M("internal-error");Ci(a)},fa:"email",F:!0},Pi={endpoint:"getOobConfirmationCode",V:["idToken","requestType"],D:function(a){if("VERIFY_EMAIL"!=a.requestType)throw new M("internal-error");},fa:"email",F:!0},
Ni={endpoint:"getOobConfirmationCode",V:["requestType"],D:function(a){if("PASSWORD_RESET"!=a.requestType)throw new M("internal-error");Ci(a)},fa:"email",F:!0},Hi={wb:!0,endpoint:"getProjectConfig",Kb:"GET"},hj={wb:!0,endpoint:"getRecaptchaParam",Kb:"GET",K:function(a){if(!a.recaptchaSiteKey)throw new M("internal-error");}},bj={endpoint:"resetPassword",D:aj,fa:"email",F:!0},Qi={endpoint:"sendVerificationCode",V:["phoneNumber","recaptchaToken"],fa:"sessionInfo",F:!0},Li={endpoint:"setAccountInfo",V:["idToken"],
D:Di,T:!0},Kg={endpoint:"setAccountInfo",V:["idToken"],D:function(a){Di(a);if(!a.password)throw new M("weak-password");},K:Ii,T:!0},Ki={endpoint:"signupNewUser",K:Ii,T:!0,F:!0},Yi={endpoint:"verifyAssertion",D:Ui,Qa:Vi,K:Wi,T:!0,F:!0},$i={endpoint:"verifyAssertion",D:Ui,Qa:Vi,K:function(a){if(a.errorMessage&&"USER_NOT_FOUND"==a.errorMessage)throw new M("user-not-found");if(a.errorMessage)throw Xi(a.errorMessage);if(!a[lg])throw new M("internal-error");},T:!0,F:!0},Zi={endpoint:"verifyAssertion",D:function(a){Ui(a);
if(!a.idToken)throw new M("internal-error");},Qa:Vi,K:Wi,T:!0},ij={endpoint:"verifyCustomToken",D:function(a){if(!a.token)throw new M("invalid-custom-token");},K:Ii,T:!0,F:!0},Ig={endpoint:"verifyPassword",D:function(a){Ci(a);if(!a.password)throw new M("wrong-password");},K:Ii,T:!0,F:!0},Ri={endpoint:"verifyPhoneNumber",D:Ji,K:Ii,F:!0},Qg={endpoint:"verifyPhoneNumber",D:function(a){if(!a.idToken)throw new M("internal-error");Ji(a)},K:function(a){if(a.temporaryProof)throw a.code="credential-already-in-use",
eh(a);Ii(a)}},Rg={Yb:{USER_NOT_FOUND:"user-not-found"},endpoint:"verifyPhoneNumber",D:Ji,K:Ii,F:!0};
function P(a,b,c){if(!bf(c,b.V))return E(new M("internal-error"));var d=b.Kb||"POST",e;return D(c).then(b.D).then(function(){b.T&&(c.returnSecureToken=!0);b.F&&a.b&&"undefined"===typeof c.tenantId&&(c.tenantId=a.b);return Bi(a,b.endpoint,d,c,b.Yb,b.wb||!1)}).then(function(f){e=f;return b.Qa?b.Qa(c,e):e}).then(b.K).then(function(){if(!b.fa)return e;if(!(b.fa in e))throw new M("internal-error");return e[b.fa]})}function Xi(a){return Ai({error:{errors:[{message:a}],code:400,message:a}})}
function Ai(a,b){var c=(a.error&&a.error.errors&&a.error.errors[0]||{}).reason||"";var d={keyInvalid:"invalid-api-key",ipRefererBlocked:"app-not-authorized"};if(c=d[c]?new M(d[c]):null)return c;c=a.error&&a.error.message||"";d={INVALID_CUSTOM_TOKEN:"invalid-custom-token",CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_EMAIL:"invalid-email",INVALID_PASSWORD:"wrong-password",USER_DISABLED:"user-disabled",
MISSING_PASSWORD:"internal-error",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_OR_INVALID_NONCE:"missing-or-invalid-nonce",INVALID_MESSAGE_PAYLOAD:"invalid-message-payload",INVALID_RECIPIENT_EMAIL:"invalid-recipient-email",INVALID_SENDER:"invalid-sender",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",
EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",INVALID_PROVIDER_ID:"invalid-provider-id",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",CORS_UNSUPPORTED:"cors-unsupported",DYNAMIC_LINK_NOT_ACTIVATED:"dynamic-link-not-activated",INVALID_APP_ID:"invalid-app-id",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",WEAK_PASSWORD:"weak-password",
OPERATION_NOT_ALLOWED:"operation-not-allowed",USER_CANCELLED:"user-cancelled",CAPTCHA_CHECK_FAILED:"captcha-check-failed",INVALID_APP_CREDENTIAL:"invalid-app-credential",INVALID_CODE:"invalid-verification-code",INVALID_PHONE_NUMBER:"invalid-phone-number",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_APP_CREDENTIAL:"missing-app-credential",MISSING_CODE:"missing-verification-code",MISSING_PHONE_NUMBER:"missing-phone-number",MISSING_SESSION_INFO:"missing-verification-id",
QUOTA_EXCEEDED:"quota-exceeded",SESSION_EXPIRED:"code-expired",REJECTED_CREDENTIAL:"rejected-credential",INVALID_CONTINUE_URI:"invalid-continue-uri",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",MISSING_IOS_BUNDLE_ID:"missing-ios-bundle-id",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_DYNAMIC_LINK_DOMAIN:"invalid-dynamic-link-domain",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",INVALID_CERT_HASH:"invalid-cert-hash",UNSUPPORTED_TENANT_OPERATION:"unsupported-tenant-operation",
INVALID_TENANT_ID:"invalid-tenant-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation"};Wa(d,b||{});b=(b=c.match(/^[^\s]+\s*:\s*(.*)$/))&&1<b.length?b[1]:void 0;for(var e in d)if(0===c.indexOf(e))return new M(d[e],b);!b&&a&&(b=Ke(a));return new M("internal-error",b)};function jj(a){this.b=a;this.a=null;this.fb=kj(this)}
function kj(a){return lj().then(function(){return new B(function(b,c){J("gapi.iframes.getContext")().open({where:document.body,url:a.b,messageHandlersFilter:J("gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER"),attributes:{style:{position:"absolute",top:"-100px",width:"1px",height:"1px"}},dontclear:!0},function(d){function e(){clearTimeout(f);b()}a.a=d;a.a.restyle({setHideOnLeave:!1});var f=setTimeout(function(){c(Error("Network Error"))},mj.get());d.ping(e).then(e,function(){c(Error("Network Error"))})})})})}
function nj(a,b){return a.fb.then(function(){return new B(function(c){a.a.send(b.type,b,c,J("gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER"))})})}function oj(a,b){a.fb.then(function(){a.a.register("authEvent",b,J("gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER"))})}var pj=new Xa(Ya,"https://apis.google.com/js/api.js?onload=%{onload}"),qj=new Pe(3E4,6E4),mj=new Pe(5E3,15E3),rj=null;
function lj(){return rj?rj:rj=(new B(function(a,b){function c(){Oe();J("gapi.load")("gapi.iframes",{callback:a,ontimeout:function(){Oe();b(Error("Network Error"))},timeout:qj.get()})}if(J("gapi.iframes.Iframe"))a();else if(J("gapi.load"))c();else{var d="__iframefcb"+Math.floor(1E6*Math.random()).toString();l[d]=function(){J("gapi.load")?c():b(Error("Network Error"))};d=eb(pj,{onload:d});D(gi(d)).s(function(){b(Error("Network Error"))})}})).s(function(a){rj=null;throw a;})};function sj(a,b,c){this.i=a;this.g=b;this.h=c;this.f=null;this.a=Md(this.i,"/__/auth/iframe");H(this.a,"apiKey",this.g);H(this.a,"appName",this.h);this.b=null;this.c=[]}sj.prototype.toString=function(){this.f?H(this.a,"v",this.f):Sd(this.a.a,"v");this.b?H(this.a,"eid",this.b):Sd(this.a.a,"eid");this.c.length?H(this.a,"fw",this.c.join(",")):Sd(this.a.a,"fw");return this.a.toString()};function tj(a,b,c,d,e){this.o=a;this.m=b;this.c=c;this.u=d;this.i=this.g=this.l=null;this.a=e;this.h=this.f=null}
tj.prototype.nb=function(a){this.h=a;return this};
tj.prototype.toString=function(){var a=Md(this.o,"/__/auth/handler");H(a,"apiKey",this.m);H(a,"appName",this.c);H(a,"authType",this.u);if(this.a.isOAuthProvider){var b=this.a;try{var c=_firebase_app__WEBPACK_IMPORTED_MODULE_0___default.a.app(this.c).auth().ha()}catch(h){c=null}b.ab=c;H(a,"providerId",this.a.providerId);b=this.a;c=Le(b.zb);for(var d in c)c[d]=c[d].toString();d=b.Fc;c=Ua(c);for(var e=0;e<d.length;e++){var f=d[e];f in c&&delete c[f]}b.cb&&b.ab&&!c[b.cb]&&(c[b.cb]=b.ab);Ta(c)||H(a,"customParameters",Ke(c))}"function"===typeof this.a.Hb&&
(b=this.a.Hb(),b.length&&H(a,"scopes",b.join(",")));this.l?H(a,"redirectUrl",this.l):Sd(a.a,"redirectUrl");this.g?H(a,"eventId",this.g):Sd(a.a,"eventId");this.i?H(a,"v",this.i):Sd(a.a,"v");if(this.b)for(var g in this.b)this.b.hasOwnProperty(g)&&!Kd(a,g)&&H(a,g,this.b[g]);this.h?H(a,"tid",this.h):Sd(a.a,"tid");this.f?H(a,"eid",this.f):Sd(a.a,"eid");g=uj(this.c);g.length&&H(a,"fw",g.join(","));return a.toString()};function uj(a){try{return _firebase_app__WEBPACK_IMPORTED_MODULE_0___default.a.app(a).auth().Aa()}catch(b){return[]}}
function vj(a,b,c,d,e){this.u=a;this.f=b;this.b=c;this.c=d||null;this.h=e||null;this.m=this.o=this.v=null;this.g=[];this.l=this.a=null}
function wj(a){var b=he();return Gi(a).then(function(c){a:{var d=Ld(b),e=d.f;d=d.b;for(var f=0;f<c.length;f++){var g=c[f];var h=d;var m=e;0==g.indexOf("chrome-extension://")?h=Ld(g).b==h&&"chrome-extension"==m:"http"!=m&&"https"!=m?h=!1:se.test(g)?h=h==g:(g=g.split(".").join("\\."),h=(new RegExp("^(.+\\."+g+"|"+g+")$","i")).test(h));if(h){c=!0;break a}}c=!1}if(!c)throw new ch(he());})}
function xj(a){if(a.l)return a.l;a.l=ue().then(function(){if(!a.o){var b=a.c,c=a.h,d=uj(a.b),e=new sj(a.u,a.f,a.b);e.f=b;e.b=c;e.c=Ra(d||[]);a.o=e.toString()}a.i=new jj(a.o);yj(a)});return a.l}k=vj.prototype;k.Fb=function(a,b,c){var d=new M("popup-closed-by-user"),e=new M("web-storage-unsupported"),f=this,g=!1;return this.ia().then(function(){zj(f).then(function(h){h||(a&&oe(a),b(e),g=!0)})}).s(function(){}).then(function(){if(!g)return re(a)}).then(function(){if(!g)return nd(c).then(function(){b(d)})})};
k.Ob=function(){var a=I();return!Je(a)&&!Ne(a)};k.Jb=function(){return!1};
k.Db=function(a,b,c,d,e,f,g,h){if(!a)return E(new M("popup-blocked"));if(g&&!Je())return this.ia().s(function(p){oe(a);e(p)}),d(),D();this.a||(this.a=wj(Aj(this)));var m=this;return this.a.then(function(){var p=m.ia().s(function(u){oe(a);e(u);throw u;});d();return p}).then(function(){Xg(c);if(!g){var p=Bj(m.u,m.f,m.b,b,c,null,f,m.c,void 0,m.h,h);ie(p,a)}}).s(function(p){"auth/network-request-failed"==p.code&&(m.a=null);throw p;})};
function Aj(a){a.m||(a.v=a.c?Ee(a.c,uj(a.b)):null,a.m=new ni(a.f,Uf(a.h),a.v));return a.m}k.Eb=function(a,b,c,d){this.a||(this.a=wj(Aj(this)));var e=this;return this.a.then(function(){Xg(b);var f=Bj(e.u,e.f,e.b,a,b,he(),c,e.c,void 0,e.h,d);ie(f)}).s(function(f){"auth/network-request-failed"==f.code&&(e.a=null);throw f;})};k.ia=function(){var a=this;return xj(this).then(function(){return a.i.fb}).s(function(){a.a=null;throw new M("network-request-failed");})};k.Rb=function(){return!0};
function Bj(a,b,c,d,e,f,g,h,m,p,u){a=new tj(a,b,c,d,e);a.l=f;a.g=g;a.i=h;a.b=Ua(m||null);a.f=p;return a.nb(u).toString()}function yj(a){if(!a.i)throw Error("IfcHandler must be initialized!");oj(a.i,function(b){var c={};if(b&&b.authEvent){var d=!1;b=Zg(b.authEvent);for(c=0;c<a.g.length;c++)d=a.g[c](b)||d;c={};c.status=d?"ACK":"ERROR";return D(c)}c.status="ERROR";return D(c)})}
function zj(a){var b={type:"webStorageSupport"};return xj(a).then(function(){return nj(a.i,b)}).then(function(c){if(c&&c.length&&"undefined"!==typeof c[0].webStorageSupport)return c[0].webStorageSupport;throw Error();})}k.ya=function(a){this.g.push(a)};k.La=function(a){Pa(this.g,function(b){return b==a})};function Cj(a){this.a=a||_firebase_app__WEBPACK_IMPORTED_MODULE_0___default.a.INTERNAL.reactNative&&_firebase_app__WEBPACK_IMPORTED_MODULE_0___default.a.INTERNAL.reactNative.AsyncStorage;if(!this.a)throw new M("internal-error","The React Native compatibility library was not found.");this.type="asyncStorage"}k=Cj.prototype;k.get=function(a){return D(this.a.getItem(a)).then(function(b){return b&&Me(b)})};k.set=function(a,b){return D(this.a.setItem(a,Ke(b)))};k.S=function(a){return D(this.a.removeItem(a))};k.$=function(){};k.ea=function(){};function Dj(a){this.b=a;this.a={};this.f=t(this.c,this)}var Ej=[];function Fj(){var a=ze()?self:null;x(Ej,function(c){c.b==a&&(b=c)});if(!b){var b=new Dj(a);Ej.push(b)}return b}
Dj.prototype.c=function(a){var b=a.data.eventType,c=a.data.eventId,d=this.a[b];if(d&&0<d.length){a.ports[0].postMessage({status:"ack",eventId:c,eventType:b,response:null});var e=[];x(d,function(f){e.push(D().then(function(){return f(a.origin,a.data.data)}))});bc(e).then(function(f){var g=[];x(f,function(h){g.push({fulfilled:h.Gb,value:h.value,reason:h.reason?h.reason.message:void 0})});x(g,function(h){for(var m in h)"undefined"===typeof h[m]&&delete h[m]});a.ports[0].postMessage({status:"done",eventId:c,
eventType:b,response:g})})}};function Gj(a,b,c){Ta(a.a)&&a.b.addEventListener("message",a.f);"undefined"===typeof a.a[b]&&(a.a[b]=[]);a.a[b].push(c)};function Hj(a){this.a=a}Hj.prototype.postMessage=function(a,b){this.a.postMessage(a,b)};function Ij(a){this.c=a;this.b=!1;this.a=[]}
function Jj(a,b,c,d){var e,f=c||{},g,h,m,p=null;if(a.b)return E(Error("connection_unavailable"));var u=d?800:50,A="undefined"!==typeof MessageChannel?new MessageChannel:null;return(new B(function(C,N){A?(e=Math.floor(Math.random()*Math.pow(10,20)).toString(),A.port1.start(),h=setTimeout(function(){N(Error("unsupported_event"))},u),g=function(wa){wa.data.eventId===e&&("ack"===wa.data.status?(clearTimeout(h),m=setTimeout(function(){N(Error("timeout"))},3E3)):"done"===wa.data.status?(clearTimeout(m),
"undefined"!==typeof wa.data.response?C(wa.data.response):N(Error("unknown_error"))):(clearTimeout(h),clearTimeout(m),N(Error("invalid_response"))))},p={messageChannel:A,onMessage:g},a.a.push(p),A.port1.addEventListener("message",g),a.c.postMessage({eventType:b,eventId:e,data:f},[A.port2])):N(Error("connection_unavailable"))})).then(function(C){Kj(a,p);return C}).s(function(C){Kj(a,p);throw C;})}
function Kj(a,b){if(b){var c=b.messageChannel,d=b.onMessage;c&&(c.port1.removeEventListener("message",d),c.port1.close());Pa(a.a,function(e){return e==b})}}Ij.prototype.close=function(){for(;0<this.a.length;)Kj(this,this.a[0]);this.b=!0};function Lj(){if(!Mj())throw new M("web-storage-unsupported");this.c={};this.a=[];this.b=0;this.u=l.indexedDB;this.type="indexedDB";this.g=this.l=this.f=this.i=null;this.o=!1;this.h=null;var a=this;ze()&&self?(this.l=Fj(),Gj(this.l,"keyChanged",function(b,c){return Nj(a).then(function(d){0<d.length&&x(a.a,function(e){e(d)});return{keyProcessed:Na(d,c.key)}})}),Gj(this.l,"ping",function(){return D(["keyChanged"])})):Ve().then(function(b){if(a.h=b)a.g=new Ij(new Hj(b)),Jj(a.g,"ping",null,!0).then(function(c){c[0].fulfilled&&
Na(c[0].value,"keyChanged")&&(a.o=!0)}).s(function(){})})}var Oj;function Pj(a){return new B(function(b,c){var d=a.u.deleteDatabase("firebaseLocalStorageDb");d.onsuccess=function(){b()};d.onerror=function(e){c(Error(e.target.error))}})}
function Qj(a){return new B(function(b,c){var d=a.u.open("firebaseLocalStorageDb",1);d.onerror=function(e){try{e.preventDefault()}catch(f){}c(Error(e.target.error))};d.onupgradeneeded=function(e){e=e.target.result;try{e.createObjectStore("firebaseLocalStorage",{keyPath:"fbase_key"})}catch(f){c(f)}};d.onsuccess=function(e){e=e.target.result;e.objectStoreNames.contains("firebaseLocalStorage")?b(e):Pj(a).then(function(){return Qj(a)}).then(function(f){b(f)}).s(function(f){c(f)})}})}
function Rj(a){a.m||(a.m=Qj(a));return a.m}function Mj(){try{return!!l.indexedDB}catch(a){return!1}}function Sj(a){return a.objectStore("firebaseLocalStorage")}function Tj(a,b){return a.transaction(["firebaseLocalStorage"],b?"readwrite":"readonly")}function Uj(a){return new B(function(b,c){a.onsuccess=function(d){d&&d.target?b(d.target.result):b()};a.onerror=function(d){c(d.target.error)}})}k=Lj.prototype;
k.set=function(a,b){var c=!1,d,e=this;return Rj(this).then(function(f){d=f;f=Sj(Tj(d,!0));return Uj(f.get(a))}).then(function(f){var g=Sj(Tj(d,!0));if(f)return f.value=b,Uj(g.put(f));e.b++;c=!0;f={};f.fbase_key=a;f.value=b;return Uj(g.add(f))}).then(function(){e.c[a]=b;return Vj(e,a)}).ka(function(){c&&e.b--})};function Vj(a,b){return a.g&&a.h&&Ue()===a.h?Jj(a.g,"keyChanged",{key:b},a.o).then(function(){}).s(function(){}):D()}
k.get=function(a){return Rj(this).then(function(b){return Uj(Sj(Tj(b,!1)).get(a))}).then(function(b){return b&&b.value})};k.S=function(a){var b=!1,c=this;return Rj(this).then(function(d){b=!0;c.b++;return Uj(Sj(Tj(d,!0))["delete"](a))}).then(function(){delete c.c[a];return Vj(c,a)}).ka(function(){b&&c.b--})};
function Nj(a){return Rj(a).then(function(b){var c=Sj(Tj(b,!1));return c.getAll?Uj(c.getAll()):new B(function(d,e){var f=[],g=c.openCursor();g.onsuccess=function(h){(h=h.target.result)?(f.push(h.value),h["continue"]()):d(f)};g.onerror=function(h){e(h.target.error)}})}).then(function(b){var c={},d=[];if(0==a.b){for(d=0;d<b.length;d++)c[b[d].fbase_key]=b[d].value;d=je(a.c,c);a.c=c}return d})}k.$=function(a){0==this.a.length&&Wj(this);this.a.push(a)};
k.ea=function(a){Pa(this.a,function(b){return b==a});0==this.a.length&&Xj(this)};function Wj(a){function b(){a.f=setTimeout(function(){a.i=Nj(a).then(function(c){0<c.length&&x(a.a,function(d){d(c)})}).then(function(){b()}).s(function(c){"STOP_EVENT"!=c.message&&b()})},800)}Xj(a);b()}function Xj(a){a.i&&a.i.cancel("STOP_EVENT");a.f&&(clearTimeout(a.f),a.f=null)};function Yj(a){var b=this,c=null;this.a=[];this.type="indexedDB";this.c=a;this.b=D().then(function(){if(Mj()){var d=Ge(),e="__sak"+d;Oj||(Oj=new Lj);c=Oj;return c.set(e,d).then(function(){return c.get(e)}).then(function(f){if(f!==d)throw Error("indexedDB not supported!");return c.S(e)}).then(function(){return c}).s(function(){return b.c})}return b.c}).then(function(d){b.type=d.type;d.$(function(e){x(b.a,function(f){f(e)})});return d})}k=Yj.prototype;k.get=function(a){return this.b.then(function(b){return b.get(a)})};
k.set=function(a,b){return this.b.then(function(c){return c.set(a,b)})};k.S=function(a){return this.b.then(function(b){return b.S(a)})};k.$=function(a){this.a.push(a)};k.ea=function(a){Pa(this.a,function(b){return b==a})};function Zj(){this.a={};this.type="inMemory"}k=Zj.prototype;k.get=function(a){return D(this.a[a])};k.set=function(a,b){this.a[a]=b;return D()};k.S=function(a){delete this.a[a];return D()};k.$=function(){};k.ea=function(){};function ak(){if(!bk()){if("Node"==Ae())throw new M("internal-error","The LocalStorage compatibility library was not found.");throw new M("web-storage-unsupported");}this.a=ck()||_firebase_app__WEBPACK_IMPORTED_MODULE_0___default.a.INTERNAL.node.localStorage;this.type="localStorage"}function ck(){try{var a=l.localStorage,b=Ge();a&&(a.setItem(b,"1"),a.removeItem(b));return a}catch(c){return null}}
function bk(){var a="Node"==Ae();a=ck()||a&&_firebase_app__WEBPACK_IMPORTED_MODULE_0___default.a.INTERNAL.node&&_firebase_app__WEBPACK_IMPORTED_MODULE_0___default.a.INTERNAL.node.localStorage;if(!a)return!1;try{return a.setItem("__sak","1"),a.removeItem("__sak"),!0}catch(b){return!1}}k=ak.prototype;k.get=function(a){var b=this;return D().then(function(){var c=b.a.getItem(a);return Me(c)})};k.set=function(a,b){var c=this;return D().then(function(){var d=Ke(b);null===d?c.S(a):c.a.setItem(a,d)})};k.S=function(a){var b=this;return D().then(function(){b.a.removeItem(a)})};
k.$=function(a){l.window&&Wc(l.window,"storage",a)};k.ea=function(a){l.window&&fd(l.window,"storage",a)};function dk(){this.type="nullStorage"}k=dk.prototype;k.get=function(){return D(null)};k.set=function(){return D()};k.S=function(){return D()};k.$=function(){};k.ea=function(){};function ek(){if(!fk()){if("Node"==Ae())throw new M("internal-error","The SessionStorage compatibility library was not found.");throw new M("web-storage-unsupported");}this.a=gk()||_firebase_app__WEBPACK_IMPORTED_MODULE_0___default.a.INTERNAL.node.sessionStorage;this.type="sessionStorage"}function gk(){try{var a=l.sessionStorage,b=Ge();a&&(a.setItem(b,"1"),a.removeItem(b));return a}catch(c){return null}}
function fk(){var a="Node"==Ae();a=gk()||a&&_firebase_app__WEBPACK_IMPORTED_MODULE_0___default.a.INTERNAL.node&&_firebase_app__WEBPACK_IMPORTED_MODULE_0___default.a.INTERNAL.node.sessionStorage;if(!a)return!1;try{return a.setItem("__sak","1"),a.removeItem("__sak"),!0}catch(b){return!1}}k=ek.prototype;k.get=function(a){var b=this;return D().then(function(){var c=b.a.getItem(a);return Me(c)})};k.set=function(a,b){var c=this;return D().then(function(){var d=Ke(b);null===d?c.S(a):c.a.setItem(a,d)})};k.S=function(a){var b=this;return D().then(function(){b.a.removeItem(a)})};k.$=function(){};
k.ea=function(){};function hk(){var a={};a.Browser=ik;a.Node=jk;a.ReactNative=kk;a.Worker=lk;this.a=a[Ae()]}var mk,ik={C:ak,Sa:ek},jk={C:ak,Sa:ek},kk={C:Cj,Sa:dk},lk={C:ak,Sa:dk};var nk={$c:"local",NONE:"none",bd:"session"};function ok(a){var b=new M("invalid-persistence-type"),c=new M("unsupported-persistence-type");a:{for(d in nk)if(nk[d]==a){var d=!0;break a}d=!1}if(!d||"string"!==typeof a)throw b;switch(Ae()){case "ReactNative":if("session"===a)throw c;break;case "Node":if("none"!==a)throw c;break;default:if(!Fe()&&"none"!==a)throw c;}}
function pk(){var a=!Ne(I())&&ye()?!0:!1,b=Je(),c=Fe();this.m=a;this.h=b;this.l=c;this.a={};mk||(mk=new hk);a=mk;try{this.g=!ge()&&Te()||!l.indexedDB?new a.a.C:new Yj(ze()?new Zj:new a.a.C)}catch(d){this.g=new Zj,this.h=!0}try{this.i=new a.a.Sa}catch(d){this.i=new Zj}this.u=new Zj;this.f=t(this.Pb,this);this.b={}}var qk;function rk(){qk||(qk=new pk);return qk}function sk(a,b){switch(b){case "session":return a.i;case "none":return a.u;default:return a.g}}
function tk(a,b){return"firebase:"+a.name+(b?":"+b:"")}function uk(a,b,c){var d=tk(b,c),e=sk(a,b.C);return a.get(b,c).then(function(f){var g=null;try{g=Me(l.localStorage.getItem(d))}catch(h){}if(g&&!f)return l.localStorage.removeItem(d),a.set(b,g,c);g&&f&&"localStorage"!=e.type&&l.localStorage.removeItem(d)})}k=pk.prototype;k.get=function(a,b){return sk(this,a.C).get(tk(a,b))};function vk(a,b,c){c=tk(b,c);"local"==b.C&&(a.b[c]=null);return sk(a,b.C).S(c)}
k.set=function(a,b,c){var d=tk(a,c),e=this,f=sk(this,a.C);return f.set(d,b).then(function(){return f.get(d)}).then(function(g){"local"==a.C&&(e.b[d]=g)})};k.addListener=function(a,b,c){a=tk(a,b);this.l&&(this.b[a]=l.localStorage.getItem(a));Ta(this.a)&&(sk(this,"local").$(this.f),this.h||(ge()||!Te())&&l.indexedDB||!this.l||wk(this));this.a[a]||(this.a[a]=[]);this.a[a].push(c)};
k.removeListener=function(a,b,c){a=tk(a,b);this.a[a]&&(Pa(this.a[a],function(d){return d==c}),0==this.a[a].length&&delete this.a[a]);Ta(this.a)&&(sk(this,"local").ea(this.f),xk(this))};function wk(a){xk(a);a.c=setInterval(function(){for(var b in a.a){var c=l.localStorage.getItem(b),d=a.b[b];c!=d&&(a.b[b]=c,c=new Kc({type:"storage",key:b,target:window,oldValue:d,newValue:c,a:!0}),a.Pb(c))}},1E3)}function xk(a){a.c&&(clearInterval(a.c),a.c=null)}
k.Pb=function(a){if(a&&a.f){var b=a.a.key;if(null==b)for(var c in this.a){var d=this.b[c];"undefined"===typeof d&&(d=null);var e=l.localStorage.getItem(c);e!==d&&(this.b[c]=e,this.Za(c))}else if(0==b.indexOf("firebase:")&&this.a[b]){"undefined"!==typeof a.a.a?sk(this,"local").ea(this.f):xk(this);if(this.m)if(c=l.localStorage.getItem(b),d=a.a.newValue,d!==c)null!==d?l.localStorage.setItem(b,d):l.localStorage.removeItem(b);else if(this.b[b]===d&&"undefined"===typeof a.a.a)return;var f=this;c=function(){if("undefined"!==
typeof a.a.a||f.b[b]!==l.localStorage.getItem(b))f.b[b]=l.localStorage.getItem(b),f.Za(b)};uc&&Fc&&10==Fc&&l.localStorage.getItem(b)!==a.a.newValue&&a.a.newValue!==a.a.oldValue?setTimeout(c,10):c()}}else x(a,t(this.Za,this))};k.Za=function(a){this.a[a]&&x(this.a[a],function(b){b()})};function yk(a){this.a=a;this.b=rk()}var zk={name:"authEvent",C:"local"};function Ak(a){return a.b.get(zk,a.a).then(function(b){return Zg(b)})};function Bk(){this.a=rk()};function Ck(){this.b=-1};function Dk(a,b){this.b=Ek;this.f=l.Uint8Array?new Uint8Array(this.b):Array(this.b);this.g=this.c=0;this.a=[];this.i=a;this.h=b;this.l=l.Int32Array?new Int32Array(64):Array(64);void 0!==Fk||(l.Int32Array?Fk=new Int32Array(Gk):Fk=Gk);this.reset()}var Fk;v(Dk,Ck);for(var Ek=64,Hk=Ek-1,Ik=[],Jk=0;Jk<Hk;Jk++)Ik[Jk]=0;var Kk=Qa(128,Ik);Dk.prototype.reset=function(){this.g=this.c=0;this.a=l.Int32Array?new Int32Array(this.h):Ra(this.h)};
function Lk(a){for(var b=a.f,c=a.l,d=0,e=0;e<b.length;)c[d++]=b[e]<<24|b[e+1]<<16|b[e+2]<<8|b[e+3],e=4*d;for(b=16;64>b;b++){e=c[b-15]|0;d=c[b-2]|0;var f=(c[b-16]|0)+((e>>>7|e<<25)^(e>>>18|e<<14)^e>>>3)|0,g=(c[b-7]|0)+((d>>>17|d<<15)^(d>>>19|d<<13)^d>>>10)|0;c[b]=f+g|0}d=a.a[0]|0;e=a.a[1]|0;var h=a.a[2]|0,m=a.a[3]|0,p=a.a[4]|0,u=a.a[5]|0,A=a.a[6]|0;f=a.a[7]|0;for(b=0;64>b;b++){var C=((d>>>2|d<<30)^(d>>>13|d<<19)^(d>>>22|d<<10))+(d&e^d&h^e&h)|0;g=p&u^~p&A;f=f+((p>>>6|p<<26)^(p>>>11|p<<21)^(p>>>25|p<<
7))|0;g=g+(Fk[b]|0)|0;g=f+(g+(c[b]|0)|0)|0;f=A;A=u;u=p;p=m+g|0;m=h;h=e;e=d;d=g+C|0}a.a[0]=a.a[0]+d|0;a.a[1]=a.a[1]+e|0;a.a[2]=a.a[2]+h|0;a.a[3]=a.a[3]+m|0;a.a[4]=a.a[4]+p|0;a.a[5]=a.a[5]+u|0;a.a[6]=a.a[6]+A|0;a.a[7]=a.a[7]+f|0}
function Mk(a,b,c){void 0===c&&(c=b.length);var d=0,e=a.c;if(n(b))for(;d<c;)a.f[e++]=b.charCodeAt(d++),e==a.b&&(Lk(a),e=0);else if(oa(b))for(;d<c;){var f=b[d++];if(!("number"==typeof f&&0<=f&&255>=f&&f==(f|0)))throw Error("message must be a byte array");a.f[e++]=f;e==a.b&&(Lk(a),e=0)}else throw Error("message must be string or array");a.c=e;a.g+=c}
var Gk=[1116352408,1899447441,3049323471,3921009573,961987163,1508970993,2453635748,2870763221,3624381080,310598401,607225278,1426881987,1925078388,2162078206,2614888103,3248222580,3835390401,4022224774,264347078,604807628,770255983,1249150122,1555081692,1996064986,2554220882,2821834349,2952996808,3210313671,3336571891,3584528711,113926993,338241895,666307205,773529912,1294757372,1396182291,1695183700,1986661051,2177026350,2456956037,2730485921,2820302411,3259730800,3345764771,3516065817,3600352804,
4094571909,275423344,430227734,506948616,659060556,883997877,958139571,1322822218,1537002063,1747873779,1955562222,2024104815,2227730452,2361852424,2428436474,2756734187,3204031479,3329325298];function Nk(){Dk.call(this,8,Ok)}v(Nk,Dk);var Ok=[1779033703,3144134277,1013904242,2773480762,1359893119,2600822924,528734635,1541459225];function Pk(a,b,c,d,e){this.u=a;this.i=b;this.l=c;this.m=d||null;this.o=e||null;this.h=b+":"+c;this.v=new Bk;this.g=new yk(this.h);this.f=null;this.b=[];this.a=this.c=null}function Qk(a){return new M("invalid-cordova-configuration",a)}k=Pk.prototype;
k.ia=function(){return this.Ba?this.Ba:this.Ba=ve().then(function(){if("function"!==typeof J("universalLinks.subscribe",l))throw Qk("cordova-universal-links-plugin-fix is not installed");if("undefined"===typeof J("BuildInfo.packageName",l))throw Qk("cordova-plugin-buildinfo is not installed");if("function"!==typeof J("cordova.plugins.browsertab.openUrl",l))throw Qk("cordova-plugin-browsertab is not installed");if("function"!==typeof J("cordova.InAppBrowser.open",l))throw Qk("cordova-plugin-inappbrowser is not installed");
},function(){throw new M("cordova-not-ready");})};function Rk(){for(var a=20,b=[];0<a;)b.push("1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(Math.floor(62*Math.random()))),a--;return b.join("")}function Sk(a){var b=new Nk;Mk(b,a);a=[];var c=8*b.g;56>b.c?Mk(b,Kk,56-b.c):Mk(b,Kk,b.b-(b.c-56));for(var d=63;56<=d;d--)b.f[d]=c&255,c/=256;Lk(b);for(d=c=0;d<b.i;d++)for(var e=24;0<=e;e-=8)a[c++]=b.a[d]>>e&255;return Kf(a)}
k.Fb=function(a,b){b(new M("operation-not-supported-in-this-environment"));return D()};k.Db=function(){return E(new M("operation-not-supported-in-this-environment"))};k.Rb=function(){return!1};k.Ob=function(){return!0};k.Jb=function(){return!0};
k.Eb=function(a,b,c,d){if(this.c)return E(new M("redirect-operation-pending"));var e=this,f=l.document,g=null,h=null,m=null,p=null;return this.c=D().then(function(){Xg(b);return Tk(e)}).then(function(){return Uk(e,a,b,c,d)}).then(function(){return(new B(function(u,A){h=function(){var C=J("cordova.plugins.browsertab.close",l);u();"function"===typeof C&&C();e.a&&"function"===typeof e.a.close&&(e.a.close(),e.a=null);return!1};e.ya(h);m=function(){g||(g=nd(2E3).then(function(){A(new M("redirect-cancelled-by-user"))}))};
p=function(){Qe()&&m()};f.addEventListener("resume",m,!1);I().toLowerCase().match(/android/)||f.addEventListener("visibilitychange",p,!1)})).s(function(u){return Vk(e).then(function(){throw u;})})}).ka(function(){m&&f.removeEventListener("resume",m,!1);p&&f.removeEventListener("visibilitychange",p,!1);g&&g.cancel();h&&e.La(h);e.c=null})};
function Uk(a,b,c,d,e){var f=Rk(),g=new Yg(b,d,null,f,new M("no-auth-event"),null,e),h=J("BuildInfo.packageName",l);if("string"!==typeof h)throw new M("invalid-cordova-configuration");var m=J("BuildInfo.displayName",l),p={};if(I().toLowerCase().match(/iphone|ipad|ipod/))p.ibi=h;else if(I().toLowerCase().match(/android/))p.apn=h;else return E(new M("operation-not-supported-in-this-environment"));m&&(p.appDisplayName=m);f=Sk(f);p.sessionId=f;var u=Bj(a.u,a.i,a.l,b,c,null,d,a.m,p,a.o,e);return a.ia().then(function(){var A=
a.h;return a.v.a.set(zk,g.A(),A)}).then(function(){var A=J("cordova.plugins.browsertab.isAvailable",l);if("function"!==typeof A)throw new M("invalid-cordova-configuration");var C=null;A(function(N){if(N){C=J("cordova.plugins.browsertab.openUrl",l);if("function"!==typeof C)throw new M("invalid-cordova-configuration");C(u)}else{C=J("cordova.InAppBrowser.open",l);if("function"!==typeof C)throw new M("invalid-cordova-configuration");N=I();a.a=C(u,N.match(/(iPad|iPhone|iPod).*OS 7_\d/i)||N.match(/(iPad|iPhone|iPod).*OS 8_\d/i)?
"_blank":"_system","location=yes")}})})}function Wk(a,b){for(var c=0;c<a.b.length;c++)try{a.b[c](b)}catch(d){}}function Tk(a){a.f||(a.f=a.ia().then(function(){return new B(function(b){function c(d){b(d);a.La(c);return!1}a.ya(c);Xk(a)})}));return a.f}function Vk(a){var b=null;return Ak(a.g).then(function(c){b=c;c=a.g;return vk(c.b,zk,c.a)}).then(function(){return b})}
function Xk(a){function b(g){d=!0;e&&e.cancel();Vk(a).then(function(h){var m=c;if(h&&g&&g.url){var p=null;m=ig(g.url);-1!=m.indexOf("/__/auth/callback")&&(p=Ld(m),p=Me(Kd(p,"firebaseError")||null),p=(p="object"===typeof p?pf(p):null)?new Yg(h.c,h.b,null,null,p,null,h.R()):new Yg(h.c,h.b,m,h.f,null,null,h.R()));m=p||c}Wk(a,m)})}var c=new Yg("unknown",null,null,null,new M("no-auth-event")),d=!1,e=nd(500).then(function(){return Vk(a).then(function(){d||Wk(a,c)})}),f=l.handleOpenURL;l.handleOpenURL=function(g){0==
g.toLowerCase().indexOf(J("BuildInfo.packageName",l).toLowerCase()+"://")&&b({url:g});if("function"===typeof f)try{f(g)}catch(h){console.error(h)}};ah||(ah=new $g);bh(b)}k.ya=function(a){this.b.push(a);Tk(this).s(function(b){"auth/invalid-cordova-configuration"===b.code&&(b=new Yg("unknown",null,null,null,new M("no-auth-event")),a(b))})};k.La=function(a){Pa(this.b,function(b){return b==a})};function Yk(a){this.a=a;this.b=rk()}var Zk={name:"pendingRedirect",C:"session"};function $k(a){return a.b.set(Zk,"pending",a.a)}function al(a){return vk(a.b,Zk,a.a)}function bl(a){return a.b.get(Zk,a.a).then(function(b){return"pending"==b})};function cl(a,b,c){this.i={};this.v=0;this.B=a;this.u=b;this.m=c;this.h=[];this.f=!1;this.l=t(this.o,this);this.b=new dl;this.w=new el;this.g=new Yk(this.u+":"+this.m);this.c={};this.c.unknown=this.b;this.c.signInViaRedirect=this.b;this.c.linkViaRedirect=this.b;this.c.reauthViaRedirect=this.b;this.c.signInViaPopup=this.w;this.c.linkViaPopup=this.w;this.c.reauthViaPopup=this.w;this.a=fl(this.B,this.u,this.m,Vf)}
function fl(a,b,c,d){var e=_firebase_app__WEBPACK_IMPORTED_MODULE_0___default.a.SDK_VERSION||null;return we()?new Pk(a,b,c,e,d):new vj(a,b,c,e,d)}cl.prototype.reset=function(){this.f=!1;this.a.La(this.l);this.a=fl(this.B,this.u,this.m);this.i={}};function gl(a){a.f||(a.f=!0,a.a.ya(a.l));var b=a.a;return a.a.ia().s(function(c){a.a==b&&a.reset();throw c;})}function hl(a){a.a.Ob()&&gl(a).s(function(b){var c=new Yg("unknown",null,null,null,new M("operation-not-supported-in-this-environment"));il(b)&&a.o(c)});a.a.Jb()||jl(a.b)}
function kl(a,b){Na(a.h,b)||a.h.push(b);a.f||bl(a.g).then(function(c){c?al(a.g).then(function(){gl(a).s(function(d){var e=new Yg("unknown",null,null,null,new M("operation-not-supported-in-this-environment"));il(d)&&a.o(e)})}):hl(a)}).s(function(){hl(a)})}function ll(a,b){Pa(a.h,function(c){return c==b})}
cl.prototype.o=function(a){if(!a)throw new M("invalid-auth-event");6E5<=ua()-this.v&&(this.i={},this.v=0);if(a&&a.getUid()&&this.i.hasOwnProperty(a.getUid()))return!1;for(var b=!1,c=0;c<this.h.length;c++){var d=this.h[c];if(d.xb(a.c,a.b)){if(b=this.c[a.c])b.h(a,d),a&&(a.f||a.b)&&(this.i[a.getUid()]=!0,this.v=ua());b=!0;break}}jl(this.b);return b};var ml=new Pe(2E3,1E4),nl=new Pe(3E4,6E4);cl.prototype.oa=function(){return this.b.oa()};
function ol(a,b,c,d,e,f,g){return a.a.Db(b,c,d,function(){a.f||(a.f=!0,a.a.ya(a.l))},function(){a.reset()},e,f,g)}function il(a){return a&&"auth/cordova-not-ready"==a.code?!0:!1}
function pl(a,b,c,d,e){var f;return $k(a.g).then(function(){return a.a.Eb(b,c,d,e).s(function(g){if(il(g))throw new M("operation-not-supported-in-this-environment");f=g;return al(a.g).then(function(){throw f;})}).then(function(){return a.a.Rb()?new B(function(){}):al(a.g).then(function(){return a.oa()}).then(function(){}).s(function(){})})})}function ql(a,b,c,d,e){return a.a.Fb(d,function(f){b.ja(c,null,f,e)},ml.get())}var rl={};
function sl(a,b,c){var d=b+":"+c;rl[d]||(rl[d]=new cl(a,b,c));return rl[d]}function dl(){this.b=null;this.f=[];this.c=[];this.a=null;this.i=this.g=!1}dl.prototype.reset=function(){this.b=null;this.a&&(this.a.cancel(),this.a=null)};
dl.prototype.h=function(a,b){if(a){this.reset();this.g=!0;var c=a.c,d=a.b,e=a.a&&"auth/web-storage-unsupported"==a.a.code,f=a.a&&"auth/operation-not-supported-in-this-environment"==a.a.code;this.i=!(!e&&!f);"unknown"!=c||e||f?a.a?(tl(this,!0,null,a.a),D()):b.za(c,d)?ul(this,a,b):E(new M("invalid-auth-event")):(tl(this,!1,null,null),D())}else E(new M("invalid-auth-event"))};function jl(a){a.g||(a.g=!0,tl(a,!1,null,null))}function vl(a){a.g&&!a.i&&tl(a,!1,null,null)}
function ul(a,b,c){c=c.za(b.c,b.b);var d=b.g,e=b.f,f=b.i,g=b.R(),h=!!b.c.match(/Redirect$/);c(d,e,g,f).then(function(m){tl(a,h,m,null)}).s(function(m){tl(a,h,null,m)})}function wl(a,b){a.b=function(){return E(b)};if(a.c.length)for(var c=0;c<a.c.length;c++)a.c[c](b)}function xl(a,b){a.b=function(){return D(b)};if(a.f.length)for(var c=0;c<a.f.length;c++)a.f[c](b)}function tl(a,b,c,d){b?d?wl(a,d):xl(a,c):xl(a,{user:null});a.f=[];a.c=[]}
dl.prototype.oa=function(){var a=this;return new B(function(b,c){a.b?a.b().then(b,c):(a.f.push(b),a.c.push(c),yl(a))})};function yl(a){var b=new M("timeout");a.a&&a.a.cancel();a.a=nd(nl.get()).then(function(){a.b||(a.g=!0,tl(a,!0,null,b))})}function el(){}el.prototype.h=function(a,b){if(a){var c=a.c,d=a.b;a.a?(b.ja(a.c,null,a.a,a.b),D()):b.za(c,d)?zl(a,b):E(new M("invalid-auth-event"))}else E(new M("invalid-auth-event"))};
function zl(a,b){var c=a.b,d=a.c;b.za(d,c)(a.g,a.f,a.R(),a.i).then(function(e){b.ja(d,e,null,c)}).s(function(e){b.ja(d,null,e,c)})};function Al(){this.vb=!1;Object.defineProperty(this,"appVerificationDisabled",{get:function(){return this.vb},set:function(a){this.vb=a},enumerable:!1})};function Bl(a,b){this.a=b;K(this,"verificationId",a)}Bl.prototype.confirm=function(a){a=Vg(this.verificationId,a);return this.a(a)};function Cl(a,b,c,d){return(new Tg(a)).Va(b,c).then(function(e){return new Bl(e,d)})};function Dl(a){var b=Sf(a);if(!(b&&b.exp&&b.auth_time&&b.iat))throw new M("internal-error","An internal error occurred. The token obtained by Firebase appears to be malformed. Please retry the operation.");L(this,{token:a,expirationTime:Se(1E3*b.exp),authTime:Se(1E3*b.auth_time),issuedAtTime:Se(1E3*b.iat),signInProvider:b.firebase&&b.firebase.sign_in_provider?b.firebase.sign_in_provider:null,claims:b})};function El(a,b,c){this.h=a;this.i=b;this.g=c;this.c=3E4;this.f=96E4;this.b=null;this.a=this.c;if(this.f<this.c)throw Error("Proactive refresh lower bound greater than upper bound!");}El.prototype.start=function(){this.a=this.c;Fl(this,!0)};function Gl(a,b){if(b)return a.a=a.c,a.g();b=a.a;a.a*=2;a.a>a.f&&(a.a=a.f);return b}function Fl(a,b){a.stop();a.b=nd(Gl(a,b)).then(function(){return Re()}).then(function(){return a.h()}).then(function(){Fl(a,!0)}).s(function(c){a.i(c)&&Fl(a,!1)})}
El.prototype.stop=function(){this.b&&(this.b.cancel(),this.b=null)};function Hl(a){this.f=a;this.b=this.a=null;this.c=0}Hl.prototype.A=function(){return{apiKey:this.f.c,refreshToken:this.a,accessToken:this.b,expirationTime:this.c}};function Il(a,b){var c=b[lg],d=b.refreshToken;b=Jl(b.expiresIn);a.b=c;a.c=b;a.a=d}function Kl(a,b){a.b=b.b;a.a=b.a;a.c=b.c}function Jl(a){return ua()+1E3*parseInt(a,10)}
function Ll(a,b){return zi(a.f,b).then(function(c){a.b=c.access_token;a.c=Jl(c.expires_in);a.a=c.refresh_token;return{accessToken:a.b,expirationTime:a.c,refreshToken:a.a}}).s(function(c){"auth/user-token-expired"==c.code&&(a.a=null);throw c;})}Hl.prototype.getToken=function(a){a=!!a;return this.b&&!this.a?E(new M("user-token-expired")):a||!this.b||ua()>this.c-3E4?this.a?Ll(this,{grant_type:"refresh_token",refresh_token:this.a}):D(null):D({accessToken:this.b,expirationTime:this.c,refreshToken:this.a})};function Ml(a,b){this.a=a||null;this.b=b||null;L(this,{lastSignInTime:Se(b||null),creationTime:Se(a||null)})}function Nl(a){return new Ml(a.a,a.b)}Ml.prototype.A=function(){return{lastLoginAt:this.b,createdAt:this.a}};function Ol(a,b,c,d,e,f){L(this,{uid:a,displayName:d||null,photoURL:e||null,email:c||null,phoneNumber:f||null,providerId:b})}function Pl(a,b){F.call(this,a);for(var c in b)this[c]=b[c]}v(Pl,F);
function Q(a,b,c){this.I=[];this.l=a.apiKey;this.m=a.appName;this.o=a.authDomain||null;a=_firebase_app__WEBPACK_IMPORTED_MODULE_0___default.a.SDK_VERSION?Ee(_firebase_app__WEBPACK_IMPORTED_MODULE_0___default.a.SDK_VERSION):null;this.a=new ni(this.l,Uf(Vf),a);this.b=new Hl(this.a);Ql(this,b[lg]);Il(this.b,b);K(this,"refreshToken",this.b.a);Rl(this,c||{});G.call(this);this.J=!1;this.o&&He()&&(this.i=sl(this.o,this.l,this.m));this.O=[];this.h=null;this.w=Sl(this);this.W=t(this.Ha,this);var d=this;this.ga=null;this.va=function(e){d.sa(e.g)};this.Z=null;this.P=[];this.ua=function(e){Tl(d,
e.c)};this.Y=null}v(Q,G);Q.prototype.sa=function(a){this.ga=a;ti(this.a,a)};Q.prototype.ha=function(){return this.ga};function Ul(a,b){a.Z&&fd(a.Z,"languageCodeChanged",a.va);(a.Z=b)&&Wc(b,"languageCodeChanged",a.va)}function Tl(a,b){a.P=b;ui(a.a,_firebase_app__WEBPACK_IMPORTED_MODULE_0___default.a.SDK_VERSION?Ee(_firebase_app__WEBPACK_IMPORTED_MODULE_0___default.a.SDK_VERSION,a.P):null)}Q.prototype.Aa=function(){return Ra(this.P)};function Vl(a,b){a.Y&&fd(a.Y,"frameworkChanged",a.ua);(a.Y=b)&&Wc(b,"frameworkChanged",a.ua)}Q.prototype.Ha=function(){this.w.b&&(this.w.stop(),this.w.start())};
function Wl(a){try{return _firebase_app__WEBPACK_IMPORTED_MODULE_0___default.a.app(a.m).auth()}catch(b){throw new M("internal-error","No firebase.auth.Auth instance is available for the Firebase App '"+a.m+"'!");}}function Sl(a){return new El(function(){return a.G(!0)},function(b){return b&&"auth/network-request-failed"==b.code?!0:!1},function(){var b=a.b.c-ua()-3E5;return 0<b?b:0})}function Xl(a){a.B||a.w.b||(a.w.start(),fd(a,"tokenChanged",a.W),Wc(a,"tokenChanged",a.W))}function Yl(a){fd(a,"tokenChanged",a.W);a.w.stop()}
function Ql(a,b){a.ma=b;K(a,"_lat",b)}function Zl(a,b){Pa(a.O,function(c){return c==b})}function $l(a){for(var b=[],c=0;c<a.O.length;c++)b.push(a.O[c](a));return bc(b).then(function(){return a})}function am(a){a.i&&!a.J&&(a.J=!0,kl(a.i,a))}
function Rl(a,b){L(a,{uid:b.uid,displayName:b.displayName||null,photoURL:b.photoURL||null,email:b.email||null,emailVerified:b.emailVerified||!1,phoneNumber:b.phoneNumber||null,isAnonymous:b.isAnonymous||!1,tenantId:b.tenantId||null,metadata:new Ml(b.createdAt,b.lastLoginAt),providerData:[]});a.a.b=a.tenantId}K(Q.prototype,"providerId","firebase");function bm(){}function cm(a){return D().then(function(){if(a.B)throw new M("app-deleted");})}
function dm(a){return Ja(a.providerData,function(b){return b.providerId})}function em(a,b){b&&(fm(a,b.providerId),a.providerData.push(b))}function fm(a,b){Pa(a.providerData,function(c){return c.providerId==b})}function gm(a,b,c){("uid"!=b||c)&&a.hasOwnProperty(b)&&K(a,b,c)}
function hm(a,b){a!=b&&(L(a,{uid:b.uid,displayName:b.displayName,photoURL:b.photoURL,email:b.email,emailVerified:b.emailVerified,phoneNumber:b.phoneNumber,isAnonymous:b.isAnonymous,tenantId:b.tenantId,providerData:[]}),b.metadata?K(a,"metadata",Nl(b.metadata)):K(a,"metadata",new Ml),x(b.providerData,function(c){em(a,c)}),Kl(a.b,b.b),K(a,"refreshToken",a.b.a))}k=Q.prototype;k.reload=function(){var a=this;return R(this,cm(this).then(function(){return im(a).then(function(){return $l(a)}).then(bm)}))};
function im(a){return a.G().then(function(b){var c=a.isAnonymous;return jm(a,b).then(function(){c||gm(a,"isAnonymous",!1);return b})})}k.dc=function(a){return this.G(a).then(function(b){return new Dl(b)})};k.G=function(a){var b=this;return R(this,cm(this).then(function(){return b.b.getToken(a)}).then(function(c){if(!c)throw new M("internal-error");c.accessToken!=b.ma&&(Ql(b,c.accessToken),b.dispatchEvent(new Pl("tokenChanged")));gm(b,"refreshToken",c.refreshToken);return c.accessToken}))};
function km(a,b){b[lg]&&a.ma!=b[lg]&&(Il(a.b,b),a.dispatchEvent(new Pl("tokenChanged")),Ql(a,b[lg]),gm(a,"refreshToken",a.b.a))}function jm(a,b){return P(a.a,gj,{idToken:b}).then(t(a.zc,a))}
k.zc=function(a){a=a.users;if(!a||!a.length)throw new M("internal-error");a=a[0];Rl(this,{uid:a.localId,displayName:a.displayName,photoURL:a.photoUrl,email:a.email,emailVerified:!!a.emailVerified,phoneNumber:a.phoneNumber,lastLoginAt:a.lastLoginAt,createdAt:a.createdAt,tenantId:a.tenantId});for(var b=lm(a),c=0;c<b.length;c++)em(this,b[c]);gm(this,"isAnonymous",!(this.email&&a.passwordHash)&&!(this.providerData&&this.providerData.length))};
function lm(a){return(a=a.providerUserInfo)&&a.length?Ja(a,function(b){return new Ol(b.rawId,b.providerId,b.email,b.displayName,b.photoUrl,b.phoneNumber)}):[]}k.Ac=function(a){Xe("firebase.User.prototype.reauthenticateAndRetrieveDataWithCredential is deprecated. Please use firebase.User.prototype.reauthenticateWithCredential instead.");return this.gb(a)};
k.gb=function(a){var b=this,c=null;return R(this,a.f(this.a,this.uid).then(function(d){km(b,d);c=mm(b,d,"reauthenticate");b.h=null;return b.reload()}).then(function(){return c}),!0)};function nm(a,b){return im(a).then(function(){if(Na(dm(a),b))return $l(a).then(function(){throw new M("provider-already-linked");})})}k.rc=function(a){Xe("firebase.User.prototype.linkAndRetrieveDataWithCredential is deprecated. Please use firebase.User.prototype.linkWithCredential instead.");return this.eb(a)};
k.eb=function(a){var b=this,c=null;return R(this,nm(this,a.providerId).then(function(){return b.G()}).then(function(d){return a.b(b.a,d)}).then(function(d){c=mm(b,d,"link");return om(b,d)}).then(function(){return c}))};k.sc=function(a,b){var c=this;return R(this,nm(this,"phone").then(function(){return Cl(Wl(c),a,b,t(c.eb,c))}))};k.Bc=function(a,b){var c=this;return R(this,D().then(function(){return Cl(Wl(c),a,b,t(c.gb,c))}),!0)};
function mm(a,b,c){var d=Wg(b);b=$f(b);return $e({user:a,credential:d,additionalUserInfo:b,operationType:c})}function om(a,b){km(a,b);return a.reload().then(function(){return a})}k.rb=function(a){var b=this;return R(this,this.G().then(function(c){return b.a.rb(c,a)}).then(function(c){km(b,c);return b.reload()}))};k.Sc=function(a){var b=this;return R(this,this.G().then(function(c){return a.b(b.a,c)}).then(function(c){km(b,c);return b.reload()}))};
k.sb=function(a){var b=this;return R(this,this.G().then(function(c){return b.a.sb(c,a)}).then(function(c){km(b,c);return b.reload()}))};
k.tb=function(a){if(void 0===a.displayName&&void 0===a.photoURL)return cm(this);var b=this;return R(this,this.G().then(function(c){return b.a.tb(c,{displayName:a.displayName,photoUrl:a.photoURL})}).then(function(c){km(b,c);gm(b,"displayName",c.displayName||null);gm(b,"photoURL",c.photoUrl||null);x(b.providerData,function(d){"password"===d.providerId&&(K(d,"displayName",b.displayName),K(d,"photoURL",b.photoURL))});return $l(b)}).then(bm))};
k.Qc=function(a){var b=this;return R(this,im(this).then(function(c){return Na(dm(b),a)?Si(b.a,c,[a]).then(function(d){var e={};x(d.providerUserInfo||[],function(f){e[f.providerId]=!0});x(dm(b),function(f){e[f]||fm(b,f)});e[Tg.PROVIDER_ID]||K(b,"phoneNumber",null);return $l(b)}):$l(b).then(function(){throw new M("no-such-provider");})}))};
k.delete=function(){var a=this;return R(this,this.G().then(function(b){return P(a.a,fj,{idToken:b})}).then(function(){a.dispatchEvent(new Pl("userDeleted"))})).then(function(){for(var b=0;b<a.I.length;b++)a.I[b].cancel("app-deleted");Ul(a,null);Vl(a,null);a.I=[];a.B=!0;Yl(a);K(a,"refreshToken",null);a.i&&ll(a.i,a)})};
k.xb=function(a,b){return"linkViaPopup"==a&&(this.g||null)==b&&this.f||"reauthViaPopup"==a&&(this.g||null)==b&&this.f||"linkViaRedirect"==a&&(this.ca||null)==b||"reauthViaRedirect"==a&&(this.ca||null)==b?!0:!1};k.ja=function(a,b,c,d){"linkViaPopup"!=a&&"reauthViaPopup"!=a||d!=(this.g||null)||(c&&this.v?this.v(c):b&&!c&&this.f&&this.f(b),this.c&&(this.c.cancel(),this.c=null),delete this.f,delete this.v)};
k.za=function(a,b){return"linkViaPopup"==a&&b==(this.g||null)?t(this.Bb,this):"reauthViaPopup"==a&&b==(this.g||null)?t(this.Cb,this):"linkViaRedirect"==a&&(this.ca||null)==b?t(this.Bb,this):"reauthViaRedirect"==a&&(this.ca||null)==b?t(this.Cb,this):null};k.tc=function(a){var b=this;return pm(this,"linkViaPopup",a,function(){return nm(b,a.providerId).then(function(){return $l(b)})},!1)};k.Cc=function(a){return pm(this,"reauthViaPopup",a,function(){return D()},!0)};
function pm(a,b,c,d,e){if(!He())return E(new M("operation-not-supported-in-this-environment"));if(a.h&&!e)return E(a.h);var f=Zf(c.providerId),g=Ge(a.uid+":::"),h=null;(!Je()||ye())&&a.o&&c.isOAuthProvider&&(h=Bj(a.o,a.l,a.m,b,c,null,g,_firebase_app__WEBPACK_IMPORTED_MODULE_0___default.a.SDK_VERSION||null,null,null,a.tenantId));var m=pe(h,f&&f.Da,f&&f.Ca);d=d().then(function(){qm(a);if(!e)return a.G().then(function(){})}).then(function(){return ol(a.i,m,b,c,g,!!h,a.tenantId)}).then(function(){return new B(function(p,u){a.ja(b,null,new M("cancelled-popup-request"),
a.g||null);a.f=p;a.v=u;a.g=g;a.c=ql(a.i,a,b,m,g)})}).then(function(p){m&&oe(m);return p?$e(p):null}).s(function(p){m&&oe(m);throw p;});return R(a,d,e)}k.uc=function(a){var b=this;return rm(this,"linkViaRedirect",a,function(){return nm(b,a.providerId)},!1)};k.Dc=function(a){return rm(this,"reauthViaRedirect",a,function(){return D()},!0)};
function rm(a,b,c,d,e){if(!He())return E(new M("operation-not-supported-in-this-environment"));if(a.h&&!e)return E(a.h);var f=null,g=Ge(a.uid+":::");d=d().then(function(){qm(a);if(!e)return a.G().then(function(){})}).then(function(){a.ca=g;return $l(a)}).then(function(h){a.da&&(h=a.da,h=h.b.set(sm,a.A(),h.a));return h}).then(function(){return pl(a.i,b,c,g,a.tenantId)}).s(function(h){f=h;if(a.da)return tm(a.da);throw f;}).then(function(){if(f)throw f;});return R(a,d,e)}
function qm(a){if(!a.i||!a.J){if(a.i&&!a.J)throw new M("internal-error");throw new M("auth-domain-config-required");}}k.Bb=function(a,b,c,d){var e=this;this.c&&(this.c.cancel(),this.c=null);var f=null;c=this.G().then(function(g){return pg(e.a,{requestUri:a,postBody:d,sessionId:b,idToken:g})}).then(function(g){f=mm(e,g,"link");return om(e,g)}).then(function(){return f});return R(this,c)};
k.Cb=function(a,b,c,d){var e=this;this.c&&(this.c.cancel(),this.c=null);var f=null,g=D().then(function(){return kg(qg(e.a,{requestUri:a,sessionId:b,postBody:d,tenantId:c}),e.uid)}).then(function(h){f=mm(e,h,"reauthenticate");km(e,h);e.h=null;return e.reload()}).then(function(){return f});return R(this,g,!0)};
k.jb=function(a){var b=this,c=null;return R(this,this.G().then(function(d){c=d;return"undefined"===typeof a||Ta(a)?{}:Jf(new zf(a))}).then(function(d){return b.a.jb(c,d)}).then(function(d){if(b.email!=d)return b.reload()}).then(function(){}))};function R(a,b,c){var d=um(a,b,c);a.I.push(d);d.ka(function(){Oa(a.I,d)});return d}
function um(a,b,c){return a.h&&!c?(b.cancel(),E(a.h)):b.s(function(d){!d||"auth/user-disabled"!=d.code&&"auth/user-token-expired"!=d.code||(a.h||a.dispatchEvent(new Pl("userInvalidated")),a.h=d);throw d;})}k.toJSON=function(){return this.A()};
k.A=function(){var a={uid:this.uid,displayName:this.displayName,photoURL:this.photoURL,email:this.email,emailVerified:this.emailVerified,phoneNumber:this.phoneNumber,isAnonymous:this.isAnonymous,tenantId:this.tenantId,providerData:[],apiKey:this.l,appName:this.m,authDomain:this.o,stsTokenManager:this.b.A(),redirectEventId:this.ca||null};this.metadata&&Wa(a,this.metadata.A());x(this.providerData,function(b){a.providerData.push(af(b))});return a};
function vm(a){if(!a.apiKey)return null;var b={apiKey:a.apiKey,authDomain:a.authDomain,appName:a.appName},c={};if(a.stsTokenManager&&a.stsTokenManager.accessToken&&a.stsTokenManager.expirationTime)c[lg]=a.stsTokenManager.accessToken,c.refreshToken=a.stsTokenManager.refreshToken||null,c.expiresIn=(a.stsTokenManager.expirationTime-ua())/1E3;else return null;var d=new Q(b,c,a);a.providerData&&x(a.providerData,function(e){e&&em(d,$e(e))});a.redirectEventId&&(d.ca=a.redirectEventId);return d}
function wm(a,b,c,d){var e=new Q(a,b);c&&(e.da=c);d&&Tl(e,d);return e.reload().then(function(){return e})}function xm(a,b,c,d){b=b||{apiKey:a.l,authDomain:a.o,appName:a.m};var e=a.b,f={};f[lg]=e.b;f.refreshToken=e.a;f.expiresIn=(e.c-ua())/1E3;b=new Q(b,f);c&&(b.da=c);d&&Tl(b,d);hm(b,a);return b};function ym(a){this.a=a;this.b=rk()}var sm={name:"redirectUser",C:"session"};function tm(a){return vk(a.b,sm,a.a)}function zm(a,b){return a.b.get(sm,a.a).then(function(c){c&&b&&(c.authDomain=b);return vm(c||{})})};function Am(a){this.a=a;this.b=rk();this.c=null;this.f=Bm(this);this.b.addListener(Cm("local"),this.a,t(this.g,this))}Am.prototype.g=function(){var a=this,b=Cm("local");Dm(this,function(){return D().then(function(){return a.c&&"local"!=a.c.C?a.b.get(b,a.a):null}).then(function(c){if(c)return Em(a,"local").then(function(){a.c=b})})})};function Em(a,b){var c=[],d;for(d in nk)nk[d]!==b&&c.push(vk(a.b,Cm(nk[d]),a.a));c.push(vk(a.b,Fm,a.a));return ac(c)}
function Bm(a){var b=Cm("local"),c=Cm("session"),d=Cm("none");return uk(a.b,b,a.a).then(function(){return a.b.get(c,a.a)}).then(function(e){return e?c:a.b.get(d,a.a).then(function(f){return f?d:a.b.get(b,a.a).then(function(g){return g?b:a.b.get(Fm,a.a).then(function(h){return h?Cm(h):b})})})}).then(function(e){a.c=e;return Em(a,e.C)}).s(function(){a.c||(a.c=b)})}var Fm={name:"persistence",C:"session"};function Cm(a){return{name:"authUser",C:a}}
Am.prototype.mb=function(a){var b=null,c=this;ok(a);return Dm(this,function(){return a!=c.c.C?c.b.get(c.c,c.a).then(function(d){b=d;return Em(c,a)}).then(function(){c.c=Cm(a);if(b)return c.b.set(c.c,b,c.a)}):D()})};function Gm(a){return Dm(a,function(){return a.b.set(Fm,a.c.C,a.a)})}function Hm(a,b){return Dm(a,function(){return a.b.set(a.c,b.A(),a.a)})}function Im(a){return Dm(a,function(){return vk(a.b,a.c,a.a)})}
function Jm(a,b){return Dm(a,function(){return a.b.get(a.c,a.a).then(function(c){c&&b&&(c.authDomain=b);return vm(c||{})})})}function Dm(a,b){a.f=a.f.then(b,b);return a.f};function Km(a){this.l=!1;K(this,"settings",new Al);K(this,"app",a);if(S(this).options&&S(this).options.apiKey)a=_firebase_app__WEBPACK_IMPORTED_MODULE_0___default.a.SDK_VERSION?Ee(_firebase_app__WEBPACK_IMPORTED_MODULE_0___default.a.SDK_VERSION):null,this.b=new ni(S(this).options&&S(this).options.apiKey,Uf(Vf),a);else throw new M("invalid-api-key");this.O=[];this.m=[];this.J=[];this.Ub=_firebase_app__WEBPACK_IMPORTED_MODULE_0___default.a.INTERNAL.createSubscribe(t(this.oc,this));this.W=void 0;this.Vb=_firebase_app__WEBPACK_IMPORTED_MODULE_0___default.a.INTERNAL.createSubscribe(t(this.pc,this));Lm(this,null);this.h=new Am(S(this).options.apiKey+":"+S(this).name);this.w=
new ym(S(this).options.apiKey+":"+S(this).name);this.Y=T(this,Mm(this));this.i=T(this,Nm(this));this.ga=!1;this.ma=t(this.Nc,this);this.ub=t(this.aa,this);this.ua=t(this.bc,this);this.va=t(this.mc,this);this.Ha=t(this.nc,this);this.a=null;Om(this);this.INTERNAL={};this.INTERNAL["delete"]=t(this.delete,this);this.INTERNAL.logFramework=t(this.vc,this);this.o=0;G.call(this);Pm(this);this.I=[]}v(Km,G);function Qm(a){F.call(this,"languageCodeChanged");this.g=a}v(Qm,F);
function Rm(a){F.call(this,"frameworkChanged");this.c=a}v(Rm,F);k=Km.prototype;k.mb=function(a){a=this.h.mb(a);return T(this,a)};k.sa=function(a){this.Z===a||this.l||(this.Z=a,ti(this.b,this.Z),this.dispatchEvent(new Qm(this.ha())))};k.ha=function(){return this.Z};k.Tc=function(){var a=l.navigator;this.sa(a?a.languages&&a.languages[0]||a.language||a.userLanguage||null:null)};k.vc=function(a){this.I.push(a);ui(this.b,_firebase_app__WEBPACK_IMPORTED_MODULE_0___default.a.SDK_VERSION?Ee(_firebase_app__WEBPACK_IMPORTED_MODULE_0___default.a.SDK_VERSION,this.I):null);this.dispatchEvent(new Rm(this.I))};
k.Aa=function(){return Ra(this.I)};k.nb=function(a){this.P===a||this.l||(this.P=a,this.b.b=this.P)};k.R=function(){return this.P};function Pm(a){Object.defineProperty(a,"lc",{get:function(){return this.ha()},set:function(b){this.sa(b)},enumerable:!1});a.Z=null;Object.defineProperty(a,"ti",{get:function(){return this.R()},set:function(b){this.nb(b)},enumerable:!1});a.P=null}
k.toJSON=function(){return{apiKey:S(this).options.apiKey,authDomain:S(this).options.authDomain,appName:S(this).name,currentUser:U(this)&&U(this).A()}};function Sm(a){return a.Tb||E(new M("auth-domain-config-required"))}function Om(a){var b=S(a).options.authDomain,c=S(a).options.apiKey;b&&He()&&(a.Tb=a.Y.then(function(){if(!a.l){a.a=sl(b,c,S(a).name);kl(a.a,a);U(a)&&am(U(a));if(a.B){am(a.B);var d=a.B;d.sa(a.ha());Ul(d,a);d=a.B;Tl(d,a.I);Vl(d,a);a.B=null}return a.a}}))}
k.xb=function(a,b){switch(a){case "unknown":case "signInViaRedirect":return!0;case "signInViaPopup":return this.g==b&&!!this.f;default:return!1}};k.ja=function(a,b,c,d){"signInViaPopup"==a&&this.g==d&&(c&&this.v?this.v(c):b&&!c&&this.f&&this.f(b),this.c&&(this.c.cancel(),this.c=null),delete this.f,delete this.v)};k.za=function(a,b){return"signInViaRedirect"==a||"signInViaPopup"==a&&this.g==b&&this.f?t(this.ac,this):null};
k.ac=function(a,b,c,d){var e=this;a={requestUri:a,postBody:d,sessionId:b,tenantId:c};this.c&&(this.c.cancel(),this.c=null);var f=null,g=null,h=ng(e.b,a).then(function(m){f=Wg(m);g=$f(m);return m});a=e.Y.then(function(){return h}).then(function(m){return Tm(e,m)}).then(function(){return $e({user:U(e),credential:f,additionalUserInfo:g,operationType:"signIn"})});return T(this,a)};
k.Lc=function(a){if(!He())return E(new M("operation-not-supported-in-this-environment"));var b=this,c=Zf(a.providerId),d=Ge(),e=null;(!Je()||ye())&&S(this).options.authDomain&&a.isOAuthProvider&&(e=Bj(S(this).options.authDomain,S(this).options.apiKey,S(this).name,"signInViaPopup",a,null,d,_firebase_app__WEBPACK_IMPORTED_MODULE_0___default.a.SDK_VERSION||null,null,null,this.R()));var f=pe(e,c&&c.Da,c&&c.Ca);c=Sm(this).then(function(g){return ol(g,f,"signInViaPopup",a,d,!!e,b.R())}).then(function(){return new B(function(g,h){b.ja("signInViaPopup",
null,new M("cancelled-popup-request"),b.g);b.f=g;b.v=h;b.g=d;b.c=ql(b.a,b,"signInViaPopup",f,d)})}).then(function(g){f&&oe(f);return g?$e(g):null}).s(function(g){f&&oe(f);throw g;});return T(this,c)};k.Mc=function(a){if(!He())return E(new M("operation-not-supported-in-this-environment"));var b=this,c=Sm(this).then(function(){return Gm(b.h)}).then(function(){return pl(b.a,"signInViaRedirect",a,void 0,b.R())});return T(this,c)};
function Um(a){if(!He())return E(new M("operation-not-supported-in-this-environment"));var b=Sm(a).then(function(){return a.a.oa()}).then(function(c){return c?$e(c):null});return T(a,b)}k.oa=function(){var a=this;return Um(this).then(function(b){a.a&&vl(a.a.b);return b}).s(function(b){a.a&&vl(a.a.b);throw b;})};
k.Rc=function(a){if(!a)return E(new M("null-user"));if(this.P!=a.tenantId)return E(new M("tenant-id-mismatch"));var b=this,c={};c.apiKey=S(this).options.apiKey;c.authDomain=S(this).options.authDomain;c.appName=S(this).name;var d=xm(a,c,b.w,b.Aa());return T(this,this.i.then(function(){if(S(b).options.apiKey!=a.l)return d.reload()}).then(function(){if(U(b)&&a.uid==U(b).uid)return hm(U(b),a),b.aa(a);Lm(b,d);am(d);return b.aa(d)}).then(function(){Vm(b)}))};
function Tm(a,b){var c={};c.apiKey=S(a).options.apiKey;c.authDomain=S(a).options.authDomain;c.appName=S(a).name;return a.Y.then(function(){return wm(c,b,a.w,a.Aa())}).then(function(d){if(U(a)&&d.uid==U(a).uid)return hm(U(a),d),a.aa(d);Lm(a,d);am(d);return a.aa(d)}).then(function(){Vm(a)})}
function Lm(a,b){U(a)&&(Zl(U(a),a.ub),fd(U(a),"tokenChanged",a.ua),fd(U(a),"userDeleted",a.va),fd(U(a),"userInvalidated",a.Ha),Yl(U(a)));b&&(b.O.push(a.ub),Wc(b,"tokenChanged",a.ua),Wc(b,"userDeleted",a.va),Wc(b,"userInvalidated",a.Ha),0<a.o&&Xl(b));K(a,"currentUser",b);b&&(b.sa(a.ha()),Ul(b,a),Tl(b,a.I),Vl(b,a))}k.pb=function(){var a=this,b=this.i.then(function(){a.a&&vl(a.a.b);if(!U(a))return D();Lm(a,null);return Im(a.h).then(function(){Vm(a)})});return T(this,b)};
function Wm(a){var b=zm(a.w,S(a).options.authDomain).then(function(c){if(a.B=c)c.da=a.w;return tm(a.w)});return T(a,b)}function Mm(a){var b=S(a).options.authDomain,c=Wm(a).then(function(){return Jm(a.h,b)}).then(function(d){return d?(d.da=a.w,a.B&&(a.B.ca||null)==(d.ca||null)?d:d.reload().then(function(){return Hm(a.h,d).then(function(){return d})}).s(function(e){return"auth/network-request-failed"==e.code?d:Im(a.h)})):null}).then(function(d){Lm(a,d||null)});return T(a,c)}
function Nm(a){return a.Y.then(function(){return Um(a)}).s(function(){}).then(function(){if(!a.l)return a.ma()}).s(function(){}).then(function(){if(!a.l){a.ga=!0;var b=a.h;b.b.addListener(Cm("local"),b.a,a.ma)}})}
k.Nc=function(){var a=this;return Jm(this.h,S(this).options.authDomain).then(function(b){if(!a.l){var c;if(c=U(a)&&b){c=U(a).uid;var d=b.uid;c=void 0===c||null===c||""===c||void 0===d||null===d||""===d?!1:c==d}if(c)return hm(U(a),b),U(a).G();if(U(a)||b)Lm(a,b),b&&(am(b),b.da=a.w),a.a&&kl(a.a,a),Vm(a)}})};k.aa=function(a){return Hm(this.h,a)};k.bc=function(){Vm(this);this.aa(U(this))};k.mc=function(){this.pb()};k.nc=function(){this.pb()};
function Xm(a,b){var c=null,d=null;return T(a,b.then(function(e){c=Wg(e);d=$f(e);return Tm(a,e)}).then(function(){return $e({user:U(a),credential:c,additionalUserInfo:d,operationType:"signIn"})}))}k.oc=function(a){var b=this;this.addAuthTokenListener(function(){a.next(U(b))})};k.pc=function(a){var b=this;Ym(this,function(){a.next(U(b))})};k.xc=function(a,b,c){var d=this;this.ga&&Promise.resolve().then(function(){q(a)?a(U(d)):q(a.next)&&a.next(U(d))});return this.Ub(a,b,c)};
k.wc=function(a,b,c){var d=this;this.ga&&Promise.resolve().then(function(){d.W=d.getUid();q(a)?a(U(d)):q(a.next)&&a.next(U(d))});return this.Vb(a,b,c)};k.cc=function(a){var b=this,c=this.i.then(function(){return U(b)?U(b).G(a).then(function(d){return{accessToken:d}}):null});return T(this,c)};k.Hc=function(a){var b=this;return this.i.then(function(){return Xm(b,P(b.b,ij,{token:a}))}).then(function(c){var d=c.user;gm(d,"isAnonymous",!1);b.aa(d);return c})};
k.Ic=function(a,b){var c=this;return this.i.then(function(){return Xm(c,P(c.b,Ig,{email:a,password:b}))})};k.Xb=function(a,b){var c=this;return this.i.then(function(){return Xm(c,P(c.b,ej,{email:a,password:b}))})};k.Ra=function(a){var b=this;return this.i.then(function(){return Xm(b,a.na(b.b))})};k.Gc=function(a){Xe("firebase.auth.Auth.prototype.signInAndRetrieveDataWithCredential is deprecated. Please use firebase.auth.Auth.prototype.signInWithCredential instead.");return this.Ra(a)};
k.ob=function(){var a=this;return this.i.then(function(){var b=U(a);if(b&&b.isAnonymous){var c=$e({providerId:null,isNewUser:!1});return $e({user:b,credential:null,additionalUserInfo:c,operationType:"signIn"})}return Xm(a,a.b.ob()).then(function(d){var e=d.user;gm(e,"isAnonymous",!0);a.aa(e);return d})})};function S(a){return a.app}function U(a){return a.currentUser}k.getUid=function(){return U(this)&&U(this).uid||null};function Zm(a){return U(a)&&U(a)._lat||null}
function Vm(a){if(a.ga){for(var b=0;b<a.m.length;b++)if(a.m[b])a.m[b](Zm(a));if(a.W!==a.getUid()&&a.J.length)for(a.W=a.getUid(),b=0;b<a.J.length;b++)if(a.J[b])a.J[b](Zm(a))}}k.Wb=function(a){this.addAuthTokenListener(a);this.o++;0<this.o&&U(this)&&Xl(U(this))};k.Ec=function(a){var b=this;x(this.m,function(c){c==a&&b.o--});0>this.o&&(this.o=0);0==this.o&&U(this)&&Yl(U(this));this.removeAuthTokenListener(a)};
k.addAuthTokenListener=function(a){var b=this;this.m.push(a);T(this,this.i.then(function(){b.l||Na(b.m,a)&&a(Zm(b))}))};k.removeAuthTokenListener=function(a){Pa(this.m,function(b){return b==a})};function Ym(a,b){a.J.push(b);T(a,a.i.then(function(){!a.l&&Na(a.J,b)&&a.W!==a.getUid()&&(a.W=a.getUid(),b(Zm(a)))}))}
k.delete=function(){this.l=!0;for(var a=0;a<this.O.length;a++)this.O[a].cancel("app-deleted");this.O=[];this.h&&(a=this.h,a.b.removeListener(Cm("local"),a.a,this.ma));this.a&&(ll(this.a,this),vl(this.a.b));return Promise.resolve()};function T(a,b){a.O.push(b);b.ka(function(){Oa(a.O,b)});return b}k.$b=function(a){return T(this,Ei(this.b,a))};k.qc=function(a){return!!Ng(a)};
k.lb=function(a,b){var c=this;return T(this,D().then(function(){var d=new zf(b);if(!d.c)throw new M("argument-error",Hf+" must be true when sending sign in link to email");return Jf(d)}).then(function(d){return c.b.lb(a,d)}).then(function(){}))};k.Uc=function(a){return this.Ka(a).then(function(b){return b.data.email})};k.$a=function(a,b){return T(this,this.b.$a(a,b).then(function(){}))};k.Ka=function(a){return T(this,this.b.Ka(a).then(function(b){return new df(b)}))};
k.Xa=function(a){return T(this,this.b.Xa(a).then(function(){}))};k.kb=function(a,b){var c=this;return T(this,D().then(function(){return"undefined"===typeof b||Ta(b)?{}:Jf(new zf(b))}).then(function(d){return c.b.kb(a,d)}).then(function(){}))};k.Kc=function(a,b){return T(this,Cl(this,a,b,t(this.Ra,this)))};
k.Jc=function(a,b){var c=this;return T(this,D().then(function(){var d=b||he(),e=Mg(a,d);d=Ng(d);if(!d)throw new M("argument-error","Invalid email link!");if(d.tenantId!==c.R())throw new M("tenant-id-mismatch");return c.Ra(e)}))};function $m(){}$m.prototype.render=function(){};$m.prototype.reset=function(){};$m.prototype.getResponse=function(){};$m.prototype.execute=function(){};function an(){this.a={};this.b=1E12}var bn=null;an.prototype.render=function(a,b){this.a[this.b.toString()]=new cn(a,b);return this.b++};an.prototype.reset=function(a){var b=dn(this,a);a=en(a);b&&a&&(b.delete(),delete this.a[a])};an.prototype.getResponse=function(a){return(a=dn(this,a))?a.getResponse():null};an.prototype.execute=function(a){(a=dn(this,a))&&a.execute()};function dn(a,b){return(b=en(b))?a.a[b]||null:null}function en(a){return(a="undefined"===typeof a?1E12:a)?a.toString():null}
function cn(a,b){this.g=!1;this.c=b;this.a=this.b=null;this.h="invisible"!==this.c.size;this.f=Vd(a);var c=this;this.i=function(){c.execute()};this.h?this.execute():Wc(this.f,"click",this.i)}cn.prototype.getResponse=function(){fn(this);return this.b};
cn.prototype.execute=function(){fn(this);var a=this;this.a||(this.a=setTimeout(function(){a.b=Ce();var b=a.c.callback,c=a.c["expired-callback"];if(b)try{b(a.b)}catch(d){}a.a=setTimeout(function(){a.a=null;a.b=null;if(c)try{c()}catch(d){}a.h&&a.execute()},6E4)},500))};cn.prototype.delete=function(){fn(this);this.g=!0;clearTimeout(this.a);this.a=null;fd(this.f,"click",this.i)};function fn(a){if(a.g)throw Error("reCAPTCHA mock was already deleted!");};function gn(){}gn.prototype.g=function(){bn||(bn=new an);return D(bn)};gn.prototype.c=function(){};var hn=null;function jn(){this.b=l.grecaptcha?Infinity:0;this.f=null;this.a="__rcb"+Math.floor(1E6*Math.random()).toString()}var kn=new Xa(Ya,"https://www.google.com/recaptcha/api.js?onload=%{onload}&render=explicit&hl=%{hl}"),ln=new Pe(3E4,6E4);
jn.prototype.g=function(a){var b=this;return new B(function(c,d){var e=setTimeout(function(){d(new M("network-request-failed"))},ln.get());if(!l.grecaptcha||a!==b.f&&!b.b){l[b.a]=function(){if(l.grecaptcha){b.f=a;var g=l.grecaptcha.render;l.grecaptcha.render=function(h,m){h=g(h,m);b.b++;return h};clearTimeout(e);c(l.grecaptcha)}else clearTimeout(e),d(new M("internal-error"));delete l[b.a]};var f=eb(kn,{onload:b.a,hl:a||""});D(gi(f)).s(function(){clearTimeout(e);d(new M("internal-error","Unable to load external reCAPTCHA dependencies!"))})}else clearTimeout(e),
c(l.grecaptcha)})};jn.prototype.c=function(){this.b--};var mn=null;function nn(a,b,c,d,e,f,g){K(this,"type","recaptcha");this.c=this.f=null;this.B=!1;this.u=b;this.g=null;g?(hn||(hn=new gn),g=hn):(mn||(mn=new jn),g=mn);this.m=g;this.a=c||{theme:"light",type:"image"};this.h=[];if(this.a[on])throw new M("argument-error","sitekey should not be provided for reCAPTCHA as one is automatically provisioned for the current project.");this.i="invisible"===this.a[pn];if(!l.document)throw new M("operation-not-supported-in-this-environment","RecaptchaVerifier is only supported in a browser HTTP/HTTPS environment with DOM support.");
if(!Vd(b)||!this.i&&Vd(b).hasChildNodes())throw new M("argument-error","reCAPTCHA container is either not found or already contains inner elements!");this.o=new ni(a,f||null,e||null);this.v=d||function(){return null};var h=this;this.l=[];var m=this.a[qn];this.a[qn]=function(u){rn(h,u);if("function"===typeof m)m(u);else if("string"===typeof m){var A=J(m,l);"function"===typeof A&&A(u)}};var p=this.a[sn];this.a[sn]=function(){rn(h,null);if("function"===typeof p)p();else if("string"===typeof p){var u=
J(p,l);"function"===typeof u&&u()}}}var qn="callback",sn="expired-callback",on="sitekey",pn="size";function rn(a,b){for(var c=0;c<a.l.length;c++)try{a.l[c](b)}catch(d){}}function tn(a,b){Pa(a.l,function(c){return c==b})}function un(a,b){a.h.push(b);b.ka(function(){Oa(a.h,b)});return b}k=nn.prototype;
k.Ba=function(){var a=this;return this.f?this.f:this.f=un(this,D().then(function(){if(Ie()&&!ze())return ue();throw new M("operation-not-supported-in-this-environment","RecaptchaVerifier is only supported in a browser HTTP/HTTPS environment.");}).then(function(){return a.m.g(a.v())}).then(function(b){a.g=b;return P(a.o,hj,{})}).then(function(b){a.a[on]=b.recaptchaSiteKey}).s(function(b){a.f=null;throw b;}))};
k.render=function(){vn(this);var a=this;return un(this,this.Ba().then(function(){if(null===a.c){var b=a.u;if(!a.i){var c=Vd(b);b=Yd("DIV");c.appendChild(b)}a.c=a.g.render(b,a.a)}return a.c}))};k.verify=function(){vn(this);var a=this;return un(this,this.render().then(function(b){return new B(function(c){var d=a.g.getResponse(b);if(d)c(d);else{var e=function(f){f&&(tn(a,e),c(f))};a.l.push(e);a.i&&a.g.execute(a.c)}})}))};k.reset=function(){vn(this);null!==this.c&&this.g.reset(this.c)};
function vn(a){if(a.B)throw new M("internal-error","RecaptchaVerifier instance has been destroyed.");}k.clear=function(){vn(this);this.B=!0;this.m.c();for(var a=0;a<this.h.length;a++)this.h[a].cancel("RecaptchaVerifier instance has been destroyed.");if(!this.i){a=Vd(this.u);for(var b;b=a.firstChild;)a.removeChild(b)}};
function wn(a,b,c){var d=!1;try{this.b=c||_firebase_app__WEBPACK_IMPORTED_MODULE_0___default.a.app()}catch(g){throw new M("argument-error","No firebase.app.App instance is currently initialized.");}if(this.b.options&&this.b.options.apiKey)c=this.b.options.apiKey;else throw new M("invalid-api-key");var e=this,f=null;try{f=this.b.auth().Aa()}catch(g){}try{d=this.b.auth().settings.appVerificationDisabledForTesting}catch(g){}f=_firebase_app__WEBPACK_IMPORTED_MODULE_0___default.a.SDK_VERSION?Ee(_firebase_app__WEBPACK_IMPORTED_MODULE_0___default.a.SDK_VERSION,f):null;nn.call(this,c,a,b,function(){try{var g=e.b.auth().ha()}catch(h){g=
null}return g},f,Uf(Vf),d)}v(wn,nn);function xn(a,b,c,d){a:{c=Array.prototype.slice.call(c);var e=0;for(var f=!1,g=0;g<b.length;g++)if(b[g].optional)f=!0;else{if(f)throw new M("internal-error","Argument validator encountered a required argument after an optional argument.");e++}f=b.length;if(c.length<e||f<c.length)d="Expected "+(e==f?1==e?"1 argument":e+" arguments":e+"-"+f+" arguments")+" but got "+c.length+".";else{for(e=0;e<c.length;e++)if(f=b[e].optional&&void 0===c[e],!b[e].N(c[e])&&!f){b=b[e];if(0>e||e>=yn.length)throw new M("internal-error",
"Argument validator received an unsupported number of arguments.");c=yn[e];d=(d?"":c+" argument ")+(b.name?'"'+b.name+'" ':"")+"must be "+b.M+".";break a}d=null}}if(d)throw new M("argument-error",a+" failed: "+d);}var yn="First Second Third Fourth Fifth Sixth Seventh Eighth Ninth".split(" ");function V(a,b){return{name:a||"",M:"a valid string",optional:!!b,N:n}}function zn(a,b){return{name:a||"",M:"a boolean",optional:!!b,N:ha}}
function W(a,b){return{name:a||"",M:"a valid object",optional:!!b,N:r}}function An(a,b){return{name:a||"",M:"a function",optional:!!b,N:q}}function Bn(a,b){return{name:a||"",M:"null",optional:!!b,N:ma}}function Cn(){return{name:"",M:"an HTML element",optional:!1,N:function(a){return!!(a&&a instanceof Element)}}}function Dn(){return{name:"auth",M:"an instance of Firebase Auth",optional:!0,N:function(a){return!!(a&&a instanceof Km)}}}
function En(){return{name:"app",M:"an instance of Firebase App",optional:!0,N:function(a){return!!(a&&a instanceof _firebase_app__WEBPACK_IMPORTED_MODULE_0___default.a.app.App)}}}function Fn(a){return{name:a?a+"Credential":"credential",M:a?"a valid "+a+" credential":"a valid credential",optional:!1,N:function(b){if(!b)return!1;var c=!a||b.providerId===a;return!(!b.na||!c)}}}
function Gn(){return{name:"authProvider",M:"a valid Auth provider",optional:!1,N:function(a){return!!(a&&a.providerId&&a.hasOwnProperty&&a.hasOwnProperty("isOAuthProvider"))}}}function Hn(){return{name:"applicationVerifier",M:"an implementation of firebase.auth.ApplicationVerifier",optional:!1,N:function(a){return!!(a&&n(a.type)&&q(a.verify))}}}function X(a,b,c,d){return{name:c||"",M:a.M+" or "+b.M,optional:!!d,N:function(e){return a.N(e)||b.N(e)}}};function Y(a,b){for(var c in b){var d=b[c].name;a[d]=In(d,a[c],b[c].j)}}function Jn(a,b){for(var c in b){var d=b[c].name;d!==c&&Object.defineProperty(a,d,{get:ta(function(e){return this[e]},c),set:ta(function(e,f,g,h){xn(e,[g],[h],!0);this[f]=h},d,c,b[c].Ya),enumerable:!0})}}function Z(a,b,c,d){a[b]=In(b,c,d)}
function In(a,b,c){function d(){var g=Array.prototype.slice.call(arguments);xn(e,c,g);return b.apply(this,g)}if(!c)return b;var e=Kn(a),f;for(f in b)d[f]=b[f];for(f in b.prototype)d.prototype[f]=b.prototype[f];return d}function Kn(a){a=a.split(".");return a[a.length-1]};Y(Km.prototype,{Xa:{name:"applyActionCode",j:[V("code")]},Ka:{name:"checkActionCode",j:[V("code")]},$a:{name:"confirmPasswordReset",j:[V("code"),V("newPassword")]},Xb:{name:"createUserWithEmailAndPassword",j:[V("email"),V("password")]},$b:{name:"fetchSignInMethodsForEmail",j:[V("email")]},oa:{name:"getRedirectResult",j:[]},qc:{name:"isSignInWithEmailLink",j:[V("emailLink")]},wc:{name:"onAuthStateChanged",j:[X(W(),An(),"nextOrObserver"),An("opt_error",!0),An("opt_completed",!0)]},xc:{name:"onIdTokenChanged",
j:[X(W(),An(),"nextOrObserver"),An("opt_error",!0),An("opt_completed",!0)]},kb:{name:"sendPasswordResetEmail",j:[V("email"),X(W("opt_actionCodeSettings",!0),Bn(null,!0),"opt_actionCodeSettings",!0)]},lb:{name:"sendSignInLinkToEmail",j:[V("email"),W("actionCodeSettings")]},mb:{name:"setPersistence",j:[V("persistence")]},Gc:{name:"signInAndRetrieveDataWithCredential",j:[Fn()]},ob:{name:"signInAnonymously",j:[]},Ra:{name:"signInWithCredential",j:[Fn()]},Hc:{name:"signInWithCustomToken",j:[V("token")]},
Ic:{name:"signInWithEmailAndPassword",j:[V("email"),V("password")]},Jc:{name:"signInWithEmailLink",j:[V("email"),V("emailLink",!0)]},Kc:{name:"signInWithPhoneNumber",j:[V("phoneNumber"),Hn()]},Lc:{name:"signInWithPopup",j:[Gn()]},Mc:{name:"signInWithRedirect",j:[Gn()]},Rc:{name:"updateCurrentUser",j:[X(function(a){return{name:"user",M:"an instance of Firebase User",optional:!!a,N:function(b){return!!(b&&b instanceof Q)}}}(),Bn(),"user")]},pb:{name:"signOut",j:[]},toJSON:{name:"toJSON",j:[V(null,!0)]},
Tc:{name:"useDeviceLanguage",j:[]},Uc:{name:"verifyPasswordResetCode",j:[V("code")]}});Jn(Km.prototype,{lc:{name:"languageCode",Ya:X(V(),Bn(),"languageCode")},ti:{name:"tenantId",Ya:X(V(),Bn(),"tenantId")}});Km.Persistence=nk;Km.Persistence.LOCAL="local";Km.Persistence.SESSION="session";Km.Persistence.NONE="none";
Y(Q.prototype,{"delete":{name:"delete",j:[]},dc:{name:"getIdTokenResult",j:[zn("opt_forceRefresh",!0)]},G:{name:"getIdToken",j:[zn("opt_forceRefresh",!0)]},rc:{name:"linkAndRetrieveDataWithCredential",j:[Fn()]},eb:{name:"linkWithCredential",j:[Fn()]},sc:{name:"linkWithPhoneNumber",j:[V("phoneNumber"),Hn()]},tc:{name:"linkWithPopup",j:[Gn()]},uc:{name:"linkWithRedirect",j:[Gn()]},Ac:{name:"reauthenticateAndRetrieveDataWithCredential",j:[Fn()]},gb:{name:"reauthenticateWithCredential",j:[Fn()]},Bc:{name:"reauthenticateWithPhoneNumber",
j:[V("phoneNumber"),Hn()]},Cc:{name:"reauthenticateWithPopup",j:[Gn()]},Dc:{name:"reauthenticateWithRedirect",j:[Gn()]},reload:{name:"reload",j:[]},jb:{name:"sendEmailVerification",j:[X(W("opt_actionCodeSettings",!0),Bn(null,!0),"opt_actionCodeSettings",!0)]},toJSON:{name:"toJSON",j:[V(null,!0)]},Qc:{name:"unlink",j:[V("provider")]},rb:{name:"updateEmail",j:[V("email")]},sb:{name:"updatePassword",j:[V("password")]},Sc:{name:"updatePhoneNumber",j:[Fn("phone")]},tb:{name:"updateProfile",j:[W("profile")]}});
Y(an.prototype,{execute:{name:"execute"},render:{name:"render"},reset:{name:"reset"},getResponse:{name:"getResponse"}});Y($m.prototype,{execute:{name:"execute"},render:{name:"render"},reset:{name:"reset"},getResponse:{name:"getResponse"}});Y(B.prototype,{ka:{name:"finally"},s:{name:"catch"},then:{name:"then"}});Jn(Al.prototype,{appVerificationDisabled:{name:"appVerificationDisabledForTesting",Ya:zn("appVerificationDisabledForTesting")}});Y(Bl.prototype,{confirm:{name:"confirm",j:[V("verificationCode")]}});
Z(jg,"fromJSON",function(a){a=n(a)?JSON.parse(a):a;for(var b,c=[ug,Lg,Sg,rg],d=0;d<c.length;d++)if(b=c[d](a))return b;return null},[X(V(),W(),"json")]);Z(Gg,"credential",function(a,b){return new Fg(a,b)},[V("email"),V("password")]);Y(Fg.prototype,{A:{name:"toJSON",j:[V(null,!0)]}});Y(xg.prototype,{wa:{name:"addScope",j:[V("scope")]},Ea:{name:"setCustomParameters",j:[W("customOAuthParameters")]}});Z(xg,"credential",yg,[X(V(),W(),"token")]);Z(Gg,"credentialWithLink",Mg,[V("email"),V("emailLink")]);
Y(zg.prototype,{wa:{name:"addScope",j:[V("scope")]},Ea:{name:"setCustomParameters",j:[W("customOAuthParameters")]}});Z(zg,"credential",Ag,[X(V(),W(),"token")]);Y(Bg.prototype,{wa:{name:"addScope",j:[V("scope")]},Ea:{name:"setCustomParameters",j:[W("customOAuthParameters")]}});Z(Bg,"credential",Cg,[X(V(),X(W(),Bn()),"idToken"),X(V(),Bn(),"accessToken",!0)]);Y(Dg.prototype,{Ea:{name:"setCustomParameters",j:[W("customOAuthParameters")]}});Z(Dg,"credential",Eg,[X(V(),W(),"token"),V("secret",!0)]);
Y(O.prototype,{wa:{name:"addScope",j:[V("scope")]},credential:{name:"credential",j:[X(V(),X(W(),Bn()),"optionsOrIdToken"),X(V(),Bn(),"accessToken",!0)]},Ea:{name:"setCustomParameters",j:[W("customOAuthParameters")]}});Y(sg.prototype,{A:{name:"toJSON",j:[V(null,!0)]}});Y(mg.prototype,{A:{name:"toJSON",j:[V(null,!0)]}});Z(Tg,"credential",Vg,[V("verificationId"),V("verificationCode")]);Y(Tg.prototype,{Va:{name:"verifyPhoneNumber",j:[V("phoneNumber"),Hn()]}});
Y(Og.prototype,{A:{name:"toJSON",j:[V(null,!0)]}});Y(M.prototype,{toJSON:{name:"toJSON",j:[V(null,!0)]}});Y(dh.prototype,{toJSON:{name:"toJSON",j:[V(null,!0)]}});Y(ch.prototype,{toJSON:{name:"toJSON",j:[V(null,!0)]}});Y(wn.prototype,{clear:{name:"clear",j:[]},render:{name:"render",j:[]},verify:{name:"verify",j:[]}});Z(qf,"parseLink",yf,[V("link")]);
(function(){if("undefined"!==typeof _firebase_app__WEBPACK_IMPORTED_MODULE_0___default.a&&_firebase_app__WEBPACK_IMPORTED_MODULE_0___default.a.INTERNAL&&_firebase_app__WEBPACK_IMPORTED_MODULE_0___default.a.INTERNAL.registerService){var a={ActionCodeInfo:{Operation:{EMAIL_SIGNIN:hf,PASSWORD_RESET:"PASSWORD_RESET",RECOVER_EMAIL:"RECOVER_EMAIL",VERIFY_EMAIL:"VERIFY_EMAIL"}},Auth:Km,AuthCredential:jg,Error:M};Z(a,"EmailAuthProvider",Gg,[]);Z(a,"FacebookAuthProvider",xg,[]);Z(a,"GithubAuthProvider",zg,[]);Z(a,"GoogleAuthProvider",Bg,[]);Z(a,"TwitterAuthProvider",Dg,[]);Z(a,"OAuthProvider",O,[V("providerId")]);Z(a,"SAMLAuthProvider",
wg,[V("providerId")]);Z(a,"PhoneAuthProvider",Tg,[Dn()]);Z(a,"RecaptchaVerifier",wn,[X(V(),Cn(),"recaptchaContainer"),W("recaptchaParameters",!0),En()]);Z(a,"ActionCodeURL",qf,[]);_firebase_app__WEBPACK_IMPORTED_MODULE_0___default.a.INTERNAL.registerService("auth",function(b,c){b=new Km(b);c({INTERNAL:{getUid:t(b.getUid,b),getToken:t(b.cc,b),addAuthTokenListener:t(b.Wb,b),removeAuthTokenListener:t(b.Ec,b)}});return b},a,function(b,c){if("create"===b)try{c.auth()}catch(d){}});_firebase_app__WEBPACK_IMPORTED_MODULE_0___default.a.INTERNAL.extendNamespace({User:Q})}else throw Error("Cannot find the firebase namespace; be sure to include firebase-app.js before this library.");
})();}).apply(typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : {});

//# sourceMappingURL=auth.esm.js.map

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../../webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./node_modules/@firebase/logger/dist/index.esm.js":
/*!*********************************************************!*\
  !*** ./node_modules/@firebase/logger/dist/index.esm.js ***!
  \*********************************************************/
/*! exports provided: LogLevel, Logger, setLogLevel */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "LogLevel", function() { return LogLevel; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Logger", function() { return Logger; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setLogLevel", function() { return setLogLevel; });
/**
 * @license
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * A container for all of the Logger instances
 */
var instances = [];
/**
 * The JS SDK supports 5 log levels and also allows a user the ability to
 * silence the logs altogether.
 *
 * The order is a follows:
 * DEBUG < VERBOSE < INFO < WARN < ERROR
 *
 * All of the log types above the current log level will be captured (i.e. if
 * you set the log level to `INFO`, errors will still be logged, but `DEBUG` and
 * `VERBOSE` logs will not)
 */
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["VERBOSE"] = 1] = "VERBOSE";
    LogLevel[LogLevel["INFO"] = 2] = "INFO";
    LogLevel[LogLevel["WARN"] = 3] = "WARN";
    LogLevel[LogLevel["ERROR"] = 4] = "ERROR";
    LogLevel[LogLevel["SILENT"] = 5] = "SILENT";
})(LogLevel || (LogLevel = {}));
/**
 * The default log level
 */
var defaultLogLevel = LogLevel.INFO;
/**
 * The default log handler will forward DEBUG, VERBOSE, INFO, WARN, and ERROR
 * messages on to their corresponding console counterparts (if the log method
 * is supported by the current log level)
 */
var defaultLogHandler = function (instance, logType) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    if (logType < instance.logLevel) {
        return;
    }
    var now = new Date().toISOString();
    switch (logType) {
        /**
         * By default, `console.debug` is not displayed in the developer console (in
         * chrome). To avoid forcing users to have to opt-in to these logs twice
         * (i.e. once for firebase, and once in the console), we are sending `DEBUG`
         * logs to the `console.log` function.
         */
        case LogLevel.DEBUG:
            console.log.apply(console, ["[" + now + "]  " + instance.name + ":"].concat(args));
            break;
        case LogLevel.VERBOSE:
            console.log.apply(console, ["[" + now + "]  " + instance.name + ":"].concat(args));
            break;
        case LogLevel.INFO:
            console.info.apply(console, ["[" + now + "]  " + instance.name + ":"].concat(args));
            break;
        case LogLevel.WARN:
            console.warn.apply(console, ["[" + now + "]  " + instance.name + ":"].concat(args));
            break;
        case LogLevel.ERROR:
            console.error.apply(console, ["[" + now + "]  " + instance.name + ":"].concat(args));
            break;
        default:
            throw new Error("Attempted to log a message with an invalid logType (value: " + logType + ")");
    }
};
var Logger = /** @class */ (function () {
    /**
     * Gives you an instance of a Logger to capture messages according to
     * Firebase's logging scheme.
     *
     * @param name The name that the logs will be associated with
     */
    function Logger(name) {
        this.name = name;
        /**
         * The log level of the given Logger instance.
         */
        this._logLevel = defaultLogLevel;
        /**
         * The log handler for the Logger instance.
         */
        this._logHandler = defaultLogHandler;
        /**
         * Capture the current instance for later use
         */
        instances.push(this);
    }
    Object.defineProperty(Logger.prototype, "logLevel", {
        get: function () {
            return this._logLevel;
        },
        set: function (val) {
            if (!(val in LogLevel)) {
                throw new TypeError('Invalid value assigned to `logLevel`');
            }
            this._logLevel = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Logger.prototype, "logHandler", {
        get: function () {
            return this._logHandler;
        },
        set: function (val) {
            if (typeof val !== 'function') {
                throw new TypeError('Value assigned to `logHandler` must be a function');
            }
            this._logHandler = val;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * The functions below are all based on the `console` interface
     */
    Logger.prototype.debug = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this._logHandler.apply(this, [this, LogLevel.DEBUG].concat(args));
    };
    Logger.prototype.log = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this._logHandler.apply(this, [this, LogLevel.VERBOSE].concat(args));
    };
    Logger.prototype.info = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this._logHandler.apply(this, [this, LogLevel.INFO].concat(args));
    };
    Logger.prototype.warn = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this._logHandler.apply(this, [this, LogLevel.WARN].concat(args));
    };
    Logger.prototype.error = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this._logHandler.apply(this, [this, LogLevel.ERROR].concat(args));
    };
    return Logger;
}());

/**
 * @license
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function setLogLevel(level) {
    instances.forEach(function (inst) {
        inst.logLevel = level;
    });
}


//# sourceMappingURL=index.esm.js.map


/***/ }),

/***/ "./node_modules/@firebase/util/dist/index.cjs.js":
/*!*******************************************************!*\
  !*** ./node_modules/@firebase/util/dist/index.cjs.js ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {

Object.defineProperty(exports, '__esModule', { value: true });

var tslib_1 = __webpack_require__(/*! tslib */ "./node_modules/@firebase/util/node_modules/tslib/tslib.es6.js");

/**
 * @license
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @fileoverview Firebase constants.  Some of these (@defines) can be overridden at compile-time.
 */
var CONSTANTS = {
    /**
     * @define {boolean} Whether this is the client Node.js SDK.
     */
    NODE_CLIENT: false,
    /**
     * @define {boolean} Whether this is the Admin Node.js SDK.
     */
    NODE_ADMIN: false,
    /**
     * Firebase SDK Version
     */
    SDK_VERSION: '${JSCORE_VERSION}'
};

/**
 * @license
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Throws an error if the provided assertion is falsy
 */
var assert = function (assertion, message) {
    if (!assertion) {
        throw assertionError(message);
    }
};
/**
 * Returns an Error object suitable for throwing.
 */
var assertionError = function (message) {
    return new Error('Firebase Database (' +
        CONSTANTS.SDK_VERSION +
        ') INTERNAL ASSERT FAILED: ' +
        message);
};

/**
 * @license
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var stringToByteArray = function (str) {
    // TODO(user): Use native implementations if/when available
    var out = [];
    var p = 0;
    for (var i = 0; i < str.length; i++) {
        var c = str.charCodeAt(i);
        if (c < 128) {
            out[p++] = c;
        }
        else if (c < 2048) {
            out[p++] = (c >> 6) | 192;
            out[p++] = (c & 63) | 128;
        }
        else if ((c & 0xfc00) === 0xd800 &&
            i + 1 < str.length &&
            (str.charCodeAt(i + 1) & 0xfc00) === 0xdc00) {
            // Surrogate Pair
            c = 0x10000 + ((c & 0x03ff) << 10) + (str.charCodeAt(++i) & 0x03ff);
            out[p++] = (c >> 18) | 240;
            out[p++] = ((c >> 12) & 63) | 128;
            out[p++] = ((c >> 6) & 63) | 128;
            out[p++] = (c & 63) | 128;
        }
        else {
            out[p++] = (c >> 12) | 224;
            out[p++] = ((c >> 6) & 63) | 128;
            out[p++] = (c & 63) | 128;
        }
    }
    return out;
};
/**
 * Turns an array of numbers into the string given by the concatenation of the
 * characters to which the numbers correspond.
 * @param bytes Array of numbers representing characters.
 * @return Stringification of the array.
 */
var byteArrayToString = function (bytes) {
    // TODO(user): Use native implementations if/when available
    var out = [];
    var pos = 0, c = 0;
    while (pos < bytes.length) {
        var c1 = bytes[pos++];
        if (c1 < 128) {
            out[c++] = String.fromCharCode(c1);
        }
        else if (c1 > 191 && c1 < 224) {
            var c2 = bytes[pos++];
            out[c++] = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
        }
        else if (c1 > 239 && c1 < 365) {
            // Surrogate Pair
            var c2 = bytes[pos++];
            var c3 = bytes[pos++];
            var c4 = bytes[pos++];
            var u = (((c1 & 7) << 18) | ((c2 & 63) << 12) | ((c3 & 63) << 6) | (c4 & 63)) -
                0x10000;
            out[c++] = String.fromCharCode(0xd800 + (u >> 10));
            out[c++] = String.fromCharCode(0xdc00 + (u & 1023));
        }
        else {
            var c2 = bytes[pos++];
            var c3 = bytes[pos++];
            out[c++] = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
        }
    }
    return out.join('');
};
// We define it as an object literal instead of a class because a class compiled down to es5 can't
// be treeshaked. https://github.com/rollup/rollup/issues/1691
// Static lookup maps, lazily populated by init_()
var base64 = {
    /**
     * Maps bytes to characters.
     */
    byteToCharMap_: null,
    /**
     * Maps characters to bytes.
     */
    charToByteMap_: null,
    /**
     * Maps bytes to websafe characters.
     * @private
     */
    byteToCharMapWebSafe_: null,
    /**
     * Maps websafe characters to bytes.
     * @private
     */
    charToByteMapWebSafe_: null,
    /**
     * Our default alphabet, shared between
     * ENCODED_VALS and ENCODED_VALS_WEBSAFE
     */
    ENCODED_VALS_BASE: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' + 'abcdefghijklmnopqrstuvwxyz' + '0123456789',
    /**
     * Our default alphabet. Value 64 (=) is special; it means "nothing."
     */
    get ENCODED_VALS() {
        return this.ENCODED_VALS_BASE + '+/=';
    },
    /**
     * Our websafe alphabet.
     */
    get ENCODED_VALS_WEBSAFE() {
        return this.ENCODED_VALS_BASE + '-_.';
    },
    /**
     * Whether this browser supports the atob and btoa functions. This extension
     * started at Mozilla but is now implemented by many browsers. We use the
     * ASSUME_* variables to avoid pulling in the full useragent detection library
     * but still allowing the standard per-browser compilations.
     *
     */
    HAS_NATIVE_SUPPORT: typeof atob === 'function',
    /**
     * Base64-encode an array of bytes.
     *
     * @param input An array of bytes (numbers with
     *     value in [0, 255]) to encode.
     * @param webSafe Boolean indicating we should use the
     *     alternative alphabet.
     * @return The base64 encoded string.
     */
    encodeByteArray: function (input, webSafe) {
        if (!Array.isArray(input)) {
            throw Error('encodeByteArray takes an array as a parameter');
        }
        this.init_();
        var byteToCharMap = webSafe
            ? this.byteToCharMapWebSafe_
            : this.byteToCharMap_;
        var output = [];
        for (var i = 0; i < input.length; i += 3) {
            var byte1 = input[i];
            var haveByte2 = i + 1 < input.length;
            var byte2 = haveByte2 ? input[i + 1] : 0;
            var haveByte3 = i + 2 < input.length;
            var byte3 = haveByte3 ? input[i + 2] : 0;
            var outByte1 = byte1 >> 2;
            var outByte2 = ((byte1 & 0x03) << 4) | (byte2 >> 4);
            var outByte3 = ((byte2 & 0x0f) << 2) | (byte3 >> 6);
            var outByte4 = byte3 & 0x3f;
            if (!haveByte3) {
                outByte4 = 64;
                if (!haveByte2) {
                    outByte3 = 64;
                }
            }
            output.push(byteToCharMap[outByte1], byteToCharMap[outByte2], byteToCharMap[outByte3], byteToCharMap[outByte4]);
        }
        return output.join('');
    },
    /**
     * Base64-encode a string.
     *
     * @param input A string to encode.
     * @param webSafe If true, we should use the
     *     alternative alphabet.
     * @return The base64 encoded string.
     */
    encodeString: function (input, webSafe) {
        // Shortcut for Mozilla browsers that implement
        // a native base64 encoder in the form of "btoa/atob"
        if (this.HAS_NATIVE_SUPPORT && !webSafe) {
            return btoa(input);
        }
        return this.encodeByteArray(stringToByteArray(input), webSafe);
    },
    /**
     * Base64-decode a string.
     *
     * @param input to decode.
     * @param webSafe True if we should use the
     *     alternative alphabet.
     * @return string representing the decoded value.
     */
    decodeString: function (input, webSafe) {
        // Shortcut for Mozilla browsers that implement
        // a native base64 encoder in the form of "btoa/atob"
        if (this.HAS_NATIVE_SUPPORT && !webSafe) {
            return atob(input);
        }
        return byteArrayToString(this.decodeStringToByteArray(input, webSafe));
    },
    /**
     * Base64-decode a string.
     *
     * In base-64 decoding, groups of four characters are converted into three
     * bytes.  If the encoder did not apply padding, the input length may not
     * be a multiple of 4.
     *
     * In this case, the last group will have fewer than 4 characters, and
     * padding will be inferred.  If the group has one or two characters, it decodes
     * to one byte.  If the group has three characters, it decodes to two bytes.
     *
     * @param input Input to decode.
     * @param webSafe True if we should use the web-safe alphabet.
     * @return bytes representing the decoded value.
     */
    decodeStringToByteArray: function (input, webSafe) {
        this.init_();
        var charToByteMap = webSafe
            ? this.charToByteMapWebSafe_
            : this.charToByteMap_;
        var output = [];
        for (var i = 0; i < input.length;) {
            var byte1 = charToByteMap[input.charAt(i++)];
            var haveByte2 = i < input.length;
            var byte2 = haveByte2 ? charToByteMap[input.charAt(i)] : 0;
            ++i;
            var haveByte3 = i < input.length;
            var byte3 = haveByte3 ? charToByteMap[input.charAt(i)] : 64;
            ++i;
            var haveByte4 = i < input.length;
            var byte4 = haveByte4 ? charToByteMap[input.charAt(i)] : 64;
            ++i;
            if (byte1 == null || byte2 == null || byte3 == null || byte4 == null) {
                throw Error();
            }
            var outByte1 = (byte1 << 2) | (byte2 >> 4);
            output.push(outByte1);
            if (byte3 !== 64) {
                var outByte2 = ((byte2 << 4) & 0xf0) | (byte3 >> 2);
                output.push(outByte2);
                if (byte4 !== 64) {
                    var outByte3 = ((byte3 << 6) & 0xc0) | byte4;
                    output.push(outByte3);
                }
            }
        }
        return output;
    },
    /**
     * Lazy static initialization function. Called before
     * accessing any of the static map variables.
     * @private
     */
    init_: function () {
        if (!this.byteToCharMap_) {
            this.byteToCharMap_ = {};
            this.charToByteMap_ = {};
            this.byteToCharMapWebSafe_ = {};
            this.charToByteMapWebSafe_ = {};
            // We want quick mappings back and forth, so we precompute two maps.
            for (var i = 0; i < this.ENCODED_VALS.length; i++) {
                this.byteToCharMap_[i] = this.ENCODED_VALS.charAt(i);
                this.charToByteMap_[this.byteToCharMap_[i]] = i;
                this.byteToCharMapWebSafe_[i] = this.ENCODED_VALS_WEBSAFE.charAt(i);
                this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[i]] = i;
                // Be forgiving when decoding and correctly decode both encodings.
                if (i >= this.ENCODED_VALS_BASE.length) {
                    this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(i)] = i;
                    this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(i)] = i;
                }
            }
        }
    }
};
/**
 * URL-safe base64 encoding
 */
var base64Encode = function (str) {
    var utf8Bytes = stringToByteArray(str);
    return base64.encodeByteArray(utf8Bytes, true);
};
/**
 * URL-safe base64 decoding
 *
 * NOTE: DO NOT use the global atob() function - it does NOT support the
 * base64Url variant encoding.
 *
 * @param str To be decoded
 * @return Decoded result, if possible
 */
var base64Decode = function (str) {
    try {
        return base64.decodeString(str, true);
    }
    catch (e) {
        console.error('base64Decode failed: ', e);
    }
    return null;
};

/**
 * @license
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Do a deep-copy of basic JavaScript Objects or Arrays.
 */
function deepCopy(value) {
    return deepExtend(undefined, value);
}
/**
 * Copy properties from source to target (recursively allows extension
 * of Objects and Arrays).  Scalar values in the target are over-written.
 * If target is undefined, an object of the appropriate type will be created
 * (and returned).
 *
 * We recursively copy all child properties of plain Objects in the source- so
 * that namespace- like dictionaries are merged.
 *
 * Note that the target can be a function, in which case the properties in
 * the source Object are copied onto it as static properties of the Function.
 */
function deepExtend(target, source) {
    if (!(source instanceof Object)) {
        return source;
    }
    switch (source.constructor) {
        case Date:
            // Treat Dates like scalars; if the target date object had any child
            // properties - they will be lost!
            var dateValue = source;
            return new Date(dateValue.getTime());
        case Object:
            if (target === undefined) {
                target = {};
            }
            break;
        case Array:
            // Always copy the array source and overwrite the target.
            target = [];
            break;
        default:
            // Not a plain Object - treat it as a scalar.
            return source;
    }
    for (var prop in source) {
        if (!source.hasOwnProperty(prop)) {
            continue;
        }
        target[prop] = deepExtend(target[prop], source[prop]);
    }
    return target;
}

/**
 * @license
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var Deferred = /** @class */ (function () {
    function Deferred() {
        var _this = this;
        this.reject = function () { };
        this.resolve = function () { };
        this.promise = new Promise(function (resolve, reject) {
            _this.resolve = resolve;
            _this.reject = reject;
        });
    }
    /**
     * Our API internals are not promiseified and cannot because our callback APIs have subtle expectations around
     * invoking promises inline, which Promises are forbidden to do. This method accepts an optional node-style callback
     * and returns a node-style callback which will resolve or reject the Deferred's promise.
     */
    Deferred.prototype.wrapCallback = function (callback) {
        var _this = this;
        return function (error, value) {
            if (error) {
                _this.reject(error);
            }
            else {
                _this.resolve(value);
            }
            if (typeof callback === 'function') {
                // Attaching noop handler just in case developer wasn't expecting
                // promises
                _this.promise.catch(function () { });
                // Some of our callbacks don't expect a value and our own tests
                // assert that the parameter length is 1
                if (callback.length === 1) {
                    callback(error);
                }
                else {
                    callback(error, value);
                }
            }
        };
    };
    return Deferred;
}());

/**
 * @license
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Returns navigator.userAgent string or '' if it's not defined.
 * @return user agent string
 */
function getUA() {
    if (typeof navigator !== 'undefined' &&
        typeof navigator['userAgent'] === 'string') {
        return navigator['userAgent'];
    }
    else {
        return '';
    }
}
/**
 * Detect Cordova / PhoneGap / Ionic frameworks on a mobile device.
 *
 * Deliberately does not rely on checking `file://` URLs (as this fails PhoneGap
 * in the Ripple emulator) nor Cordova `onDeviceReady`, which would normally
 * wait for a callback.
 */
function isMobileCordova() {
    return (typeof window !== 'undefined' &&
        // @ts-ignore Setting up an broadly applicable index signature for Window
        // just to deal with this case would probably be a bad idea.
        !!(window['cordova'] || window['phonegap'] || window['PhoneGap']) &&
        /ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(getUA()));
}
/**
 * Detect Node.js.
 *
 * @return true if Node.js environment is detected.
 */
// Node detection logic from: https://github.com/iliakan/detect-node/
function isNode() {
    try {
        return (Object.prototype.toString.call(global.process) === '[object process]');
    }
    catch (e) {
        return false;
    }
}
/**
 * Detect Browser Environment
 */
function isBrowser() {
    return typeof self === 'object' && self.self === self;
}
/**
 * Detect React Native.
 *
 * @return true if ReactNative environment is detected.
 */
function isReactNative() {
    return (typeof navigator === 'object' && navigator['product'] === 'ReactNative');
}
/**
 * Detect whether the current SDK build is the Node version.
 *
 * @return true if it's the Node SDK build.
 */
function isNodeSdk() {
    return CONSTANTS.NODE_CLIENT === true || CONSTANTS.NODE_ADMIN === true;
}

/**
 * @license
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var ERROR_NAME = 'FirebaseError';
// Based on code from:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error#Custom_Error_Types
var FirebaseError = /** @class */ (function (_super) {
    tslib_1.__extends(FirebaseError, _super);
    function FirebaseError(code, message) {
        var _this = _super.call(this, message) || this;
        _this.code = code;
        _this.name = ERROR_NAME;
        // Fix For ES5
        // https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
        Object.setPrototypeOf(_this, FirebaseError.prototype);
        // Maintains proper stack trace for where our error was thrown.
        // Only available on V8.
        if (Error.captureStackTrace) {
            Error.captureStackTrace(_this, ErrorFactory.prototype.create);
        }
        return _this;
    }
    return FirebaseError;
}(Error));
var ErrorFactory = /** @class */ (function () {
    function ErrorFactory(service, serviceName, errors) {
        this.service = service;
        this.serviceName = serviceName;
        this.errors = errors;
    }
    ErrorFactory.prototype.create = function (code) {
        var data = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            data[_i - 1] = arguments[_i];
        }
        var customData = data[0] || {};
        var fullCode = this.service + "/" + code;
        var template = this.errors[code];
        var message = template ? replaceTemplate(template, customData) : 'Error';
        // Service Name: Error message (service/code).
        var fullMessage = this.serviceName + ": " + message + " (" + fullCode + ").";
        var error = new FirebaseError(fullCode, fullMessage);
        // Keys with an underscore at the end of their name are not included in
        // error.data for some reason.
        // TODO: Replace with Object.entries when lib is updated to es2017.
        for (var _a = 0, _b = Object.keys(customData); _a < _b.length; _a++) {
            var key = _b[_a];
            if (key.slice(-1) !== '_') {
                if (key in error) {
                    console.warn("Overwriting FirebaseError base field \"" + key + "\" can cause unexpected behavior.");
                }
                error[key] = customData[key];
            }
        }
        return error;
    };
    return ErrorFactory;
}());
function replaceTemplate(template, data) {
    return template.replace(PATTERN, function (_, key) {
        var value = data[key];
        return value != null ? value.toString() : "<" + key + "?>";
    });
}
var PATTERN = /\{\$([^}]+)}/g;

/**
 * @license
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Evaluates a JSON string into a javascript object.
 *
 * @param {string} str A string containing JSON.
 * @return {*} The javascript object representing the specified JSON.
 */
function jsonEval(str) {
    return JSON.parse(str);
}
/**
 * Returns JSON representing a javascript object.
 * @param {*} data Javascript object to be stringified.
 * @return {string} The JSON contents of the object.
 */
function stringify(data) {
    return JSON.stringify(data);
}

/**
 * @license
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Decodes a Firebase auth. token into constituent parts.
 *
 * Notes:
 * - May return with invalid / incomplete claims if there's no native base64 decoding support.
 * - Doesn't check if the token is actually valid.
 */
var decode = function (token) {
    var header = {}, claims = {}, data = {}, signature = '';
    try {
        var parts = token.split('.');
        header = jsonEval(base64Decode(parts[0]) || '');
        claims = jsonEval(base64Decode(parts[1]) || '');
        signature = parts[2];
        data = claims['d'] || {};
        delete claims['d'];
    }
    catch (e) { }
    return {
        header: header,
        claims: claims,
        data: data,
        signature: signature
    };
};
/**
 * Decodes a Firebase auth. token and checks the validity of its time-based claims. Will return true if the
 * token is within the time window authorized by the 'nbf' (not-before) and 'iat' (issued-at) claims.
 *
 * Notes:
 * - May return a false negative if there's no native base64 decoding support.
 * - Doesn't check if the token is actually valid.
 */
var isValidTimestamp = function (token) {
    var claims = decode(token).claims;
    var now = Math.floor(new Date().getTime() / 1000);
    var validSince = 0, validUntil = 0;
    if (typeof claims === 'object') {
        if (claims.hasOwnProperty('nbf')) {
            validSince = claims['nbf'];
        }
        else if (claims.hasOwnProperty('iat')) {
            validSince = claims['iat'];
        }
        if (claims.hasOwnProperty('exp')) {
            validUntil = claims['exp'];
        }
        else {
            // token will expire after 24h by default
            validUntil = validSince + 86400;
        }
    }
    return (!!now &&
        !!validSince &&
        !!validUntil &&
        now >= validSince &&
        now <= validUntil);
};
/**
 * Decodes a Firebase auth. token and returns its issued at time if valid, null otherwise.
 *
 * Notes:
 * - May return null if there's no native base64 decoding support.
 * - Doesn't check if the token is actually valid.
 */
var issuedAtTime = function (token) {
    var claims = decode(token).claims;
    if (typeof claims === 'object' && claims.hasOwnProperty('iat')) {
        return claims['iat'];
    }
    return null;
};
/**
 * Decodes a Firebase auth. token and checks the validity of its format. Expects a valid issued-at time.
 *
 * Notes:
 * - May return a false negative if there's no native base64 decoding support.
 * - Doesn't check if the token is actually valid.
 */
var isValidFormat = function (token) {
    var decoded = decode(token), claims = decoded.claims;
    return !!claims && typeof claims === 'object' && claims.hasOwnProperty('iat');
};
/**
 * Attempts to peer into an auth token and determine if it's an admin auth token by looking at the claims portion.
 *
 * Notes:
 * - May return a false negative if there's no native base64 decoding support.
 * - Doesn't check if the token is actually valid.
 */
var isAdmin = function (token) {
    var claims = decode(token).claims;
    return typeof claims === 'object' && claims['admin'] === true;
};

/**
 * @license
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function contains(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
}
function safeGet(obj, key) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
        return obj[key];
    }
    else {
        return undefined;
    }
}
function isEmpty(obj) {
    for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            return false;
        }
    }
    return true;
}
function map(obj, fn, contextObj) {
    var res = {};
    for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            res[key] = fn.call(contextObj, obj[key], key, obj);
        }
    }
    return res;
}

/**
 * @license
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Returns a querystring-formatted string (e.g. &arg=val&arg2=val2) from a
 * params object (e.g. {arg: 'val', arg2: 'val2'})
 * Note: You must prepend it with ? when adding it to a URL.
 */
function querystring(querystringParams) {
    var params = [];
    var _loop_1 = function (key, value) {
        if (Array.isArray(value)) {
            value.forEach(function (arrayVal) {
                params.push(encodeURIComponent(key) + '=' + encodeURIComponent(arrayVal));
            });
        }
        else {
            params.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
        }
    };
    for (var _i = 0, _a = Object.entries(querystringParams); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        _loop_1(key, value);
    }
    return params.length ? '&' + params.join('&') : '';
}
/**
 * Decodes a querystring (e.g. ?arg=val&arg2=val2) into a params object
 * (e.g. {arg: 'val', arg2: 'val2'})
 */
function querystringDecode(querystring) {
    var obj = {};
    var tokens = querystring.replace(/^\?/, '').split('&');
    tokens.forEach(function (token) {
        if (token) {
            var key = token.split('=');
            obj[key[0]] = key[1];
        }
    });
    return obj;
}

/**
 * @license
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @fileoverview SHA-1 cryptographic hash.
 * Variable names follow the notation in FIPS PUB 180-3:
 * http://csrc.nist.gov/publications/fips/fips180-3/fips180-3_final.pdf.
 *
 * Usage:
 *   var sha1 = new sha1();
 *   sha1.update(bytes);
 *   var hash = sha1.digest();
 *
 * Performance:
 *   Chrome 23:   ~400 Mbit/s
 *   Firefox 16:  ~250 Mbit/s
 *
 */
/**
 * SHA-1 cryptographic hash constructor.
 *
 * The properties declared here are discussed in the above algorithm document.
 * @constructor
 * @final
 * @struct
 */
var Sha1 = /** @class */ (function () {
    function Sha1() {
        /**
         * Holds the previous values of accumulated variables a-e in the compress_
         * function.
         * @private
         */
        this.chain_ = [];
        /**
         * A buffer holding the partially computed hash result.
         * @private
         */
        this.buf_ = [];
        /**
         * An array of 80 bytes, each a part of the message to be hashed.  Referred to
         * as the message schedule in the docs.
         * @private
         */
        this.W_ = [];
        /**
         * Contains data needed to pad messages less than 64 bytes.
         * @private
         */
        this.pad_ = [];
        /**
         * @private {number}
         */
        this.inbuf_ = 0;
        /**
         * @private {number}
         */
        this.total_ = 0;
        this.blockSize = 512 / 8;
        this.pad_[0] = 128;
        for (var i = 1; i < this.blockSize; ++i) {
            this.pad_[i] = 0;
        }
        this.reset();
    }
    Sha1.prototype.reset = function () {
        this.chain_[0] = 0x67452301;
        this.chain_[1] = 0xefcdab89;
        this.chain_[2] = 0x98badcfe;
        this.chain_[3] = 0x10325476;
        this.chain_[4] = 0xc3d2e1f0;
        this.inbuf_ = 0;
        this.total_ = 0;
    };
    /**
     * Internal compress helper function.
     * @param buf Block to compress.
     * @param offset Offset of the block in the buffer.
     * @private
     */
    Sha1.prototype.compress_ = function (buf, offset) {
        if (!offset) {
            offset = 0;
        }
        var W = this.W_;
        // get 16 big endian words
        if (typeof buf === 'string') {
            for (var i = 0; i < 16; i++) {
                // TODO(user): [bug 8140122] Recent versions of Safari for Mac OS and iOS
                // have a bug that turns the post-increment ++ operator into pre-increment
                // during JIT compilation.  We have code that depends heavily on SHA-1 for
                // correctness and which is affected by this bug, so I've removed all uses
                // of post-increment ++ in which the result value is used.  We can revert
                // this change once the Safari bug
                // (https://bugs.webkit.org/show_bug.cgi?id=109036) has been fixed and
                // most clients have been updated.
                W[i] =
                    (buf.charCodeAt(offset) << 24) |
                        (buf.charCodeAt(offset + 1) << 16) |
                        (buf.charCodeAt(offset + 2) << 8) |
                        buf.charCodeAt(offset + 3);
                offset += 4;
            }
        }
        else {
            for (var i = 0; i < 16; i++) {
                W[i] =
                    (buf[offset] << 24) |
                        (buf[offset + 1] << 16) |
                        (buf[offset + 2] << 8) |
                        buf[offset + 3];
                offset += 4;
            }
        }
        // expand to 80 words
        for (var i = 16; i < 80; i++) {
            var t = W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16];
            W[i] = ((t << 1) | (t >>> 31)) & 0xffffffff;
        }
        var a = this.chain_[0];
        var b = this.chain_[1];
        var c = this.chain_[2];
        var d = this.chain_[3];
        var e = this.chain_[4];
        var f, k;
        // TODO(user): Try to unroll this loop to speed up the computation.
        for (var i = 0; i < 80; i++) {
            if (i < 40) {
                if (i < 20) {
                    f = d ^ (b & (c ^ d));
                    k = 0x5a827999;
                }
                else {
                    f = b ^ c ^ d;
                    k = 0x6ed9eba1;
                }
            }
            else {
                if (i < 60) {
                    f = (b & c) | (d & (b | c));
                    k = 0x8f1bbcdc;
                }
                else {
                    f = b ^ c ^ d;
                    k = 0xca62c1d6;
                }
            }
            var t = (((a << 5) | (a >>> 27)) + f + e + k + W[i]) & 0xffffffff;
            e = d;
            d = c;
            c = ((b << 30) | (b >>> 2)) & 0xffffffff;
            b = a;
            a = t;
        }
        this.chain_[0] = (this.chain_[0] + a) & 0xffffffff;
        this.chain_[1] = (this.chain_[1] + b) & 0xffffffff;
        this.chain_[2] = (this.chain_[2] + c) & 0xffffffff;
        this.chain_[3] = (this.chain_[3] + d) & 0xffffffff;
        this.chain_[4] = (this.chain_[4] + e) & 0xffffffff;
    };
    Sha1.prototype.update = function (bytes, length) {
        // TODO(johnlenz): tighten the function signature and remove this check
        if (bytes == null) {
            return;
        }
        if (length === undefined) {
            length = bytes.length;
        }
        var lengthMinusBlock = length - this.blockSize;
        var n = 0;
        // Using local instead of member variables gives ~5% speedup on Firefox 16.
        var buf = this.buf_;
        var inbuf = this.inbuf_;
        // The outer while loop should execute at most twice.
        while (n < length) {
            // When we have no data in the block to top up, we can directly process the
            // input buffer (assuming it contains sufficient data). This gives ~25%
            // speedup on Chrome 23 and ~15% speedup on Firefox 16, but requires that
            // the data is provided in large chunks (or in multiples of 64 bytes).
            if (inbuf === 0) {
                while (n <= lengthMinusBlock) {
                    this.compress_(bytes, n);
                    n += this.blockSize;
                }
            }
            if (typeof bytes === 'string') {
                while (n < length) {
                    buf[inbuf] = bytes.charCodeAt(n);
                    ++inbuf;
                    ++n;
                    if (inbuf === this.blockSize) {
                        this.compress_(buf);
                        inbuf = 0;
                        // Jump to the outer loop so we use the full-block optimization.
                        break;
                    }
                }
            }
            else {
                while (n < length) {
                    buf[inbuf] = bytes[n];
                    ++inbuf;
                    ++n;
                    if (inbuf === this.blockSize) {
                        this.compress_(buf);
                        inbuf = 0;
                        // Jump to the outer loop so we use the full-block optimization.
                        break;
                    }
                }
            }
        }
        this.inbuf_ = inbuf;
        this.total_ += length;
    };
    /** @override */
    Sha1.prototype.digest = function () {
        var digest = [];
        var totalBits = this.total_ * 8;
        // Add pad 0x80 0x00*.
        if (this.inbuf_ < 56) {
            this.update(this.pad_, 56 - this.inbuf_);
        }
        else {
            this.update(this.pad_, this.blockSize - (this.inbuf_ - 56));
        }
        // Add # bits.
        for (var i = this.blockSize - 1; i >= 56; i--) {
            this.buf_[i] = totalBits & 255;
            totalBits /= 256; // Don't use bit-shifting here!
        }
        this.compress_(this.buf_);
        var n = 0;
        for (var i = 0; i < 5; i++) {
            for (var j = 24; j >= 0; j -= 8) {
                digest[n] = (this.chain_[i] >> j) & 255;
                ++n;
            }
        }
        return digest;
    };
    return Sha1;
}());

/**
 * Helper to make a Subscribe function (just like Promise helps make a
 * Thenable).
 *
 * @param executor Function which can make calls to a single Observer
 *     as a proxy.
 * @param onNoObservers Callback when count of Observers goes to zero.
 */
function createSubscribe(executor, onNoObservers) {
    var proxy = new ObserverProxy(executor, onNoObservers);
    return proxy.subscribe.bind(proxy);
}
/**
 * Implement fan-out for any number of Observers attached via a subscribe
 * function.
 */
var ObserverProxy = /** @class */ (function () {
    /**
     * @param executor Function which can make calls to a single Observer
     *     as a proxy.
     * @param onNoObservers Callback when count of Observers goes to zero.
     */
    function ObserverProxy(executor, onNoObservers) {
        var _this = this;
        this.observers = [];
        this.unsubscribes = [];
        this.observerCount = 0;
        // Micro-task scheduling by calling task.then().
        this.task = Promise.resolve();
        this.finalized = false;
        this.onNoObservers = onNoObservers;
        // Call the executor asynchronously so subscribers that are called
        // synchronously after the creation of the subscribe function
        // can still receive the very first value generated in the executor.
        this.task
            .then(function () {
            executor(_this);
        })
            .catch(function (e) {
            _this.error(e);
        });
    }
    ObserverProxy.prototype.next = function (value) {
        this.forEachObserver(function (observer) {
            observer.next(value);
        });
    };
    ObserverProxy.prototype.error = function (error) {
        this.forEachObserver(function (observer) {
            observer.error(error);
        });
        this.close(error);
    };
    ObserverProxy.prototype.complete = function () {
        this.forEachObserver(function (observer) {
            observer.complete();
        });
        this.close();
    };
    /**
     * Subscribe function that can be used to add an Observer to the fan-out list.
     *
     * - We require that no event is sent to a subscriber sychronously to their
     *   call to subscribe().
     */
    ObserverProxy.prototype.subscribe = function (nextOrObserver, error, complete) {
        var _this = this;
        var observer;
        if (nextOrObserver === undefined &&
            error === undefined &&
            complete === undefined) {
            throw new Error('Missing Observer.');
        }
        // Assemble an Observer object when passed as callback functions.
        if (implementsAnyMethods(nextOrObserver, [
            'next',
            'error',
            'complete'
        ])) {
            observer = nextOrObserver;
        }
        else {
            observer = {
                next: nextOrObserver,
                error: error,
                complete: complete
            };
        }
        if (observer.next === undefined) {
            observer.next = noop;
        }
        if (observer.error === undefined) {
            observer.error = noop;
        }
        if (observer.complete === undefined) {
            observer.complete = noop;
        }
        var unsub = this.unsubscribeOne.bind(this, this.observers.length);
        // Attempt to subscribe to a terminated Observable - we
        // just respond to the Observer with the final error or complete
        // event.
        if (this.finalized) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            this.task.then(function () {
                try {
                    if (_this.finalError) {
                        observer.error(_this.finalError);
                    }
                    else {
                        observer.complete();
                    }
                }
                catch (e) {
                    // nothing
                }
                return;
            });
        }
        this.observers.push(observer);
        return unsub;
    };
    // Unsubscribe is synchronous - we guarantee that no events are sent to
    // any unsubscribed Observer.
    ObserverProxy.prototype.unsubscribeOne = function (i) {
        if (this.observers === undefined || this.observers[i] === undefined) {
            return;
        }
        delete this.observers[i];
        this.observerCount -= 1;
        if (this.observerCount === 0 && this.onNoObservers !== undefined) {
            this.onNoObservers(this);
        }
    };
    ObserverProxy.prototype.forEachObserver = function (fn) {
        if (this.finalized) {
            // Already closed by previous event....just eat the additional values.
            return;
        }
        // Since sendOne calls asynchronously - there is no chance that
        // this.observers will become undefined.
        for (var i = 0; i < this.observers.length; i++) {
            this.sendOne(i, fn);
        }
    };
    // Call the Observer via one of it's callback function. We are careful to
    // confirm that the observe has not been unsubscribed since this asynchronous
    // function had been queued.
    ObserverProxy.prototype.sendOne = function (i, fn) {
        var _this = this;
        // Execute the callback asynchronously
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this.task.then(function () {
            if (_this.observers !== undefined && _this.observers[i] !== undefined) {
                try {
                    fn(_this.observers[i]);
                }
                catch (e) {
                    // Ignore exceptions raised in Observers or missing methods of an
                    // Observer.
                    // Log error to console. b/31404806
                    if (typeof console !== 'undefined' && console.error) {
                        console.error(e);
                    }
                }
            }
        });
    };
    ObserverProxy.prototype.close = function (err) {
        var _this = this;
        if (this.finalized) {
            return;
        }
        this.finalized = true;
        if (err !== undefined) {
            this.finalError = err;
        }
        // Proxy is no longer needed - garbage collect references
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this.task.then(function () {
            _this.observers = undefined;
            _this.onNoObservers = undefined;
        });
    };
    return ObserverProxy;
}());
/** Turn synchronous function into one called asynchronously. */
function async(fn, onError) {
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        Promise.resolve(true)
            .then(function () {
            fn.apply(void 0, args);
        })
            .catch(function (error) {
            if (onError) {
                onError(error);
            }
        });
    };
}
/**
 * Return true if the object passed in implements any of the named methods.
 */
function implementsAnyMethods(obj, methods) {
    if (typeof obj !== 'object' || obj === null) {
        return false;
    }
    for (var _i = 0, methods_1 = methods; _i < methods_1.length; _i++) {
        var method = methods_1[_i];
        if (method in obj && typeof obj[method] === 'function') {
            return true;
        }
    }
    return false;
}
function noop() {
    // do nothing
}

/**
 * @license
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Check to make sure the appropriate number of arguments are provided for a public function.
 * Throws an error if it fails.
 *
 * @param fnName The function name
 * @param minCount The minimum number of arguments to allow for the function call
 * @param maxCount The maximum number of argument to allow for the function call
 * @param argCount The actual number of arguments provided.
 */
var validateArgCount = function (fnName, minCount, maxCount, argCount) {
    var argError;
    if (argCount < minCount) {
        argError = 'at least ' + minCount;
    }
    else if (argCount > maxCount) {
        argError = maxCount === 0 ? 'none' : 'no more than ' + maxCount;
    }
    if (argError) {
        var error = fnName +
            ' failed: Was called with ' +
            argCount +
            (argCount === 1 ? ' argument.' : ' arguments.') +
            ' Expects ' +
            argError +
            '.';
        throw new Error(error);
    }
};
/**
 * Generates a string to prefix an error message about failed argument validation
 *
 * @param fnName The function name
 * @param argumentNumber The index of the argument
 * @param optional Whether or not the argument is optional
 * @return The prefix to add to the error thrown for validation.
 */
function errorPrefix(fnName, argumentNumber, optional) {
    var argName = '';
    switch (argumentNumber) {
        case 1:
            argName = optional ? 'first' : 'First';
            break;
        case 2:
            argName = optional ? 'second' : 'Second';
            break;
        case 3:
            argName = optional ? 'third' : 'Third';
            break;
        case 4:
            argName = optional ? 'fourth' : 'Fourth';
            break;
        default:
            throw new Error('errorPrefix called with argumentNumber > 4.  Need to update it?');
    }
    var error = fnName + ' failed: ';
    error += argName + ' argument ';
    return error;
}
/**
 * @param fnName
 * @param argumentNumber
 * @param namespace
 * @param optional
 */
function validateNamespace(fnName, argumentNumber, namespace, optional) {
    if (optional && !namespace) {
        return;
    }
    if (typeof namespace !== 'string') {
        //TODO: I should do more validation here. We only allow certain chars in namespaces.
        throw new Error(errorPrefix(fnName, argumentNumber, optional) +
            'must be a valid firebase namespace.');
    }
}
function validateCallback(fnName, argumentNumber, callback, optional) {
    if (optional && !callback) {
        return;
    }
    if (typeof callback !== 'function') {
        throw new Error(errorPrefix(fnName, argumentNumber, optional) +
            'must be a valid function.');
    }
}
function validateContextObject(fnName, argumentNumber, context, optional) {
    if (optional && !context) {
        return;
    }
    if (typeof context !== 'object' || context === null) {
        throw new Error(errorPrefix(fnName, argumentNumber, optional) +
            'must be a valid context object.');
    }
}

/**
 * @license
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// Code originally came from goog.crypt.stringToUtf8ByteArray, but for some reason they
// automatically replaced '\r\n' with '\n', and they didn't handle surrogate pairs,
// so it's been modified.
// Note that not all Unicode characters appear as single characters in JavaScript strings.
// fromCharCode returns the UTF-16 encoding of a character - so some Unicode characters
// use 2 characters in Javascript.  All 4-byte UTF-8 characters begin with a first
// character in the range 0xD800 - 0xDBFF (the first character of a so-called surrogate
// pair).
// See http://www.ecma-international.org/ecma-262/5.1/#sec-15.1.3
/**
 * @param {string} str
 * @return {Array}
 */
var stringToByteArray$1 = function (str) {
    var out = [];
    var p = 0;
    for (var i = 0; i < str.length; i++) {
        var c = str.charCodeAt(i);
        // Is this the lead surrogate in a surrogate pair?
        if (c >= 0xd800 && c <= 0xdbff) {
            var high = c - 0xd800; // the high 10 bits.
            i++;
            assert(i < str.length, 'Surrogate pair missing trail surrogate.');
            var low = str.charCodeAt(i) - 0xdc00; // the low 10 bits.
            c = 0x10000 + (high << 10) + low;
        }
        if (c < 128) {
            out[p++] = c;
        }
        else if (c < 2048) {
            out[p++] = (c >> 6) | 192;
            out[p++] = (c & 63) | 128;
        }
        else if (c < 65536) {
            out[p++] = (c >> 12) | 224;
            out[p++] = ((c >> 6) & 63) | 128;
            out[p++] = (c & 63) | 128;
        }
        else {
            out[p++] = (c >> 18) | 240;
            out[p++] = ((c >> 12) & 63) | 128;
            out[p++] = ((c >> 6) & 63) | 128;
            out[p++] = (c & 63) | 128;
        }
    }
    return out;
};
/**
 * Calculate length without actually converting; useful for doing cheaper validation.
 * @param {string} str
 * @return {number}
 */
var stringLength = function (str) {
    var p = 0;
    for (var i = 0; i < str.length; i++) {
        var c = str.charCodeAt(i);
        if (c < 128) {
            p++;
        }
        else if (c < 2048) {
            p += 2;
        }
        else if (c >= 0xd800 && c <= 0xdbff) {
            // Lead surrogate of a surrogate pair.  The pair together will take 4 bytes to represent.
            p += 4;
            i++; // skip trail surrogate.
        }
        else {
            p += 3;
        }
    }
    return p;
};

exports.CONSTANTS = CONSTANTS;
exports.Deferred = Deferred;
exports.ErrorFactory = ErrorFactory;
exports.FirebaseError = FirebaseError;
exports.Sha1 = Sha1;
exports.assert = assert;
exports.assertionError = assertionError;
exports.async = async;
exports.base64 = base64;
exports.base64Decode = base64Decode;
exports.base64Encode = base64Encode;
exports.contains = contains;
exports.createSubscribe = createSubscribe;
exports.decode = decode;
exports.deepCopy = deepCopy;
exports.deepExtend = deepExtend;
exports.errorPrefix = errorPrefix;
exports.getUA = getUA;
exports.isAdmin = isAdmin;
exports.isBrowser = isBrowser;
exports.isEmpty = isEmpty;
exports.isMobileCordova = isMobileCordova;
exports.isNode = isNode;
exports.isNodeSdk = isNodeSdk;
exports.isReactNative = isReactNative;
exports.isValidFormat = isValidFormat;
exports.isValidTimestamp = isValidTimestamp;
exports.issuedAtTime = issuedAtTime;
exports.jsonEval = jsonEval;
exports.map = map;
exports.querystring = querystring;
exports.querystringDecode = querystringDecode;
exports.safeGet = safeGet;
exports.stringLength = stringLength;
exports.stringToByteArray = stringToByteArray$1;
exports.stringify = stringify;
exports.validateArgCount = validateArgCount;
exports.validateCallback = validateCallback;
exports.validateContextObject = validateContextObject;
exports.validateNamespace = validateNamespace;
//# sourceMappingURL=index.cjs.js.map

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../../webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./node_modules/@firebase/util/node_modules/tslib/tslib.es6.js":
/*!*********************************************************************!*\
  !*** ./node_modules/@firebase/util/node_modules/tslib/tslib.es6.js ***!
  \*********************************************************************/
/*! exports provided: __extends, __assign, __rest, __decorate, __param, __metadata, __awaiter, __generator, __exportStar, __values, __read, __spread, __spreadArrays, __await, __asyncGenerator, __asyncDelegator, __asyncValues, __makeTemplateObject, __importStar, __importDefault */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__extends", function() { return __extends; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__assign", function() { return __assign; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__rest", function() { return __rest; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__decorate", function() { return __decorate; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__param", function() { return __param; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__metadata", function() { return __metadata; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__awaiter", function() { return __awaiter; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__generator", function() { return __generator; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__exportStar", function() { return __exportStar; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__values", function() { return __values; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__read", function() { return __read; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__spread", function() { return __spread; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__spreadArrays", function() { return __spreadArrays; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__await", function() { return __await; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__asyncGenerator", function() { return __asyncGenerator; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__asyncDelegator", function() { return __asyncDelegator; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__asyncValues", function() { return __asyncValues; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__makeTemplateObject", function() { return __makeTemplateObject; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__importStar", function() { return __importStar; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__importDefault", function() { return __importDefault; });
/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    }
    return __assign.apply(this, arguments);
}

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __param(paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
}

function __metadata(metadataKey, metadataValue) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}

function __awaiter(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

function __exportStar(m, exports) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}

function __values(o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
}

function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
}

function __spread() {
    for (var ar = [], i = 0; i < arguments.length; i++)
        ar = ar.concat(__read(arguments[i]));
    return ar;
}

function __spreadArrays() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};

function __await(v) {
    return this instanceof __await ? (this.v = v, this) : new __await(v);
}

function __asyncGenerator(thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
}

function __asyncDelegator(o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
}

function __asyncValues(o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
}

function __makeTemplateObject(cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};

function __importStar(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result.default = mod;
    return result;
}

function __importDefault(mod) {
    return (mod && mod.__esModule) ? mod : { default: mod };
}


/***/ }),

/***/ "./node_modules/css-loader/index.js?!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/src/index.js?!./node_modules/vue-backtotop/src/styles.css?vue&type=style&index=0&lang=css&":
/*!*****************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/css-loader??ref--7-1!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/src??ref--7-2!./node_modules/vue-backtotop/src/styles.css?vue&type=style&index=0&lang=css& ***!
  \*****************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(/*! ../../css-loader/lib/css-base.js */ "./node_modules/css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, ".back-to-top-fade-enter-active, \n.back-to-top-fade-leave-active {\n  transition: opacity .7s;\n}\n.back-to-top-fade-enter, \n.back-to-top-fade-leave-to {\n  opacity: 0;\n}\n.vue-back-to-top {\n  position: fixed;\n  z-index: 1000;\n}\n[dir] .vue-back-to-top {\n  cursor:pointer;\n}\n.vue-back-to-top .default {\n  color: #ffffff;\n  height: 30px;\n  line-height: 30px;\n  width: 160px;\n}\n[dir] .vue-back-to-top .default {\n  background-color: #f5c85c;\n  border-radius: 3px;\n  text-align: center;\n}\n.vue-back-to-top .default span{\n  color:#ffffff;\n}\n.vue-back-to-top--is-footer {\n  bottom: 50% !important;\n  position: absolute;\n}\n[dir] .vue-back-to-top--is-footer {\n  transform: translateY(50%);\n}", ""]);

// exports


/***/ }),

/***/ "./node_modules/firebase/app/dist/index.cjs.js":
/*!*****************************************************!*\
  !*** ./node_modules/firebase/app/dist/index.cjs.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var firebase = _interopDefault(__webpack_require__(/*! @firebase/app */ "./node_modules/@firebase/app/dist/index.cjs.js"));

/**
 * @license
 * Copyright 2018 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

module.exports = firebase;
//# sourceMappingURL=index.cjs.js.map


/***/ }),

/***/ "./node_modules/firebase/auth/dist/index.esm.js":
/*!******************************************************!*\
  !*** ./node_modules/firebase/auth/dist/index.esm.js ***!
  \******************************************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _firebase_auth__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @firebase/auth */ "./node_modules/@firebase/auth/dist/auth.esm.js");

//# sourceMappingURL=index.esm.js.map


/***/ }),

/***/ "./node_modules/style-loader/index.js!./node_modules/css-loader/index.js?!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/src/index.js?!./node_modules/vue-backtotop/src/styles.css?vue&type=style&index=0&lang=css&":
/*!*********************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/style-loader!./node_modules/css-loader??ref--7-1!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/src??ref--7-2!./node_modules/vue-backtotop/src/styles.css?vue&type=style&index=0&lang=css& ***!
  \*********************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


var content = __webpack_require__(/*! !../../css-loader??ref--7-1!../../vue-loader/lib/loaders/stylePostLoader.js!../../postcss-loader/src??ref--7-2!./styles.css?vue&type=style&index=0&lang=css& */ "./node_modules/css-loader/index.js?!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/src/index.js?!./node_modules/vue-backtotop/src/styles.css?vue&type=style&index=0&lang=css&");

if(typeof content === 'string') content = [[module.i, content, '']];

var transform;
var insertInto;



var options = {"hmr":true}

options.transform = transform
options.insertInto = undefined;

var update = __webpack_require__(/*! ../../style-loader/lib/addStyles.js */ "./node_modules/style-loader/lib/addStyles.js")(content, options);

if(content.locals) module.exports = content.locals;

if(false) {}

/***/ }),

/***/ "./node_modules/vue-backtotop/src/BackToTop.vue":
/*!******************************************************!*\
  !*** ./node_modules/vue-backtotop/src/BackToTop.vue ***!
  \******************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _BackToTop_vue_vue_type_template_id_58c5690e___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./BackToTop.vue?vue&type=template&id=58c5690e& */ "./node_modules/vue-backtotop/src/BackToTop.vue?vue&type=template&id=58c5690e&");
/* harmony import */ var _BackToTop_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./BackToTop.vue?vue&type=script&lang=js& */ "./node_modules/vue-backtotop/src/BackToTop.vue?vue&type=script&lang=js&");
/* empty/unused harmony star reexport *//* harmony import */ var _styles_css_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./styles.css?vue&type=style&index=0&lang=css& */ "./node_modules/vue-backtotop/src/styles.css?vue&type=style&index=0&lang=css&");
/* harmony import */ var _vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../vue-loader/lib/runtime/componentNormalizer.js */ "./node_modules/vue-loader/lib/runtime/componentNormalizer.js");






/* normalize component */

var component = Object(_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__["default"])(
  _BackToTop_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__["default"],
  _BackToTop_vue_vue_type_template_id_58c5690e___WEBPACK_IMPORTED_MODULE_0__["render"],
  _BackToTop_vue_vue_type_template_id_58c5690e___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"],
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var api; }
component.options.__file = "node_modules/vue-backtotop/src/BackToTop.vue"
/* harmony default export */ __webpack_exports__["default"] = (component.exports);

/***/ }),

/***/ "./node_modules/vue-backtotop/src/BackToTop.vue?vue&type=script&lang=js&":
/*!*******************************************************************************!*\
  !*** ./node_modules/vue-backtotop/src/BackToTop.vue?vue&type=script&lang=js& ***!
  \*******************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _vue_loader_lib_index_js_vue_loader_options_BackToTop_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../vue-loader/lib??vue-loader-options!./BackToTop.vue?vue&type=script&lang=js& */ "./node_modules/vue-loader/lib/index.js?!./node_modules/vue-backtotop/src/BackToTop.vue?vue&type=script&lang=js&");
/* empty/unused harmony star reexport */ /* harmony default export */ __webpack_exports__["default"] = (_vue_loader_lib_index_js_vue_loader_options_BackToTop_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__["default"]); 

/***/ }),

/***/ "./node_modules/vue-backtotop/src/BackToTop.vue?vue&type=template&id=58c5690e&":
/*!*************************************************************************************!*\
  !*** ./node_modules/vue-backtotop/src/BackToTop.vue?vue&type=template&id=58c5690e& ***!
  \*************************************************************************************/
/*! exports provided: render, staticRenderFns */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _vue_loader_lib_loaders_templateLoader_js_vue_loader_options_vue_loader_lib_index_js_vue_loader_options_BackToTop_vue_vue_type_template_id_58c5690e___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../../vue-loader/lib??vue-loader-options!./BackToTop.vue?vue&type=template&id=58c5690e& */ "./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/vue-loader/lib/index.js?!./node_modules/vue-backtotop/src/BackToTop.vue?vue&type=template&id=58c5690e&");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "render", function() { return _vue_loader_lib_loaders_templateLoader_js_vue_loader_options_vue_loader_lib_index_js_vue_loader_options_BackToTop_vue_vue_type_template_id_58c5690e___WEBPACK_IMPORTED_MODULE_0__["render"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return _vue_loader_lib_loaders_templateLoader_js_vue_loader_options_vue_loader_lib_index_js_vue_loader_options_BackToTop_vue_vue_type_template_id_58c5690e___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"]; });



/***/ }),

/***/ "./node_modules/vue-backtotop/src/main.js":
/*!************************************************!*\
  !*** ./node_modules/vue-backtotop/src/main.js ***!
  \************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _BackToTop_vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./BackToTop.vue */ "./node_modules/vue-backtotop/src/BackToTop.vue");
 

/**
 * Check why can't use () => {}
 */
_BackToTop_vue__WEBPACK_IMPORTED_MODULE_0__["default"].install = function (Vue, options) {
  Vue.component(_BackToTop_vue__WEBPACK_IMPORTED_MODULE_0__["default"].name, _BackToTop_vue__WEBPACK_IMPORTED_MODULE_0__["default"])
}

/* harmony default export */ __webpack_exports__["default"] = (_BackToTop_vue__WEBPACK_IMPORTED_MODULE_0__["default"]);


/***/ }),

/***/ "./node_modules/vue-backtotop/src/styles.css?vue&type=style&index=0&lang=css&":
/*!************************************************************************************!*\
  !*** ./node_modules/vue-backtotop/src/styles.css?vue&type=style&index=0&lang=css& ***!
  \************************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _style_loader_index_js_css_loader_index_js_ref_7_1_vue_loader_lib_loaders_stylePostLoader_js_postcss_loader_src_index_js_ref_7_2_styles_css_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../style-loader!../../css-loader??ref--7-1!../../vue-loader/lib/loaders/stylePostLoader.js!../../postcss-loader/src??ref--7-2!./styles.css?vue&type=style&index=0&lang=css& */ "./node_modules/style-loader/index.js!./node_modules/css-loader/index.js?!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/postcss-loader/src/index.js?!./node_modules/vue-backtotop/src/styles.css?vue&type=style&index=0&lang=css&");
/* harmony import */ var _style_loader_index_js_css_loader_index_js_ref_7_1_vue_loader_lib_loaders_stylePostLoader_js_postcss_loader_src_index_js_ref_7_2_styles_css_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_style_loader_index_js_css_loader_index_js_ref_7_1_vue_loader_lib_loaders_stylePostLoader_js_postcss_loader_src_index_js_ref_7_2_styles_css_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _style_loader_index_js_css_loader_index_js_ref_7_1_vue_loader_lib_loaders_stylePostLoader_js_postcss_loader_src_index_js_ref_7_2_styles_css_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0__) if(["default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _style_loader_index_js_css_loader_index_js_ref_7_1_vue_loader_lib_loaders_stylePostLoader_js_postcss_loader_src_index_js_ref_7_2_styles_css_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_style_loader_index_js_css_loader_index_js_ref_7_1_vue_loader_lib_loaders_stylePostLoader_js_postcss_loader_src_index_js_ref_7_2_styles_css_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "./node_modules/vue-loader/lib/index.js?!./node_modules/vue-backtotop/src/BackToTop.vue?vue&type=script&lang=js&":
/*!*********************************************************************************************************************************!*\
  !*** ./node_modules/vue-loader/lib??vue-loader-options!./node_modules/vue-backtotop/src/BackToTop.vue?vue&type=script&lang=js& ***!
  \*********************************************************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'BackToTop',
  props: {
    text: {
      type: String,
      default: 'Voltar ao topo',
    },
    visibleoffset: {
      type: [String, Number],
      default: 600,
    },
    visibleoffsetbottom: {
      type: [String, Number],
      default: 0,
    },
    right: {
      type: String,
      default: '30px',
    },
    bottom: {
      type: String,
      default: '40px',
    },
    scrollFn: {
      type: Function,
      default: function (eventObject) {},
    }
  },
  data () {
    return {
      visible: false
    }
  },
  mounted () {
    window.smoothscroll = () => {
      let currentScroll = document.documentElement.scrollTop || document.body.scrollTop
      if (currentScroll > 0) {
        window.requestAnimationFrame(window.smoothscroll)
        window.scrollTo(0, Math.floor(currentScroll - (currentScroll / 5)))
      }
    }
    window.addEventListener('scroll', this.catchScroll)
  },
  destroyed () {
    window.removeEventListener('scroll', this.catchScroll)
  },
  methods: {
    /**
     * Catch window scroll event 
     * @return {void}
     */
    catchScroll () {
      const pastTopOffset = window.pageYOffset > parseInt(this.visibleoffset)
      const pastBottomOffset = window.innerHeight + window.pageYOffset >= document.body.offsetHeight - parseInt(this.visibleoffsetbottom)
      this.visible = parseInt(this.visibleoffsetbottom) > 0 ? pastTopOffset && !pastBottomOffset : pastTopOffset
      this.scrollFn(this)
    },
    /**
     * The function who make the magics
     * @return {void}
     */
    backToTop () {
      window.smoothscroll()
      this.$emit('scrolled')
    }
  },
});


/***/ }),

/***/ "./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/vue-loader/lib/index.js?!./node_modules/vue-backtotop/src/BackToTop.vue?vue&type=template&id=58c5690e&":
/*!*******************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib??vue-loader-options!./node_modules/vue-backtotop/src/BackToTop.vue?vue&type=template&id=58c5690e& ***!
  \*******************************************************************************************************************************************************************************************************************/
/*! exports provided: render, staticRenderFns */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "render", function() { return render; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return staticRenderFns; });
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("transition", { attrs: { name: "back-to-top-fade" } }, [
    _c(
      "div",
      {
        directives: [
          {
            name: "show",
            rawName: "v-show",
            value: _vm.visible,
            expression: "visible"
          }
        ],
        staticClass: "vue-back-to-top",
        style: "bottom:" + this.bottom + ";right:" + this.right + ";",
        on: { click: _vm.backToTop }
      },
      [
        _vm._t("default", [
          _c("div", { staticClass: "default" }, [
            _c("span", [
              _vm._v("\n          " + _vm._s(_vm.text) + "\n        ")
            ])
          ])
        ])
      ],
      2
    )
  ])
}
var staticRenderFns = []
render._withStripped = true



/***/ })

}]);