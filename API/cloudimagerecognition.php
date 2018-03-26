<?php
require 'vendor/autoload.php';
use Aws\Sqs\SqsClient;
use Aws\Credentials\CredentialProvider;
use Aws\S3\S3Client;

$queue = SqsClient::factory(array(
    'version' => 'latest',
    'region'  => 'us-west-1',
    'credentials' => array(
    	'key' => 'AKIAJMVZ7WZA37QWGEBQ',
    	'secret'  => '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',
    )
));

$s3 = S3Client::factory(array(
    'version' => 'latest',
    'region' => 'us-west-1',
    'credentials' => array(
    	'key' => 'AKIAJMVZ7WZA37QWGEBQ',
      	'secret'  => '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',
    )
));

$input_queue = 'https://sqs.us-west-1.amazonaws.com/858081815435/Input_Queue';
$bucket = 'image-recognition-results';

$req = new stdClass();
$req->id = rand();
$req->input = $_GET['input'];
$req_json = json_encode($req);

$queue->sendMessage(array(
    'QueueUrl'    => $input_queue,
    'MessageBody' => $req_json
));

$filename = basename(parse_url($_GET['input'], PHP_URL_PATH));

while(true){
    sleep(1);
    try {
        if($s3->doesObjectExist($bucket, $filename)){
            $result = $s3->getObject(array(
                'Bucket' => $bucket,
                'Key'    => $filename
            ));
            $image_result = (string) $result['Body'];
            $output = "[" . $filename . "," . $image_result . "]";
            echo $output . "\n";
            http_response_code(200);
            break;
        }
    } catch (S3Exception $e) {}
}

return $output;
?>