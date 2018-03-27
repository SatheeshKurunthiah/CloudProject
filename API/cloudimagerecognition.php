<?php
require 'vendor/autoload.php';
use Aws\Sqs\SqsClient;
use Aws\Credentials\CredentialProvider;
use Aws\S3\S3Client;

$queue = SqsClient::factory(array(
    'version' => 'latest',
    'region'  => 'us-west-1',
    'credentials' => array(
    	'key' => 'AKIAJJGVSSTQZ75HVGTA',
    	'secret'  => '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',
    )
));

$s3 = S3Client::factory(array(
    'version' => 'latest',
    'region' => 'us-west-1',
    'credentials' => array(
    	'key' => 'AKIAJJGVSSTQZ75HVGTA',
      	'secret'  => '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',
    )
));

$input_queue = 'https://sqs.us-west-1.amazonaws.com/436902321227/Input_Queue';
$bucket = 'cloud-image-recognition-results';

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