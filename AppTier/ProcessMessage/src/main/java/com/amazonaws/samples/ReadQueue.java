package com.amazonaws.samples;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

import org.json.JSONException;
import org.json.JSONObject;

import com.amazonaws.services.sqs.AmazonSQS;
import com.amazonaws.services.sqs.AmazonSQSClientBuilder;
import com.amazonaws.services.sqs.model.Message;
import com.amazonaws.services.sqs.model.ReceiveMessageRequest;
import com.amazonaws.services.sqs.model.SendMessageRequest;

public class ReadQueue {
	private static final AmazonSQS sqs = AmazonSQSClientBuilder.defaultClient();
	private static final String INPUT_QUEUE = "Input_Queue";
	private static final String OUTPUT_QUEUE = "Output_Queue";
	private static final String TENSOR_PATH = "/home/ubuntu/CloudProject/Scripts/run_tensor.sh";
	private static String inputQueueUrl = sqs.getQueueUrl(INPUT_QUEUE).getQueueUrl();
	private static String outputQueueUrl = sqs.getQueueUrl(OUTPUT_QUEUE).getQueueUrl();

	public static void main(String[] args) throws InterruptedException, IOException, JSONException {
		ReadQueue.receiveMsg();
	}

	public static void receiveMsg() throws InterruptedException, IOException, JSONException {
		ReceiveMessageRequest re = new ReceiveMessageRequest(inputQueueUrl).withMaxNumberOfMessages(1);

		while (true) {
			List<Message> message = sqs.receiveMessage(re).getMessages();
			if (message.size() <= 0) {
				System.out.println("Waiting for messages..!!");
				Thread.sleep(5000);
				continue;
			}

			List<String> decoded_message = getInput(message.get(0));
			String id = decoded_message.get(0);
			String input = decoded_message.get(1);

			File f = new File(TENSOR_PATH);
			if (f.exists() && !f.isDirectory()) {
				String command = TENSOR_PATH + " " + input;
				String output = executeScript(command);
				System.out.println("Final Output:" + output);
				sendMsg(id, output);
			}
		}
	}

	private static List<String> getInput(Message message) {
		List<String> list = new ArrayList<>();
		sqs.deleteMessage(inputQueueUrl, message.getReceiptHandle());
		System.out.println("Message Deleted from queue..!!");
		try {
			JSONObject jObject = new JSONObject(message.getBody());
			list.add(jObject.get("id").toString());
			list.add(jObject.get("input").toString());
		} catch (JSONException e) {
			e.printStackTrace();
		}
		return list;
	}

	private static String executeScript(String command) {
		System.out.println("Running Command: " + command);
		StringBuffer output = new StringBuffer();
		Process p;
		try {
			p = Runtime.getRuntime().exec(command);
			System.out.println("Waiting for command to execute...!!");
			p.waitFor();
			System.out.println("Command executed...!!");
			BufferedReader reader = new BufferedReader(new InputStreamReader(p.getInputStream()));
			String line = "";
			while ((line = reader.readLine()) != null) {
				output.append(line + "\n");
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return output.toString();
	}

	public static void sendMsg(String id, String output) throws JSONException {
		JSONObject json = new JSONObject();
		json.append("id", id);
		json.append("output", output);
		sqs.sendMessage(new SendMessageRequest(outputQueueUrl, json.toString()));
	}
}
