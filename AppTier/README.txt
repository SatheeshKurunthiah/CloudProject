App tier has 3 Java programs.

All 3 programs are converted into executable jars and made to run as service so that it can handle system restarts.

1. Instance Manager

This program runs in a while loop and checks for the number of messages and dynamically increases the Image Recognition instance up to 19 (19 Image Recognition + 1 Main Controller).

The program when started will create a new instance (Image Recognition) by default and this instance will never get terminated even when there are no messages in the input queue whereas other instances that were created dynamically will get terminated after 5 minutes of idle time.

2. Process Messages

This program runs in a while loop and when a message is available in Input queue it consumes the messages and runs the tensor flow script through a script file names "run_tensor.sh". The results from this script file is then pushed into the Output Queue.

3. Output Queue

This program runs in a while loop and when a message is available in Output Queue it consumes the messages and store the message in S3 in Key, Value pair. The Key would be the file name of the image and Value would be the result from the tensor output. Once it has been stores the messages are removed from the Output Queue.
