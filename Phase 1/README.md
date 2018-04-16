# Cloud Project

Members

Satheesh Kurunthiah - 1212901792
Sachin Sundar Pungampalayam Shanmugasundaram – 1213230978
Raj Sadaye – 1213175416
Shubham Gondane – 1213179615

IP Address - 13.57.183.30

S3 Bucket Name - cloud-image-recognition-results

This project has 4 components.

1. PHP app that pushes the requested file into Input queue and send the result from S3 as response to the request. This program runs in Main Controller (EC2 Instance)

2. Instance Manager is a Java application that runs as a service in Main Controller (EC2 Instance) and dynamically increases the Image Recognition instance based on number of messages in the Input Queue. It also terminates the instances when they are idle for 5 minutes.

3. Output Queue is a Java application that runs as a service in Main Controller (EC2 Instance) and process the messages from Output Queue and stores it in S3 as Key Value pair and deletes the messages from the Output Queue.

4. Process Message is a Java Application that runs as a service in Image Recognition Instance and process the messages in the Input Queue and runs against the Tensor flow script and pushes the result into the Output Queue.
