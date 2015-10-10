angular
    .module('s3Upload', [])

    .directive('s3UploadArea', function($timeout, S3Upload){
        return {
            restrict: 'E',
            transclude: true,
            scope: {
                creds: '=',
                errorEmail: '@',
                errorSubject: '@'
            },
            templateUrl: 'templates/s3-upload-area-directive.html',

            link: function(scope, element, attrs){

                var s3upload = new S3Upload({
                    creds: scope.creds,
                    onStart: function(file){
                        scope.$apply(function(){
                            scope.helper.text = {
                                title: 'Uploading...',
                                desc: file.name
                            };
                            scope.helper.uploading = true;
                        });
                    },
                    onError: function(err, file){
                        scope.$apply(function(){
                            scope.helper.text = {
                                title: 'Whoops Error!',
                                desc: '<a href="mailto:'+scope.errorEmail+'?subject='+scope.errorSubject+'&body='+err.message+'">Let us know about it</a>'
                            };
                            scope.helper.uploading = false;
                            scope.helper.uploadProgress = 0;
                        });
                    },
                    onSuccess: function(url, file){
                        scope.$apply(function(){
                            scope.helper.text = {
                                title: 'Done uploading '+file.name,
                                desc: 'Click here to upload another video'
                            };
                            scope.helper.uploading = false;
                            scope.helper.uploadProgress = 0;
                        });
                    },
                    onProgress: function(percentage){
                        scope.$apply(function(){
                            scope.helper.uploadProgress = percentage;
                        });
                    }
                });

                var fileInputEl = angular.element(document.getElementById('file-input'));
                fileInputEl.bind('change', function(event){
                    var files = event.target.files,
                        file = files[0];
                    
                    if(file){
                        s3upload.uploadFile(file);
                    } else {
                        // No File Selected
                        scope.helper.text = {
                            title: 'No file selected',
                            desc: 'Click here and upload a .mp4 file'
                        };
                    }
                });

                scope.helper = {
                    text:{
                        title: 'Upload Video File',
                        desc: 'Click here and upload a .mp4 file'
                    },
                    uploading: false,
                    uploadProgress: 0,
                    closeDialog: function(){
                        location.reload();
                    },
                    triggerFilePicker: function(){
                        if(!scope.helper.uploading){
                            fileInputEl[0].click();
                        }
                    }
                };
            
            } 
        }
    });
