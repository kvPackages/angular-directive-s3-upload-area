angular
    .module('ngS3Upload', [])

    .directive('s3UploadArea', function($timeout, S3Upload){
        return {
            restrict: 'E',
            transclude: true,
            scope: {
                creds: '=',
                errorEmail: '@',
                errorSubject: '@',
                onSuccess: '&',
                messages: '=',
                allowedFileTypes: '@'
            },
            templateUrl: 'templates/s3-upload-area.directive.html',

            link: function(scope, element, attrs){

                var msgHelper = {
                    _messages: {
                        default: {
                            title: 'Upload File',
                            desc: 'Click here to upload'
                        },
                        noFile: {
                            title: 'No file selected',
                            desc: 'Click here to upload'
                        },
                        success: {
                            title: 'Done uploading %filename%',
                            desc: 'Click here to upload another'
                        },
                        error: {
                            title: 'Whoops Error!',
                            desc: '<a href="mailto:%email%?subject=%subject%&body=%msg%">Let us know about it</a>'
                        },
                        uploading: {
                            title: 'Uploading...',
                            desc: '%filename%'
                        },
                        incorrectFileType: {
                            title: 'Whoops! That file type is not supported',
                            desc: 'The supported filestypes are %allowedFileTypes%'
                        }  
                    },

                    init: function(){
                        if(typeof scope.messages === 'object'){
                            angular.extend(this._messages, scope.messages);
                        }
                    },

                    _parseVarsInStr: function(str, vars){
                        for(var key in vars){
                            str = str.replace('%'+key+'%', vars[key]);
                        }
                        return str;
                    },

                    get: function(state, field, vars){
                        return this._parseVarsInStr(this._messages[state][field], vars);
                    }
                };

                msgHelper.init();

                var s3upload = new S3Upload({
                    creds: scope.creds,
                    onStart: function(file){
                        scope.$apply(function(){
                            scope.helper.text = {
                                title: msgHelper.get('uploading', 'title', {}),
                                desc: msgHelper.get('uploading', 'desc', { filename: file.name })
                            };
                            scope.helper.uploading = true;
                        });
                    },
                    onError: function(err, file){
                        scope.$apply(function(){
                            scope.helper.text = {
                                title: msgHelper.get('error', 'title', {}),
                                desc: msgHelper.get('error', 'desc', {
                                    email: scope.errorEmail,
                                    subject: scope.errorSubject,
                                    msg: err.message
                                })
                            };
                            scope.helper.uploading = false;
                            scope.helper.uploadProgress = 0;
                        });
                    },
                    onSuccess: function(url, file){
                        scope.$apply(function(){
                            scope.helper.text = {
                                title: msgHelper.get('success', 'title', { filename: file.name }),
                                desc: msgHelper.get('success', 'desc', {})
                            };
                            scope.helper.uploading = false;
                            scope.helper.uploadProgress = 0;
                            scope.onSuccess({ url: url, file: file });
                        });
                    },
                    onProgress: function(percentage){
                        scope.$apply(function(){
                            scope.helper.uploadProgress = percentage;
                        });
                    }
                });

                var allowedFileTypes = scope.allowedFileTypes.split(',');
                var uploadFile = function(file){
                    if(allowedFileTypes.indexOf(file.type) === -1){
                        //unsupported filetype
                        scope.$apply(function(){
                            scope.helper.text = {
                                title: msgHelper.get('incorrectFileType', 'title', {}),
                                desc: msgHelper.get('incorrectFileType', 'desc', {
                                    allowedFileTypes: allowedFileTypes.join(', ')
                                })
                            };
                        });
                        return;
                    }

                    if(file){
                        s3upload.uploadFile(file);
                    } else {
                        // No File Selected
                        scope.helper.text = {
                            title: msgHelper.get('noFile', 'title', {}),
                            desc: msgHelper.get('noFile', 'desc', {})
                        };
                    }
                };

                var fileInputEl = angular.element(document.getElementById('file-input'));
                fileInputEl.bind('change', function(event){
                    var files = event.target.files,
                        file = files[0];
                    uploadFile(file);
                });

                scope.helper = {
                    text:{
                        title: msgHelper.get('default', 'title', {}),
                        desc: msgHelper.get('default', 'desc', {})
                    },
                    uploading: false,
                    uploadProgress: 0,
                    onFileDrop: function(files){
                        uploadFile(files[0]);
                    },
                    triggerFilePicker: function(){
                        if(!scope.helper.uploading){
                            fileInputEl[0].click();
                        }
                    }
                };
            
            } 
        }
    })

    .filter('unsafe', function($sce) {
        return function(val) {
            return $sce.trustAsHtml(val);
        };
    });

