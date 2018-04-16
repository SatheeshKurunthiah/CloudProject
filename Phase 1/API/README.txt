This folder has a single php file and handles the request from outside world.

AWS PHP SDK has to be installed before running this program.

https://docs.aws.amazon.com/aws-sdk-php/v3/guide/getting-started/installation.html 

This app is deployed in Apache web server in an EC2 instance (Main Controller)

https://www.digitalocean.com/community/tutorials/how-to-install-linux-apache-mysql-php-lamp-stack-on-ubuntu-16-04

This program will simply push the messages that it receives from outside into the input queue. It also waits until the requested file name is available in S3 as a key. Then, it reads the corresponding value and sends the output as response to the request.
