# mrm-task-npm-aws
MRM task to configure your npm projects with scripts to accomplish blue-green deployments on AWS ECS

These are generic npm scripts that you can configure your `package.json` with and get access to convinience scripts to upload and release your Docker images in spectacular, no-downtime, blue-green fashion. 

## How to Use
```
npm i -g mrm-task-npm-aws
npx mrm npm-aws
```

> Looking for _npm scripts for Docker_? Go [here](https://gist.github.com/duluca/d13e501e870215586271b0f9ce1781ce#file-npm-scripts-for-docker-md)!
> Don't know how to create your own AWS ECS Cluster? Go [here](https://gist.github.com/duluca/ebcf98923f733a1fdb6682f111b1a832#file-step-by-step-how-to-for-aws-ecs-md).

**Watch the video**: [Do More With Less JavaScript](https://youtu.be/Sd1aM8181kc?list=PLtevgo7IoQizTQdXtRKEXGguTQbL0F01_)

## Docker Containers for Static or Angular/React/Vue/etc SPA Websites
* `docker pull duluca/minimal-nginx-web-server`
  * **Documentation:** https://hub.docker.com/r/duluca/minimal-nginx-web-server/
* `docker pull duluca/minimal-node-web-server`
  * **Documentation:** https://hub.docker.com/r/duluca/minimal-node-web-server/

## Features
* **Cross-Platform:** Works on Windows 10 and macOS.
* **`aws:login`:** Using your AWS credentials, gets the Docker for your ECS Container Repository and configures your Docker CLI instance to point at your private repository.
* **`aws:deploy`:** Kicks-off the blue-green deployment your already published image.
* **`aws:release`:** Points Docker to your private ECS repository, publishes your latest build image and then kicks-off deployment.

## Pre-Requisites
* A correctly configured AWS ECS Cluster. Instructions are [here](https://gist.github.com/duluca/ebcf98923f733a1fdb6682f111b1a832#file-step-by-step-how-to-for-aws-ecs-md).
* On your project, first setup [npm scripts for Docker](https://gist.github.com/duluca/d13e501e870215586271b0f9ce1781ce#file-npm-scripts-for-docker-md) and then come back here.
* Create `.env` file and set `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`
  * Sample `.env` file:
  ```Bash
    AWS_ACCESS_KEY_ID=your_own_key_id
    AWS_SECRET_ACCESS_KEY=your_own_secret_key
  ```
* Install AWS CLI
  * Mac: `brew install awscli`
  * Win: `choco install awscli`
* Log in to AWS CLI with your credentials
  * Run `aws configure`
  * You'll need your Access Key ID and Secret Access Key
  * Default region name: `us-east-1`

## Configuring Package.json in 2-steps
### Step 1
> Make sure to update `package.json` from when you configured _npm scripts for Docker_, so that the `imageRepo` property has the address of your new ECS repository.
In your `package.json` file, under the config property, add three new properties using your own values, as shown below:
```json
  ...
  "config": {
    "awsRegion": "your_aws_region",
    "awsEcsCluster": "your_ecs_cluster_name",
    "awsService": "your_apps_ecs_service_name"
  },
  ...
```
### Step 2
Copy & paste these new scripts under the `scripts` property in `package.json`:
```json
  "scripts": {
    "aws:login:win": "cross-conf-env aws ecr get-login --no-include-email --region $npm_package_config_awsRegion > dockerLogin.cmd && call dockerLogin.cmd && del dockerLogin.cmd",
    "aws:login:mac": "eval $(aws ecr get-login --no-include-email --region $npm_package_config_awsRegion)",
    "aws:login": "run-p -cs aws:login:win aws:login:mac",
    "aws:deploy": "cross-conf-env docker run --env-file ./.env duluca/ecs-deploy-fargate -c $npm_package_config_awsEcsCluster -n $npm_package_config_awsService -i $npm_package_config_imageRepo:latest -r $npm_package_config_awsRegion --timeout 1000",
    "aws:release": "run-s -cs aws:login docker:publish aws:deploy",
  },
```
> Note the duluca/ecs-deploy-fargate blue-green deployment script is a fork of the original silintl/ecs-deploy image with AWS ECS Fargate support with this PR https://github.com/silinternational/ecs-deploy/pull/129 integrated. Once silintl/ecs-deploy merges this change, I recommend using silintl/ecs-deploy for your blue-green deployments.

## Running
You're done. Now run your scripts. To build and publish an image you only need to use two of the commands frequently.
1. `npm run docker:debug`: [Test], Build, Tag, Run, Tail and launch your app in a browser to test.
2. `npm run aws:release`: Configure Docker with AWS, publish your latest image build and release it on ECS.

> _Be patient!_ Things won't work right away. AWS is a complicated beast, however once everything is configured correctly, it is an immensely powerful tool. Go through AWS ECS setup instructions [here](https://gist.github.com/duluca/ebcf98923f733a1fdb6682f111b1a832#file-step-by-step-how-to-for-aws-ecs-md).

## AWS ECS Deploy Permissions

In order to be able to deploy using the scripts provided by `npm scripts for AWS ECS` make sure your user is part of an IAM Group that has the following inline policy applied to it.

*Note:* This may not be complete.

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ecr:BatchCheckLayerAvailability",
                "ecr:BatchGetImage",
                "ecr:GetDownloadUrlForLayer",
                "ecr:GetAuthorizationToken",
                "ecr:InitiateLayerUpload",
                "ecr:UploadLayerPart",
                "ecr:CompleteLayerUpload",
                "ecr:PutImage",
                "ecs:DeregisterTaskDefinition",
                "ecs:DescribeClusters",
                "ecs:DescribeContainerInstances",
                "ecs:DescribeServices",
                "ecs:DescribeTaskDefinition",
                "ecs:DescribeTasks",
                "ecs:ListClusters",
                "ecs:ListContainerInstances",
                "ecs:ListServices",
                "ecs:ListTaskDefinitionFamilies",
                "ecs:ListTaskDefinitions",
                "ecs:ListTasks",
                "ecs:RegisterContainerInstance",
                "ecs:RegisterTaskDefinition",
                "ecs:RunTask",
                "ecs:StartTask",
                "ecs:StopTask",
                "ecs:UpdateContainerAgent",
                "ecs:UpdateService"
            ],
            "Resource": "*"
        }
    ]
}
```
