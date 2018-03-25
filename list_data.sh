aws s3api list-objects --bucket ${1} | \grep Key | cut -d ":" -f2 | cut -d "\"" -f2
