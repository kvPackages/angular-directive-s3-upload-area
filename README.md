**Dependencies**
```
bower install kvPackages/kv-package-angular-directive-file-drop aws-sdk-js --save
```

**S3 Management**

CORS Configuration
```
<?xml version="1.0" encoding="UTF-8"?>
<CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
    <CORSRule>
        <AllowedOrigin>http://localhost:9000</AllowedOrigin>
        <AllowedOrigin>YOUR_REMOTE_DOMAIN</AllowedOrigin>
        <AllowedMethod>PUT</AllowedMethod>
        <MaxAgeSeconds>10000</MaxAgeSeconds>
        <ExposeHeader>x-amz-server-side-encryption</ExposeHeader>
        <ExposeHeader>x-amz-request-id</ExposeHeader>
        <ExposeHeader>x-amz-id-2</ExposeHeader>
        <AllowedHeader>*</AllowedHeader>
    </CORSRule>
</CORSConfiguration>
```

Bucket Policy
```
{
	"Version": "2012-10-17",
	"Id": "Policy1444484273488",
	"Statement": [
		{
			"Sid": "Stmt1444484271193",
			"Effect": "Allow",
			"Principal": {
				"AWS": "arn:aws:iam::643177771640:user/app_public"
			},
			"Action": [
				"s3:PutObjectAcl",
				"s3:PutObject"
			],
			"Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
		}
	]
}
```
