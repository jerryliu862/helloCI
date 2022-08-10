pipeline {
    agent any
    environment {
        CI = 'true'
        RED = '#FF0000'
        YELLOW = '#FFFF00'
        GREEN = '#008000'
    }

    stages {
        stage('Pre-Build') {
            steps {
                echo "Build Started"
                slackSend(color: '#008000', message: "Build Started: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.BUILD_URL})", channel: "#17live_wso_cicd")
            }
        }
        stage('Copy Folder') {
            steps {
                script {
                    if (env.BRANCH_NAME == 'develop') {
                        echo 'dev copy folder'   
                        sh 'cp -R ./* /home/foritech/Projects/17Live_WSO/17Live_WSO_FE/'
                    } 
                }
            }
        }
        stage('Remove Docker Containers') {
            steps {
                script {
                    if (env.BRANCH_NAME == "develop") {
                        sh 'sudo docker rm -f 17live-wso-fe-container-dev || true'
                    }
                    if (env.BRANCH_NAME == "stage") {
                        sh 'sudo docker rm -f 17live-wso-fe-container-stg || true'
                    }
                }
            }
        }

        stage('Remove Docker Image') {
            steps {
                script {
                    if (env.BRANCH_NAME == "develop") { 
                        sh 'sudo docker image rm 17live-wso-fe-image-dev || true'
                    }
                    if (env.BRANCH_NAME == "stage") { 
                        sh 'sudo docker image rm 17live-wso-fe-image-stg || true'
                    }
                }
            }
        }

        stage('List Docker Containers') {
            steps {
                script {
                    if (env.BRANCH_NAME == "develop") { 
                        sh 'sudo docker ps --all'
                    }
                    if (env.BRANCH_NAME == "stage") { 
                        sh 'sudo docker ps --all'
                    }
                }    
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    if (env.BRANCH_NAME == "develop") { 
                        sh 'sudo docker build . -t "17live-wso-fe-image-dev"'
                    }
                    if (env.BRANCH_NAME == "stage") { 
                        sh 'sudo docker build . -t "17live-wso-fe-image-stg"'
                    }
                }
            }
        }

        stage('Build Docker Container') {
            steps {
                script {
                    if (env.BRANCH_NAME == "develop") { 
                        sh 'sudo docker run -d --name 17live-wso-fe-container-dev -p 4101:3000 17live-wso-fe-image-dev'
                    }
                    if (env.BRANCH_NAME == "stage") { 
                        sh 'sudo docker run -d --env-file ./.env.stg --name 17live-wso-fe-container-stg -p 4111:3000 17live-wso-fe-image-stg'
                    }
                }    
            }
        }
    }

    post { 
        success {
            echo "Build Success"
            slackSend(color: '#008000', message: "Build Succeed: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.BUILD_URL})", channel: "#17live_wso_cicd")
        }

        failure { 
            echo "Build Failed"
            slackSend(color: '#FF0000', message: "Build Failed: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.BUILD_URL})", channel: "#17live_wso_cicd")
        }
    }
}