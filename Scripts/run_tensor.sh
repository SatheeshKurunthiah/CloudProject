#! /bin/bash

source ~/tensorflow/bin/activate
cd /home/ubuntu/tensorflow/models/tutorials/image/imagenet
python classify_image.py --image_file $1 --num_top_predictions 1 >> image_result.txt
cat image_result.txt
rm image_result.txt