pipeline {
    agent any

    environment {
        K8S_CLUSTER = 'your-k8s-cluster'   // Kubernetes cluster name
        DEV_ENV = 'development'            // Development 
        TEST_ENV = 'test'                  // Test 
        PROD_ENV = 'production'            // Production 
        KUBE_CONFIG = '/k8s/'
    }

    stages {
        stage('Checkout') {
            steps {
                git 'https://github.com/erenelmaci/backend-starter-ts.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                script {
                    if (env.ENV == 'production') {
                        echo 'Deploying to Development environment...'
                        sh "kubectl --kubeconfig=${KUBE_CONFIG} apply -f k8s/backend-deployment.yaml"
                    } 
                    // else if (env.ENV == 'test') {
                    //     echo 'Deploying to Test environment...'
                    //     sh "kubectl --kubeconfig=${KUBE_CONFIG} apply -f k8s/test-deployment.yaml"
                    // } else if (env.ENV == 'production') {
                    //     echo 'Deploying to Production environment...'
                    //     sh "kubectl --kubeconfig=${KUBE_CONFIG} apply -f k8s/prod-deployment.yaml"
                    // }
                }
            }
        }

        stage('Rolling Update') {
            steps {
                script {
                    // Rolling update
                    echo 'Starting Rolling Update...'
                    sh "kubectl --kubeconfig=${KUBE_CONFIG} rollout restart deployment/your-deployment-name"
                }
            }
        }

        stage('Verify Deployment') {
            steps {
                script {
                    echo 'Verifying deployment...'
                    sh "kubectl --kubeconfig=${KUBE_CONFIG} rollout status deployment/your-deployment-name"
                }
            }
        }
    }

    post {
        success {
            echo 'Deployment was successful!'
        }
        failure {
            echo 'Deployment failed.'
        }
    }
}
