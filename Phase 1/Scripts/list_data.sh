#!/bin/sh
mkdir -p ./results
aws s3 cp s3://image-recognition-results ./results --recursive > /dev/null
rm output 2>/dev/null
for file in ./results/*
do
	filename=`basename $file`
	content=`cat $file`
	echo "["$filename", "$content"]" >> output
done
cat output
