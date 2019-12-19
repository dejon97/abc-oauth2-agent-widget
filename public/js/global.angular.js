var app = angular.module("abc-oauth2-app", []);

agentSdkFactory.$inject = ['$window'];
lpAuthentication.$inject = ['$window'];

app.factory('agentSdkFactory', agentSdkFactory);
app.factory('lpAuthentication', lpAuthentication);

app.config(['$locationProvider', function ($locationProvider) {
    $locationProvider.html5Mode({ enabled: true, requireBase: false });
}]);
app.config(['$httpProvider', function($httpProvider) {
    if (!$httpProvider.defaults.headers.get) {
        $httpProvider.defaults.headers.get = {};    
    }
}]);

app.directive('authWindow', function () {
    var directive = {};
    directive.restrict = 'E';
    directive.scope = false;
    directive.template = '<div></div>';
    return directive;
});

app.config(['$locationProvider', function ($locationProvider) {
    $locationProvider.html5Mode({ enabled: true, requireBase: false });
}]);

var uuid = function uuid() {
    var uuid = "", i, random;
    for (i = 0; i < 32; i++) {
        random = Math.random() * 16 | 0;

        if (i == 8 || i == 12 || i == 16 || i == 20) {
            uuid += "-"
        }
        uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
    }
    return uuid;
};

//lightweight encapsulation of authentication flows
function lpAuthentication() {
    var getAuthenticationStatus = function () {
        return false;
    };

    var authenticate = function () {
        //todo - complete authentication flow lightweight
    };

    return {
        getAuthenticationStatus: getAuthenticationStatus,
        authenticate: authenticate
    };
}

//factory encapsulation of LivePerson Agent Workspace Widget SDK
function agentSdkFactory($window) {
    var isInit = false;

    var init = function () {
        $window.lpTag.agentSDK.init();
        isInit = true;
    };

    var addConversationLine = function (content, callback) {
        $window.lpTag.agentSDK.command($window.lpTag.agentSDK.cmdNames.write, content, callback);
    };

    var sendStructuredContent = function (json, metadata) {
        var cmdName = $window.lpTag.agentSDK.cmdNames.writeSC;
        var data = {
            json: json,
            metadata: metadata
        };
        $window.lpTag.agentSDK.command(cmdName, data, function (err) {
            console.log('Error sending SC ', err);
        });
    };

    var onVisitorBlur = function (callback) {
        $window.lpTag.agentSDK.onVisitorBlurred(callback);
    };

    var onVisitorFocus = function (callback) {
        $window.lpTag.agentSDK.onVisitorFocused(callback);
    };

    var setConsumerProfile = function(consumerData, callback, error) {
        $window.lpTag.agentSDK.setConsumerProfile(consumerData, callback, error);
    }

    var getProperty = function getProperty(propName, callback) {
        setTimeout(() => {
            $window.lpTag.agentSDK.get(propName, function (data) {
                console.log('retrieved property ' + propName + ' || ' + data);
                callback(data);
            }, function (err) {
                console.log('Failed to retrieve ' + propName);
                //getProperty(propName, callback)
            });
        }, 500);
    };

    var bindProperty = function bindProperty(propName, callback) {
        setTimeout(() => {
            $window.lpTag.agentSDK.bind(propName, function (data) {
                console.log('bound to property ' + propName + ' || ' + JSON.stringify(data));
                callback(data);
            }, function (err) {
                if (err) {
                    console.log('bindProperty ' + err);
                }
            });
        }, 500);
    };

    var sendSC = function sendSC(json, metadata) {
        var cmdName = "Write StructuredContent"; //$window.lpTag.agentSDK.cmdNames.writeSC;
        var data = {
            json: json,
            metadata: metadata
        };
        console.log('SC Data is ' + JSON.stringify(data));
        $window.lpTag.agentSDK.command(cmdName, data, function (err) {
            if (err) {
                console.log('Error sending SC ', err);
            }

            console.log('Completed SC Send');
        });
    };

    return {
        init: init,
        isInit: isInit,
        addConversationLine: addConversationLine,
        sendStructuredContent: sendStructuredContent,
        setConsumerProfile: setConsumerProfile,
        onVisitorBlur: onVisitorBlur,
        onVisitorFocus: onVisitorFocus,
        getProperty: getProperty,
        bindProperty: bindProperty,
        sendSC: sendSC
    };
}
