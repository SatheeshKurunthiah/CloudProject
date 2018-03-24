package com.amazonaws.samples;
import com.amazonaws.services.sqs.AmazonSQS;
import com.amazonaws.services.sqs.AmazonSQSClientBuilder;
import com.amazonaws.services.sqs.model.AmazonSQSException;
import com.amazonaws.services.sqs.model.CreateQueueResult;
import com.amazonaws.services.sqs.model.Message;
import com.amazonaws.services.sqs.model.ReceiveMessageRequest;
import com.amazonaws.services.sqs.model.SendMessageBatchRequest;
import com.amazonaws.services.sqs.model.SendMessageBatchRequestEntry;
import com.amazonaws.services.sqs.model.SendMessageRequest;
import com.amazonaws.util.IOUtils;

import java.io.File;
import java.io.IOException;
import java.lang.ProcessBuilder.Redirect;
import java.util.Date;
import java.util.List;
import java.util.Map.Entry;

import org.json.*;
public class readq {

	private static final String QUEUE_NAME = "Input_Queue";
	private static final String QUEUE_NAME1 = "Output_Queue";
	
	public static void main(String[] args)
	{
		
		readq se = new readq();
		se.receiveMsg();
		
	}
	public static void receiveMsg() {
		final AmazonSQS sqs = AmazonSQSClientBuilder.defaultClient();
		String queueUrl = sqs.getQueueUrl(QUEUE_NAME).getQueueUrl();
		
		while(true)
		{
		
		ReceiveMessageRequest re=new ReceiveMessageRequest(queueUrl).withMaxNumberOfMessages(1);
		List<Message> message=sqs.receiveMessage(re).getMessages();
		//List<Message> messages = sqs.receiveMessage(queueUrl)
		// delete messages from the queue
		String id="",input="";
		for (Message m : message) {
			sqs.deleteMessage(queueUrl, m.getReceiptHandle());
			try {
				JSONObject jObject  = new JSONObject(m.getBody());
				id=jObject.get("id").toString();
				input=jObject.get("input").toString();
				//System.out.println(m.getBody());
			} catch (JSONException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			System.out.println(id +" "+input);
			
		}
		
		
		String command="";
		System.out.println("deleted msgs");
		String path="/home/ubuntu/tensorflow/bin/activate";
		File f =new File(path);
		if(f.exists() && !f.isDirectory())
		{
		
		command = "source /home/ubuntu/tensorflow/bin/activate";
		ProcessBuilder pb=new ProcessBuilder(command);
		Process p = null;
		try {
			p = pb.start();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		try {
			p.waitFor();
		} catch (InterruptedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		}
		path="/home/ubuntu/tensorflow/models/tutorials/image/imagenet";
		command="cd /home/ubuntu/tensorflow/models/tutorials/image/imagenet";
		File f2 =new File(path);
		if(f2.exists() && !f2.isDirectory())
		{
		ProcessBuilder pb1=new ProcessBuilder(command);
		Process p1 = null;
		try {
			p1=pb1.start();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		try {
			p1.waitFor();
		} catch (InterruptedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		}
		
		
		String output="";
		File f3=new File("classify_image.py");
		if(f3.exists())
		{
		command="python classify_image.py --image_file "+input+" --num_top_predictions 1 ";
		ProcessBuilder pb2=new ProcessBuilder(command);
		//pb2.redirectOutput(Redirect.appendTo(output));
		Process p2 = null;
		try {
			 output = IOUtils.toString(pb2.start().getInputStream());
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		}
		/*try {
			p2.waitFor();
		} catch (InterruptedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}*/
		sendMsg(id+" "+output);
		
		try {
			Thread.sleep(5000);
		} catch (InterruptedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		}
		
	}
	public static void sendMsg(String message) {
		final AmazonSQS sqs = AmazonSQSClientBuilder.defaultClient();
		String queueUrl = sqs.getQueueUrl(QUEUE_NAME1).getQueueUrl();
		SendMessageRequest send_msg_request = new SendMessageRequest()
			.withQueueUrl(queueUrl)
			.withMessageBody(message)
			.withDelaySeconds(5);
		sqs.sendMessage(send_msg_request);
		//System.out.println("send a msg");
	}



}
