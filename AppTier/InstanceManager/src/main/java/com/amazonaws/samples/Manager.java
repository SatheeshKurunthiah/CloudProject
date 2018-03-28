package com.amazonaws.samples;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.services.cloudwatch.AmazonCloudWatch;
import com.amazonaws.services.cloudwatch.AmazonCloudWatchClient;
import com.amazonaws.services.cloudwatch.AmazonCloudWatchClientBuilder;
import com.amazonaws.services.cloudwatch.model.Datapoint;
import com.amazonaws.services.cloudwatch.model.Dimension;
import com.amazonaws.services.cloudwatch.model.GetMetricStatisticsRequest;
import com.amazonaws.services.cloudwatch.model.GetMetricStatisticsResult;
import com.amazonaws.services.ec2.AmazonEC2;
import com.amazonaws.services.ec2.AmazonEC2ClientBuilder;
import com.amazonaws.services.ec2.model.DescribeInstancesRequest;
import com.amazonaws.services.ec2.model.DescribeInstancesResult;
import com.amazonaws.services.ec2.model.Filter;
import com.amazonaws.services.ec2.model.Instance;
import com.amazonaws.services.ec2.model.Reservation;
import com.amazonaws.services.ec2.model.RunInstancesRequest;
import com.amazonaws.services.ec2.model.RunInstancesResult;
import com.amazonaws.services.ec2.model.TerminateInstancesRequest;
import com.amazonaws.services.sqs.AmazonSQS;
import com.amazonaws.services.sqs.AmazonSQSClientBuilder;
import com.amazonaws.services.sqs.model.GetQueueAttributesRequest;
import com.amazonaws.services.sqs.model.Message;
import com.amazonaws.services.sqs.model.ReceiveMessageRequest;

public class Manager {
	final static String Queue1 = "Input_Queue";
	final static AmazonSQS sqs = AmazonSQSClientBuilder.defaultClient();
	final static AmazonEC2 ec2 = AmazonEC2ClientBuilder.defaultClient();
	static AmazonCloudWatchClient cloudWatch;
	final static int MaxInstances = 19;
	final static AmazonCloudWatch cw = AmazonCloudWatchClientBuilder.defaultClient();
	private static String key = "AKIAJJGVSSTQZ75HVGTA";
	private static String secret = "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";

	public static int getMessageCount() {
		List<String> Attributes = new ArrayList<String>();
		Attributes.add("ApproximateNumberOfMessages");
		String queueUrl = sqs.getQueueUrl(Queue1).getQueueUrl();
		GetQueueAttributesRequest request = new GetQueueAttributesRequest(queueUrl);
		request.setAttributeNames(Attributes);
		Map<String, String> attributes = sqs.getQueueAttributes(request).getAttributes();
		int Count = Integer.parseInt(attributes.get("ApproximateNumberOfMessages"));
		return Count;
	}

	public static void getMessages() {
		ReceiveMessageRequest receiveMessageRequest = new ReceiveMessageRequest(sqs.getQueueUrl(Queue1).getQueueUrl());
		receiveMessageRequest.setMaxNumberOfMessages(10);

		List<Message> messages = sqs.receiveMessage(receiveMessageRequest).getMessages();
		System.out.println(messages.size());
	}

	public static List<String> getInstances() {
		List<String> Value = new ArrayList<String>();
		Value.add("ami-bfeff9df");
		List<String> instances = new ArrayList<>();
		Filter f = new Filter("image-id", Value);
		DescribeInstancesRequest request = new DescribeInstancesRequest();
		DescribeInstancesResult response = ec2.describeInstances(request.withFilters(f));

		for (Reservation reservation : response.getReservations()) {
			for (Instance instance : reservation.getInstances()) {

				if (instance.getState().getName().equals("running")
						|| instance.getState().getName().equals("pending")) {
					instances.add(instance.getInstanceId());
				}
			}
		}

		return instances;
	}

	private static double getInstanceAverageLoad(String instanceId) {

		long offsetInMilliseconds = 1000 * 60 * 60;
		GetMetricStatisticsRequest request = new GetMetricStatisticsRequest()
				.withStartTime(new Date(new Date().getTime() - offsetInMilliseconds)).withNamespace("AWS/EC2")
				.withPeriod(60 * 5).withDimensions(new Dimension().withName("InstanceId").withValue(instanceId))
				.withMetricName("CPUUtilization").withStatistics("Average", "Maximum").withEndTime(new Date());
		GetMetricStatisticsResult getMetricStatisticsResult = cloudWatch.getMetricStatistics(request);

		double avgCPUUtilization = 0;
		List dataPoint = getMetricStatisticsResult.getDatapoints();

		if (dataPoint.size() > 0) {
			for (Object aDataPoint : dataPoint) {
				Datapoint dp = (Datapoint) aDataPoint;
				avgCPUUtilization = dp.getAverage();
			}
			System.out.println("Instance ID: " + instanceId + " CPU Util: " + avgCPUUtilization);

			return avgCPUUtilization;
		} else {
			System.out.println("No Data point received..");
			return 100.0;
		}
	}

	public static String createInstance() {
		String imageID = "ami-bfeff9df";
		int minInstanceCount = 1;
		int maxInstanceCount = 1;
		String instanceId = null;
		RunInstancesRequest rir = new RunInstancesRequest(imageID, maxInstanceCount, minInstanceCount);
		rir.setInstanceType("t2.micro");

		RunInstancesResult result = ec2.runInstances(rir);

		List<Instance> resultInstance = result.getReservation().getInstances();

		for (Instance ins : resultInstance) {
			System.out.println("New instance has been created:" + ins.getInstanceId());
			instanceId = ins.getInstanceId();

		}
		return instanceId;

	}

	public static void terminateinstance(String instanceId) {
		TerminateInstancesRequest request = new TerminateInstancesRequest().withInstanceIds(instanceId);
		ec2.terminateInstances(request);
		System.out.println("Instance ID : " + instanceId + " terminated");
	}

	public static void scale() throws InterruptedException {
		List<String> instances = getInstances();
		int requestCount = getMessageCount();
		String mainInstance = "";
		int instanceCount = instances.size();
		if (instanceCount == 0) {
			mainInstance = createInstance();
			instanceCount++;
		}
		else
			mainInstance = instances.get(0);
		Thread.sleep(10000);
		while (true) {
			System.out.println("Running Instances: " + instanceCount);
			if (instanceCount < MaxInstances && instanceCount < requestCount + 1) {
				createInstance();
				Thread.sleep(1000);
			} else if (instanceCount > requestCount + 1) {
				instances = getInstances();
				for (String id : instances) {
					if (id.equals(mainInstance))
						continue;
					double utilization = getInstanceAverageLoad(id);
					if (utilization < 5) {
						terminateinstance(id);
					}
				}
				Thread.sleep(10000);
			} else {
				Thread.sleep(10000);
			}
			instanceCount = getInstances().size();
			requestCount = getMessageCount();
		}
	}

	public static void main(String[] args) throws InterruptedException {
		cloudWatch = new AmazonCloudWatchClient(new BasicAWSCredentials(key, secret));
		cloudWatch.setEndpoint("monitoring.us-west-1.amazonaws.com");
		scale();
	}
}
