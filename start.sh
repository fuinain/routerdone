docker stop routerdone
docker rm routerdone
docker build -t routerdone .
docker run -d --name routerdone -p 20128:20128 --env-file .env -v routerdone-data:/app/data routerdone