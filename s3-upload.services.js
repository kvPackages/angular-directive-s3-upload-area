angular
	.module('ngS3Upload')

	.factory('S3Upload', function(){
		
		var S3Upload = function(options){
			this._options = options;
		};

		S3Upload.prototype.updateConfig = function(key, val){
			this._options[key] = val;
		};

		S3Upload.prototype.uploadFile = function(file){
			var options = this._options,
				creds = options.creds;

            AWS.config.update({
                accessKeyId: creds.access_key,
                secretAccessKey: creds.secret_key
            });

            AWS.config.region = 'us-east-1';
            var bucket = new AWS.S3({
                params: {
                    Bucket: creds.bucket,
                }
            });

            if(typeof options.onStart === 'function'){
        		options.onStart(file);
        	}
     
            bucket.putObject({
                Key: file.name,
                ContentType: file.type,
                Body: file,
                ServerSideEncryption: 'AES256'
            }, function(err, data) {
                if(err){
                    // There Was An Error With Your S3 Config
                    if(typeof options.onError === 'function'){
                		options.onError(err, file);
                	}
                    return false;
                } else {
                    // Success!
                    if(typeof options.onSuccess === 'function'){
                		options.onSuccess('https://'+creds.bucket+'.s3.amazonaws.com/'+encodeURIComponent(file.name), file);
                	}
                }
            })
            .on('httpUploadProgress',function(progress, file) {
                // Log Progress Information
                if(typeof options.onProgress === 'function'){
                	options.onProgress(Math.round(progress.loaded / progress.total * 100));
                }
            });
		};

		return S3Upload;
	});
