# Online Streaming

## Release

Version 1.0.0

## Use Guide

Front end:

1. cd frontend
2. npm install
3. npm start

Back end:
1. pip install -i https://pypi.tuna.tsinghua.edu.cn/simple -r requirements.txt
2. python manage.py makemigrations
3. python manage.py migrate
4. python manage.py runserver

## Feature Development Guide

1. make sure you are on 'dev' branch (use 'git branch' to check your current branch and 'git checkout dev' to move to dev)
2. git pull
3. git checkout -b your-fearture-branch-name (Naming format sample: zhizhien_testing_Agora_framework)
4. develop on your feature branch

## Feature Merge Guide

1. Make sure at least one person review your PR and one person quality check your feature (Left a 'LGTM' on comment for review, 'QA' for quality check)
2. Make sure all pipeline pass
3. Fix all conflicts
4. Squash and Merge (Make sure you only merge to dev branch) DO NOT DIRECTLY MERGE TO MASTER

## Dev Merge Guide (Release)

### DONT DIRECTLY MERGE DEV INTO MASTER

1. Make sure you are on 'dev' branch (use 'git branch' to check your current branch)
2. git pull
3. git checkout -b release-version-number
4. Update documents
5. Make sure three team member review your PR and quality check your feature (Left a 'LGTM' on comment for review, 'QA' for quality check)
6. Make sure all pipeline pass
7. Fix all conflicts
8. Squash and Merge to master
9. Merge master back to dev
