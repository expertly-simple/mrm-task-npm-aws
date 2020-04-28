const {
  // JSON files
  json,
  // package.json
  packageJson,
  // New line separated text files
  lines,
  // Install npm packages
  install
} = require("mrm-core");

function task(config) {
  configureCommonNpmPackages();
  configureNpmScripts();
}

const config = [
  ["awsRegion", "your_aws_region"],
  ["awsEcsCluster", "your_ecs_cluster_name"],
  ["awsService", "your_apps_ecs_service_name"]
]

const scripts = [
  ["aws:login:win", "cross-conf-env aws ecr get-login --no-include-email --region $npm_package_config_awsRegion > dockerLogin.cmd && call dockerLogin.cmd && del dockerLogin.cmd"],
  ["aws:login:mac", "eval $(aws ecr get-login --no-include-email --region $npm_package_config_awsRegion)"],
  ["aws:login", "run-p -cs aws:login:win aws:login:mac"],
  ["aws:deploy", "cross-conf-env docker run --env-file ./.env silintl/ecs-deploy -c $npm_package_config_awsEcsCluster -n $npm_package_config_awsService -i $npm_package_config_imageRepo:latest -r $npm_package_config_awsRegion --timeout 1000"],
  ["aws:release", "run-s -cs aws:login docker:publish aws:deploy"],
  ["aws:publish:compose", "cross-conf-env ecs-cli compose --file docker-compose.aws.yml -p $npm_package_name -c $npm_package_config_awsEcsCluster -r $npm_package_config_awsRegion create"]
]


function configureNpmScripts() {
  const pkg = packageJson();

  
  scripts.forEach(e => pkg.setScript(e[0], e[1]).save())


  config.forEach(e => {
    if(!pkg.get(`config.${e[0]}`)) {
      pkg.set(`config.${e[0]}`, e[1]).save()
    }
  })
}

function configureCommonNpmPackages() {
  const commonNpm = ["cross-conf-env", "npm-run-all", "dev-norms"];
  install(commonNpm);
}

task.description = "Configures npm Scripts for AWS ECS";
module.exports = task;
