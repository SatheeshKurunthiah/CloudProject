package storeOutput;

import java.util.HashMap;
import java.util.List;

import org.json.JSONObject;

import com.amazonaws.AmazonServiceException;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.sqs.AmazonSQS;
import com.amazonaws.services.sqs.AmazonSQSClientBuilder;
import com.amazonaws.services.sqs.model.GetQueueAttributesRequest;
import com.amazonaws.services.sqs.model.GetQueueAttributesResult;
import com.amazonaws.services.sqs.model.Message;
import com.amazonaws.services.sqs.model.ReceiveMessageRequest;


/*
 * Read the messages from the output queue. Process it and put it in a S3 bucket.
 * Once object is stored in the bucket, delete the message from the queue. If some
 * error occurs, do not delete the message so that it will be processed again. If the
 * approximate number of messages in the queue is greater than 10, keep on reading
 * messages from the queue. If it is less than 10, sleep for 10 seconds before
 * reading the queue again. This will reduce the polling of empty or small queue.
 */
public class storeOutput {
	public static void main(String[] args)
	{
		storeOutput.receiveMsg();
	}

	public static void receiveMsg() {
		final AmazonSQS sqs = AmazonSQSClientBuilder.defaultClient();
		String queueUrl = "https://sqs.us-west-2.amazonaws.com/858081815435/Output_Queue";

		// Set message request attributes
		ReceiveMessageRequest messageRequest = new ReceiveMessageRequest(queueUrl);
		messageRequest.setMaxNumberOfMessages(10);
		messageRequest.setWaitTimeSeconds(10);

		// Set queue attributes to request from the queue
		GetQueueAttributesRequest queueRequest = new GetQueueAttributesRequest("ApproximateNumberOfMessages");
		queueRequest.setQueueUrl(queueUrl);
		queueRequest.withAttributeNames("ApproximateNumberOfMessages");

		// Runs forever. Gets message from the queue, parses it, stores it in a bucket
		while (true) {
			GetQueueAttributesResult queueResult = sqs.getQueueAttributes(queueRequest);
			int approxMessages = new Integer(queueResult.getAttributes().get("ApproximateNumberOfMessages"));
			System.out.println("receiveMsg: " + "Approx. number of message in queue: " + approxMessages);

			// Get the messages from queue
			List<Message> messages = sqs.receiveMessage(messageRequest).getMessages();
			System.out.println("receiveMsg: " + "Messages count: " + messages.size());
			HashMap<Integer, String> processedObjects = new HashMap<>();
			for (Message m : messages) {
				JSONObject obj = null;
				try {
					// Parse the message from the queue
					obj = new JSONObject(m.getBody());
					String idStr = obj.get("id").toString();
					idStr = idStr.substring(2, idStr.length() - 2);
					Integer id = new Integer(idStr);
					String input = obj.get("input").toString();
					input = input.substring(2, input.length() - 2);
					String output = obj.get("output").toString();
					output = output.substring(2, output.indexOf("(") - 1);
					String key = input;
					if (!processedObjects.containsKey(id)) {
						System.out.println("receiveMsg: " + "Key: " + key + ", Value: " + output);
						processedObjects.put(id, key);
						// Put the object in the bucket
						storeOutput.putObject("image-recognition-results", key, output);
					} else {
						System.out.println("receiveMsg: " + "Object already exists in bucket");
					}
				} catch (Exception e) {
					e.printStackTrace();
					// If any error occurs, do not delete that message, process it again
					continue;
				}
				// Delete the processed message
				sqs.deleteMessage(queueUrl, m.getReceiptHandle());
			}
			System.out.println("receiveMsg: " + messages.size() + " messages processed from queue");
			try {
				// Sleep only if the approximate number of messages in the queue is less than 10
				if (approxMessages < 10) {
					Thread.sleep(10000);
				}
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
	}

	// Put the object in the bucket
	public static void putObject(String bucketName, String key, String value) {
		final AmazonS3 s3 = AmazonS3ClientBuilder.defaultClient();

		try {
			s3.putObject(bucketName, key, value);
			System.out.println("putObject: Object(" + key + ", " + value + ") stored in bucket");
		} catch (AmazonServiceException e) {
			System.err.println(e.getErrorMessage());
		}
	}
}
