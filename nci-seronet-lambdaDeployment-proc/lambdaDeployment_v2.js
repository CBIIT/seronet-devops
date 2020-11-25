console.log('Loading function');
var AWS = require('aws-sdk');
var lambda = new AWS.Lambda();
exports.handler = function(event, context) {
    key = event.Records[0].s3.object.key
    bucket = event.Records[0].s3.bucket.name
    if (bucket == "nci-seronet-proc-layers-test") {
        console.log('Create new shared layer');
		var layerParams = {
			CompatibleRuntimes: [ 
				"python3.8"
			], 
			Content: {
				S3Bucket: bucket, 
				S3Key: key
			}, 
			Description: "My Python layer", 
			LayerName: bucket, 
			//LicenseInfo: "MIT"
			};
		var funcParams = {
			//MasterRegion: "us-east-1",
			//FunctionVersion: "ALL",
			//Marker: '',
				MaxItems: 50
				};
		lambda.publishLayerVersion(layerParams, function(err, layerData) {
			if (err) console.log(err, err.stack);
			//else return data.LayerVersionArn;
			//else console.log(data.LayerVersionArn);
			
			else lambda.listFunctions(funcParams, function(err, data) {
					if (err) console.log(err, err.stack);
					else data.Functions.forEach(function(lambdaFunc) {
						if (lambdaFunc.FunctionName.includes("nci-seronet-proc")) {
							console.log(lambdaFunc.FunctionName);
							console.log("update to layer: " + layerData.LayerVersionArn);
							}
						});
					});
			
			});
			
		//console.log('Update all seronet functions to use the latest layer');
		//var params = {
			//MasterRegion: "us-east-1",
			//FunctionVersion: "ALL",
			//Marker: '',
		//		MaxItems: 50
		//		};
		//lambda.listFunctions(params, function(err, data) {
		//	if (err) console.log(err, err.stack);
		//	else data.Functions.forEach(function(lambdaFunc) {
		//		if (lambdaFunc.FunctionName.includes("nci-seronet-proc")) {
		//			console.log(lambdaFunc.FunctionName);
		//			console.log("update to layer: " + newLayer);
		//			}
		//		});
		//	});
    } else {
        var functionName = bucket;
        console.log("uploaded to lambda function: " + functionName);
        var params = {
            FunctionName: functionName,
            S3Key: key,
            S3Bucket: bucket,
        };
        lambda.updateFunctionCode(params, function(err, data) {
            if (err) {
                console.log(err, err.stack);
                context.fail(err);
            } else {
                console.log(data);
                context.succeed(data);
            }
        });
    }
};