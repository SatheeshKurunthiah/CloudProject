#! /bin/bash

	APP_PATH=/home/satheeshkurunthiah/CloudProject/Phase\ 2/Frontend/app/
	cd $APP_PATH
	echo 'Starting PYTHON Server'
	/bin/su - $USER -c "python3 -m http.server 80"
