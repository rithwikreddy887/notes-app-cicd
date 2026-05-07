pipeline {
    agent any

    environment {
        AUTH_IMAGE = "notes-auth"
        BACKEND_IMAGE = "notes-backend"
        FRONTEND_IMAGE = "notes-frontend"
        IMAGE_TAG = "jenkins-test"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Auth Dependencies') {
            steps {
                dir('auth') {
                    sh 'npm ci'
                }
            }
        }

        stage('Install Backend Dependencies') {
            steps {
                dir('backend') {
                    sh 'npm ci'
                }
            }
        }

        stage('Run Auth Tests') {
            steps {
                dir('auth') {
                    sh 'npm test'
                }
            }
        }

        stage('Run Backend Tests') {
            steps {
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
                sh 'docker build -t $AUTH_IMAGE:$IMAGE_TAG ./auth'
                sh 'docker build -t $BACKEND_IMAGE:$IMAGE_TAG ./backend'
                sh 'docker build -t $FRONTEND_IMAGE:$IMAGE_TAG ./frontend'
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