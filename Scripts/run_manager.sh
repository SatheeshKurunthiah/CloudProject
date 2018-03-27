#! /bin/bash

    PATH=/bin:/sbin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin
    JAVA=/usr/bin/java
    MY_MANAGER_SERVER=/home/ubuntu/CloudProject/manager.jar
    USER=ubuntu
    /bin/su - $USER -c "$JAVA -jar $MY_MANAGER_SERVER &"
