pipeline {
    agent any

    environment {
        DOCKERHUB_USERNAME = "rithwik887"

        AUTH_IMAGE = "notes-auth"
        BACKEND_IMAGE = "notes-backend"
        FRONTEND_IMAGE = "notes-frontend"
        IMAGE_TAG = "latest"

        MONGO_USERNAME = "mongo-user"
        MONGO_PASSWORD = "mongo-pass"
        MONGO_HOST = "notes-app-notes-app-mongo-service"
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
                sh 'docker build -t $DOCKERHUB_USERNAME/$AUTH_IMAGE:$IMAGE_TAG ./auth'
                sh 'docker build -t $DOCKERHUB_USERNAME/$BACKEND_IMAGE:$IMAGE_TAG ./backend'
                sh 'docker build -t $DOCKERHUB_USERNAME/$FRONTEND_IMAGE:$IMAGE_TAG ./frontend'
            }
        }

        stage('Scan Docker Images') {
            steps {
                sh 'trivy image --exit-code 1 --ignore-unfixed --severity CRITICAL $DOCKERHUB_USERNAME/$AUTH_IMAGE:$IMAGE_TAG'
                sh 'trivy image --exit-code 1 --ignore-unfixed --severity CRITICAL $DOCKERHUB_USERNAME/$BACKEND_IMAGE:$IMAGE_TAG'
                sh 'trivy image --exit-code 1 --ignore-unfixed --severity CRITICAL $DOCKERHUB_USERNAME/$FRONTEND_IMAGE:$IMAGE_TAG'
            }
        }

        stage('Login to DockerHub') {
            steps {
                withCredentials([string(credentialsId: 'dockerhub-token', variable: 'DOCKERHUB_TOKEN')]) {
                    sh 'echo $DOCKERHUB_TOKEN | docker login -u $DOCKERHUB_USERNAME --password-stdin'
                }
            }
        }

        stage('Push Docker Images') {
            steps {
                sh 'docker push $DOCKERHUB_USERNAME/$AUTH_IMAGE:$IMAGE_TAG'
                sh 'docker push $DOCKERHUB_USERNAME/$BACKEND_IMAGE:$IMAGE_TAG'
                sh 'docker push $DOCKERHUB_USERNAME/$FRONTEND_IMAGE:$IMAGE_TAG'
            }
        }

        stage('Verify Kubernetes Access') {
            steps {
                sh 'kubectl get nodes'
                sh 'helm version'
            }
        }

        stage('Deploy with Helm') {
            steps {
                sh '''
                helm upgrade --install notes-app ./helm/notes-app \
                  --set image.auth.repository=$DOCKERHUB_USERNAME/$AUTH_IMAGE \
                  --set image.auth.tag=$IMAGE_TAG \
                  --set image.backend.repository=$DOCKERHUB_USERNAME/$BACKEND_IMAGE \
                  --set image.backend.tag=$IMAGE_TAG \
                  --set image.frontend.repository=$DOCKERHUB_USERNAME/$FRONTEND_IMAGE \
                  --set image.frontend.tag=$IMAGE_TAG \
                  --set config.mongoHost=$MONGO_HOST \
                  --set secret.mongoUsername=$MONGO_USERNAME \
                  --set secret.mongoPassword=$MONGO_PASSWORD \
                  --set mongodb.env.rootUsername=$MONGO_USERNAME \
                  --set mongodb.env.rootPassword=$MONGO_PASSWORD
                '''
            }
        }

        stage('Restart App Deployments') {
            steps {
                sh '''
                kubectl rollout restart deploy notes-app-notes-app-auth-deploy || true
                kubectl rollout restart deploy notes-app-notes-app-backend-deploy || true
                kubectl rollout restart deploy notes-app-notes-app-frontend-deploy || true
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                sh 'helm status notes-app'
                sh 'kubectl get pods'
                sh 'kubectl get svc'
                sh 'kubectl get ingress'
            }
        }

        stage('Start Ingress Port Forward') {
            steps {
                sh '''
                pkill -f "kubectl port-forward" || true
                nohup kubectl port-forward -n ingress-nginx svc/ingress-nginx-controller 8080:80 > portforward.log 2>&1 &
                sleep 5
                echo "Notes App available at: http://notes.local:8080"
                '''
            }
        }
    }

    post {
        success {
            echo 'Full Jenkins CI/CD pipeline completed successfully.'
            echo 'Open: http://notes.local:8080'
        }
        failure {
            echo 'Jenkins CI/CD pipeline failed.'
        }
    }
}