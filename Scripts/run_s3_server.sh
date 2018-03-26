#! /bin/bash

    PATH=/bin:/sbin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin
    JAVA=/usr/bin/java
    MY_STORE_SERVER=/home/ubuntu/CloudProject/storeq.jar
    USER=ubuntu
    /bin/su - $USER -c "$JAVA -jar $MY_STORE_SERVER &"
