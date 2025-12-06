pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                // Forráskód lehúzása Gitből
                checkout scm
            }
        }

        stage('Install dependencies') {
            steps {
                // Node modulok (word-guess-game gyökérben)
                sh 'npm ci'
            }
        }

        stage('Lint & Test') {
            steps {
                sh 'npm run lint'
                sh 'npm test'
            }
        }

        stage('Build Docker image') {
            steps {
                // Docker image build a jelenlegi workspace-ből
                sh 'docker build -t klbrtmr/word-guess-game:latest .'
            }
        }

        stage('Deploy with Ansible') {
            steps {
                sh '''
                cd ansible
                ansible-playbook -i inventory.ini deploy.yml
                '''
            }
        }
    }
}
