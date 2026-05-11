pipeline {
    agent any

    environment {
        DOCKERHUB_USERNAME = "rithwik887"

        AUTH_IMAGE = "notes-auth"
        BACKEND_IMAGE = "notes-backend"
        FRONTEND_IMAGE = "notes-frontend"

        IMAGE_TAG = "latest"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {

                dir('auth') {
                    sh 'npm ci'
                }

                dir('backend') {
                    sh 'npm ci'
                }
            }
        }

        stage('Run Unit Tests') {
            steps {

                dir('auth') {
                    sh 'npm test'
                }

                dir('backend') {
                    sh 'npm test'
                }
            }
        }

        stage('Validate Frontend') {
            steps {
                sh 'test -f frontend/index.html'
            }
        }

        stage('Build Docker Images') {
            steps {

                sh '''
                docker build -t $DOCKERHUB_USERNAME/$AUTH_IMAGE:$IMAGE_TAG ./auth
                '''

                sh '''
                docker build -t $DOCKERHUB_USERNAME/$BACKEND_IMAGE:$IMAGE_TAG ./backend
                '''

                sh '''
                docker build -t $DOCKERHUB_USERNAME/$FRONTEND_IMAGE:$IMAGE_TAG ./frontend
                '''
            }
        }

        stage('Scan Docker Images') {
            steps {

                sh '''
                mkdir -p /tmp/trivy-cache

                trivy image \
                  --cache-dir /tmp/trivy-cache \
                  --exit-code 1 \
                  --ignore-unfixed \
                  --severity CRITICAL \
                  $DOCKERHUB_USERNAME/$AUTH_IMAGE:$IMAGE_TAG
                '''

                sh '''
                trivy image \
                  --cache-dir /tmp/trivy-cache \
                  --exit-code 1 \
                  --ignore-unfixed \
                  --severity CRITICAL \
                  $DOCKERHUB_USERNAME/$BACKEND_IMAGE:$IMAGE_TAG
                '''

                sh '''
                trivy image \
                  --cache-dir /tmp/trivy-cache \
                  --exit-code 1 \
                  --ignore-unfixed \
                  --severity CRITICAL \
                  $DOCKERHUB_USERNAME/$FRONTEND_IMAGE:$IMAGE_TAG
                '''
            }
        }

        stage('Login to DockerHub') {
            steps {

                withCredentials([
                    string(
                        credentialsId: 'dockerhub-token',
                        variable: 'DOCKERHUB_TOKEN'
                    )
                ]) {

                    sh '''
                    echo $DOCKERHUB_TOKEN | docker login -u $DOCKERHUB_USERNAME --password-stdin
                    '''
                }
            }
        }

        stage('Push Docker Images') {
            steps {

                sh '''
                docker push $DOCKERHUB_USERNAME/$AUTH_IMAGE:$IMAGE_TAG
                '''

                sh '''
                docker push $DOCKERHUB_USERNAME/$BACKEND_IMAGE:$IMAGE_TAG
                '''

                sh '''
                docker push $DOCKERHUB_USERNAME/$FRONTEND_IMAGE:$IMAGE_TAG
                '''
            }
        }
    }

    post {

        success {

            echo 'Jenkins CI pipeline completed successfully.'
        }

        failure {

            echo 'Jenkins CI pipeline failed.'
        }
    }
}