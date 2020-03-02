app.controller("authController", function($scope, $rootScope, $http, $location, $timeout, $interval, agentSdkFactory) {
    $scope.accountId = "";

    if (!agentSdkFactory.isInit) {
       agentSdkFactory.init();
       ("Agent SDK init");

       agentSdkFactory.getProperty('chatInfo.accountId', function (accountId) {
           $scope.accountId = accountId;
           console.log("Retrieved Account Id " + $scope.accountId);
       });
   }

   const nonce = () => {
       var text = "";
       const length = 8;
       var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
       for(var i = 0; i < length; i++) {
           text += possible.charAt(Math.floor(Math.random() * possible.length));
       }
       return text;
   };

   $scope.vm = {
       auth:{
           submittable: true,
           result: 'Authentication results will be shown here when available...',
           completed: false
       }
   };

   $scope.data = {
       convId: '',
       accountId: ''
   };


   $scope.sendAuth = function(){

        var updateCallback = function(data) {
  
            console.log('updateCallback ' + JSON.stringify(data));

            var status = data.newValue[0].status;

            if (status) {
                var encryptionToken = data.newValue[0].token;
            
                $http({
                    method: 'POST',
                    url: './auth/user/profile',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: {
                        accountId: $scope.accountId,
                        encryptedtoken: encryptionToken
                    }
                }).then(function(responseData) {
                    var profileInfo = "name: " + responseData.data.name + " email: " + responseData.data.email;

                    $scope.vm.auth.result = profileInfo;
                    console.log(JSON.stringify(responseData));

                    // var consumerData = {
                    //     firstName: responseData.data.given_name,
                    //     lastName: responseData.data.family_name,
                    //     email: responseData.data.email
                    // }

                    // agentSdkFactory.setConsumerProfile(consumerData, 
                    //     function() {
                    //         console.log('Consumer Profile Set ' + JSON.stringify(consumerData));
                    //     }, 
                    //     function(err) {
                    //         console.log(err);
                    //     }
                    // );

                });
            } else {
                $timeout(()=> {
                    $scope.vm.auth.result = 'Authentication Request Failed';
                }, 2000);

                var error_message = data.newValue[0].errors[0].message;
                console.log("Authentication Error Message: " + error_message);
            };

        };
    
        $http({
            method: 'GET',
            url: './auth/accounts/' + $scope.accountId,
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function(responseData) {
            console.log(responseData.data);

            var authJson = {"type":"vertical","tag":"authentication","elements":[{"type":"text","text":"Authentication Request"}]};
            var authMeta =[{"type":"BusinessChatMessage","receivedMessage":{"title":"Tap here to sign in","subtitle":"Thank you","imageURL":"https://s3.amazonaws.com/sc-tasks/Assets/misc/lplogo.png","style":"small"},"replyMessage":{"title":"Successfully signed in!","subtitle":"Thank you","imageURL":"https://s3.amazonaws.com/sc-tasks/Assets/misc/lplogo.png","style":"small"}},{"type":"ConnectorAuthenticationRequest","requestIdentifier":""}];
            
            authMeta[1].requestIdentifier = uuid();
            //authMeta[1].apple = {"oauth2": {"scope":["profile", "openid", "email", "apple-business-chat.read"], "responseEncryptionKey": responseData.data.publickey}}
            //authMeta[1].apple = {"oauth2": {"scope":["profile", "openid", "email", "apple-business-chat.read"], "responseEncryptionKey": responseData.data.publickey, "state": uuid()}}
            //authMeta[1].apple = {"oauth2": {"scope":["profile", "openid", "email"], "responseType": "id_token", "responseEncryptionKey": responseData.data.publickey}}
            authMeta[1].apple = {"oauth2": {"scope":["profile", "openid", "email", "apple-business-chat.read"], "responseType": "code", "clientSecret":"C6tQDH81F5BSyKS", "responseEncryptionKey": responseData.data.publickey, "state": uuid()}}
            //authMeta[1].apple = {"oauth2": {"scope":["profile", "openid", "email", "apple-business-chat.read"], "clientSecret":"C6tQDH81F5BSyKS", "responseEncryptionKey": responseData.data.publickey, "state": uuid()}}
            
            agentSdkFactory.sendSC(authJson, authMeta);

            agentSdkFactory.bindProperty('metadata.connectorAuthResponse', updateCallback);
        });

       $scope.vm.auth.result = 'Authentication bubble sent to visitor';
       $scope.vm.auth.completed = false;

       $timeout(()=>{
           $scope.vm.auth.result = 'Waiting on authentication result... ';
       }, 2250);
   };


});