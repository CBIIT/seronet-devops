var AWS = require('aws-sdk');
var lambda = new AWS.Lambda();
exports.handler = function(event, context) {
    key = event.Records[0].s3.object.key
    bucket = event.Records[0].s3.bucket.name
    if (bucket.includes("nci-seronet-proc-layers")) {
        console.log('Create new shared layer for Seronet proc functions');
		var layerParams = {
			CompatibleRuntimes: [ 
				"python3.8"
			], 
			Content: {
				S3Bucket: bucket, 
				S3Key: key
			}, 
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
			else lambda.listFunctions(funcParams, function(err, funcData) {
					if (err) console.log(err, err.stack);
					else funcData.Functions.forEach(function(lambdaFunc) {
						if (lambdaFunc.FunctionName.includes("nci-seronet-proc") || lambdaFunc.FunctionName.includes("seronet-file-remover-sns")) {
							console.log("Function Name: " + lambdaFunc.FunctionName);
							console.log("Layer to Use: " + layerData.LayerVersionArn);
							var params = {
								FunctionName: lambdaFunc.FunctionName, 
								Layers: [
									layerData.LayerVersionArn,
								],
							};
							lambda.updateFunctionConfiguration(params, function(err, data) {
								if (err) console.log(err, err.stack); // an error occurred
								else     console.log(data);
								});
							}
						});
					});
			
			});
			
    } else {
        if (bucket === "nci-seronet-proc-fileremover") {
			var functionName = "seronet-file-remover-sns";
		} else {
			var functionName = bucket;
		}
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