## Build & Deploy to GCP

### Create Docker Image
```
docker build -t {image_name} .
```
```-t```: tag

### Push Image to Google Container Registry
```
docker push {image_name}
```

### Deploy to Google Cloud Run
```
gcloud run deploy bbq-backend \
  --image {image_name} \
  --platform managed \
  --region asia-east1 \
  --allow-unauthenticated
```


## Note
### Image 
#### View All Images
```
docker image ls
```

#### Delete Image
```
docker image rm {image_id}
```

### Container
#### Run Container
```
docker run -it --name {container_name} -p 80:80 {image_name}
```

```
docker container create --name {container_name} -p {80:80} {image_id}
docker container start {container_name}
```

#### View All Containers
``` 
docker ps -a 
``` 
or 
``` 
docker container ls -a 
```

```-a```: All container 


#### Stop Container
```
docker container stop {container_name}
```

#### 檢查 container log
```
docker logs -f -t {container_name}
```
```-f```: follow

```-t```: timestamps

```-tails {num}```: 顯示最後 num 行

#### 進入 Container 內部
```
docker container exec -it {container_name} sh
```
```exit``` for exit the shell

### 清理
刪除已停止的 Containers
```
docker container prune
```

刪除未使用的 Images
```
docker image prune
```
