<?php
require 'vendor/autoload.php';
use Aws\Sqs\SqsClient;
use Aws\Credentials\CredentialProvider;
use Aws\S3\S3Client;

$queue = SqsClient::factory(array(
    'version' => 'latest',
    'region'  => 'us-west-2',
    'credentials' => array(
    	'key' => 'AKIAJMVZ7WZA37QWGEBQ',
    	'secret'  => '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',
    )
));

$s3 = S3Client::factory(array(
    'version' => 'latest',
    'region' => 'us-west-2',
    'credentials' => array(
    	'key' => 'AKIAJMVZ7WZA37QWGEBQ',
      	'secret'  => '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',
    )
));

$input_queue = 'https://sqs.us-west-2.amazonaws.com/858081815435/Input_Queue';
$bucket = 'image-recognition-result';

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
                'Key'    => $filename,
                'SaveAs' => "/home/ubuntu/CloudProject/Results/" . $filename
            ));
            $image_result = file_get_contents("/home/ubuntu/CloudProject/Results/" . $filename);
            $output = "[" . $filename . "," . $image_result . "]";
            http_response_code(200);
            echo $output . "\n";
            break;
        }
    } catch (S3Exception $e) {}
}

return $output;
?>