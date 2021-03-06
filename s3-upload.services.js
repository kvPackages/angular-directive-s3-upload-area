angular
	.module('ngS3Upload')

	.factory('S3Upload', function(){
		
		var S3Upload = function(options){
			this._options = options;
		};

		S3Upload.prototype.updateConfig = function(key, val){
			this._options[key] = val;
		};

        S3Upload.prototype._genRandStr = function(length){
            if(typeof length !== 'number') length = 41;

            // Math.random returns number with length between 16 and 18 chars

            //if length below 16 do in one go
            if(length <= 16){
                return Math.random().toString(36).substring(2,length+2);
            }

            //else calculate how many iterations we need
            var iterations = Math.ceil(length / 16),
                outputStr = '';
            
            for(var i = 0; i < iterations; i++){
                outputStr += Math.random().toString(36).substring(2,18);
            }

            //correct length if it's too high
            if(outputStr.length > length) outputStr = outputStr.substring(0,length);

            return outputStr;
        };

		S3Upload.prototype.uploadFile = function(file){
			var options = this._options,
				creds = options.creds;

            AWS.config.update({
                accessKeyId: creds.access_key,
                secretAccessKey: creds.secret_key
            });

            AWS.config.region = 'us-east-1';

            if(typeof options.onStart === 'function'){
        		options.onStart(file);
        	}

            var filename = file.name;
            if(options.addRandomFilenamePrefix){
                var randomPrefix = this._genRandStr();
                filename = randomPrefix+file.name;
            }

            var awsReqOptions = {
                Bucket: creds.bucket,
                Key: options.uploadPath+filename,
                ContentType: file.type,
                Body: file,
                ServerSideEncryption: 'AES256'
            };

            if(options.filePermissions){
                awsReqOptions.ACL = options.filePermissions;
            }

            var s3 = new AWS.S3.ManagedUpload({
                params: awsReqOptions,
                httpOptions: {
                    timeout: (((1000 * 60) * 60) * 24) * 7 //(((1 sec * 60 = 1min) * 60 = 1h) * 24 = 24h) * 7 = 7d
                }
            });

            s3.send(function(err, data) {
                if(err){
                    // There Was An Error With Your S3 Config
                    if(typeof options.onError === 'function'){
                		options.onError(err, file);
                	}
                    return false;
                } else {
                    // Success!
                    if(typeof options.onSuccess === 'function'){
                        console.log('https://'+creds.bucket+'.s3.amazonaws.com/'+options.uploadPath+encodeURIComponent(filename));
                		options.onSuccess('https://'+creds.bucket+'.s3.amazonaws.com/'+options.uploadPath+encodeURIComponent(filename), file);
                	}
                }
            });

            s3.on('httpUploadProgress',function(progress, file) {
                // Log Progress Information
                if(typeof options.onProgress === 'function'){
                    var percentage = Math.round(progress.loaded / progress.total * 100);
                	options.onProgress(percentage, progress.loaded, progress.total);
                }
            });
		};

		return S3Upload;
	});
