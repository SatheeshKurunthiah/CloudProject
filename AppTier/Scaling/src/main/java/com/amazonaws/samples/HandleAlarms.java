package com.amazonaws.samples;

import com.amazonaws.services.cloudwatch.AmazonCloudWatch;
import com.amazonaws.services.cloudwatch.AmazonCloudWatchClientBuilder;
import com.amazonaws.services.cloudwatch.model.ComparisonOperator;
import com.amazonaws.services.cloudwatch.model.DeleteAlarmsRequest;
import com.amazonaws.services.cloudwatch.model.DeleteAlarmsResult;
import com.amazonaws.services.cloudwatch.model.DescribeAlarmsRequest;
import com.amazonaws.services.cloudwatch.model.DescribeAlarmsResult;
import com.amazonaws.services.cloudwatch.model.Dimension;
import com.amazonaws.services.cloudwatch.model.MetricAlarm;
import com.amazonaws.services.cloudwatch.model.PutMetricAlarmRequest;
import com.amazonaws.services.cloudwatch.model.PutMetricAlarmResult;
import com.amazonaws.services.cloudwatch.model.StandardUnit;
import com.amazonaws.services.cloudwatch.model.Statistic;

public class HandleAlarms {
	final static AmazonCloudWatch cw = AmazonCloudWatchClientBuilder.defaultClient();
	public void createCloudWatchAlarm(String instanceId, String alarmName)
	{
		//String alarmName = "Alarm1";
		Dimension dimension = new Dimension().withName("InstanceId").withValue(instanceId);
		PutMetricAlarmRequest request = new PutMetricAlarmRequest()
			    .withAlarmName(alarmName)
			    .withComparisonOperator(
			        ComparisonOperator.LessThanThreshold)
			    .withEvaluationPeriods(1)
			    .withMetricName("CPUUtilization")
			    .withNamespace("AWS/EC2")
			    .withPeriod(300)
			    .withStatistic(Statistic.Average)
			    .withThreshold(4.5)
			    .withActionsEnabled(true)
			    .withAlarmActions("arn:aws:sns:us-west-1:xxxxxxxxx:NotifyMe", "arn:aws:automate:us-west-1:ec2:terminate")
			    .withAlarmDescription(
			        "Alarm when server CPU utilization falls below 4.5%")
			    .withUnit(StandardUnit.Seconds)
			    .withDimensions(dimension);

			PutMetricAlarmResult response = cw.putMetricAlarm(request);
	}
	public void describeCloudWatchAlarm()
	{
		boolean done = false;
		DescribeAlarmsRequest request = new DescribeAlarmsRequest();

		while(!done) {

		    DescribeAlarmsResult response = cw.describeAlarms(request);

		    for(MetricAlarm alarm : response.getMetricAlarms()) {
		        System.out.printf("Retrieved alarm %s", alarm.getAlarmName());
		    }

		    request.setNextToken(response.getNextToken());

		    if(response.getNextToken() == null) {
		        done = true;
		    }
		}
	}
	public void deleteCloudWatchAlarm(String alarmName)
	{
		DeleteAlarmsRequest request = new DeleteAlarmsRequest()
			    .withAlarmNames(alarmName);

			DeleteAlarmsResult response = cw.deleteAlarms(request);
	}
	/*public static void getCloudWatchData()
	{
		@SuppressWarnings("deprecation")
		AmazonCloudWatchClient cloudWatch = new AmazonCloudWatchClient();
		long offsetInMilliseconds = 1000 * 60 * 60 * 24;
		Dimension instanceDimension = new Dimension();
		instanceDimension.setName("instanceid");
		instanceDimension.setValue("i-027433a5b33cf2c37");
		

		GetMetricStatisticsRequest request = new GetMetricStatisticsRequest()
        .withStartTime(new Date(new Date().getTime() - offsetInMilliseconds))
        .withNamespace("AWS/EC2")
        .withPeriod(60 * 60)
        .withMetricName("CPUUtilization")
        .withStatistics("Average")
        .withDimensions(Arrays.asList(instanceDimension))
        .withEndTime(new Date());

		GetMetricStatisticsResult getMetricStatisticsResult = cloudWatch.getMetricStatistics(request);
		System.out.println(getMetricStatisticsResult);
		
	}*/
}
