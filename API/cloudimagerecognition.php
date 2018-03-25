<?php
require 'vendor/autoload.php';
use Aws\Sqs\SqsClient;
use Aws\Credentials\CredentialProvider;
use Aws\S3\S3Client;

echo 'your input is ';
echo $_GET['input'];

$queue = SqsClient::factory(array(
    'version' => 'latest',
    'region'  => 'us-west-1',
    'credentials' => array(
    	'key' => 'AKIAJMVZ7WZA37QWGEBQ',
    	'secret'  => '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',
    )
));

$input_queue = 'https://sqs.us-west-1.amazonaws.com/858081815435/Input_Queue';

$req = new stdClass();
$req->id = rand();
$req->input = $_GET['input'];
$req_json = json_encode($req);

$queue->sendMessage(array(
    'QueueUrl'    => $input_queue,
    'MessageBody' => $req_json,
));

http_response_code(200);

?>