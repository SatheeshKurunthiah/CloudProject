package com.amazonaws.samples;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Map;

import com.amazonaws.services.sqs.AmazonSQS;
import com.amazonaws.services.sqs.AmazonSQSClientBuilder;

import com.amazonaws.services.sqs.model.GetQueueAttributesRequest;
import com.amazonaws.services.sqs.model.Message;
import com.amazonaws.services.sqs.model.ReceiveMessageRequest;
import com.amazonaws.services.cloudwatch.AmazonCloudWatch;
import com.amazonaws.services.cloudwatch.AmazonCloudWatchClient;
import com.amazonaws.services.cloudwatch.AmazonCloudWatchClientBuilder;
import com.amazonaws.services.cloudwatch.model.Dimension;
import com.amazonaws.services.cloudwatch.model.GetMetricStatisticsRequest;
import com.amazonaws.services.cloudwatch.model.GetMetricStatisticsResult;
import com.amazonaws.services.cloudwatch.model.MetricAlarm;
import com.amazonaws.services.cloudwatch.model.PutMetricAlarmRequest;
import com.amazonaws.services.cloudwatch.model.PutMetricAlarmResult;
import com.amazonaws.services.cloudwatch.model.StandardUnit;
import com.amazonaws.services.cloudwatch.model.Statistic;
import com.amazonaws.services.cloudwatch.model.ComparisonOperator;
import com.amazonaws.services.cloudwatch.model.DeleteAlarmsRequest;
import com.amazonaws.services.cloudwatch.model.DeleteAlarmsResult;
import com.amazonaws.services.cloudwatch.model.DescribeAlarmsRequest;
import com.amazonaws.services.cloudwatch.model.DescribeAlarmsResult;
import com.amazonaws.services.ec2.AmazonEC2;
import com.amazonaws.services.ec2.AmazonEC2ClientBuilder;
import com.amazonaws.services.ec2.model.DescribeInstancesRequest;
import com.amazonaws.services.ec2.model.DescribeInstancesResult;
import com.amazonaws.services.ec2.model.Filter;
import com.amazonaws.services.ec2.model.Instance;
import com.amazonaws.services.ec2.model.Reservation;
import com.amazonaws.services.ec2.model.RunInstancesRequest;
import com.amazonaws.services.ec2.model.RunInstancesResult;

public class Scaling {
	
	final static String Queue1 = "Input_Queue";
	final static AmazonSQS sqs = AmazonSQSClientBuilder.defaultClient();
	final static AmazonEC2 ec2 = AmazonEC2ClientBuilder.defaultClient();
	final static int MaxInstances = 9;
	final static AmazonCloudWatch cw = AmazonCloudWatchClientBuilder.defaultClient();
	final static HandleAlarms alarm = new HandleAlarms();

	
	public static int getMessageCount()
	{
		List<String> Attributes = new ArrayList<String>();
		Attributes.add("ApproximateNumberOfMessages");
		String queueUrl = sqs.getQueueUrl(Queue1).getQueueUrl();
		GetQueueAttributesRequest request = new GetQueueAttributesRequest(queueUrl);
		request.setAttributeNames(Attributes);
		Map<String, String> attributes = sqs.getQueueAttributes(request).getAttributes();
		int Count = Integer.parseInt(attributes.get("ApproximateNumberOfMessages"));
		return Count;
	}
	
	public static void getMessages()
	{
		ReceiveMessageRequest receiveMessageRequest = new ReceiveMessageRequest(sqs.getQueueUrl(Queue1).getQueueUrl());
        receiveMessageRequest.setMaxNumberOfMessages(10);

        List<Message> messages = sqs.receiveMessage(receiveMessageRequest).getMessages();
        System.out.println(messages.size());
	}
	
	public static int getInstances()
	{
		boolean done = false;
		int count = 0;
		List<String> Value = new ArrayList<String>();
		Value.add("ami-32213752");
		Filter f = new Filter("image-id", Value);
		
		DescribeInstancesRequest request = new DescribeInstancesRequest();
		while(!done) {
		    DescribeInstancesResult response = ec2.describeInstances(request.withFilters(f));

		    for(Reservation reservation : response.getReservations()) {
		        for(Instance instance : reservation.getInstances()) {
		        		
		        		if (instance.getState().getName().equals("running") || instance.getState().getName().equals("pending"))
		        		{
		        			//if (!instance.getImageId().equals("ami-07585467"))
		        			count +=1;
		        		}
						
		            /*System.out.printf(
		                "Found instance with id %s, " +
		                "AMI %s, " +
		                "type %s, " +
		                "state %s " +
		                "and monitoring state %s\n",
		                instance.getInstanceId(),
		                instance.getImageId(),
		                instance.getInstanceType(),
		                instance.getState().getName(),
		                instance.getMonitoring().getState());*/
		        }
		    }

		    request.setNextToken(response.getNextToken());

		    if(response.getNextToken() == null) {
		        done = true;
		    }
		}
		return count;
	}
	
	public static String createInstance()
	{
		String imageID="ami-32213752";
		int minInstanceCount=1;
        int maxInstanceCount=1;
        String instanceId = null;
        RunInstancesRequest rir=new RunInstancesRequest(imageID,maxInstanceCount,minInstanceCount);
        rir.setInstanceType("t2.micro");
        
        RunInstancesResult result=ec2.runInstances(rir);
        
        List<Instance> resultInstance=result.getReservation().getInstances();
        
        for(Instance ins:resultInstance)
        {
            System.out.println("New instance has been created:"+ins.getInstanceId());
            instanceId = ins.getInstanceId();
            
        }
        return instanceId;
        
        
	}
	
	public static void scale() throws InterruptedException
	{
		String instanceId = null;
		String alarmName = null;
		int instanceCount = getInstances();
		int requestCount = getMessageCount();
		System.out.println("Running Instances: " + instanceCount);
		Thread.sleep(2000);
		if (instanceCount == 0)
		{
			instanceId = createInstance();
			alarmName = "Alarm" + instanceId;
			alarm.createCloudWatchAlarm(instanceId,alarmName);
		}
		while (true) {
			if(instanceCount < MaxInstances && requestCount > 0)
			{
				instanceId = createInstance();
				alarmName = "Alarm" + instanceId;
				alarm.createCloudWatchAlarm(instanceId,alarmName);
				Thread.sleep(1000);
			}else {
				Thread.sleep(10000);
			}
			instanceCount = getInstances();
			requestCount = getMessageCount();
		}
	}
	
	
	public static void main(String[] args) throws InterruptedException {
			scale();
	}
}
